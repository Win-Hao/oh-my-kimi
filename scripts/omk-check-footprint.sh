#!/usr/bin/env bash
# 检查这个 fork 对上游源码的侵入面没有扩大。
# CI 和本地跑的是同一份逻辑——别在 workflow 里另抄一份，会走样。
#
# 用法：./scripts/omk-check-footprint.sh          检查已提交内容 + 工作区
#       ./scripts/omk-check-footprint.sh --committed  只检查已提交内容（CI 用）
set -euo pipefail
cd "$(dirname "$0")/.."

# 属于 omk 自己的路径，不算侵入
OURS='^(packages/omk/|site/|scripts/omk-|\.github/workflows/omk-)'
# 有意改动的上游文件白名单。新增之前先想清楚，并记进 DIVERGENCES.md
ALLOWED='^(apps/kimi-code/src/main\.ts|apps/kimi-code/package\.json|README\.md|README\.en\.md|CLAUDE\.md|DIVERGENCES\.md|pnpm-lock\.yaml)$'

if ! git rev-parse --verify --quiet upstream/main >/dev/null; then
  git remote add upstream https://github.com/MoonshotAI/kimi-code.git 2>/dev/null || true
  git fetch --quiet --no-tags upstream main:refs/remotes/upstream/main
fi

BASE="$(git merge-base HEAD upstream/main)"
echo "上游基线：${BASE}"

if [ "${1:-}" = "--committed" ]; then
  CHANGED="$(git diff --name-only "${BASE}..HEAD")"
else
  # 连工作区一起看，否则「改了但还没 commit」会漏掉（本地曾因此漏过一次）
  CHANGED="$(git diff --name-only "${BASE}"; git ls-files --others --exclude-standard)"
fi

OUTSIDE="$(echo "${CHANGED}" | sort -u | grep -vE "${OURS}" | grep -vE "${ALLOWED}" || true)"

if [ -n "${OUTSIDE}" ]; then
  echo "⚠️  以下上游文件被改动，超出了约定的侵入面："
  echo "${OUTSIDE}" | sed 's/^/    /'
  echo
  echo "先想清楚能不能改成「在 packages/omk 里加新东西」。"
  echo "确实要改的话：记进 DIVERGENCES.md，并把路径加进本脚本的 ALLOWED。"
  exit 1
fi

echo "✅ 侵入面没有扩大"
