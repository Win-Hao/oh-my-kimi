#!/usr/bin/env bash
# 同步上游。个人 fork 不提 PR，所以用 merge 不用 rebase：
# merge 每次只处理「上次同步到现在」的增量，rebase 每次都重放你所有的提交。
#
# 用法：./scripts/omk-sync.sh          预览 + 同步
#       ./scripts/omk-sync.sh --dry    只预览，不动
#
# 注意：变量一律写成 ${VAR}。裸 $VAR 后面跟中文全角字符时，
# bash 会把全角字符当成变量名的一部分，报 unbound variable。
set -euo pipefail
cd "$(dirname "$0")/.."

DRY=0
[ "${1:-}" = "--dry" ] && DRY=1

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 工作区不干净，先提交或 stash"
  git status --short
  exit 1
fi

git fetch --quiet upstream
BASE="$(git merge-base HEAD upstream/main)"
FROM="$(git rev-parse --short HEAD)"
TO="$(git rev-parse --short upstream/main)"

if [ "${BASE}" = "$(git rev-parse upstream/main)" ]; then
  echo "✅ 已是最新（upstream/main = ${TO}）"
  exit 0
fi

COUNT="$(git rev-list --count 'HEAD..upstream/main')"
echo "⬇️  上游有 ${COUNT} 个新提交：${FROM}..${TO}"
echo

# 冲突预警：你改过的上游文件 ∩ 上游这次改过的文件
MINE="$(git diff --name-only "${BASE}..HEAD")"
THEIRS="$(git diff --name-only "${BASE}..upstream/main")"
OVERLAP="$(comm -12 <(echo "${MINE}" | sort -u) <(echo "${THEIRS}" | sort -u) || true)"

if [ -n "${OVERLAP}" ]; then
  echo "⚠️  这些文件你我都改过，可能冲突："
  echo "${OVERLAP}" | sed 's/^/    /'
  echo
  echo "   解冲突前先读一遍 DIVERGENCES.md，确认你的改动不会被上游版本盖掉。"
  echo "   判断上游是「小改」还是「重写」： git diff HEAD upstream/main -- <文件>"
else
  echo "✅ 零重叠，这次 merge 应该是干净的"
fi
echo

if [ "${DRY}" = "1" ]; then
  echo "(--dry，到此为止)"
  exit 0
fi

git merge upstream/main --no-edit -m "chore(omk): 同步上游 (${FROM}..${TO})"
echo
echo "✅ 同步完成。接下来跑一遍验证："
echo "   pnpm install && pnpm --filter @omk/core test"
