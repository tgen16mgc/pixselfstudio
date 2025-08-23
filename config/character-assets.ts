import type { AssetDefinition, PartDefinition } from "@/types/character"

// Re-export types for convenience
export type { AssetDefinition, PartDefinition }

export type PartKey = "body" | "hairBehind" | "clothes" | "mouth" | "eyes" | "eyebrows" | "hairFront" | "earring" | "glasses" | "blush"

// Function to get character parts (now returns fallback for client-side hook)
export function CHARACTER_PARTS(): PartDefinition[] {
  // For now, return fallback parts
  // In the future, this could be enhanced to read from a server-side manifest
  return FALLBACK_CHARACTER_PARTS
}

// Fallback manual configuration in case auto-discovery fails
const FALLBACK_CHARACTER_PARTS: PartDefinition[] = [
  {
    key: "body",
    label: "BODY",
    icon: "👤",
    category: "Body",
    assets: [
      {
        id: "default",
        name: "Default BODY",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/body/body-default.png",
        enabled: true,
      },
      {
        id: "v2",
        name: "V2 BODY",
        path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/body/body-v2.png",
        enabled: true,
      }
    ],
    defaultAsset: "default",
    optional: false,
  },
  {
    key: "clothes",
    label: "CLOTHES",
    icon: "👕",
    category: "Body",
    assets: [
    {
      id: "none",
      name: "No CLOTHES",
      path: "",
      enabled: true,
    },
    {
      id: "aotheneu",
      name: "Aotheneu CLOTHES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/clothes/clothes-aotheneu.png",
      enabled: true,
    },
    {
      id: "dress1",
      name: "Dress1 CLOTHES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/clothes/clothes-dress1.png",
      enabled: true,
    },
    {
      id: "neu",
      name: "Neu CLOTHES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/clothes/clothes-neu.png",
      enabled: true,
    },
    {
      id: "somi",
      name: "Somi CLOTHES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/body/clothes/clothes-somi.png",
      enabled: true,
    }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "hairFront",
    label: "HAIR FRONT",
    icon: "💇",
    category: "Hair",
    assets: [
    {
      id: "none",
      name: "No HAIR FRONT",
      path: "",
      enabled: true,
    },
    {
      id: "2side",
      name: "2side HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side.png",
      enabled: true,
    },
    {
      id: "2side-black",
      name: "2side HAIR FRONT (Black)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-black.png",
      enabled: true,
      color: "#333333",
    },
    {
      id: "2side-white",
      name: "2side HAIR FRONT (White)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-white.png",
      enabled: true,
      color: "#FAFAFA",
    },
    {
      id: "2side-pink",
      name: "2side HAIR FRONT (Pink)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-pink.png",
      enabled: true,
      color: "#F8BBD0",
    },
    {
      id: "2side-yellow",
      name: "2side HAIR FRONT (Yellow)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-yellow.png",
      enabled: true,
      color: "#FFF9C4",
    },
    {
      id: "2side-red",
      name: "2side HAIR FRONT (Red)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-red.png",
      enabled: true,
      color: "#FF8A80",
    },
    {
      id: "2side-wineRed",
      name: "2side HAIR FRONT (WineRed)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-wineRed.png",
      enabled: true,
      color: "#B56576",
    },
    {
      id: "2side-purple",
      name: "2side HAIR FRONT (Purple)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-purple.png",
      enabled: true,
      color: "#CE93D8",
    },
    {
      id: "2side-blue",
      name: "2side HAIR FRONT (Blue)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-blue.png",
      enabled: true,
      color: "#90CAF9",
    },
    {
      id: "2side-brown",
      name: "2side HAIR FRONT (Brown)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-2side-brown.png",
      enabled: true,
      color: "#8B4513",
    },
    {
      id: "64",
      name: "64 HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64.png",
      enabled: true,
    },
    {
      id: "64-black",
      name: "64 HAIR FRONT (Black)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-black.png",
      enabled: true,
      color: "#333333",
    },
    {
      id: "64-white",
      name: "64 HAIR FRONT (White)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-white.png",
      enabled: true,
      color: "#FAFAFA",
    },
    {
      id: "64-pink",
      name: "64 HAIR FRONT (Pink)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-pink.png",
      enabled: true,
      color: "#F8BBD0",
    },
    {
      id: "64-yellow",
      name: "64 HAIR FRONT (Yellow)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-yellow.png",
      enabled: true,
      color: "#FFF9C4",
    },
    {
      id: "64-red",
      name: "64 HAIR FRONT (Red)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-red.png",
      enabled: true,
      color: "#FF8A80",
    },
    {
      id: "64-wineRed",
      name: "64 HAIR FRONT (WineRed)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-wineRed.png",
      enabled: true,
      color: "#B56576",
    },
    {
      id: "64-purple",
      name: "64 HAIR FRONT (Purple)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-purple.png",
      enabled: true,
      color: "#CE93D8",
    },
    {
      id: "64-blue",
      name: "64 HAIR FRONT (Blue)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-blue.png",
      enabled: true,
      color: "#90CAF9",
    },
    {
      id: "64-brown",
      name: "64 HAIR FRONT (Brown)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-64-brown.png",
      enabled: true,
      color: "#8B4513",
    },
    {
      id: "long37",
      name: "Long37 HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37.png",
      enabled: true,
    },
    {
      id: "long37-black",
      name: "Long37 HAIR FRONT (Black)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-black.png",
      enabled: true,
      color: "#333333",
    },
    {
      id: "long37-white",
      name: "Long37 HAIR FRONT (White)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-white.png",
      enabled: true,
      color: "#FAFAFA",
    },
    {
      id: "long37-pink",
      name: "Long37 HAIR FRONT (Pink)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-pink.png",
      enabled: true,
      color: "#F8BBD0",
    },
    {
      id: "long37-yellow",
      name: "Long37 HAIR FRONT (Yellow)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-yellow.png",
      enabled: true,
      color: "#FFF9C4",
    },
    {
      id: "long37-red",
      name: "Long37 HAIR FRONT (Red)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-red.png",
      enabled: true,
      color: "#FF8A80",
    },
    {
      id: "long37-wineRed",
      name: "Long37 HAIR FRONT (WineRed)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-wineRed.png",
      enabled: true,
      color: "#B56576",
    },
    {
      id: "long37-purple",
      name: "Long37 HAIR FRONT (Purple)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-purple.png",
      enabled: true,
      color: "#CE93D8",
    },
    {
      id: "long37-blue",
      name: "Long37 HAIR FRONT (Blue)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-blue.png",
      enabled: true,
      color: "#90CAF9",
    },
    {
      id: "long37-brown",
      name: "Long37 HAIR FRONT (Brown)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-long37-brown.png",
      enabled: true,
      color: "#8B4513",
    },
    {
      id: "tomboy",
      name: "Tomboy HAIR FRONT",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy.png",
      enabled: true,
    },
    {
      id: "tomboy-black",
      name: "Tomboy HAIR FRONT (Black)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-black.png",
      enabled: true,
      color: "#333333",
    },
    {
      id: "tomboy-white",
      name: "Tomboy HAIR FRONT (White)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-white.png",
      enabled: true,
      color: "#FAFAFA",
    },
    {
      id: "tomboy-pink",
      name: "Tomboy HAIR FRONT (Pink)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-pink.png",
      enabled: true,
      color: "#F8BBD0",
    },
    {
      id: "tomboy-yellow",
      name: "Tomboy HAIR FRONT (Yellow)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-yellow.png",
      enabled: true,
      color: "#FFF9C4",
    },
    {
      id: "tomboy-red",
      name: "Tomboy HAIR FRONT (Red)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-red.png",
      enabled: true,
      color: "#FF8A80",
    },
    {
      id: "tomboy-wineRed",
      name: "Tomboy HAIR FRONT (WineRed)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-wineRed.png",
      enabled: true,
      color: "#B56576",
    },
    {
      id: "tomboy-purple",
      name: "Tomboy HAIR FRONT (Purple)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-purple.png",
      enabled: true,
      color: "#CE93D8",
    },
    {
      id: "tomboy-blue",
      name: "Tomboy HAIR FRONT (Blue)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-blue.png",
      enabled: true,
      color: "#90CAF9",
    },
    {
      id: "tomboy-brown",
      name: "Tomboy HAIR FRONT (Brown)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-front/hair-front-tomboy-brown.png",
      enabled: true,
      color: "#8B4513",
    }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "hairBehind",
    label: "HAIR BEHIND",
    icon: "🎭",
    category: "Hair",
    assets: [
    {
      id: "none",
      name: "No HAIR BEHIND",
      path: "",
      enabled: true,
    },
    {
      id: "2side",
      name: "2side HAIR BEHIND",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side.png",
      enabled: true,
    },
    {
      id: "2side-black",
      name: "2side HAIR BEHIND (Black)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-black.png",
      enabled: true,
      color: "#333333",
    },
    {
      id: "2side-white",
      name: "2side HAIR BEHIND (White)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-white.png",
      enabled: true,
      color: "#FAFAFA",
    },
    {
      id: "2side-pink",
      name: "2side HAIR BEHIND (Pink)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-pink.png",
      enabled: true,
      color: "#F8BBD0",
    },
    {
      id: "2side-yellow",
      name: "2side HAIR BEHIND (Yellow)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-yellow.png",
      enabled: true,
      color: "#FFF9C4",
    },
    {
      id: "2side-red",
      name: "2side HAIR BEHIND (Red)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-red.png",
      enabled: true,
      color: "#FF8A80",
    },
    {
      id: "2side-wineRed",
      name: "2side HAIR BEHIND (WineRed)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-wineRed.png",
      enabled: true,
      color: "#B56576",
    },
    {
      id: "2side-purple",
      name: "2side HAIR BEHIND (Purple)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-purple.png",
      enabled: true,
      color: "#CE93D8",
    },
    {
      id: "2side-blue",
      name: "2side HAIR BEHIND (Blue)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-blue.png",
      enabled: true,
      color: "#90CAF9",
    },
    {
      id: "2side-brown",
      name: "2side HAIR BEHIND (Brown)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-2side-brown.png",
      enabled: true,
      color: "#8B4513",
    },
    {
      id: "curly",
      name: "Curly HAIR BEHIND",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly.png",
      enabled: true,
    },
    {
      id: "curly-black",
      name: "Curly HAIR BEHIND (Black)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-black.png",
      enabled: true,
      color: "#333333",
    },
    {
      id: "curly-white",
      name: "Curly HAIR BEHIND (White)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-white.png",
      enabled: true,
      color: "#FAFAFA",
    },
    {
      id: "curly-pink",
      name: "Curly HAIR BEHIND (Pink)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-pink.png",
      enabled: true,
      color: "#F8BBD0",
    },
    {
      id: "curly-yellow",
      name: "Curly HAIR BEHIND (Yellow)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-yellow.png",
      enabled: true,
      color: "#FFF9C4",
    },
    {
      id: "curly-red",
      name: "Curly HAIR BEHIND (Red)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-red.png",
      enabled: true,
      color: "#FF8A80",
    },
    {
      id: "curly-wineRed",
      name: "Curly HAIR BEHIND (WineRed)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-wineRed.png",
      enabled: true,
      color: "#B56576",
    },
    {
      id: "curly-purple",
      name: "Curly HAIR BEHIND (Purple)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-purple.png",
      enabled: true,
      color: "#CE93D8",
    },
    {
      id: "curly-blue",
      name: "Curly HAIR BEHIND (Blue)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-blue.png",
      enabled: true,
      color: "#90CAF9",
    },
    {
      id: "curly-brown",
      name: "Curly HAIR BEHIND (Brown)",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/hair/hair-behind/hair-behind-curly-brown.png",
      enabled: true,
      color: "#8B4513",
    }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "eyes",
    label: "EYES",
    icon: "👀",
    category: "Face",
    assets: [
    {
      id: "none",
      name: "No EYES",
      path: "",
      enabled: true,
    },
    {
      id: "basic1",
      name: "Basic1 EYES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyes/eyes-basic1.png",
      enabled: true,
    },
    {
      id: "default",
      name: "Default EYES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyes/eyes-default.png",
      enabled: true,
    },
    {
      id: "medium",
      name: "Medium EYES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyes/eyes-medium.png",
      enabled: true,
    }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "eyebrows",
    label: "EYEBROWS",
    icon: "🤨",
    category: "Face",
    assets: [
    {
      id: "none",
      name: "No EYEBROWS",
      path: "",
      enabled: true,
    },
    {
      id: "curved",
      name: "Curved EYEBROWS",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyebrows/eyebrows-curved.png",
      enabled: true,
    },
    {
      id: "default",
      name: "Default EYEBROWS",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyebrows/eyebrows-default.png",
      enabled: true,
    },
    {
      id: "flat",
      name: "Flat EYEBROWS",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/eyebrows/eyebrows-flat.png",
      enabled: true,
    }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "mouth",
    label: "MOUTH",
    icon: "👄",
    category: "Face",
    assets: [
    {
      id: "none",
      name: "No MOUTH",
      path: "",
      enabled: true,
    },
    {
      id: "default",
      name: "Default MOUTH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/mouth/mouth-default.png",
      enabled: true,
    },
    {
      id: "small",
      name: "Small MOUTH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/mouth/mouth-small.png",
      enabled: true,
    },
    {
      id: "smile1",
      name: "Smile1 MOUTH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/mouth/mouth-smile1.png",
      enabled: true,
    }
    ],
    defaultAsset: "default",
    optional: true,
  },
  {
    key: "blush",
    label: "BLUSH",
    icon: "😊",
    category: "Face",
    assets: [
    {
      id: "none",
      name: "No BLUSH",
      path: "",
      enabled: true,
    },
    {
      id: "default",
      name: "Default BLUSH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/blush/blush-default.png",
      enabled: true,
    },
    {
      id: "light",
      name: "Light BLUSH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/blush/blush-light.png",
      enabled: true,
    },
    {
      id: "soft",
      name: "Soft BLUSH",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/face/blush/blush-soft.png",
      enabled: true,
    }
    ],
    defaultAsset: "none",
    optional: true,
  },
  {
    key: "earring",
    label: "EARRING",
    icon: "💎",
    category: "Accessories",
    assets: [
    {
      id: "none",
      name: "No EARRING",
      path: "",
      enabled: true,
    },
    {
      id: "default",
      name: "Default EARRING",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/accessories/earring/earring-default.png",
      enabled: true,
    },
    {
      id: "helixmix",
      name: "Helixmix EARRING",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/accessories/earring/earring-helixmix.png",
      enabled: true,
    }
    ],
    defaultAsset: "none",
    optional: true,
  },
  {
    key: "glasses",
    label: "GLASSES",
    icon: "🤓",
    category: "Accessories",
    assets: [
    {
      id: "none",
      name: "No GLASSES",
      path: "",
      enabled: true,
    },
    {
      id: "default",
      name: "Default GLASSES",
      path: "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/assets/character/accessories/glasses/glasses-default.png",
      enabled: true,
    }
    ],
    defaultAsset: "none",
    optional: true,
  }
]

// Layering order (high to low z-index)
export const LAYER_ORDER: PartKey[] = [
  "glasses", // Highest layer - glasses go on top
  "earring", // Earring on top of most elements
  "hairFront",
  "eyebrows",
  "eyes",
  "mouth",
  "blush", // Blush on cheeks
  "clothes",
  "body",
  "hairBehind", // Lowest layer
]

// Helper functions for easy asset management
export function getPartByKey(key: PartKey): PartDefinition | undefined {
  return CHARACTER_PARTS().find((part) => part.key === key)
}

export function getAssetPath(partKey: PartKey, assetId: string): string {
  const part = getPartByKey(partKey)
  if (!part) return ""

  const asset = part.assets.find((a) => a.id === assetId)
  return asset?.path || ""
}

export function getEnabledAssets(partKey: PartKey): AssetDefinition[] {
  const part = getPartByKey(partKey)
  if (!part) return []

  return part.assets.filter((asset) => asset.enabled)
}

// Easy way to add new assets - just call this function
export function addAssetToPart(partKey: PartKey, assetId: string, name: string, path: string, enabled = true): void {
  const part = getPartByKey(partKey)
  if (part) {
    part.assets.push({
      id: assetId,
      name,
      path,
      enabled,
    })
  }
}

// Force refresh the asset cache (useful for development)
let _cachedParts: PartDefinition[] | null = null

export function refreshAssetCache(): void {
  _cachedParts = null
}
