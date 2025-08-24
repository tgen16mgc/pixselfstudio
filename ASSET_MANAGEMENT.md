# PixSelf Asset Management System

This document explains how to manage character assets in the PixSelf application.

## Adding or Removing Character Assets

The application supports automatic detection of character asset changes. Follow these steps to add or remove assets:

### 1. Place New Assets in the Correct Folder

Assets should be placed in the correct folder structure under `public/assets/character/`:

```
public/assets/character/
├── accessories/
│   ├── earring/
│   └── glasses/
├── body/
│   ├── body/
│   └── clothes/
├── face/
│   ├── blush/
│   ├── eyebrows/
│   ├── eyes/
│   └── mouth/
└── hair/
    ├── hair-behind/
    └── hair-front/
```

### 2. Follow the Naming Convention

Assets should follow this naming convention:

- Base assets: `{part-type}-{asset-id}.png`
  - Example: `hair-front-tomboy.png`, `eyes-happy.png`

- Color variants: `{part-type}-{asset-id}-{color}.png` 
  - Example: `hair-front-tomboy-brown.png`, `eyes-happy-blue.png`

### 3. Run the Asset Check Script

After adding or removing assets, run:

```bash
npm run check-assets
```

This will:
- Scan all asset folders
- Detect new or removed assets
- Update the asset registry
- Update the static configuration files

### 4. Auto Import with Server Restart

For convenience, you can use the auto-import script:

```bash
npm run auto-import
```

This will:
- Check for asset changes
- Ask if you want to restart the development server
- Restart the server if confirmed

## Supported Color Variants

The following color names are supported for variants:
- black, brown, blonde, red
- purple, blue, pink, white
- yellow, wineRed, fair, light
- medium, olive, deep, dark
- gold, silver, green, gray, orange

## Part Configuration

Each part can be configured with:
- Whether it supports color variants
- Whether it's optional or required
- Default asset ID

## Troubleshooting

If assets are not appearing in the application:
1. Make sure they follow the naming convention
2. Run `npm run check-assets` to update the registry
3. Restart the development server
4. Check the console for any error messages
