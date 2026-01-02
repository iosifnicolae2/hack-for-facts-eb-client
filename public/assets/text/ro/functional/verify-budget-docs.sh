#!/bin/bash

# =============================================================================
# Budget Documentation Verification Script
# =============================================================================
# Generates deep research verification prompts for Romanian budget classification
# documentation files, using Claude AI deep links for automated research.
#
# Usage: ./verify-budget-docs.sh
# =============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$SCRIPT_DIR/research-verifications"
GENERATE_LINK_SCRIPT="$HOME/.claude/skills/deep-research/scripts/generate-link.py"
DATE_STAMP=$(date +%Y-%m-%d)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verification prompt template (Romanian)
read -r -d '' VERIFICATION_PROMPT << 'PROMPT_EOF' || true
Efectuează o verificare aprofundată și detaliată a documentației bugetare pentru clasificația funcțională românească prezentată mai jos.

## Context
Acest document face parte din platforma Transparenta.eu care prezintă clasificația bugetară funcțională conform Ordinului MFP nr. 1954/2005. Platforma este destinată analizei datelor bugetare publice din România.

## Obiectiv
Verifică acuratețea, completitudinea și calitatea documentației pentru a asigura că informațiile prezentate sunt corecte și utile pentru utilizatori fără pregătire de specialitate bugetară.

## Checklist de Verificare

### 1. Acuratețe Legală și Tehnică (CRITIC)
Verifică următoarele aspecte critice:
- [ ] Codul bugetar (capitol/subcapitol) corespunde cu Ordinul MFP nr. 1954/2005
- [ ] Denumirea oficială este identică cu cea din Anexa I (clasificația veniturilor) sau Anexa II (clasificația cheltuielilor)
- [ ] Referințele legislative sunt actuale și corect citate (verifică pe legislatie.just.ro)
- [ ] Semnul matematic (+/-) pentru calcule bugetare este corect documentat
- [ ] Tratamentul în consolidare (buget general consolidat) este corect specificat
- [ ] Cotele de impozitare și alte procente menționate sunt corecte și actuale
- [ ] Termenele de plată și declarare (dacă sunt menționate) sunt corecte

### 2. Completitudine și Structură
Verifică prezența și corectitudinea secțiunilor:
- [ ] Secțiunea "Definiție și scop" este prezentă și completă
- [ ] Secțiunea "Cum funcționează în practică" explică mecanismul (cine plătește, cine primește, cum se execută)
- [ ] Secțiunea "Utilizare în calcul și impact bugetar" specifică impactul pe tipuri de bugete
- [ ] Secțiunea "Aspecte importante" acoperă cazuri speciale, excepții și modificări recente
- [ ] Secțiunea "Interpretare pentru analiză tehnică și consolidare" oferă ghid pentru analiza datelor
- [ ] Secțiunea "Documente relevante" conține referințe la legislația primară
- [ ] Subcapitolele și paragrafele sunt listate conform clasificației oficiale MFP

### 3. Claritate și Calitate Conținut
Verifică calitatea explicațiilor:
- [ ] Explicațiile sunt clare și accesibile pentru un utilizator fără pregătire de specialitate
- [ ] Terminologia este consistentă cu nomenclatura oficială MFP
- [ ] Nu există erori factuale sau date inventate
- [ ] Exemplele practice (dacă există) sunt relevante și au surse citate
- [ ] Fluxul financiar este ilustrat clar
- [ ] Nu există cod SQL, sintaxă de programare sau referințe tehnice de implementare

### 4. Link-uri și Referințe
Verifică validitatea link-urilor:
- [ ] Link-urile către legislatie.just.ro funcționează și afișează documentul corect
- [ ] Link-urile către mfinante.gov.ro funcționează
- [ ] Referințele legislative citate sunt corecte (număr și an)

### 5. Limba Română
Verifică calitatea limbii:
- [ ] Gramatică și ortografie corecte
- [ ] Diacritice corecte (ș, ț, ă, â, î - forme Unicode corecte, nu formele vechi ş, ţ)
- [ ] Stilul este consistent în tot documentul (formal, tehnic)
- [ ] Acronimele sunt explicate la prima utilizare

### 6. Conformitate cu Standarde
Verifică dacă este aplicabil:
- [ ] Maparea COFOG (clasificare internațională) este prezentă și corectă
- [ ] Corespondența cu clasificația economică este menționată unde este relevant

## Resurse pentru verificare
Folosește următoarele surse oficiale pentru a verifica informațiile:

1. **Ordinul MFP nr. 1954/2005** - legislatie.just.ro/Public/DetaliiDocument/67596
2. **Anexa I - Clasificația veniturilor**: mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/AnexanrI_13102025.xls
3. **Anexa II - Clasificația cheltuielilor**: mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/AnexanrII_29012025.xls
4. **Anexa 7 - Corespondență COFOG**: mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/Anexanr7_13052025.xls
5. **Codul Fiscal** - legislatie.just.ro/Public/DetaliiDocument/171282
6. **Legea 500/2002 - Finanțele publice** - legislatie.just.ro/Public/DetaliiDocumentAfis/37954
7. **Execuție bugetară MFP** - mfinante.gov.ro/domenii/bugetul-de-stat/informatii-executie-bugetara

## Format de răspuns dorit

Structurează răspunsul astfel:

### 1. Rezumat General
Un paragraf scurt cu concluzia generală a verificării.

### 2. Probleme Critice Găsite
Lista problemelor care necesită corectare imediată (dacă există):
- Erori în codurile bugetare
- Denumiri oficiale incorecte
- Referințe legislative greșite sau expirate
- Date factuale incorecte

### 3. Probleme Minore / Sugestii de Îmbunătățire
Lista aspectelor care ar putea fi îmbunătățite:
- Clarificări necesare
- Informații lipsă
- Formatare
- Link-uri nefuncționale

### 4. Confirmări ale Informațiilor Corecte
Lista aspectelor verificate și confirmate ca fiind corecte:
- Cod bugetar corect
- Denumire oficială corectă
- Referințe legislative valide
- Etc.

### 5. Surse Consultate
Lista link-urilor și documentelor consultate pentru verificare.

---

## Conținutul fișierului de verificat:

PROMPT_EOF

# Check if generate-link.py exists
if [[ ! -f "$GENERATE_LINK_SCRIPT" ]]; then
    echo -e "${RED}Error: generate-link.py not found at $GENERATE_LINK_SCRIPT${NC}"
    echo "Please ensure the deep-research skill is properly installed."
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo -e "${GREEN}Created output directory: $OUTPUT_DIR${NC}"

# Count total files
total_files=$(find "$SOURCE_DIR" -maxdepth 1 -name "*.md" -type f | wc -l | tr -d ' ')
current=0

echo -e "${YELLOW}Found $total_files .md files to process${NC}"
echo "=========================================="

# Process each .md file sequentially
for file in "$SOURCE_DIR"/*.md; do
    # Skip if it's this script's output or not a regular file
    [[ ! -f "$file" ]] && continue

    filename=$(basename "$file" .md)

    # Skip files that might be scripts or non-documentation
    [[ "$filename" == "verify-budget-docs" ]] && continue

    current=$((current + 1))
    output_file="$OUTPUT_DIR/research-$DATE_STAMP-verify-$filename.md"

    echo -e "\n${YELLOW}[$current/$total_files] Processing: $filename.md${NC}"

    # Read file content
    file_content=$(cat "$file")

    # Get the first line to extract the title (usually "# Capitol XX - Name")
    first_line=$(head -n 1 "$file")

    # Create reference file with prompt + content
    cat > "$output_file" << EOF
# Deep Research: Verificare $filename

$first_line

## URL

[PASTE URL HERE AFTER STARTING RESEARCH]

## Prompt

\`\`\`
$VERIFICATION_PROMPT

$file_content
\`\`\`

## Context

- **Created**: $(date '+%Y-%m-%d %H:%M:%S')
- **Source File**: $file
- **Working Directory**: $(pwd)

## Research Results

[PASTE RESEARCH RESULTS HERE]

---

## Notes
<!-- Add any notes about the verification process here -->
EOF

    echo -e "  ${GREEN}Created: $output_file${NC}"

    # Generate deep link
    if python3 "$GENERATE_LINK_SCRIPT" "$output_file" 2>/dev/null; then
        echo -e "  ${GREEN}Deep link generated successfully${NC}"
    else
        echo -e "  ${YELLOW}Warning: Could not generate deep link (URL may be too long)${NC}"
    fi

done

echo ""
echo "=========================================="
echo -e "${GREEN}Complete! Generated $current verification files.${NC}"
echo -e "Output directory: ${YELLOW}$OUTPUT_DIR${NC}"
echo ""
echo "Next steps:"
echo "1. Open each file in $OUTPUT_DIR"
echo "2. Click the deep link (or copy the prompt if link is too long)"
echo "3. Paste the research results back into the file"
