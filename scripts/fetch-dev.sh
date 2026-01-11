#!/bin/bash

# Fetch Vercel protected URL with share token
URL="https://dev.transparenta.eu/ro/learning/local-budgets-guide/expenditure-basics/be-the-finance-minister"
SHARE_TOKEN="Nt2eNechmJEswSECnNAhAr60l4wvyaaE"
OUTPUT="dev.html"

curl -L -s -c /tmp/cookies.txt -b /tmp/cookies.txt "${URL}?_vercel_share=${SHARE_TOKEN}" -o "${OUTPUT}"
