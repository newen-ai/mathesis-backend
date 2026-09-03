#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: cleanup-local-branches.sh [options]

Remove local branches that do not exist on origin.

Options:
  --repo <path>   Repository path (default: current directory)
  --force         Use git branch -D (delete even if unmerged)
  --yes           Skip confirmation prompt
  --dry-run       Only show branches that would be removed
  --help          Show this help message
EOF
}

repo_path="."
force_delete=false
assume_yes=false
dry_run=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      if [[ $# -lt 2 ]]; then
        echo "Error: --repo requires a path argument."
        exit 1
      fi
      repo_path="$2"
      shift 2
      ;;
    --force)
      force_delete=true
      shift
      ;;
    --yes)
      assume_yes=true
      shift
      ;;
    --dry-run)
      dry_run=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown option '$1'."
      usage
      exit 1
      ;;
  esac
done

if [[ ! -d "$repo_path" ]]; then
  echo "Error: repository path does not exist: $repo_path"
  exit 1
fi

cd "$repo_path"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: '$repo_path' is not a git repository."
  exit 1
fi

echo "Refreshing origin refs..."
git fetch --prune origin >/dev/null 2>&1 || {
  echo "Warning: could not fetch/prune origin. Continuing with current refs."
}

current_branch="$(git branch --show-current)"

local_only_branches="$({
  comm -23 \
    <(git for-each-ref --format='%(refname:short)' refs/heads | sort) \
    <(git for-each-ref --format='%(refname:short)' refs/remotes/origin | sed 's|^origin/||' | grep -v '^HEAD$' | sort)
} || true)"

filtered_branches=""
if [[ -n "$local_only_branches" ]]; then
  while IFS= read -r branch; do
    [[ -z "$branch" ]] && continue
    if [[ "$branch" == "$current_branch" ]]; then
      echo "Skipping current checked out branch: $branch"
      continue
    fi
    filtered_branches+="$branch"$'\n'
  done <<< "$local_only_branches"
fi

if [[ -z "$filtered_branches" ]]; then
  echo "No local-only branches to remove."
  exit 0
fi

echo ""
echo "Local branches that do not exist on origin:"
index=1
while IFS= read -r branch; do
  [[ -z "$branch" ]] && continue
  printf "  %d. %s\n" "$index" "$branch"
  index=$((index + 1))
done <<< "$filtered_branches"

if [[ "$dry_run" == true ]]; then
  echo ""
  echo "Dry run complete. No branches were deleted."
  exit 0
fi

if [[ "$assume_yes" != true ]]; then
  echo ""
  read -r -p "Delete these branches locally? [y/N] " confirmation
  case "$confirmation" in
    [yY]|[yY][eE][sS]) ;;
    *)
      echo "Cancelled."
      exit 0
      ;;
  esac
fi

delete_flag="-d"
if [[ "$force_delete" == true ]]; then
  delete_flag="-D"
fi

echo ""
failures=0
while IFS= read -r branch; do
  [[ -z "$branch" ]] && continue
  if git branch "$delete_flag" "$branch"; then
    :
  else
    failures=$((failures + 1))
  fi
done <<< "$filtered_branches"

if [[ "$failures" -gt 0 ]]; then
  echo ""
  echo "Finished with $failures branch deletion failure(s)."
  echo "Tip: re-run with --force to remove unmerged branches."
  exit 1
fi

echo ""
echo "Done. Local-only branches were removed."
