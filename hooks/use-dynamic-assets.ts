import { useState, useEffect } from 'react'
import { PartDefinition } from '@/config/character-assets'
import { assetRegistry } from '@/utils/asset-registry'

export function useDynamicAssets() {
  const [parts, setParts] = useState<PartDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAssets() {
      try {
        setLoading(true)
        setError(null)
        
        // Get character parts from the asset registry
        const registry = await assetRegistry.getRegistry()
        const partsArray = Object.values(registry.parts)
        
        setParts(partsArray)
      } catch (err) {
        console.error('Failed to load dynamic assets:', err)
        setError(err instanceof Error ? err.message : 'Failed to load assets')
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [])

  const refreshAssets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear cache and reload
      assetRegistry.clearCache()
      const registry = await assetRegistry.getRegistry()
      const partsArray = Object.values(registry.parts)
      
      setParts(partsArray)
    } catch (err) {
      console.error('Failed to refresh assets:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh assets')
    } finally {
      setLoading(false)
    }
  }

  return {
    parts,
    loading,
    error,
    refreshAssets,
  }
}
