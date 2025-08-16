# PixSelf Character Creation Studio

A modern 8-bit pixel art character creator built with Next.js 15, TypeScript, and Shadcn/ui. Create, customize, and download your own retro-style pixel avatars with an intuitive interface and comprehensive customization options.

## ✨ Features

### 🎨 Character Customization
- **7 Body Parts**: Hair, Head, Eyes, Eyebrows, Mouth, Body, and Costume
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
    └── image/            # Background images
```

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