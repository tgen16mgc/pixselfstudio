# 🎨 Asset System Refactor: PNG Recognition & Color Variants

This document outlines the complete reframing and reconstruction of the PNG asset recognition and registration system for character parts and color variants in Pixself Studio.

## 📋 Overview

The previous system had several critical problems:
- **Manual Configuration Overload**: 766 lines of hardcoded asset definitions
- **Color Variant Explosion**: Each color variant treated as a separate asset
- **Inconsistent Discovery**: Multiple discovery methods with different logic
- **Naming Convention Issues**: Inconsistent patterns across different parts
- **Asset Registration Complexity**: Assets needed manual addition to multiple places

## 🚀 New Architecture

### 1. Hierarchical Asset Structure

```typescript
// New structure: Asset → Variants → Colors
interface AssetDefinition {
  id: string
  name: string
  basePath: string
  enabled: boolean
  variants: AssetVariant[]  // Color variants
  defaultVariant: string
}

interface AssetVariant {
  id: string
  name: string
  color?: string
  path: string
  enabled: boolean
}
```

### 2. Automated Asset Discovery

The new system automatically discovers assets by:
1. **Scanning folder structure** for PNG files
2. **Parsing filenames** to extract base assets and color variants
3. **Grouping variants** under their base assets
4. **Generating metadata** automatically

### 3. Color Palette System

Predefined color palettes for different part categories:
- **Hair**: black, brown, blonde, red, purple, blue, pink, white, yellow, wineRed
- **Skin**: fair, light, medium, olive, deep, dark
- **Clothes**: red, blue, green, yellow, purple, orange, black, white
- **Eyes**: brown, blue, green, gray, purple, red
- **Accessories**: gold, silver, black, white, red, blue

## 📁 File Organization

### Current Structure
```
public/assets/character/
├── body/
│   ├── body/
│   │   ├── body-default.png
│   │   └── body-v2.png
│   └── clothes/
│       ├── clothes-aotheneu.png
│       ├── clothes-dress1.png
│       └── clothes-neu.png
├── hair/
│   ├── hair-front/
│   │   ├── hair-front-2side.png
│   │   ├── hair-front-2side-black.png
│   │   ├── hair-front-2side-brown.png
│   │   └── hair-front-64.png
│   └── hair-behind/
│       ├── hair-behind-2side.png
│       └── hair-behind-curly.png
└── face/
    ├── eyes/
    │   ├── eyes-basic1.png
    │   └── eyes-default.png
    └── mouth/
        ├── mouth-default.png
        └── mouth-small.png
```

### Naming Convention
```
[part-name]-[style]-[color].png
```

Examples:
- `hair-front-2side-black.png` → Base: "2side", Color: "black"
- `clothes-aotheneu-red.png` → Base: "aotheneu", Color: "red"
- `body-default-fair.png` → Base: "default", Color: "fair"

## 🔧 Implementation

### 1. Asset Registry System

**File**: `utils/asset-registry.ts`

The core system that:
- Discovers assets automatically
- Groups variants under base assets
- Provides caching and performance optimization
- Handles error recovery

```typescript
// Usage
const registry = await assetRegistry.getRegistry()
const part = await assetRegistry.getPart('hairFront')
const asset = await assetRegistry.getAsset('hairFront', '2side')
const variant = await assetRegistry.getVariant('hairFront', '2side', '2side-black')
```

### 2. Color Palette Configuration

**File**: `config/color-palettes.ts`

Predefined color palettes with helper functions:

```typescript
// Get available colors for a part
const colors = getAvailableColors('hairFront') // ['black', 'brown', 'blonde', ...]

// Get color hex value
const hex = getColorById('hair', 'black') // "#2C1810"

// Get color name
const name = getColorName('hair', 'black') // "Black"
```

### 3. Asset Generation Script

**File**: `scripts/generate-asset-registry.js`

Automated script that:
- Scans all asset folders
- Parses filenames for variants
- Generates structured registry JSON
- Updates legacy manifest for backward compatibility

```bash
npm run registry
```

### 4. Updated Character Drawing

**File**: `utils/character-drawing.ts`

Enhanced drawing system with:
- Variant support
- Color-aware rendering
- Error handling
- Performance optimization

```typescript
// Draw with color variant
await drawCharacterToCanvas(canvas, selections, { width: 512, height: 512 })

// Get asset info with variants
const info = await getAssetInfo('hairFront', '2side', '2side-black')
```

## 🎯 Benefits of the New System

### 1. **Scalability**
- Add new assets by simply placing PNG files in folders
- No manual configuration required
- Automatic variant detection

### 2. **Maintainability**
- Single source of truth for asset structure
- Automated discovery reduces human error
- Clear separation of concerns

### 3. **Performance**
- Intelligent caching system
- Lazy loading of variants
- Optimized asset lookup

### 4. **Flexibility**
- Easy to add new color palettes
- Support for custom naming conventions
- Extensible variant system

### 5. **Developer Experience**
- Clear API for asset access
- Type-safe interfaces
- Comprehensive error handling

## 🔄 Migration Guide

### For Existing Assets

1. **No changes needed** to existing PNG files
2. **Run the registry generator**:
   ```bash
   npm run registry
   ```
3. **Update imports** in components to use new API
4. **Test color variant functionality**

### For New Assets

1. **Place PNG files** in appropriate folders
2. **Follow naming convention**: `[part]-[style]-[color].png`
3. **Run registry generator** to update configuration
4. **Assets are automatically available** in the UI

### For Developers

1. **Use new API** for asset access:
   ```typescript
   import { assetRegistry } from '@/utils/asset-registry'
   
   const part = await assetRegistry.getPart('hairFront')
   const asset = await assetRegistry.getAsset('hairFront', '2side')
   ```

2. **Handle color variants**:
   ```typescript
   const variants = await getAssetVariants('hairFront', '2side')
   const colors = await getAvailableColorsForPart('hairFront')
   ```

3. **Validate selections**:
   ```typescript
   const isValid = await validateSelection('hairFront', '2side', '2side-black')
   ```

## 🛠️ Configuration

### Part Configuration

Each part is configured with:
- **Label**: Display name
- **Icon**: UI icon
- **Category**: Grouping (Body, Face, Hair, Accessories)
- **Color Support**: Whether the part supports color variants
- **Optional**: Whether the part can be disabled

### Color Support Matrix

| Part | Color Support | Palette |
|------|---------------|---------|
| Body | ✅ | Skin |
| Clothes | ✅ | Clothes |
| Hair Front | ✅ | Hair |
| Hair Behind | ✅ | Hair |
| Eyes | ✅ | Eyes |
| Eyebrows | ❌ | - |
| Mouth | ❌ | - |
| Blush | ❌ | - |
| Earring | ✅ | Accessories |
| Glasses | ❌ | - |

## 🚀 Usage Examples

### Basic Asset Access

```typescript
// Get all parts
const parts = await getCharacterParts()

// Get specific part
const hairPart = await getPartByKey('hairFront')

// Get asset path
const path = await getAssetPath('hairFront', '2side', '2side-black')
```

### Color Variant Management

```typescript
// Get all variants for an asset
const variants = await getAssetVariants('hairFront', '2side')

// Get available colors for a part
const colors = await getAvailableColorsForPart('hairFront')

// Get color information
const colorHex = getColorById('hair', 'black')
```

### Drawing with Variants

```typescript
// Create selections with color variants
const selections: Selections = {
  hairFront: {
    assetId: '2side',
    enabled: true,
    colorVariant: '2side-black'
  }
}

// Draw character
await drawCharacterToCanvas(canvas, selections)
```

## 🔍 Troubleshooting

### Common Issues

1. **Assets not showing up**
   - Run `npm run registry` to regenerate
   - Check file naming convention
   - Verify folder structure

2. **Color variants missing**
   - Ensure PNG files follow naming pattern
   - Check color palette configuration
   - Verify part has color support enabled

3. **Performance issues**
   - Clear asset cache: `assetRegistry.clearCache()`
   - Check for large PNG files
   - Verify caching is working

### Debug Tools

```typescript
// Check registry status
const registry = await assetRegistry.getRegistry()
console.log('Registry metadata:', registry.metadata)

// Validate specific asset
const isValid = await validateSelection('hairFront', '2side', '2side-black')

// Get detailed asset info
const info = await getAssetInfo('hairFront', '2side', '2side-black')
```

## 📈 Future Enhancements

### Planned Features

1. **Dynamic Color Generation**
   - Programmatic color application
   - Real-time color preview
   - Custom color picker

2. **Asset Metadata**
   - Author information
   - Version tracking
   - Compatibility flags

3. **Advanced Discovery**
   - WebP support
   - Multiple resolution support
   - Asset optimization

4. **UI Enhancements**
   - Color palette picker
   - Variant preview
   - Asset search/filtering

## 🎯 Conclusion

The reframed asset system provides:
- **Automated discovery** of assets and variants
- **Structured organization** of color variants
- **Scalable architecture** for future growth
- **Developer-friendly API** for easy integration
- **Performance optimization** through intelligent caching

This new system eliminates the manual configuration burden while providing a robust foundation for character customization features.