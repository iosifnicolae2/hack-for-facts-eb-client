#!/bin/bash

# =============================================================================
# Generate Research Files Script
# =============================================================================
# Generates research-ec prompt files from templates using economic codes
# from ec.json (sorted by amount/importance).
#
# Usage: ./generate-research-files.sh [--dry-run] [--limit <n>]
#
# Options:
#   --dry-run       Show what would be done without creating files
#   --limit <n>     Limit to first n missing codes (default: 20)
#
# Skips codes that already have research files.
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="$SCRIPT_DIR"
EC_JSON="$SCRIPT_DIR/../ec.json"
TEMPLATE_CAPITOL="$SCRIPT_DIR/research-template-capitol.md"
TEMPLATE_SUBCAPITOL="$SCRIPT_DIR/research-template-subcapitol.md"
CLASSIFICATIONS_JSON="$SCRIPT_DIR/../../../../src/assets/economic-classifications-general-ro.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false
LIMIT=20

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --limit)
            LIMIT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: ./generate-research-files.sh [--dry-run] [--limit <n>]"
            echo ""
            echo "Options:"
            echo "  --dry-run       Show what would be done without creating files"
            echo "  --limit <n>     Limit to first n missing codes (default: 20)"
            echo ""
            echo "Skips codes that already have research files."
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
total_generated=0
total_skipped=0

log_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Check dependencies
if ! command -v jq &> /dev/null; then
    log_error "jq is required but not installed. Install it with: brew install jq"
    exit 1
fi

# Check required files
if [[ ! -f "$EC_JSON" ]]; then
    log_error "ec.json not found: $EC_JSON"
    exit 1
fi

if [[ ! -f "$TEMPLATE_CAPITOL" ]]; then
    log_error "Capitol template not found: $TEMPLATE_CAPITOL"
    exit 1
fi

if [[ ! -f "$TEMPLATE_SUBCAPITOL" ]]; then
    log_error "Subcapitol template not found: $TEMPLATE_SUBCAPITOL"
    exit 1
fi

# Function to clean economic code (remove trailing .00)
clean_code() {
    local code="$1"
    # Remove trailing .00 groups
    echo "$code" | sed 's/\.00$//' | sed 's/\.00$//'
}

# Function to get parent code (e.g., 57.01 -> 57)
get_parent_code() {
    local code="$1"
    if [[ "$code" == *.* ]]; then
        echo "${code%.*}"
    else
        echo ""
    fi
}

# Function to get name from classifications JSON
get_name_from_classifications() {
    local code="$1"
    jq -r --arg code "$code" '
        .. | objects | select(.code? == $code) | .description // empty
    ' "$CLASSIFICATIONS_JSON" 2>/dev/null | head -1
}

# Function to check if research file exists
file_exists() {
    local code="$1"
    [[ -f "$RESEARCH_DIR/research-ec-$code.md" ]]
}

# Function to determine if code is capitol (2-digit) or subcapitol
is_capitol() {
    local code="$1"
    [[ ! "$code" == *.* ]]
}

# Function to generate research file
generate_file() {
    local code="$1"
    local name="$2"
    local output_file="$RESEARCH_DIR/research-ec-$code.md"

    local template
    local parent_code=""
    local parent_name=""

    if is_capitol "$code"; then
        template="$TEMPLATE_CAPITOL"
    else
        template="$TEMPLATE_SUBCAPITOL"
        parent_code=$(get_parent_code "$code")
        parent_name=$(get_name_from_classifications "$parent_code")
        if [[ -z "$parent_name" ]]; then
            parent_name="[Capitol $parent_code]"
        fi
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would create: research-ec-$code.md"
        log_info "  Code: $code"
        log_info "  Name: $name"
        if [[ -n "$parent_code" ]]; then
            log_info "  Parent: $parent_code - $parent_name"
        fi
        return
    fi

    # Generate file from template
    # Escape special sed characters in name and parent_name
    local escaped_name=$(echo "$name" | sed 's/[&/\]/\\&/g')
    local escaped_parent_name=$(echo "$parent_name" | sed 's/[&/\]/\\&/g')

    sed -e "s/{CODE}/$code/g" \
        -e "s/{NAME}/$escaped_name/g" \
        -e "s/{PARENT_CODE}/$parent_code/g" \
        -e "s/{PARENT_NAME}/$escaped_parent_name/g" \
        "$template" > "$output_file"

    log_success "Created: research-ec-$code.md"
}

# Main execution
echo "=========================================="
echo "Generate Research Files"
echo "=========================================="
echo "EC JSON: $EC_JSON"
echo "Templates: $TEMPLATE_CAPITOL, $TEMPLATE_SUBCAPITOL"
echo "Limit: $LIMIT missing codes"
if [[ "$DRY_RUN" == "true" ]]; then
    echo "Mode: DRY RUN"
fi
echo "=========================================="
echo ""

# Extract unique codes from ec.json, sorted by amount (already sorted in JSON)
# Format: code|name (preserving order from JSON)
log_info "Extracting top codes from ec.json..."

# Get unique ec_c|ec_n pairs, keeping first occurrence (highest amount)
codes_and_names=$(jq -r '.data.aggregatedLineItems.nodes[] | "\(.ec_c)|\(.ec_n)"' "$EC_JSON" | awk -F'|' '!seen[$1]++ {print}')

# Process codes
processed=0
echo ""
log_info "Processing codes (limit: $LIMIT)..."
echo ""

while IFS='|' read -r raw_code name; do
    [[ -z "$raw_code" ]] && continue

    # Clean the code
    code=$(clean_code "$raw_code")

    # Skip if file already exists
    if file_exists "$code"; then
        total_skipped=$((total_skipped + 1))
        continue
    fi

    # Check limit
    if [[ $processed -ge $LIMIT ]]; then
        break
    fi

    # Generate file
    generate_file "$code" "$name"
    total_generated=$((total_generated + 1))
    processed=$((processed + 1))

done <<< "$codes_and_names"

echo ""
echo "=========================================="
echo "Generation Complete"
echo "=========================================="
echo "Generated: $total_generated files"
echo "Skipped (already exist): $total_skipped files"
echo "=========================================="

if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    echo -e "${YELLOW}This was a dry run. No files were created.${NC}"
    echo "Run without --dry-run to create the files."
fi
