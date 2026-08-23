#!/usr/bin/env bash
# 查当前 HEAD 这次提交的 CI 结果，等它跑完。
#
# 为什么需要这个脚本：push 之后立刻用 `gh run list --limit 1` 取 run，
# 那一刻 GitHub 还没创建新 run，取到的是**上一次**（很可能是绿的）——
# 于是你会看到一个假的成功。踩过一次，别再踩。
#
# 用法：./scripts/omk-ci-status.sh        等 HEAD 的 CI 跑完
#       ./scripts/omk-ci-status.sh <sha>  查指定提交
set -euo pipefail
cd "$(dirname "$0")/.."

SHA="${1:-$(git rev-parse HEAD)}"
# 必须显式从 origin 取：这个仓库有 upstream remote，
# `gh repo view` 会挑中 MoonshotAI/kimi-code，查到别人家的 CI 去。
REPO="$(git remote get-url origin | sed -E 's#.*github\.com[:/]##; s#\.git$##')"
echo "提交 ${SHA:0:9} @ ${REPO}"

# 等 run 出现（push 后 GitHub 创建 run 有延迟）
RID=""
for _ in $(seq 1 30); do
  RID="$(gh run list --repo "${REPO}" --commit "${SHA}" --workflow=omk-ci.yml \
         --limit 1 --json databaseId --jq '.[0].databaseId // empty')"
  [ -n "${RID}" ] && break
  sleep 4
done

if [ -z "${RID}" ]; then
  echo "❌ 两分钟内没等到这次提交的 run。检查是否已 push，或 workflow 是否被禁用。"
  exit 1
fi

gh run watch "${RID}" --repo "${REPO}" --exit-status
