#!/bin/bash

# =============================================================================
# Apply Research Fixes Script
# =============================================================================
# Processes research verification files and uses Claude Code CLI to fix/improve
# the original markdown files based on the research findings.
#
# Usage: ./apply-research-fixes.sh
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="$SCRIPT_DIR/research-verifications"
LOG_DIR="$SCRIPT_DIR/fix-logs"
BATCH_SIZE=10
DATE_STAMP=$(date +%Y-%m-%d-%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
total_processed=0
total_skipped=0
total_success=0
total_failed=0

# Create log directory
mkdir -p "$LOG_DIR"
MAIN_LOG="$LOG_DIR/batch-$DATE_STAMP.log"

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

# Check if research directory exists
if [[ ! -d "$RESEARCH_DIR" ]]; then
    log_error "Research directory not found: $RESEARCH_DIR"
    exit 1
fi

# Count total files
total_files=$(find "$RESEARCH_DIR" -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')

if [[ $total_files -eq 0 ]]; then
    log_error "No research files found in $RESEARCH_DIR"
    exit 1
fi

log "=========================================="
log "Apply Research Fixes - Starting"
log "=========================================="
log "Research directory: $RESEARCH_DIR"
log "Total research files: $total_files"
log "Batch size: $BATCH_SIZE"
log "Log file: $MAIN_LOG"
log "=========================================="

# Function to process a single research file
process_research_file() {
    local research_file="$1"
    local filename=$(basename "$research_file")
    local log_file="$LOG_DIR/${filename%.md}-$DATE_STAMP.log"

    # Extract source file path (macOS compatible)
    local source_file=$(grep "Source File" "$research_file" 2>/dev/null | sed 's/.*Source File\*\*: //' || echo "")

    if [[ -z "$source_file" ]]; then
        echo "SKIP:NO_SOURCE_PATH"
        return
    fi

    # Check if source file exists
    if [[ ! -f "$source_file" ]]; then
        echo "SKIP:SOURCE_NOT_FOUND"
        return
    fi

    # Extract research results (everything after "## Research Results" until end of file or next major section)
    local research_results=$(awk '/^## Research Results$/{found=1; next} found && /^## [^R]/{exit} found{print}' "$research_file")

    # Check if research results contain actual content (not just placeholder)
    if [[ -z "$research_results" ]] || [[ "$research_results" == *"[PASTE RESEARCH RESULTS HERE]"* ]]; then
        echo "SKIP:NO_RESEARCH_RESULTS"
        return
    fi

    # Build the prompt
    local prompt
    read -r -d '' prompt << PROMPT_EOF || true
Ești un expert în documentație bugetară românească. Ai primit rezultatele unei verificări aprofundate a unui document de clasificație bugetară.

## Sarcina ta:
Citește fișierul original și aplică TOATE corecțiile identificate în cercetarea de mai jos. Fă modificările direct în fișier.

## Fișier de modificat:
$source_file

## Rezultatele cercetării (probleme găsite și corecții necesare):

$research_results

## Instrucțiuni CRITICE:
1. Citește mai întâi fișierul original folosind instrumentul Read
2. Aplică TOATE corecțiile critice identificate în cercetare
3. Aplică sugestiile de îmbunătățire unde este cazul
4. Păstrează structura și formatul existent al documentului
5. Asigură-te că diacriticele sunt corecte (ș, ț, ă, â, î - nu ş, ţ)
6. NU adăuga comentarii sau note despre modificări în fișier
7. NU modifica secțiuni care nu au fost menționate în cercetare ca având probleme
8. Dacă cercetarea indică "Nu s-au găsit probleme critice" sau similar, nu face modificări majore
9. Folosește instrumentul Edit pentru a face modificările necesare

Începe acum: citește fișierul și apoi aplică modificările necesare bazate pe cercetare.
PROMPT_EOF

    # Run Claude CLI
    if claude -p \
        --dangerously-skip-permissions \
        --tools "Read,Edit" \
        --model opus \
        "$prompt" > "$log_file" 2>&1; then
        echo "SUCCESS:$source_file"
    else
        echo "FAILED:$source_file"
    fi
}

# Export function for use in subshells
export -f process_research_file
export LOG_DIR DATE_STAMP

# Arrays for batch processing
declare -a batch_files=()
declare -a pids=()
batch_num=1

echo ""
log_info "Starting batch processing..."
echo ""

# Process files in batches
for research_file in "$RESEARCH_DIR"/*.md; do
    [[ ! -f "$research_file" ]] && continue

    batch_files+=("$research_file")

    # When batch is full, process it
    if [[ ${#batch_files[@]} -ge $BATCH_SIZE ]]; then
        echo -e "${YELLOW}Processing batch $batch_num (${#batch_files[@]} files)...${NC}"
        log "Processing batch $batch_num with ${#batch_files[@]} files"

        # Launch all processes in this batch
        for bf in "${batch_files[@]}"; do
            filename=$(basename "$bf")
            echo "  Starting: $filename"

            # Run in background and capture output
            (
                result=$(process_research_file "$bf")
                echo "$result|$bf"
            ) &
            pids+=($!)
        done

        # Wait for all processes in this batch
        for pid in "${pids[@]}"; do
            wait $pid 2>/dev/null || true
        done

        # Process results (note: results are logged in individual files)
        for bf in "${batch_files[@]}"; do
            filename=$(basename "$bf")
            log_file="$LOG_DIR/${filename%.md}-$DATE_STAMP.log"

            if [[ -f "$log_file" ]] && grep -q "Successfully\|edited\|Edit\|modified" "$log_file" 2>/dev/null; then
                total_success=$((total_success + 1))
                echo -e "  ${GREEN}Completed: $filename${NC}"
            elif [[ ! -f "$log_file" ]]; then
                total_skipped=$((total_skipped + 1))
                echo -e "  ${YELLOW}Skipped: $filename${NC}"
            else
                total_processed=$((total_processed + 1))
            fi
        done

        # Reset for next batch
        batch_files=()
        pids=()
        batch_num=$((batch_num + 1))

        echo ""
    fi
done

# Process remaining files (less than full batch)
if [[ ${#batch_files[@]} -gt 0 ]]; then
    echo -e "${YELLOW}Processing final batch $batch_num (${#batch_files[@]} files)...${NC}"
    log "Processing final batch $batch_num with ${#batch_files[@]} files"

    for bf in "${batch_files[@]}"; do
        filename=$(basename "$bf")
        echo "  Starting: $filename"

        (
            result=$(process_research_file "$bf")
            echo "$result|$bf"
        ) &
        pids+=($!)
    done

    # Wait for all remaining processes
    for pid in "${pids[@]}"; do
        wait $pid 2>/dev/null || true
    done

    for bf in "${batch_files[@]}"; do
        filename=$(basename "$bf")
        log_file="$LOG_DIR/${filename%.md}-$DATE_STAMP.log"

        if [[ -f "$log_file" ]] && grep -q "Successfully\|edited\|Edit\|modified" "$log_file" 2>/dev/null; then
            total_success=$((total_success + 1))
            echo -e "  ${GREEN}Completed: $filename${NC}"
        elif [[ ! -f "$log_file" ]]; then
            total_skipped=$((total_skipped + 1))
            echo -e "  ${YELLOW}Skipped: $filename${NC}"
        else
            total_processed=$((total_processed + 1))
        fi
    done
fi

echo ""
log "=========================================="
log "Processing Complete"
log "=========================================="
log "Total files processed: $total_processed"
log "Successfully fixed: $total_success"
log "Skipped (no research): $total_skipped"
log "Failed: $total_failed"
log "Log directory: $LOG_DIR"
log "=========================================="

echo ""
echo -e "${GREEN}Done! Check $LOG_DIR for detailed logs.${NC}"
