import { useState, useEffect } from 'react'
import { PartDefinition } from '@/config/character-assets'
import { getCharacterPartsFromManifest } from '@/utils/manifest-asset-discovery'

// Check if we're on client side
const isClient = typeof window !== 'undefined'

export function useDynamicAssets() {
  const [parts, setParts] = useState<PartDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isClient) {
      return
    }
    
    let mounted = true

    const loadAssets = async () => {
      try {
        setLoading(true)
        setError(null)
        const dynamicParts = await getCharacterPartsFromManifest()
        
        if (mounted) {
          setParts(dynamicParts)
        }
      } catch (err) {
        console.error('❌ Failed to load dynamic assets:', err)
        if (mounted) {
          setError('Failed to load assets')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Use setTimeout to ensure this runs on client side
    const timer = setTimeout(() => {
      loadAssets()
    }, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const refreshAssets = async () => {
    try {
      setLoading(true)
      setError(null)
      const dynamicParts = await getCharacterPartsFromManifest()
      setParts(dynamicParts)
    } catch (err) {
      console.error('Failed to refresh assets:', err)
      setError('Failed to refresh assets')
    } finally {
      setLoading(false)
    }
  }

  return {
    parts,
    loading,
    error,
    refreshAssets
  }
}
