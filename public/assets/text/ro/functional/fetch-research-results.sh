#!/bin/bash

# =============================================================================
# Fetch Research Results Script
# =============================================================================
# Processes research verification files, opens each Claude.ai chat URL using
# claude --chrome, copies the research result, and appends it to the markdown.
#
# Usage: ./fetch-research-results.sh [--dry-run] [--file <filename>]
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="$SCRIPT_DIR/research-verifications"
LOG_DIR="$SCRIPT_DIR/fetch-logs"
DATE_STAMP=$(date +%Y-%m-%d-%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
SINGLE_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --file)
            SINGLE_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Counters
total_processed=0
total_skipped=0
total_success=0
total_failed=0

# Create log directory
mkdir -p "$LOG_DIR"
MAIN_LOG="$LOG_DIR/fetch-$DATE_STAMP.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MAIN_LOG"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$MAIN_LOG"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}" | tee -a "$MAIN_LOG"
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$MAIN_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$MAIN_LOG"
}

# Check if research directory exists
if [[ ! -d "$RESEARCH_DIR" ]]; then
    log_error "Research directory not found: $RESEARCH_DIR"
    exit 1
fi

# Function to process a single research file
process_research_file() {
    local research_file="$1"
    local filename=$(basename "$research_file")
    local log_file="$LOG_DIR/${filename%.md}-$DATE_STAMP.log"

    log_info "Processing: $filename"

    # Check if Research Results section already has content
    local existing_results=$(awk '/^## Research Results$/{found=1; next} found{print}' "$research_file" | grep -v "^$" | head -5)

    if [[ -n "$existing_results" ]]; then
        log_warning "Skipping $filename - Research Results already has content"
        echo "SKIP:HAS_RESULTS"
        return
    fi

    # Extract the Claude.ai URL (may be 1-2 lines after ## URL header)
    local claude_url=$(grep -A3 "^## URL" "$research_file" | grep "https://claude.ai" | head -1 | tr -d ' ')

    if [[ -z "$claude_url" ]]; then
        log_error "No Claude.ai URL found in $filename"
        echo "SKIP:NO_URL"
        return
    fi

    log "Found URL: $claude_url"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would fetch results from: $claude_url"
        echo "DRYRUN:$claude_url"
        return
    fi

    # Build the prompt for claude --chrome - using Tampermonkey functions on window scope
    local prompt="Navigate to $claude_url. Then:
1. Run JS: clickResearchArtifact() - opens last artifact panel
2. Wait 1 second for panel to open
3. Run JS: getCopyButtonPosition() - returns {x, y} coordinates
4. Click at those exact x,y coordinates to copy content to clipboard
5. Press Escape to close panel
6  Close the tab
6. Exit"

    # Run claude with --chrome to copy result to clipboard
    log "Running claude --chrome to copy research results to clipboard..."

    # Clear clipboard first
    echo "" | pbcopy

    local claude_output
    if claude_output=$(claude --chrome \
        --model haiku \
        -p "$prompt" 2>&1); then

        # Small delay to ensure clipboard is ready
        sleep 1

        # Get the clipboard content
        local clipboard_content
        clipboard_content=$(pbpaste)

        # Check if clipboard has meaningful content
        if [[ -n "$clipboard_content" ]] && [[ ${#clipboard_content} -gt 200 ]]; then
            # Append the clipboard content directly to the markdown file
            log "Appending clipboard content to $filename (${#clipboard_content} chars)..."

            # Add the result after "## Research Results"
            echo "" >> "$research_file"
            echo "$clipboard_content" >> "$research_file"

            log_success "Successfully fetched and appended results for $filename"
            echo "SUCCESS:$filename"
        else
            log_error "Clipboard content too short or empty for $filename (${#clipboard_content} chars)"
            echo "Claude output: $claude_output" > "$log_file"
            echo "Clipboard: $clipboard_content" >> "$log_file"
            echo "FAILED:EMPTY_CLIPBOARD"
        fi
    else
        log_error "Claude command failed for $filename"
        echo "$claude_output" > "$log_file"
        echo "FAILED:COMMAND_ERROR"
    fi
}

# Main execution
log "=========================================="
log "Fetch Research Results - Starting"
log "=========================================="
log "Research directory: $RESEARCH_DIR"
log "Log file: $MAIN_LOG"
if [[ "$DRY_RUN" == "true" ]]; then
    log "Mode: DRY RUN"
fi
log "=========================================="

# Determine which files to process
if [[ -n "$SINGLE_FILE" ]]; then
    # Process single file
    target_file="$RESEARCH_DIR/$SINGLE_FILE"
    if [[ ! -f "$target_file" ]]; then
        log_error "File not found: $target_file"
        exit 1
    fi
    files_to_process=("$target_file")
else
    # Process all files
    files_to_process=("$RESEARCH_DIR"/*.md)
fi

# Count total files
total_files=${#files_to_process[@]}
log "Total files to process: $total_files"
echo ""

# Process files sequentially (in-band)
for research_file in "${files_to_process[@]}"; do
    [[ ! -f "$research_file" ]] && continue

    filename=$(basename "$research_file")
    total_processed=$((total_processed + 1))

    echo -e "${BLUE}[$total_processed/$total_files] Processing: $filename${NC}"

    result=$(process_research_file "$research_file")

    case "$result" in
        SUCCESS:*)
            total_success=$((total_success + 1))
            echo -e "  ${GREEN}Done${NC}"
            ;;
        SKIP:*)
            total_skipped=$((total_skipped + 1))
            echo -e "  ${YELLOW}Skipped: ${result#SKIP:}${NC}"
            ;;
        DRYRUN:*)
            echo -e "  ${BLUE}[Dry run] URL: ${result#DRYRUN:}${NC}"
            ;;
        FAILED:*)
            total_failed=$((total_failed + 1))
            echo -e "  ${RED}Failed: ${result#FAILED:}${NC}"
            ;;
    esac

    echo ""

    # Small delay between requests to be nice to Claude.ai
    if [[ "$DRY_RUN" != "true" ]] && [[ "$result" == SUCCESS:* ]]; then
        sleep 2
    fi
done

echo ""
log "=========================================="
log "Fetch Complete"
log "=========================================="
log "Total processed: $total_processed"
log "Successful: $total_success"
log "Skipped: $total_skipped"
log "Failed: $total_failed"
log "Log directory: $LOG_DIR"
log "=========================================="

echo ""
echo -e "${GREEN}Done! Check $LOG_DIR for detailed logs.${NC}"
