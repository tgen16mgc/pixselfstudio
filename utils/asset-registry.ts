import type { 
  AssetDefinition, 
  PartDefinition, 
  AssetVariant, 
  AssetRegistry, 
  AssetDiscoveryResult,
  PartKey 
} from "@/types/character"
import { getAvailableColors } from "@/config/color-palettes"

// Asset registry configuration
const PART_CONFIGS: Record<PartKey, {
  label: string
  icon: string
  category: "Body" | "Face" | "Hair" | "Accessories"
  folderPath: string
  defaultAsset: string
  optional: boolean
  colorSupport: boolean
}> = {
  body: {
    label: "BODY",
    icon: "👤",
    category: "Body",
    folderPath: "body/body",
    defaultAsset: "default",
    optional: false,
    colorSupport: true,
  },
  clothes: {
    label: "CLOTHES",
    icon: "👕",
    category: "Body",
    folderPath: "body/clothes",
    defaultAsset: "default",
    optional: true,
    colorSupport: true,
  },
  hairBehind: {
    label: "HAIR BEHIND",
    icon: "🎭",
    category: "Hair",
    folderPath: "hair/hair-behind",
    defaultAsset: "default",
    optional: true,
    colorSupport: true,
  },
  hairFront: {
    label: "HAIR FRONT",
    icon: "💇",
    category: "Hair",
    folderPath: "hair/hair-front",
    defaultAsset: "default",
    optional: true,
    colorSupport: true,
  },
  eyes: {
    label: "EYES",
    icon: "👀",
    category: "Face",
    folderPath: "face/eyes",
    defaultAsset: "default",
    optional: true,
    colorSupport: true,
  },
  eyebrows: {
    label: "EYEBROWS",
    icon: "🤨",
    category: "Face",
    folderPath: "face/eyebrows",
    defaultAsset: "default",
    optional: true,
    colorSupport: false,
  },
  mouth: {
    label: "MOUTH",
    icon: "👄",
    category: "Face",
    folderPath: "face/mouth",
    defaultAsset: "default",
    optional: true,
    colorSupport: false,
  },
  blush: {
    label: "BLUSH",
    icon: "😊",
    category: "Face",
    folderPath: "face/blush",
    defaultAsset: "none",
    optional: true,
    colorSupport: false,
  },
  earring: {
    label: "EARRING",
    icon: "💎",
    category: "Accessories",
    folderPath: "accessories/earring",
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
  },
  glasses: {
    label: "GLASSES",
    icon: "🤓",
    category: "Accessories",
    folderPath: "accessories/glasses",
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
  },
  hat: {
    label: "HAT",
    icon: "🎩",
    category: "Accessories",
    folderPath: "accessories/hat",
    defaultAsset: "none",
    optional: true,
    colorSupport: true,
  },
}

// Asset registry singleton
class AssetRegistryManager {
  private registry: AssetRegistry | null = null
  private lastUpdate: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async getRegistry(): Promise<AssetRegistry> {
    const now = Date.now()
    
    // Return cached registry if still valid
    if (this.registry && (now - this.lastUpdate) < this.CACHE_DURATION) {
      return this.registry
    }

    // Discover assets and build registry
    const discoveryResult = await this.discoverAssets()
    
    if (!discoveryResult.success) {
      throw new Error(`Asset discovery failed: ${discoveryResult.errors.join(', ')}`)
    }

    // Build registry
    const parts: Record<PartKey, PartDefinition> = {} as Record<PartKey, PartDefinition>
    let totalAssets = 0
    let totalVariants = 0

    for (const part of discoveryResult.parts) {
      parts[part.key] = part
      totalAssets += part.assets.length
      totalVariants += part.assets.reduce((sum, asset) => sum + asset.variants.length, 0)
    }

    this.registry = {
      version: "2.0.0",
      generated: new Date().toISOString(),
      parts,
      metadata: {
        totalAssets,
        totalVariants,
        lastUpdated: new Date().toISOString(),
      }
    }

    this.lastUpdate = now
    return this.registry
  }

  async discoverAssets(): Promise<AssetDiscoveryResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const parts: PartDefinition[] = []
    let scannedFolders = 0
    let discoveredAssets = 0
    let discoveredVariants = 0

    try {
      // Fetch the asset registry
      const registryUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/assets/asset-registry.json`
        : 'http://localhost:3000/assets/asset-registry.json'

      const response = await fetch(registryUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch registry: ${response.status}`)
      }

      const registry: AssetRegistry = await response.json()

      // Use the registry directly since it's already in the correct format
      for (const [partKey, partDefinition] of Object.entries(registry.parts)) {
        scannedFolders++
        discoveredAssets += partDefinition.assets.length
        discoveredVariants += partDefinition.assets.reduce((sum, asset) => sum + asset.variants.length, 0)
        parts.push(partDefinition)
      }

    } catch (error) {
      errors.push(`Asset discovery failed: ${error}`)
    }

    return {
      success: errors.length === 0,
      parts,
      errors,
      warnings,
      metadata: {
        scannedFolders,
        discoveredAssets,
        discoveredVariants,
      }
    }
  }

  private processAssetsForPart(
    partKey: PartKey,
    filenames: string[],
    config: typeof PART_CONFIGS[PartKey]
  ): AssetDefinition[] {
    const assets: AssetDefinition[] = []
    const assetGroups = new Map<string, string[]>()

    // Group files by base asset name
    for (const filename of filenames) {
      const baseName = this.extractBaseAssetName(filename, partKey)
      if (!assetGroups.has(baseName)) {
        assetGroups.set(baseName, [])
      }
      assetGroups.get(baseName)!.push(filename)
    }

    // Create asset definitions with variants
    for (const [baseName, files] of assetGroups) {
      const variants: AssetVariant[] = []
      
      for (const filename of files) {
        const variant = this.createVariantFromFilename(filename, partKey, config)
        if (variant) {
          variants.push(variant)
        }
      }

      if (variants.length > 0) {
        const asset: AssetDefinition = {
          id: baseName,
          name: this.generateAssetName(baseName, config.label),
          basePath: `/assets/character/${config.folderPath}`,
          enabled: true,
          variants,
          defaultVariant: this.findDefaultVariant(variants),
        }

        assets.push(asset)
      }
    }

    return assets
  }

  private extractBaseAssetName(filename: string, partKey: PartKey): string {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|svg)$/i, '')
    
    // Remove part prefix (e.g., "hair-front-" -> "")
    const withoutPrefix = nameWithoutExt.replace(new RegExp(`^${partKey.replace(/([A-Z])/g, '-$1').toLowerCase()}-`), '')
    
    // Extract base name (before color suffix)
    const baseName = withoutPrefix.replace(/-(black|brown|blonde|red|purple|blue|pink|white|yellow|wineRed|fair|light|medium|olive|deep|dark|gold|silver|green|gray|orange)$/, '')
    
    return baseName || 'default'
  }

  private createVariantFromFilename(
    filename: string,
    partKey: PartKey,
    config: typeof PART_CONFIGS[PartKey]
  ): AssetVariant | null {
    const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|svg)$/i, '')
    const baseName = this.extractBaseAssetName(filename, partKey)
    
    // Extract color from filename
    const colorMatch = nameWithoutExt.match(/-(black|brown|blonde|red|purple|blue|pink|white|yellow|wineRed|fair|light|medium|olive|deep|dark|gold|silver|green|gray|orange)$/)
    const colorId = colorMatch ? colorMatch[1] : undefined
    
    // Generate variant ID
    const variantId = colorId ? `${baseName}-${colorId}` : baseName
    
    // Generate variant name
    const variantName = colorId 
      ? `${this.generateAssetName(baseName, config.label)} (${this.capitalizeFirst(colorId)})`
      : this.generateAssetName(baseName, config.label)

    return {
      id: variantId,
      name: variantName,
      color: colorId,
      path: `/assets/character/${config.folderPath}/${filename}`,
      enabled: true,
    }
  }

  private findDefaultVariant(variants: AssetVariant[]): string {
    // Prefer variants without color (original)
    const original = variants.find(v => !v.color)
    if (original) return original.id
    
    // Fall back to first variant
    return variants[0]?.id || 'default'
  }

  private generateAssetName(baseName: string, partLabel: string): string {
    if (baseName === 'default') {
      return `Default ${partLabel}`
    }
    
    // Convert kebab-case to Title Case
    return baseName
      .split('-')
      .map(word => this.capitalizeFirst(word))
      .join(' ')
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Helper methods for external use
  async getPart(partKey: PartKey): Promise<PartDefinition | undefined> {
    const registry = await this.getRegistry()
    return registry.parts[partKey]
  }

  async getAsset(partKey: PartKey, assetId: string): Promise<AssetDefinition | undefined> {
    const part = await this.getPart(partKey)
    return part?.assets.find(asset => asset.id === assetId)
  }

  async getVariant(partKey: PartKey, assetId: string, variantId: string): Promise<AssetVariant | undefined> {
    const asset = await this.getAsset(partKey, assetId)
    return asset?.variants.find(variant => variant.id === variantId)
  }

  // Clear cache (useful for development)
  clearCache(): void {
    this.registry = null
    this.lastUpdate = 0
  }
}

// Export singleton instance
export const assetRegistry = new AssetRegistryManager()

// Export helper functions
export async function getCharacterParts(): Promise<PartDefinition[]> {
  const registry = await assetRegistry.getRegistry()
  return Object.values(registry.parts)
}

export async function getAssetPath(partKey: PartKey, assetId: string, variantId?: string): Promise<string> {
  const asset = await assetRegistry.getAsset(partKey, assetId)
  if (!asset) return ""

  const variant = variantId 
    ? asset.variants.find(v => v.id === variantId)
    : asset.variants.find(v => v.id === asset.defaultVariant)
  
  return variant?.path || ""
}

export async function getEnabledAssets(partKey: PartKey): Promise<AssetDefinition[]> {
  const part = await assetRegistry.getPart(partKey)
  return part?.assets.filter(asset => asset.enabled) || []
}