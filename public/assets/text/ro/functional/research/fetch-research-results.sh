#!/bin/bash

# =============================================================================
# Fetch Functional Research Results Script
# =============================================================================
# Processes functional research files, extracts Claude.ai URL from ## Research URL section,
# runs web-flow research-extraction, and saves output to functional folder.
#
# Usage: ./fetch-research-results.sh [--dry-run] [--file <filename>] [--limit <n>]
#
# Options:
#   --dry-run       Show what would be done without executing
#   --file <name>   Process only a specific file
#   --limit <n>     Limit processing to first n files (default: unlimited)
#
# Resumable: Files with existing "## Processed" section are skipped.
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$SCRIPT_DIR/.."
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
LIMIT=0  # 0 = unlimited

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
        --limit)
            LIMIT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: ./fetch-research-results.sh [--dry-run] [--file <filename>] [--limit <n>]"
            echo ""
            echo "Options:"
            echo "  --dry-run       Show what would be done without executing"
            echo "  --file <name>   Process only a specific file"
            echo "  --limit <n>     Limit processing to first n files (default: unlimited)"
            echo ""
            echo "Resumable: Files with existing '## Processed' section are skipped."
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Counters
total_processed=0
total_skipped=0
total_success=0
total_failed=0
processed_count=0

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

# Check if web-flow is available
if ! command -v web-flow &> /dev/null; then
    log_error "web-flow CLI not found. Install it with:"
    log_error "  cd ~/projects/research/web-flow && deno task install"
    exit 1
fi

# Function to process a single research file
# Note: All log_* calls redirect to stderr so only the final status goes to stdout
process_research_file() {
    local research_file="$1"
    local filename=$(basename "$research_file")
    local log_file="$LOG_DIR/${filename%.md}-$DATE_STAMP.log"

    log_info "Processing: $filename" >&2

    # Skip README.md
    if [[ "$filename" == "README.md" ]]; then
        log_warning "Skipping $filename - README file" >&2
        echo "SKIP:README"
        return
    fi

    # Check if Processed section already exists
    if grep -q "^## Processed" "$research_file"; then
        log_warning "Skipping $filename - Already processed" >&2
        echo "SKIP:ALREADY_PROCESSED"
        return
    fi

    # Extract the Claude.ai URL from ## Research URL section
    local claude_url=$(grep -A2 "^## Research URL" "$research_file" | grep -oE 'https://claude\.ai/chat/[a-f0-9-]+' | head -1)

    if [[ -z "$claude_url" ]]; then
        log_warning "Skipping $filename - No Research URL found" >&2
        echo "SKIP:NO_URL"
        return
    fi

    # Extract code from filename (e.g., research-fn-10.01.md -> 10.01)
    local code=$(basename "$filename" .md | sed 's/^research-fn-//')
    local output_file="$OUTPUT_DIR/${code}.md"

    log "Found URL: $claude_url" >&2
    log "Code: $code -> Output: $output_file" >&2

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would extract research from: $claude_url" >&2
        log_info "[DRY RUN] Would save to: $output_file" >&2
        echo "DRYRUN:$code"
        return
    fi

    # Run web-flow research-extraction
    log "Running web-flow research-extraction..." >&2

    local webflow_output
    if webflow_output=$(echo "$claude_url" | web-flow research-extraction --raw 2>&1); then
        # Check if output is not empty and has reasonable content
        if [[ -n "$webflow_output" ]] && [[ ${#webflow_output} -gt 100 ]]; then
            # Save to output file
            echo "$webflow_output" > "$output_file"

            # Append Processed section to research file
            local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
            {
                echo ""
                echo "## Processed"
                echo ""
                echo "- **Date:** $timestamp"
                echo "- **Output:** [${code}.md](../${code}.md)"
            } >> "$research_file"

            log_success "Successfully extracted research for $filename (${#webflow_output} chars)" >&2
            log "Output saved to: $output_file" >&2
            echo "SUCCESS:$code"
        else
            log_error "Output too short or empty for $filename (${#webflow_output} chars)" >&2
            echo "$webflow_output" > "$log_file"
            echo "FAILED:EMPTY_OUTPUT"
        fi
    else
        log_error "web-flow command failed for $filename" >&2
        echo "$webflow_output" > "$log_file"
        echo "FAILED:COMMAND_ERROR"
    fi
}

# Main execution
log "=========================================="
log "Fetch Functional Research Results - Starting"
log "=========================================="
log "Research directory: $RESEARCH_DIR"
log "Output directory: $OUTPUT_DIR"
log "Log file: $MAIN_LOG"
if [[ "$DRY_RUN" == "true" ]]; then
    log "Mode: DRY RUN"
fi
if [[ "$LIMIT" -gt 0 ]]; then
    log "Limit: $LIMIT files"
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
    # Process all research-fn-*.md files (exclude README)
    files_to_process=()
    for f in "$RESEARCH_DIR"/research-fn-*.md; do
        [[ -f "$f" ]] && files_to_process+=("$f")
    done
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
            processed_count=$((processed_count + 1))
            echo -e "  ${GREEN}Done - ${result#SUCCESS:}.md${NC}"
            ;;
        SKIP:*)
            total_skipped=$((total_skipped + 1))
            echo -e "  ${YELLOW}Skipped: ${result#SKIP:}${NC}"
            ;;
        DRYRUN:*)
            processed_count=$((processed_count + 1))
            echo -e "  ${BLUE}[Dry run] Would process: ${result#DRYRUN:}${NC}"
            ;;
        FAILED:*)
            total_failed=$((total_failed + 1))
            processed_count=$((processed_count + 1))
            echo -e "  ${RED}Failed: ${result#FAILED:}${NC}"
            ;;
    esac

    echo ""

    # Check limit (counts actual attempts: SUCCESS, FAILED, DRYRUN - not SKIP)
    if [[ "$LIMIT" -gt 0 && "$processed_count" -ge "$LIMIT" ]]; then
        log_info "Reached limit of $LIMIT attempted files. Stopping."
        break
    fi

    # Delay between requests to be nice to Claude.ai
    if [[ "$DRY_RUN" != "true" ]] && [[ "$result" == SUCCESS:* ]]; then
        sleep 3
    fi
done

echo ""
log "=========================================="
log "Fetch Functional Research Results Complete"
log "=========================================="
log "Total processed: $total_processed"
log "Successful: $total_success"
log "Skipped: $total_skipped"
log "Failed: $total_failed"
log "Log directory: $LOG_DIR"
log "=========================================="

echo ""
echo -e "${GREEN}Done! Check $LOG_DIR for detailed logs.${NC}"
