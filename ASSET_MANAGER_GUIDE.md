# 🎨 PixSelf Asset Manager - Complete Guide

## 📋 Overview

The PixSelf Asset Manager handles the complex dual-system architecture for managing character assets:

1. **Style Options** → Hardcoded config (`character-assets.ts`)
2. **Color Variants** → Dynamic manifest (`color-variants-manifest.json`)

## 🚀 Quick Start

### Add a New Style
```bash
# Add a new hairstyle called "pixie"
npm run add-asset -- --file /path/to/your/pixie-hair.png --part hairFront --style pixie

# Add a new eye style called "sleepy"
npm run add-asset -- --file /path/to/sleepy-eyes.png --part eyes --style sleepy

# Add a new mouth expression called "wink"  
npm run add-asset -- --file /path/to/wink.png --part mouth --style wink
```

### Add Color Variants
```bash
# Add purple variant for existing "pixie" hairstyle
npm run add-asset -- --file /path/to/pixie-purple.png --part hairFront --style pixie --color purple

# Add blue variant for existing "sleepy" eyes
npm run add-asset -- --file /path/to/sleepy-blue.png --part eyes --style sleepy --color blue

# Add pink variant for existing "wink" mouth
npm run add-asset -- --file /path/to/wink-pink.png --part mouth --style wink --color pink
```

### Auto-Process Everything
```bash
# Automatically detect and process all PNG files in your asset folders
npm run add-asset -- --scan
```

### Remove Assets
```bash
# Remove a style and ALL its color variants
npm run add-asset -- --remove --part hairFront --style pixie

# Remove only a specific color variant
npm run add-asset -- --remove --part hairFront --style tomboy --color purple
```

### Update Existing Assets
```bash
# Update an existing base style image (keeps same part/style, replaces PNG file)
# Note: --update flag not yet implemented, manually copy files:
cp /path/to/new-image.png public/assets/character/[part]/[subfolder]/[filename].png

# Update an existing color variant image
cp /path/to/new-variant.png public/assets/character/[part]/[subfolder]/[filename].png

# Example: Update hair-behind-2tail assets
cp add34/hair-behind-2tail*.png public/assets/character/hair/hair-behind/
```

## 📁 File Organization

### Proper File Naming Convention

**Base Styles:**
```
{prefix}-{style}.png

Examples:
- hair-front-pixie.png
- eyes-sleepy.png  
- mouth-wink.png
- clothes-jacket.png
```

**Color Variants:**
```
{prefix}-{style}-{color}.png

Examples:
- hair-front-pixie-purple.png
- eyes-sleepy-blue.png
- mouth-wink-pink.png
- clothes-jacket-red.png
```

### Directory Structure
```
public/assets/character/
├── body/body/              # Body shapes
├── body/clothes/           # Clothing items
├── hair/hair-front/        # Front hair layers
├── hair/hair-behind/       # Back hair layers  
├── face/eyes/              # Eye styles
├── face/eyebrows/          # Eyebrow styles
├── face/mouth/             # Mouth expressions
├── face/blush/             # Face blush
└── accessories/
    ├── earring/            # Earring accessories
    └── glasses/            # Glasses accessories
```

## 🎯 Supported Parts & Prefixes

| Part | Prefix | Folder | Examples |
|------|--------|---------|----------|
| `body` | `body` | `body/body/` | `body-default.png`, `body-athletic.png` |
| `clothes` | `clothes` | `body/clothes/` | `clothes-dress.png`, `clothes-jacket-red.png` |
| `hairFront` | `hair-front` | `hair/hair-front/` | `hair-front-pixie.png`, `hair-front-pixie-purple.png` |
| `hairBehind` | `hair-behind` | `hair/hair-behind/` | `hair-behind-long.png`, `hair-behind-long-brown.png` |
| `eyes` | `eyes` | `face/eyes/` | `eyes-sleepy.png`, `eyes-sleepy-blue.png` |
| `eyebrows` | `eyebrows` | `face/eyebrows/` | `eyebrows-thick.png` |
| `mouth` | `mouth` | `face/mouth/` | `mouth-wink.png`, `mouth-wink-pink.png` |
| `blush` | `blush` | `face/blush/` | `blush-heavy.png` |
| `earring` | `earring` | `accessories/earring/` | `earring-hoops.png`, `earring-hoops-gold.png` |
| `glasses` | `glasses` | `accessories/glasses/` | `glasses-round.png` |

## 🌈 Supported Colors

| Color | Hex Code | Color | Hex Code |
|-------|----------|-------|----------|
| `black` | `#333333` | `white` | `#FFFFFF` |
| `brown` | `#8B4513` | `yellow` | `#FFF59D` |
| `choco` | `#D2691E` | `green` | `#4ECDC4` |
| `blonde` | `#DAA520` | `orange` | `#FFB74D` |
| `red` | `#FF8A80` | `gray` | `#9E9E9E` |
| `purple` | `#CE93D8` | `gold` | `#FFD700` |
| `blue` | `#90CAF9` | `silver` | `#C0C0C0` |
| `pink` | `#F8BBD0` | | |

## 🔧 How It Works

### 1. **Adding a Base Style**
```bash
npm run add-asset -- --file my-hair.png --part hairFront --style pixie
```

**What happens:**
1. ✅ Copies `my-hair.png` → `public/assets/character/hair/hair-front/hair-front-pixie.png`
2. ✅ Adds entry to `config/character-assets.ts` hardcoded config
3. ✅ Updates color variants manifest
4. ✅ Style appears in **AssetVariantGrid** (style selection)

### 2. **Adding a Color Variant**  
```bash
npm run add-asset -- --file my-hair-purple.png --part hairFront --style pixie --color purple
```

**What happens:**
1. ✅ Copies `my-hair-purple.png` → `public/assets/character/hair/hair-front/hair-front-pixie-purple.png`
2. ✅ Updates color variants manifest (NOT hardcoded config)
3. ✅ Color appears in **DynamicColorVariants** (color selection)

## 📊 System Architecture

### Dual System Design
```
┌─────────────────┐    ┌──────────────────────┐
│ AssetVariantGrid │    │ DynamicColorVariants │
│                 │    │                      │
│ Shows:          │    │ Shows:               │
│ • Base Styles   │    │ • Color Options      │
│ • [TOMBOY]      │    │ • [⚫][🟤][🟡]      │
│ • [PIXIE]       │    │ • [DEFAULT][BROWN]   │
│ • [2SIDE]       │    │ • [BLONDE]           │
└─────────────────┘    └──────────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌──────────────────────┐
│character-assets │    │color-variants-       │
│      .ts        │    │   manifest.json      │
│                 │    │                      │
│ Hardcoded       │    │ Generated            │
│ Configuration   │    │ Dynamically          │
└─────────────────┘    └──────────────────────┘
```

## 🛠️ Advanced Usage

### Batch Processing
```bash
# Copy all your PNG files to the appropriate folders first
cp *.png public/assets/character/hair/hair-front/

# Then auto-process everything
npm run add-asset -- --scan
```

### Manual File Organization
If you prefer to organize files manually:

1. **Copy files** to correct folders with proper naming
2. **Run scan** to update configs: `npm run add-asset -- --scan`

### Error Handling
The script validates:
- ✅ File exists
- ✅ Valid part name
- ✅ Valid color name
- ✅ Proper file naming
- ✅ Prevents duplicates

## 🔄 Complete Workflow Example

### Adding a New Character Asset Collection

1. **Create your PNG files:**
   ```
   wizard-hat.png           # Base style
   wizard-hat-blue.png      # Blue variant
   wizard-hat-purple.png    # Purple variant
   wizard-hat-gold.png      # Gold variant
   ```

2. **Add the base style:**
   ```bash
   npm run add-asset -- --file wizard-hat.png --part glasses --style wizard-hat
   ```

3. **Add color variants:**
   ```bash
   npm run add-asset -- --file wizard-hat-blue.png --part glasses --style wizard-hat --color blue
   npm run add-asset -- --file wizard-hat-purple.png --part glasses --style wizard-hat --color purple  
   npm run add-asset -- --file wizard-hat-gold.png --part glasses --style wizard-hat --color gold
   ```

4. **Test in app:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Select "glasses" part → See "wizard-hat" style option
   # Click "wizard-hat" → See blue, purple, gold color variants
   ```

### Removing Assets

1. **Remove a specific color variant:**
   ```bash
   npm run add-asset -- --remove --part glasses --style wizard-hat --color blue
   # Removes only the blue variant, keeps the base style and other colors
   ```

2. **Remove entire style:**
   ```bash
   npm run add-asset -- --remove --part glasses --style wizard-hat
   # Removes base style + ALL color variants + config entry
   ```

3. **What gets removed:**
   - ✅ PNG files from asset folders
   - ✅ Entries from hardcoded config (for base styles)
   - ✅ Updates color variants manifest
   - ✅ No broken references left behind

## ⚠️ Important Notes

### DO NOT manually edit:
- ❌ `color-variants-manifest.json` (auto-generated)
- ❌ Add color variants to `character-assets.ts` (causes bugs)

### Always use the script for:
- ✅ Adding new base styles
- ✅ Adding color variants
- ✅ Updating existing asset images
- ✅ Updating configurations

### File Requirements:
- ✅ PNG format only
- ✅ Transparent background recommended
- ✅ 640x640 pixels recommended
- ✅ Pixel art style preferred

## 🚀 Quick Commands Reference

```bash
# Show help
npm run add-asset -- --help

# Add base style
npm run add-asset -- --file FILE --part PART --style STYLE

# Add color variant  
npm run add-asset -- --file FILE --part PART --style STYLE --color COLOR

# Remove style and all variants
npm run add-asset -- --remove --part PART --style STYLE

# Remove specific color variant
npm run add-asset -- --remove --part PART --style STYLE --color COLOR

# Update existing asset image (manual copy)
cp FILE public/assets/character/[part]/[subfolder]/[filename].png

# Auto-process all files
npm run add-asset -- --scan

# Manual manifest update
npm run scan




# Start development server
npm run dev
```

## 🎉 Success!

After running the script, your new assets will be available in the character creator:

1. **Base styles** appear in the **Style Options grid** (powered by `character-assets.ts`)
2. **Color variants** appear as **round color buttons** (powered by `color-variants-manifest.json`)
3. **Character canvas updates** immediately when selected (uses GitHub raw URLs)
4. **No duplicate entries** or system conflicts

## ✅ **Verified Working System:**

- ✅ **Character Drawing**: Uses manifest data to load correct variant PNGs
- ✅ **Color Variants**: Each color shows unique visual appearance  
- ✅ **Asset Management**: Script handles dual-system architecture automatically
- ✅ **GitHub Integration**: All assets served from GitHub raw URLs for reliability
- ✅ **Automatic Manifest Updates**: Both asset manifest AND color variants manifest update automatically

## 🔧 **Recent Fix Applied:**

**Issue:** Color variants didn't show initially after adding assets
- **Problem**: Script was only updating asset manifest, not color variants manifest
- **Fix**: Script now updates BOTH manifests automatically
- **Result**: Color variants appear immediately after running the script

The script handles all the complexity of the dual-system architecture automatically! 🎨✨
