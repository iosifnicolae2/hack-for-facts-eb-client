#!/bin/bash
cat ./src/locales/ro/messages.po | grep -R -n --include='*.po' -B2 '^msgstr ""$' . 