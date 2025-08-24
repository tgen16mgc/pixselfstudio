import { NextResponse } from 'next/server'
import { assetRegistry } from '@/utils/asset-registry'

export async function GET() {
  try {
    // Get the current registry state
    const registry = await assetRegistry.getRegistry()
    
    // Return the registry and some diagnostic info
    return NextResponse.json({
      success: true,
      registryLoaded: !!registry,
      totalParts: Object.keys(registry.parts).length,
      totalAssets: registry.metadata.totalAssets,
      totalVariants: registry.metadata.totalVariants,
      parts: Object.keys(registry.parts).map(key => ({
        key,
        label: registry.parts[key].label,
        assetCount: registry.parts[key].assets.length,
      }))
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

