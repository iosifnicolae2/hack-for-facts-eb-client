#!/usr/bin/env bash
set -euo pipefail

shopt -s nullglob
secret_files=(*.secret.yaml)

if [ ${#secret_files[@]} -eq 0 ]; then
  echo "No *.secret.yaml files found in $(pwd)"
  exit 1
fi

for secret_file in "${secret_files[@]}"; do
  sealed_file="sealed-${secret_file/.secret.yaml/.yaml}"
  kubeseal --format=yaml \
    --controller-namespace=kube-system \
    --controller-name=sealed-secrets-controller \
    --scope strict \
    --namespace=hack-for-facts-dev \
    < "$secret_file" | \
    yq e '.metadata.annotations += {"argocd.argoproj.io/sync-wave": "-5"}' - > "$sealed_file"
done
