# Translation Insertion Script

This script automates the process of inserting Romanian translations into the `messages.po` file based on grep output.

## Purpose

When you have translations in a grep output format (with line numbers and context), this script will:
1. Parse the grep output to extract `msgid` and `msgstr` pairs
2. Find matching `msgid` entries in the Romanian locale file
3. Update empty `msgstr ""` entries with the translations

## Usage

### Basic Usage

```bash
# From a file
cat your_grep_output.txt | python3 insert_translations.py

# Or directly with stdin
python3 insert_translations.py < your_grep_output.txt
```

### Example with the provided sample

```bash
python3 insert_translations.py < example_grep_input.txt
```

## Input Format

The script expects grep output with context lines (typically generated with `grep -B 2 -A 0` or similar). Example:

```
--
./src/locales/ro/messages.po-33-#: src/routes/cookie-policy.lazy.tsx:53
./src/locales/ro/messages.po-34-msgid "<0>__clerk_*</0>: Various Clerk cookies..."
./src/locales/ro/messages.po:35:msgstr "<0>__clerk_*</0>: Diverse cookie-uri Clerk..."
--
./src/locales/ro/messages.po-37-#: src/routes/cookie-policy.lazy.tsx:51
./src/locales/ro/messages.po-38-msgid "<0>__clerk_db_jwt</0>: Session token for authentication..."
./src/locales/ro/messages.po:39:msgstr "<0>__clerk_db_jwt</0>: Token de sesiune pentru autentificare..."
```

## How It Works

1. **Parse Input**: The script reads the grep output and extracts pairs of `msgid` and `msgstr`
2. **Match Entries**: For each `msgid` found, it searches the Romanian `messages.po` file
3. **Update Empty Entries**: When it finds a matching `msgid` with an empty `msgstr ""`, it replaces it with the translation
4. **Preserve Existing**: Entries that already have translations are left unchanged

## Output

The script provides progress information:
- Number of translations found in input
- Number of translations updated in the file
- Final success message

Example output:
```
Parsing 15 lines of input...
Found 3 translations
Reading ./src/locales/ro/messages.po...
Read 5000 lines from PO file
Updating translations...
Writing 3 updates to ./src/locales/ro/messages.po...
✓ Successfully updated 3 translations!
```

## Generating Input from Existing Translations

If you have an existing version of `messages.po` with translations, you can generate the grep format input:

```bash
# Search for all msgstr lines that are not empty
grep -B 2 'msgstr "' src/locales/ro/messages.po | grep -v '^msgstr ""$' > translations.txt
```

## Safety Features

- **Non-destructive**: Only updates empty `msgstr ""` entries
- **Preserves formatting**: Maintains the exact structure of the PO file
- **Validation**: Skips invalid or malformed input lines
- **Dry-run capability**: Check the script output before committing changes

## After Running

After inserting translations, you should:

1. **Verify changes**: Use git diff to review what was changed
   ```bash
   git diff src/locales/ro/messages.po
   ```

2. **Compile translations**: Run the i18n compile command
   ```bash
   yarn i18n:compile
   ```

3. **Test**: Verify translations appear correctly in the application
   ```bash
   yarn dev
   ```

## Troubleshooting

### No translations found
- Check that your input file has the correct grep format
- Ensure msgid and msgstr lines are properly formatted with quotes

### No updates made
- All matching msgid entries may already have translations
- The msgid text must match exactly (including quotes and special characters)

### Encoding issues
- Ensure your input file is UTF-8 encoded
- The PO files use UTF-8 encoding

## Files

- `insert_translations.py` - Main script
- `example_grep_input.txt` - Example input file for testing
- `src/locales/ro/messages.po` - Target Romanian translation file (not modified by git until you run the script)
