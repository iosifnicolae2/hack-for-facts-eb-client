#!/bin/bash

# =============================================================================
# Generate Subcapitol Research Files Script (Functional)
# =============================================================================
# Groups items from ec.json by functional subcapitol code (XX.XX), sums amounts,
# ranks by total, and generates research prompts with names from
# classifications JSON.
#
# Usage: ./generate-subcapitol-research.sh [--dry-run] [--limit <n>]
#
# Options:
#   --dry-run       Show what would be done without creating files
#   --limit <n>     Limit to first n missing codes (default: 20)
#
# Skips codes that already have research files or output files.
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESEARCH_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$SCRIPT_DIR/.."
FN_JSON="$SCRIPT_DIR/../../economic/ec.json"
TEMPLATE_SUBCAPITOL="$SCRIPT_DIR/research-template-subcapitol.md"
CLASSIFICATIONS_JSON="$SCRIPT_DIR/../../../../../../src/assets/functional-classifications-general-ro.json"

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
            echo "Usage: ./generate-subcapitol-research.sh [--dry-run] [--limit <n>]"
            echo ""
            echo "Options:"
            echo "  --dry-run       Show what would be done without creating files"
            echo "  --limit <n>     Limit to first n missing codes (default: 20)"
            echo ""
            echo "Groups by subcapitol (XX.XX), sums amounts, ranks by total."
            echo "Names are looked up from classifications JSON."
            echo "Skips codes that already have research files or output files."
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
if [[ ! -f "$FN_JSON" ]]; then
    log_error "ec.json not found: $FN_JSON"
    exit 1
fi

if [[ ! -f "$TEMPLATE_SUBCAPITOL" ]]; then
    log_error "Subcapitol template not found: $TEMPLATE_SUBCAPITOL"
    exit 1
fi

if [[ ! -f "$CLASSIFICATIONS_JSON" ]]; then
    log_error "Classifications JSON not found: $CLASSIFICATIONS_JSON"
    exit 1
fi

# Function to extract subcapitol code (first 2 segments: XX.XX)
extract_subcapitol() {
    local code="$1"
    echo "$code" | cut -d'.' -f1-2
}

# Function to get parent code (e.g., 68.03 -> 68)
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

# Function to check if research file or output file exists
file_exists() {
    local code="$1"
    [[ -f "$RESEARCH_DIR/research-fn-$code.md" ]] || [[ -f "$OUTPUT_DIR/${code}.md" ]]
}

# Function to generate research file
generate_file() {
    local code="$1"
    local name="$2"
    local output_file="$RESEARCH_DIR/research-fn-$code.md"

    local parent_code=$(get_parent_code "$code")
    local parent_name=$(get_name_from_classifications "$parent_code")
    if [[ -z "$parent_name" ]]; then
        parent_name="[Capitol $parent_code]"
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would create: research-fn-$code.md"
        log_info "  Code: $code"
        log_info "  Name: $name"
        log_info "  Parent: $parent_code - $parent_name"
        return
    fi

    # Escape special sed characters in name and parent_name
    local escaped_name=$(echo "$name" | sed 's/[&/\]/\\&/g')
    local escaped_parent_name=$(echo "$parent_name" | sed 's/[&/\]/\\&/g')

    # Generate file from template
    sed -e "s/{CODE}/$code/g" \
        -e "s/{NAME}/$escaped_name/g" \
        -e "s/{PARENT_CODE}/$parent_code/g" \
        -e "s/{PARENT_NAME}/$escaped_parent_name/g" \
        "$TEMPLATE_SUBCAPITOL" > "$output_file"

    log_success "Created: research-fn-$code.md"
}

# Main execution
echo "=========================================="
echo "Generate Subcapitol Research Files (Functional)"
echo "=========================================="
echo "FN JSON: $FN_JSON"
echo "Classifications: $CLASSIFICATIONS_JSON"
echo "Template: $TEMPLATE_SUBCAPITOL"
echo "Limit: $LIMIT missing codes"
if [[ "$DRY_RUN" == "true" ]]; then
    echo "Mode: DRY RUN"
fi
echo "=========================================="
echo ""

# Step 1: Extract subcapitol codes, group and sum amounts
log_info "Extracting and grouping by subcapitol (XX.XX)..."

# Extract subcapitol|amount, group by subcapitol, sum amounts, sort by total
grouped_codes=$(jq -r '.data.aggregatedLineItems.nodes[] |
    "\(.fn_c | split(".")[0:2] | join("."))|\(.amount)"' "$FN_JSON" |
    awk -F'|' '{sum[$1] += $2} END {for (k in sum) print sum[k] "|" k}' |
    sort -t'|' -k1 -rn)

# Process codes
processed=0
echo ""
log_info "Processing top subcapitols (limit: $LIMIT)..."
echo ""

while IFS='|' read -r total_amount code; do
    [[ -z "$code" ]] && continue

    # Skip if code doesn't have a dot (it's a capitol, not subcapitol)
    if [[ ! "$code" == *.* ]]; then
        continue
    fi

    # Skip if file already exists
    if file_exists "$code"; then
        total_skipped=$((total_skipped + 1))
        continue
    fi

    # Check limit
    if [[ $processed -ge $LIMIT ]]; then
        break
    fi

    # Look up name from classifications JSON
    name=$(get_name_from_classifications "$code")
    if [[ -z "$name" ]]; then
        log_warning "No name found for code $code in classifications JSON, skipping"
        continue
    fi

    # Generate file
    generate_file "$code" "$name"
    total_generated=$((total_generated + 1))
    processed=$((processed + 1))

done <<< "$grouped_codes"

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
