import { useState, useEffect } from 'react'
import { PartDefinition } from '@/config/character-assets'
import { getCharacterPartsFromManifest } from '@/utils/manifest-asset-discovery'

// Debug import
console.log('🔍 Importing getCharacterPartsFromManifest:', typeof getCharacterPartsFromManifest)

// Check if we're on client side
const isClient = typeof window !== 'undefined'

export function useDynamicAssets() {
  console.log('🎯 useDynamicAssets hook called')
  const [parts, setParts] = useState<PartDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Test if useEffect runs
  console.log('🎯 Hook state - parts:', parts.length, 'loading:', loading, 'error:', error)

  useEffect(() => {
    console.log('🎯 useEffect triggered! isClient:', isClient)
    
    if (!isClient) {
      console.log('🎯 Not on client side, skipping dynamic loading')
      return
    }
    
    let mounted = true

    const loadAssets = async () => {
      try {
        console.log('🔄 Loading dynamic assets...')
        setLoading(true)
        setError(null)
        console.log('🔄 About to call getCharacterPartsFromManifest...')
        const dynamicParts = await getCharacterPartsFromManifest()
        console.log('✅ Dynamic assets loaded:', dynamicParts.length, 'parts')
        
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
