# PixSelf Character Creation Studio

A modern 8-bit pixel art character creator built with Next.js 15, TypeScript, and Shadcn/ui. Create, customize, and download your own retro-style pixel avatars with an intuitive interface and comprehensive customization options.

## ✨ Features

### 🎨 Character Customization
- **8 Body Parts**: Hair, Head, Eyes, Eyebrows, Mouth, Blush, Body, and Costume
- **Multiple Variants**: 10 different style variants for each body part
- **Color Palettes**: 6+ carefully curated colors for each part
- **Real-time Preview**: Live character rendering with smooth animations

### 🖥️ User Experience
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Zoom Controls**: Scale your character preview from 50% to 200%
- **Undo/Redo System**: Full history tracking with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **8-bit Sound Effects**: Authentic retro audio feedback
- **Accessibility**: Screen reader support and keyboard navigation

### 💾 Save & Share
- **Download Options**: Export in Small (384×480), Medium (768×960), or Large (1536×1920)
- **Character Gallery**: Save and manage multiple character designs locally
- **Share Templates**: Generate shareable character previews
- **Local Storage**: Persistent character saves using browser storage

### 🎮 Interactive Features
- **Randomize Button**: Generate random character combinations (Spacebar shortcut)
- **Quick Actions**: Fast access to common operations
- **Mobile Gestures**: Touch-friendly controls for mobile devices
- **Loading Animations**: Smooth transitions and feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tgen16mgc/pixselfstudio.git
cd pixselfstudio
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to start creating characters!

## 🎯 How to Use

1. **Select a Body Part**: Choose from Hair, Head, Eyes, Eyebrows, Mouth, Body, or Costume
2. **Pick a Style**: Browse through 10 different variants for each part
3. **Choose Colors**: Select from curated color palettes for each element
4. **Preview**: Watch your character update in real-time with floating animation
5. **Export**: Download your creation in your preferred size
6. **Save**: Store your favorite characters in the local gallery

### Keyboard Shortcuts
- `Ctrl/Cmd + Z`: Undo last change
- `Ctrl/Cmd + Y`: Redo change
- `Ctrl/Cmd + S`: Open download dialog
- `Spacebar`: Randomize character
- `Ctrl/Cmd + G`: Open character gallery

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui with custom PixSelf branding
- **Icons**: Lucide React
- **Fonts**: Press Start 2P (retro gaming font), Geist Sans & Mono
- **Canvas Rendering**: HTML5 Canvas with pixel-perfect rendering
- **Storage**: Browser localStorage API

## 🎨 Design System

The PixSelf brand uses a carefully crafted design system:
- **Primary Colors**: Navy blue and gold accent
- **Typography**: Pixel-perfect 8-bit style fonts
- **Components**: Custom UI components with retro gaming aesthetics
- **Animations**: Subtle floating and scaling effects
- **Responsive**: Mobile-first design with touch-friendly controls

## 📁 Project Structure

```
pixselfstudio/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main character creator page
├── components/            # React components
│   ├── character-studio/  # Character rendering components
│   ├── ui/               # Reusable UI components
│   └── modals/           # Dialog components
├── config/               # Configuration files
│   ├── 8bit-theme.ts     # Color palettes and themes
│   └── pixself-brand.ts  # Brand colors and styling
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
    └── assets/           # Character assets
        └── character/    # Character body parts
```

## 🎨 Asset Upload Guide

This guide explains how to add new character parts and assets to your Pixself Character Studio.

### 1. **Asset Requirements**

**Image Specifications:**
- **Format**: PNG with transparency
- **Size**: 640x640 pixels (recommended)
- **Style**: Pixel art style to match existing assets
- **Background**: Transparent
- **Color**: Any colors (can be recolored via the system)

### 2. **File Structure**

Your assets should be organized in the `public/assets/character/` directory:

```plaintext
public/
└── assets/
    └── character/
        ├── body.png
        ├── clothes.png
        ├── eyes.png
        ├── eyebrows.png
        ├── hair-front.png
        ├── hair-behind.png
        ├── mouth.png
        ├── earring.png (when available)
        ├── glasses.png (when available)
        └── [new-part].png
```

### 3. **Adding New Assets to Existing Parts**

To add new variants to existing parts (like new hairstyles, clothes, etc.):

**Step 1**: Upload your asset file to the appropriate directory

```plaintext
public/assets/character/hair-front-style2.png
public/assets/character/clothes-dress.png
public/assets/character/eyes-sleepy.png
```

**Step 2**: Update the `config/character-assets.ts` file:

```typescript
// Find the part you want to add to (e.g., hairFront)
{
  key: "hairFront",
  label: "HAIR FRONT",
  icon: "💇",
  category: "Hair",
  assets: [
    {
      id: "none",
      name: "None",
      path: "",
      enabled: true,
    },
    {
      id: "default",
      name: "Default Hair Front",
      path: "/assets/character/hair-front.png",
      enabled: true,
    },
    // ADD NEW ASSET HERE
    {
      id: "style2",
      name: "Curly Hair",
      path: "/assets/character/hair-front-style2.png",
      enabled: true,
    },
  ],
  defaultAsset: "default",
  optional: true,
},
```

### 4. **Adding Completely New Parts**

To add entirely new character parts (like hats, shoes, etc.):

**Step 1**: Upload your asset files

```plaintext
public/assets/character/hat-cap.png
public/assets/character/hat-beanie.png
public/assets/character/shoes-sneakers.png
```

**Step 2**: Update the TypeScript types in `types/character.ts`:

```typescript
export type PartKey = 
  | "body" 
  | "hairBehind" 
  | "clothes" 
  | "mouth" 
  | "eyes" 
  | "eyebrows" 
  | "hairFront" 
  | "earring"
  | "glasses"
  | "hat"      // ADD NEW PART
  | "shoes"    // ADD NEW PART
```

**Step 3**: Add the new part definition in `config/character-assets.ts`:

```typescript
// Add to the CHARACTER_PARTS array
{
  key: "hat",
  label: "HAT",
  icon: "🎩",
  category: "Accessories",
  assets: [
    {
      id: "none",
      name: "No Hat",
      path: "",
      enabled: true,
    },
    {
      id: "cap",
      name: "Baseball Cap",
      path: "/assets/character/hat-cap.png",
      enabled: true,
    },
    {
      id: "beanie",
      name: "Beanie",
      path: "/assets/character/hat-beanie.png",
      enabled: true,
    },
  ],
  defaultAsset: "none",
  optional: true,
},
```

**Step 4**: Update the layer order in `config/character-assets.ts`:

```typescript
// Update LAYER_ORDER to include new parts
export const LAYER_ORDER: PartKey[] = [
  "hat",        // ADD NEW PARTS IN CORRECT Z-ORDER
  "glasses",    // Highest layer
  "hairFront",
  "eyebrows",
  "eyes",
  "mouth",
  "clothes",
  "body",
  "hairBehind",
  "shoes",      // ADD SHOES BEHIND BODY
  "earring",
]
```

### 5. **Asset Creation Tips**

**Design Guidelines:**
- Keep the pixel art style consistent
- Use similar proportions to existing assets
- Ensure assets align properly when layered
- Test with different combinations

**Color Considerations:**
- Assets can use any colors initially
- The color system will allow recoloring
- Use contrasting colors for better visibility

**Positioning:**
- Center your assets in the 640x640 canvas
- Align with existing body proportions
- Consider how parts will layer together

### 6. **Testing New Assets**

After adding assets:

1. **Restart the development server**
2. **Check the browser console** for any errors
3. **Test the new parts** in the character customizer
4. **Verify layering** looks correct
5. **Test export functionality** with new assets

### 7. **Bulk Asset Upload**

For multiple assets:

**Step 1**: Organize files with consistent naming:

```plaintext
hair-front-1.png, hair-front-2.png, hair-front-3.png
clothes-shirt.png, clothes-dress.png, clothes-jacket.png
```

**Step 2**: Use the helper function to add multiple assets:

```typescript
// You can use this pattern to add multiple assets quickly
const hairStyles = [
  { id: "style1", name: "Short Hair", path: "/assets/character/hair-front-1.png" },
  { id: "style2", name: "Long Hair", path: "/assets/character/hair-front-2.png" },
  { id: "style3", name: "Curly Hair", path: "/assets/character/hair-front-3.png" },
]

// Add them to the hairFront assets array
```

### 8. **Common Issues & Solutions**

**Asset not showing:**
- Check file path is correct
- Ensure file is in `public/` directory
- Verify asset is marked as `enabled: true`

**Layering issues:**
- Adjust the `LAYER_ORDER` array
- Higher in array = rendered on top

**Performance issues:**
- Optimize PNG files for web
- Keep file sizes reasonable
- Use appropriate compression

### 9. **Script Commands**

The project includes several automation scripts for asset management:

**Basic Asset Management:**
```bash
npm run scan-assets          # Scan and discover new assets
npm run update-config        # Update static configuration
npm run update-assets        # Run both scan and update
```

**CDN Integration:**
```bash
npm run setup-cdn            # Generate GitHub CDN URLs
npm run update-assets-cdn    # Complete workflow with CDN
```

**Color Variants:**
```bash
npm run add-color-variants   # Add color variants to assets
npm run update-assets-with-colors  # Complete workflow with colors
```

**Complete Workflow (Recommended):**
```bash
npm run update-assets-with-colors  # Scan → Update → Add Colors → CDN
```

### 10. **Advanced Features**

**Conditional Assets:**

```typescript
// Assets that only show with certain combinations
{
  id: "special",
  name: "Special Style",
  path: "/assets/character/special.png",
  enabled: true,
  // You can add custom logic for when this shows
}
```

**Asset Variants:**
- Create multiple versions of the same asset
- Use consistent naming conventions
- Group related assets together

**Color Variants:**
- Add color variants to any asset using the automation script
- Supports 6 color variants per asset (hair, body, clothes, eyes, mouth, blush)
- Automatic CDN integration for all color variants

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) - The React Framework for the Web
- UI components powered by [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Inspired by classic 8-bit pixel art and retro gaming aesthetics

---

**Start creating your pixel art avatar today!** 🎮✨