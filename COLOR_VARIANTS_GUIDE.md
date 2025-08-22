# 🎨 Color Variants Guide

This guide explains how to add color variants to your character assets in Pixself Studio.

## 📋 Overview

Color variants allow users to customize the colors of different character parts (hair, clothes, eyes, etc.) while keeping the same style/shape. There are two main approaches:

### Option 1: Multiple Asset Files (Recommended)
Create separate PNG files for each color variant of an asset.

### Option 2: Programmatic Color Application
Apply colors dynamically using canvas manipulation (more complex but flexible).

## 🎯 Option 1: Multiple Asset Files

### Step 1: Create Color Variant PNGs

For each asset that supports colors, create multiple PNG files with different colors:

```
public/assets/character/hair/hair-front/
├── hair-front-default.png          (original/default color)
├── hair-front-default-black.png    (black variant)
├── hair-front-default-brown.png    (brown variant)
├── hair-front-default-blonde.png   (blonde variant)
├── hair-front-default-red.png      (red variant)
├── hair-front-default-purple.png   (purple variant)
└── hair-front-default-blue.png     (blue variant)
```

### Step 2: Naming Convention

Use this naming pattern:
```
[part-name]-[style]-[color].png
```

Examples:
- `hair-front-default-black.png`
- `clothes-aotheneu-red.png`
- `eyes-medium-blue.png`
- `body-default-fair.png`

### Step 3: Color Palette Reference

Use these predefined colors for consistency:

#### Hair Colors
- `black`: #2C1810
- `brown`: #8B4513
- `blonde`: #DAA520
- `red`: #DC143C
- `purple`: #9370DB
- `blue`: #00CED1

#### Body/Skin Colors
- `fair`: #FDBCB4
- `light`: #EEA990
- `medium`: #C68642
- `olive`: #8D5524
- `deep`: #654321
- `dark`: #3C2414

#### Clothes Colors
- `red`: #FF6B6B
- `blue`: #4ECDC4
- `green`: #45B7D1
- `yellow`: #96CEB4
- `purple`: #FFEAA7
- `orange`: #DDA0DD

#### Eye Colors
- `brown`: #8B4513
- `blue`: #4169E1
- `green`: #228B22
- `gray`: #808080
- `purple`: #9370DB
- `red`: #DC143C

#### Mouth Colors
- `darkRed`: #DC143C
- `red`: #FF6347
- `mutedRed`: #CD5C5C
- `orange`: #FF8C00
- `pink`: #FF69B4
- `purple`: #9370DB

#### Blush Colors
- `pink`: #FFB6C1
- `red`: #FF6347
- `mutedRed`: #CD5C5C
- `orange`: #FF8C00
- `darkRed`: #DC143C
- `purple`: #9370DB

### Step 4: Update Configuration

Run the automated script to add color variants to your configuration:

```bash
npm run colors
```

This script will:
1. Scan your existing assets
2. Add color variant entries to the configuration
3. Update the `character-assets.ts` file automatically

### Step 5: Upload to GitHub

After creating your color variant PNGs:

```bash
# Add the new files
git add public/assets/character/

# Commit the changes
git commit -m "feat: add color variants for character assets"

# Push to GitHub
git push origin main

# Update CDN configuration
npm run cdn
```

## 🎯 Option 2: Programmatic Color Application

For more advanced color manipulation, you can modify the drawing system to apply colors dynamically:

### Step 1: Update Types

Add color support to the `PartSelection` interface in `types/character.ts`:

```typescript
export interface PartSelection {
  assetId: string
  enabled: boolean
  color?: string  // Add color property
}
```

### Step 2: Update Drawing Function

Modify `utils/character-drawing.ts` to apply colors:

```typescript
// In drawCharacterToCanvas function
if (img) {
  // Apply color if specified
  if (selection.color) {
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = selection.color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }
  
  // Draw the image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
}
```

## 🔧 Manual Configuration

If you prefer to manually configure color variants, edit `config/character-assets.ts`:

```typescript
{
  key: "hairFront",
  label: "HAIR FRONT",
  icon: "💇",
  category: "Hair",
  assets: [
    {
      id: "default",
      name: "Default HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-default.png",
      enabled: true,
    },
    {
      id: "default-black",
      name: "Default HAIR FRONT (Black)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-default-black.png",
      enabled: true,
      color: "#2C1810",
    },
    {
      id: "default-brown",
      name: "Default HAIR FRONT (Brown)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-default-brown.png",
      enabled: true,
      color: "#8B4513",
    },
    // ... more color variants
  ],
  defaultAsset: "default",
  optional: true,
}
```

## 🎨 Creating Color Variants in Image Editing Software

### Using Photoshop/GIMP:

1. **Open your original asset** (e.g., `hair-front-default.png`)
2. **Duplicate the layer** for each color variant
3. **Use Hue/Saturation adjustment** or **Color Balance** to change colors
4. **Save as** with the color name (e.g., `hair-front-default-black.png`)

### Using Online Tools:

1. **Upload your PNG** to an online color editor
2. **Adjust hue/saturation** to get the desired color
3. **Download** with the new filename

### Using Command Line (ImageMagick):

```bash
# Convert to black hair
convert hair-front-default.png -modulate 0,0,0 hair-front-default-black.png

# Convert to brown hair
convert hair-front-default.png -modulate 30,50,80 hair-front-default-brown.png

# Convert to blonde hair
convert hair-front-default.png -modulate 60,80,120 hair-front-default-blonde.png
```

## 📁 Folder Structure

Organize your color variants in the same folder as the original asset:

```
public/assets/character/
├── body/
│   └── body/
│       ├── body-default.png
│       ├── body-default-fair.png
│       ├── body-default-light.png
│       └── body-default-medium.png
├── hair/
│   ├── hair-front/
│   │   ├── hair-front-default.png
│   │   ├── hair-front-default-black.png
│   │   └── hair-front-default-brown.png
│   └── hair-behind/
│       ├── hair-behind-default.png
│       └── hair-behind-default-black.png
└── clothes/
    └── clothes/
        ├── clothes-default.png
        ├── clothes-default-red.png
        └── clothes-default-blue.png
```

## 🚀 Quick Start

1. **Create color variant PNGs** for your assets
2. **Run the automation script**: `npm run colors`
3. **Upload to GitHub**: `git add . && git commit -m "add color variants" && git push`
4. **Update CDN**: `npm run cdn`

## 🎯 Best Practices

1. **Keep original assets** - Always maintain the original/default version
2. **Use consistent naming** - Follow the `[part]-[style]-[color].png` pattern
3. **Maintain transparency** - Ensure PNG files preserve alpha channels
4. **Test color combinations** - Make sure colors work well together
5. **Document your colors** - Keep track of which colors you've created

## 🔍 Troubleshooting

### Color variants not showing up?
- Check that the PNG files exist in the correct location
- Verify the file names match the configuration
- Run `npm run cdn` to update CDN URLs

### Colors look wrong?
- Ensure you're using the correct hex color values
- Check that the PNG files have proper transparency
- Verify the color application method (file-based vs programmatic)

### Performance issues?
- Optimize PNG files for web (reduce file size)
- Consider using WebP format for better compression
- Implement lazy loading for color variants

## 📚 Additional Resources

- [PNG Optimization Guide](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/image-optimization)
- [Color Theory for Designers](https://www.smashingmagazine.com/2010/02/color-theory-for-designers-part-1-the-meaning-of-color/)
- [Canvas Color Manipulation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas)
