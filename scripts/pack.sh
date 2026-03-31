#!/bin/bash
# ============================================
# kugougames-live-helper 浏览器扩展打包脚本
# 打包为可提交到 Chrome/Edge 商店的 zip 文件
#
# 用法：
#   bash scripts/pack.sh
#
# 输出：
#   dist/kugougames-live-helper-v{版本号}.zip
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_ROOT/dist"
MANIFEST="$PROJECT_ROOT/manifest.json"
DEV_DIR="$DIST_DIR/dev"
MODE="${1:-pack}"  # 默认 pack 模式，传 dev 则为开发调试模式

# 扩展实际需要的文件列表（只有这些会被复制/打包）
EXT_FILES=(
    "manifest.json"
    "background.js"
    "content-script.js"
    "icons/"
)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================
# dev 模式：生成干净的本地调试目录
# 用法：bash scripts/pack.sh dev
# Chrome 加载 dist/dev/ 目录即可调试
# ============================================
if [ "$MODE" = "dev" ]; then
    echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   🔧 开发调试模式                        ║${NC}"
    echo -e "${BLUE}║   生成干净的扩展目录供浏览器加载          ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
    echo ""

    # 清理旧的 dev 目录
    rm -rf "$DEV_DIR"
    mkdir -p "$DEV_DIR"

    # 只复制扩展需要的文件
    for item in "${EXT_FILES[@]}"; do
        if [ -d "$PROJECT_ROOT/$item" ]; then
            cp -r "$PROJECT_ROOT/$item" "$DEV_DIR/$item"
        elif [ -f "$PROJECT_ROOT/$item" ]; then
            cp "$PROJECT_ROOT/$item" "$DEV_DIR/$item"
        else
            echo -e "  ${YELLOW}⚠ 跳过不存在的: $item${NC}"
        fi
    done

    echo -e "${GREEN}✅ 开发目录已生成: ${CYAN}dist/dev/${NC}"
    echo ""
    echo -e "  📁 目录内容:"
    ls -la "$DEV_DIR" | tail -n +2 | while read line; do
        echo -e "     $line"
    done
    echo ""
    echo -e "${YELLOW}📋 使用方法:${NC}"
    echo -e "  1. 打开 Chrome → ${CYAN}chrome://extensions/${NC}"
    echo -e "  2. 开启「开发者模式」"
    echo -e "  3. 点击「加载已解压的扩展程序」"
    echo -e "  4. 选择 ${CYAN}dist/dev/${NC} 目录"
    echo -e ""
    echo -e "${YELLOW}💡 提示:${NC}"
    echo -e "  修改代码后重新运行 ${CYAN}bash scripts/pack.sh dev${NC}"
    echo -e "  然后在 Chrome 扩展页面点击 🔄 刷新按钮即可"
    exit 0
fi

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🧩 浏览器扩展打包工具                  ║${NC}"
echo -e "${BLUE}║   适用于 Chrome Web Store / Edge Add-ons  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# 1. 检查必要文件
# ============================================
echo -e "${CYAN}[1/4]${NC} 检查扩展文件..."

if [ ! -f "$MANIFEST" ]; then
    echo -e "${RED}✗ 错误: 未找到 manifest.json${NC}"
    echo -e "  路径: $MANIFEST"
    exit 1
fi

REQUIRED_FILES=("manifest.json" "background.js" "content-script.js")
MISSING=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PROJECT_ROOT/$file" ]; then
        echo -e "  ${RED}✗ 缺少: $file${NC}"
        MISSING=1
    else
        echo -e "  ${GREEN}✓${NC} $file"
    fi
done

ICON_SIZES=("16" "48" "128")
for size in "${ICON_SIZES[@]}"; do
    icon_file="icons/icon${size}.png"
    if [ ! -f "$PROJECT_ROOT/$icon_file" ]; then
        echo -e "  ${RED}✗ 缺少图标: $icon_file${NC}"
        MISSING=1
    else
        echo -e "  ${GREEN}✓${NC} $icon_file"
    fi
done

if [ "$MISSING" -eq 1 ]; then
    echo -e "\n${RED}✗ 存在缺失文件，请补全后重试${NC}"
    exit 1
fi

echo -e "  ${GREEN}所有必要文件检查通过 ✓${NC}"

# ============================================
# 2. 读取版本号
# ============================================
echo ""
echo -e "${CYAN}[2/4]${NC} 读取扩展信息..."

if command -v jq &> /dev/null; then
    VERSION=$(jq -r '.version' "$MANIFEST")
    EXT_NAME=$(jq -r '.name' "$MANIFEST")
    MANIFEST_VERSION=$(jq -r '.manifest_version' "$MANIFEST")
else
    VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$MANIFEST" | head -1 | grep -o '"[^"]*"$' | tr -d '"')
    EXT_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$MANIFEST" | head -1 | grep -o '"[^"]*"$' | tr -d '"')
    MANIFEST_VERSION=$(grep -o '"manifest_version"[[:space:]]*:[[:space:]]*[0-9]*' "$MANIFEST" | grep -o '[0-9]*$')
fi

if [ -z "$VERSION" ]; then
    echo -e "${RED}✗ 无法从 manifest.json 读取版本号${NC}"
    exit 1
fi

echo -e "  📦 扩展名称:    ${CYAN}${EXT_NAME}${NC}"
echo -e "  📋 Manifest:    v${MANIFEST_VERSION}"
echo -e "  🏷️  版本号:      ${CYAN}v${VERSION}${NC}"

# ============================================
# 3. 打包 zip
# ============================================
echo ""
echo -e "${CYAN}[3/4]${NC} 打包扩展..."

# 创建输出目录
mkdir -p "$DIST_DIR"

ZIP_NAME="kugougames-live-helper-v${VERSION}.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"

# 如果已存在同版本的包，先删除
if [ -f "$ZIP_PATH" ]; then
    echo -e "  ${YELLOW}⚠ 已存在同版本包，将覆盖: $ZIP_NAME${NC}"
    rm -f "$ZIP_PATH"
fi

# 从项目根目录打包，只包含扩展需要的文件
cd "$PROJECT_ROOT"
zip -r "$ZIP_PATH" \
    manifest.json \
    background.js \
    content-script.js \
    icons/ \
    > /dev/null 2>&1

# ============================================
# 4. 输出结果
# ============================================
echo ""
echo -e "${CYAN}[4/4]${NC} 打包完成！"
echo ""

# 获取文件大小
if [ -f "$ZIP_PATH" ]; then
    FILE_SIZE=$(du -h "$ZIP_PATH" | cut -f1)
    echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ 扩展打包成功！                      ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  📁 输出文件:  ${CYAN}dist/${ZIP_NAME}${NC}"
    echo -e "  📏 文件大小:  ${FILE_SIZE}"
    echo ""
    echo -e "${YELLOW}📋 提交指南:${NC}"
    echo -e "  ┌─────────────────────────────────────────────────┐"
    echo -e "  │ Chrome Web Store:                                │"
    echo -e "  │   https://chrome.google.com/webstore/devconsole  │"
    echo -e "  │                                                  │"
    echo -e "  │ Edge Add-ons:                                    │"
    echo -e "  │   https://partner.microsoft.com/dashboard/       │"
    echo -e "  │   microsoftedge/publishapi/overview              │"
    echo -e "  └─────────────────────────────────────────────────┘"
    echo ""

    echo -e "${CYAN}📦 zip 内容预览:${NC}"
    unzip -l "$ZIP_PATH" | head -20
    echo ""
else
    echo -e "${RED}✗ 打包失败，未生成 zip 文件${NC}"
    exit 1
fi
