# PixSelf Character Asset System

## Overview

The PixSelf character system allows for customizing avatars with various body parts and color variants. This document outlines the asset organization, naming conventions, and how the color variant system works.

## Asset Organization

Assets follow a standardized folder structure and naming convention:

```
/public/assets/character/
├── accessories/
│   ├── earring/
│   │   ├── default.png
│   │   └── helixmix.png
│   └── glasses/
│       └── default.png
├── body/
│   ├── body/
│   │   ├── default.png
│   │   └── v2.png
│   └── clothes/
│       ├── aotheneu.png
│       ├── dress1.png
│       ├── neu.png
│       └── somi.png
├── face/
│   ├── blush/
│   │   ├── default.png
│   │   ├── light.png
│   │   └── soft.png
│   ├── eyebrows/
│   │   ├── curved.png
│   │   ├── default.png
│   │   └── flat.png
│   ├── eyes/
│   │   ├── basic1.png
│   │   ├── default.png
│   │   ├── default-blue.png
│   │   ├── default-green.png
│   │   └── medium.png
│   └── mouth/
│       ├── default.png
│       ├── small.png
│       ├── smile.png
│       └── smile-pink.png
└── hair/
    ├── behind/
    │   ├── 2side.png
    │   └── curly.png
    └── front/
        ├── 2side.png
        ├── 2side-blue.png
        ├── 2side-purple.png
        ├── 2side-red.png
        ├── 64.png
        ├── long37.png
        ├── tomboy.png
        ├── tomboy-black.png
        ├── tomboy-blonde.png
        └── tomboy-brown.png
```

## Asset Naming Convention

Assets follow this naming pattern:

1. Base style name: `[style].png` 
   - Example: `tomboy.png`

2. Color variants: `[style]-[color].png` 
   - Example: `tomboy-brown.png`

## Color Variant System

The color variant system allows assets to have different color variations without duplicating sprite sheets. Color variants are defined in `config/color-variants.ts`.

### Supported Color Variants

- **Hair**: black, white, pink, yellow, red, wineRed, purple, blue, brown
- **Eyes**: brown, blue, green, gray, purple, red
- **Mouth**: darkRed, red, mutedRed, orange, pink, purple
- **Body**: fair, light, medium, olive, deep, dark
- **Clothes**: red, blue, green, yellow, purple, orange

## Asset Path Resolution

The asset path resolver (`utils/asset-path-resolver.ts`) handles the logic for finding asset paths, including color variants.

### How Path Resolution Works

1. When a character part is selected with a style (e.g., "tomboy")
2. The resolver checks if there's a direct match for that asset ID
3. If a color is selected (e.g., "brown"), it creates a path for "tomboy-brown.png"
4. If the file exists, it's used; otherwise, it falls back to the base style

## Adding New Assets

To add new assets:

1. Create your asset following the naming convention (`[style].png` or `[style]-[color].png`)
2. Place it in the appropriate folder based on the part type
3. Run `npm run scan` to update the asset manifest

For color variants:
1. Create a base style (e.g., `tomboy.png`)
2. Create color variants as needed (e.g., `tomboy-brown.png`, `tomboy-blue.png`)
3. The system will automatically detect and handle these variants

## Utility Scripts

The following npm scripts are available to manage assets:

- `npm run organize`: Reorganizes assets according to standardized naming
- `npm run verify`: Verifies all asset paths are working correctly
- `npm run update-paths`: Updates the application to use the new path structure
- `npm run scan`: Updates the asset manifest

## Migration Process

To migrate from the old inconsistent structure to the new one:

1. Run `npm run organize --apply` to copy assets to the new structure
2. Run `npm run update-paths` to update the application code
3. Run `npm run verify` to ensure all paths are working correctly
4. Start the application and test all color variants

## Best Practices

1. Always follow the naming convention for new assets
2. For parts that support color variants, always provide a base version without color suffix
3. Use the verification script to check for missing assets
4. Update the asset manifest after adding new assets

## Troubleshooting

- **Color variants not showing**: Check that both the base asset and color variant exist
- **Missing assets**: Run the verification script to identify which assets are missing
- **Path resolution errors**: Check the browser console for 404 errors and ensure assets are in the correct locations
