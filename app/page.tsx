"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  ChevronRight,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Share2,
  Layers,
  Settings,
  Undo2,
  Redo2,
  Grid,
  Save,
} from "lucide-react"
import { Press_Start_2P } from "next/font/google"
import { PixselfFooter } from "@/components/pixself-footer"

// Import Pixself brand components
import { PixselfBackground } from "@/components/pixself-background"
import { PixselfButton, PixselfPanel } from "@/components/pixself-ui-components"
import { LoadingScreen } from "@/components/loading-screen"
import { DownloadConfirmationModal } from "@/components/download-confirmation-modal"
import { ShareTemplateModal } from "@/components/share-template-modal"
import { CharacterGalleryModal } from "@/components/character-gallery-modal"
import { EnhancedTitleSection } from "@/components/enhanced-title-section"
import { PromotionBanner } from "@/components/promotion-banner"
import { AssetVariantGrid } from "@/components/asset-variant-grid"
import { ColorPalettePlaceholder } from "@/components/color-palette-placeholder"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { isStorageAvailable } from "@/utils/character-storage"
import {
  createDefaultSelections,
  randomizeSelections,
  drawCharacterToCanvas,
  generateCharacterThumbnail,
  preloadCharacterAssets,
} from "@/utils/character-drawing"
import { CHARACTER_PARTS } from "@/config/character-assets"
import type { PartKey, Selections } from "@/types/character"

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface HistoryState {
  selections: Selections
  timestamp: number
}

// 8-bit sound effects
const play8BitSound = (type: "click" | "select" | "success" | "error", enabled: boolean) => {
  if (!enabled) return

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    switch (type) {
      case "click":
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        break
      case "select":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.05)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
        break
      case "success":
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        break
      case "error":
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        break
    }

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch {
    console.log("Audio not supported")
  }
}

// Canvas preview component
function PixelCanvasPreview({
  selections,
  scale = 0.5,
  zoom = 1,
}: { selections: Selections; scale?: number; zoom?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationOffset, setAnimationOffset] = useState(0)

  useEffect(() => {
    const animate = () => {
      setAnimationOffset((prev) => (prev + 0.01) % (Math.PI * 2))
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current

    const baseSize = 640
    canvas.width = baseSize * scale * zoom
    canvas.height = baseSize * scale * zoom

    const ctx = canvas.getContext("2d")!
    ctx.save()

    // Apply subtle floating animation
    const floatY = Math.sin(animationOffset) * 2
    ctx.translate(0, floatY * scale * zoom)

    // Draw the actual character (now async)
    drawCharacterToCanvas(canvas, selections, scale * zoom).catch(console.error)

    ctx.restore()
  }, [selections, scale, zoom, animationOffset])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-auto max-w-full"
      style={{ imageRendering: "pixelated" }}
      aria-label="Pixel character preview"
    />
  )
}

// Character Frame
function PixselfCharacterFrame({ children, zoom = 1 }: { children: React.ReactNode; zoom?: number }) {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[500px] border-4 overflow-hidden backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(240, 248, 255, 0.85)", // Alice blue with transparency
        borderColor: PIXSELF_BRAND.colors.primary.navy,
        boxShadow: PIXSELF_BRAND.shadows.glowStrong,
      }}
    >
      <div
        className="absolute inset-2 opacity-20"
        style={{
          backgroundImage: `
      repeating-linear-gradient(
        0deg,
        ${PIXSELF_BRAND.colors.primary.gold}80 0px,
        ${PIXSELF_BRAND.colors.primary.gold}80 2px,
        transparent 2px,
        transparent 4px
      ),
      repeating-linear-gradient(
        90deg,
        ${PIXSELF_BRAND.colors.primary.gold}80 0px,
        ${PIXSELF_BRAND.colors.primary.gold}80 2px,
        transparent 2px,
        transparent 4px
      )
    `,
        }}
      />
      <div className="absolute inset-4 grid place-items-center overflow-hidden">
        <div style={{ transform: `scale(${zoom})` }}>{children}</div>
      </div>
    </div>
  )
}

// Responsive hook
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const handler = () => setIsDesktop(media.matches)
    handler()
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])
  return isDesktop
}

// Main component
export default function Page() {
  const isDesktop = useIsDesktop()
  const [isLoading, setIsLoading] = useState(true)
  const [selections, setSelections] = useState<Selections>(createDefaultSelections)
  const [activePart, setActivePart] = useState<PartKey>("body")
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoom, setZoom] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  // const [, setShareLoading] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [downloadModalData, setDownloadModalData] = useState<{
    preview: string
    fileName: string
    fileSize: string
    scale: number
  } | null>(null)
  const [sharePreviewData, setSharePreviewData] = useState<string>("")
  const [storageAvailable, setStorageAvailable] = useState(false)

  // Preload assets on mount
  useEffect(() => {
    preloadCharacterAssets().catch(console.error)
  }, [])

  // Check storage availability on mount
  useEffect(() => {
    setStorageAvailable(isStorageAvailable())
  }, [])

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      const initialState: HistoryState = {
        selections: selections,
        timestamp: Date.now(),
      }
      setHistory([initialState])
      setHistoryIndex(0)
    }
  }, [history.length, selections])

  // Add to history when selections change
  const addToHistory = useCallback(
    (newSelections: Selections) => {
      const newState: HistoryState = {
        selections: newSelections,
        timestamp: Date.now(),
      }

      setHistory((prev) => {
        const newHistory = [...prev.slice(0, historyIndex + 1), newState]
        return newHistory.slice(-50)
      })
      setHistoryIndex((prev) => prev + 1)
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setSelections(history[newIndex].selections)
      play8BitSound("click", soundEnabled)
    }
  }, [historyIndex, history, soundEnabled, setSelections])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setSelections(history[newIndex].selections)
      play8BitSound("click", soundEnabled)
    }
  }, [historyIndex, history, soundEnabled, setSelections])

  const showDownloadConfirmation = useCallback(async (scale = 1) => {
    try {
      // Generate preview using the thumbnail function
      const previewDataUrl = await generateCharacterThumbnail(selections, 400)

      // Calculate file info
      const width = 640 * scale
      const height = 640 * scale
      const sizeLabel = scale === 0.5 ? "small" : scale === 1 ? "medium" : "large"
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")
      const fileName = `pixself-character-${sizeLabel}-${timestamp}.png`
      const estimatedSize = Math.round((width * height * 4) / 1024) // Rough estimate in KB
      const fileSize = estimatedSize > 1024 ? `${(estimatedSize / 1024).toFixed(1)} MB` : `${estimatedSize} KB`

      setDownloadModalData({
        preview: previewDataUrl,
        fileName,
        fileSize,
        scale,
      })
      setShowDownloadModal(true)
    } catch (error) {
      console.error("Preview generation failed:", error)
      play8BitSound("error", soundEnabled)
      alert("Preview generation failed. Please try again.")
    }
  }, [selections, soundEnabled, setDownloadModalData, setShowDownloadModal])

  const randomize = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const newSelections = randomizeSelections()
      setSelections(newSelections)
      addToHistory(newSelections)
      setLoading(false)
      play8BitSound("success", soundEnabled)
    }, 100)
  }, [addToHistory, soundEnabled, setLoading, setSelections])

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          undo()
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault()
          redo()
        } else if (e.key === "s") {
          e.preventDefault()
          showDownloadConfirmation()
        } else if (e.key === " ") {
          e.preventDefault()
          randomize()
        } else if (e.key === "g") {
          e.preventDefault()
          if (storageAvailable) setShowGalleryModal(true)
        }
      } else if (e.key === " " && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        randomize()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [historyIndex, history, soundEnabled, storageAvailable, randomize, undo, redo, showDownloadConfirmation])

  function onSelectAsset(part: PartKey, assetId: string) {
    setLoading(true)
    setTimeout(() => {
      const newSelections = {
        ...selections,
        [part]: {
          ...selections[part],
          assetId,
          enabled: assetId !== "none", // Disable if "none" is selected
        },
      }
      setSelections(newSelections)
      addToHistory(newSelections)
      setLoading(false)
      play8BitSound("select", soundEnabled)
    }, 50)
  }

  // randomize function moved above

  function resetAll() {
    const newSelections = createDefaultSelections()
    setSelections(newSelections)
    addToHistory(newSelections)
    play8BitSound("click", soundEnabled)
  }

  // Handle loading character from gallery
  const handleLoadCharacter = useCallback(
    (newSelections: Selections) => {
      setSelections(newSelections)
      addToHistory(newSelections)
      play8BitSound("success", soundEnabled)
    },
    [addToHistory, soundEnabled],
  )

  // Handle saving character
  const handleSaveCharacter = useCallback(
    () => {
      play8BitSound("success", soundEnabled)
    },
    [soundEnabled],
  )

  // Show download confirmation modal (moved above)

  // Actual download function that creates and saves a PNG
  async function downloadPng() {
    if (!downloadModalData) return

    setDownloadLoading(true)

    try {
      // Create a temporary canvas for export
      const exportCanvas = document.createElement("canvas")
      const exportCtx = exportCanvas.getContext("2d")

      if (!exportCtx) {
        throw new Error("Could not create canvas context")
      }

      // Draw the character to the export canvas
      await drawCharacterToCanvas(exportCanvas, selections, downloadModalData.scale)

      // Convert canvas to blob and download
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Could not create image blob")
        }

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = downloadModalData.fileName

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        URL.revokeObjectURL(url)

        setDownloadLoading(false)
        setShowDownloadModal(false)
        setDownloadModalData(null)
        play8BitSound("success", soundEnabled)
      }, "image/png")
    } catch (error) {
      console.error("Download failed:", error)
      setDownloadLoading(false)
      play8BitSound("error", soundEnabled)
      alert("Download failed. Please try again.")
    }
  }

  async function shareCharacter() {
    try {
      // Generate preview using the thumbnail function
      const previewDataUrl = await generateCharacterThumbnail(selections, 500)
      setSharePreviewData(previewDataUrl)
      setShowShareModal(true)
      play8BitSound("click", soundEnabled)
    } catch (error) {
      console.error("Share preview generation failed:", error)
      play8BitSound("error", soundEnabled)
      alert("Share preview generation failed. Please try again.")
    }
  }

  // Group parts by category
  const partsByCategory = CHARACTER_PARTS.reduce(
    (acc, part) => {
      if (!acc[part.category]) acc[part.category] = []
      acc[part.category].push(part)
      return acc
    },
    {} as Record<string, typeof CHARACTER_PARTS>,
  )

  // Show loading screen first
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <main className={`min-h-screen ${press2p.className} relative`}>
      <PixselfBackground />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 lg:py-8">
        {/* Enhanced Header */}
        <header className="mb-6">
          <EnhancedTitleSection
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onUndo={undo}
            onRedo={redo}
            onReset={resetAll}
            onRandomize={randomize}
            onShare={shareCharacter}
            onDownload={() => showDownloadConfirmation()}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            isLoading={loading}
            isDownloadLoading={downloadLoading}
            isDesktop={isDesktop}
          />
        </header>

        {/* Promotion Banner */}
        <div className="mb-8">
          <PromotionBanner
            message="🎮 NO ACTIVE PROMOTIONS • STAY TUNED FOR AMAZING DEALS • FOLLOW US FOR UPDATES 🎮"
            isActive={false}
          />
        </div>

        {isDesktop ? (
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Parts Navigation */}
            <div className="col-span-3 space-y-6">
              <PixselfPanel title="CHARACTER PARTS" icon={<Layers className="h-4 w-4" />}>
                {Object.entries(partsByCategory).map(([category, parts]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="text-[10px] font-bold tracking-wider"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        {category}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {parts.map((p) => {
                        const active = activePart === p.key
                        const partSelection = selections[p.key]
                        const isEnabled = partSelection?.enabled ?? true

                        return (
                          <button
                            key={p.key}
                            onClick={() => {
                              setActivePart(p.key)
                              play8BitSound("click", soundEnabled)
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-4 backdrop-blur-sm ${
                              active
                                ? "active:translate-x-1 active:translate-y-1"
                                : "hover:translate-x-0.5 hover:translate-y-0.5"
                            }`}
                            style={{
                              backgroundColor: active
                                ? PIXSELF_BRAND.colors.primary.gold
                                : PIXSELF_BRAND.colors.cloud.light,
                              color: PIXSELF_BRAND.colors.primary.navy,
                              borderColor: active
                                ? PIXSELF_BRAND.colors.primary.navy
                                : PIXSELF_BRAND.colors.primary.navyLight,
                              boxShadow: active ? PIXSELF_BRAND.shadows.pixelLarge : PIXSELF_BRAND.shadows.pixel,
                              opacity: isEnabled ? 1 : 0.6,
                            }}
                          >
                            <span className="text-[8px] font-mono leading-none">{p.icon}</span>
                            <span className="text-[10px] tracking-wide font-bold flex-1">{p.label}</span>
                            {!isEnabled && <span className="text-[6px] opacity-60">OFF</span>}
                            <ChevronRight
                              className={`h-3.5 w-3.5 transition-all duration-200 ${
                                active ? "opacity-100 translate-x-1" : "opacity-0"
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </PixselfPanel>

              {/* Gallery Panel */}
              {storageAvailable && (
                <PixselfPanel title="CHARACTER GALLERY" icon={<Grid className="h-4 w-4" />}>
                  <div className="space-y-4">
                    <div className="text-[9px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                      Save and manage your characters:
                    </div>
                    <PixselfButton
                      onClick={() => setShowGalleryModal(true)}
                      variant="accent"
                      size="sm"
                      fullWidth
                      icon={<Grid className="h-3.5 w-3.5" />}
                    >
                      OPEN GALLERY
                    </PixselfButton>
                    <div className="text-[8px] text-center" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                      Ctrl+G to open gallery
                    </div>
                  </div>
                </PixselfPanel>
              )}
            </div>

            {/* Center - Preview */}
            <div className="col-span-6">
              <PixselfPanel title="LIVE PREVIEW" variant="primary">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="text-[10px] font-bold tracking-wider"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        ZOOM CONTROLS
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                          disabled={zoom <= 0.5}
                          className="w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 backdrop-blur-sm"
                          style={{
                            backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                            borderColor: PIXSELF_BRAND.colors.primary.navy,
                            color: PIXSELF_BRAND.colors.primary.navy,
                          }}
                        >
                          <ZoomOut className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className="text-[9px] min-w-[4ch] text-center font-bold"
                          style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                        >
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                          disabled={zoom >= 2}
                          className="w-8 h-8 border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 backdrop-blur-sm"
                          style={{
                            backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                            borderColor: PIXSELF_BRAND.colors.primary.navy,
                            color: PIXSELF_BRAND.colors.primary.navy,
                          }}
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <PixselfCharacterFrame zoom={zoom}>
                    <PixelCanvasPreview selections={selections} scale={0.6} zoom={1} />
                  </PixselfCharacterFrame>

                  {/* Action Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-3">
                      <PixselfButton
                        onClick={randomize}
                        disabled={loading}
                        loading={loading}
                        icon={<RefreshCw className="h-4 w-4" />}
                      >
                        RANDOMIZE
                      </PixselfButton>
                      <PixselfButton
                        onClick={() => showDownloadConfirmation()}
                        disabled={downloadLoading}
                        loading={downloadLoading}
                        variant="accent"
                        icon={<Download className="h-4 w-4" />}
                      >
                        DOWNLOAD
                      </PixselfButton>
                      {storageAvailable && (
                        <PixselfButton
                          onClick={() => setShowGalleryModal(true)}
                          variant="secondary"
                          icon={<Save className="h-4 w-4" />}
                        >
                          SAVE
                        </PixselfButton>
                      )}
                    </div>
                  </div>
                </div>
              </PixselfPanel>
            </div>

            {/* Right Sidebar - Customization */}
            <div className="col-span-3 space-y-6">
              <PixselfPanel
                title={`CUSTOMIZE ${CHARACTER_PARTS.find((p) => p.key === activePart)?.label}`}
                icon={<Settings className="h-4 w-4" />}
              >
                <div className="space-y-6">
                  {/* Asset Selection */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="h-3.5 w-3.5" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
                      <div
                        className="text-[10px] font-bold tracking-wider"
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        STYLE OPTIONS
                      </div>
                    </div>
                    <AssetVariantGrid
                      activePart={activePart}
                      currentAssetId={selections[activePart]?.assetId || "default"}
                      onAssetSelect={(assetId) => onSelectAsset(activePart, assetId)}
                      isLoading={loading}
                      isMobile={false}
                    />
                  </div>

                  {/* Color Variants */}
                  <ColorPalettePlaceholder activePart={activePart} isMobile={false} />
                </div>
              </PixselfPanel>

              <PixselfPanel title="EXPORT OPTIONS">
                <div className="space-y-4">
                  <div className="text-[9px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    Choose your export size:
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <PixselfButton
                      onClick={() => showDownloadConfirmation(0.5)}
                      disabled={downloadLoading}
                      loading={downloadLoading}
                      size="sm"
                      icon={<Download className="h-3.5 w-3.5" />}
                    >
                      SMALL (320×320)
                    </PixselfButton>
                    <PixselfButton
                      onClick={() => showDownloadConfirmation(1)}
                      disabled={downloadLoading}
                      loading={downloadLoading}
                      size="sm"
                      icon={<Download className="h-3.5 w-3.5" />}
                    >
                      MEDIUM (640×640)
                    </PixselfButton>
                    <PixselfButton
                      onClick={() => showDownloadConfirmation(2)}
                      disabled={downloadLoading}
                      loading={downloadLoading}
                      size="sm"
                      icon={<Download className="h-3.5 w-3.5" />}
                    >
                      LARGE (1280×1280)
                    </PixselfButton>
                  </div>
                  <div className="pt-3 border-t-4" style={{ borderTopColor: PIXSELF_BRAND.colors.primary.navy }}>
                    <PixselfButton
                      onClick={shareCharacter}
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon={<Share2 className="h-3.5 w-3.5" />}
                    >
                      SHARE CHARACTER
                    </PixselfButton>
                  </div>
                </div>
              </PixselfPanel>
            </div>
          </div>
        ) : (
          // Mobile Layout
          <div className="space-y-6">
            {/* Mobile Preview */}
            <PixselfPanel title="LIVE PREVIEW" variant="primary">
              <div className="space-y-3">
                {/* Compact Mobile Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="text-[8px] font-bold tracking-wider"
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      ZOOM:
                    </div>
                    <button
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                      disabled={zoom <= 0.5}
                      className="w-6 h-6 border-2 flex items-center justify-center text-[8px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                        borderColor: PIXSELF_BRAND.colors.primary.navy,
                        color: PIXSELF_BRAND.colors.primary.navy,
                      }}
                    >
                      <ZoomOut className="h-2.5 w-2.5" />
                    </button>
                    <span
                      className="text-[7px] min-w-[3ch] text-center font-bold"
                      style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                    >
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                      disabled={zoom >= 2}
                      className="w-6 h-6 border-2 flex items-center justify-center text-[8px] font-bold transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                        borderColor: PIXSELF_BRAND.colors.primary.navy,
                        color: PIXSELF_BRAND.colors.primary.navy,
                      }}
                    >
                      <ZoomIn className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {/* Compact Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                        borderColor: PIXSELF_BRAND.colors.primary.navy,
                        color: PIXSELF_BRAND.colors.primary.navy,
                      }}
                      title="Undo"
                    >
                      <Undo2 className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                        borderColor: PIXSELF_BRAND.colors.primary.navy,
                        color: PIXSELF_BRAND.colors.primary.navy,
                      }}
                      title="Redo"
                    >
                      <Redo2 className="h-2.5 w-2.5" />
                    </button>
                    {storageAvailable && (
                      <button
                        onClick={() => setShowGalleryModal(true)}
                        className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200"
                        style={{
                          backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                          borderColor: PIXSELF_BRAND.colors.primary.navy,
                          color: PIXSELF_BRAND.colors.primary.navy,
                        }}
                        title="Gallery"
                      >
                        <Grid className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Compact Character Frame */}
                <div className="flex justify-center">
                  <div
                    className="relative border-4 overflow-hidden backdrop-blur-sm"
                    style={{
                      backgroundColor: "rgba(240, 248, 255, 0.85)",
                      borderColor: PIXSELF_BRAND.colors.primary.navy,
                      boxShadow: PIXSELF_BRAND.shadows.glowStrong,
                      width: "min(100%, 280px)",
                      aspectRatio: "1/1",
                    }}
                  >
                    <div
                      className="absolute inset-2 opacity-20"
                      style={{
                        backgroundImage: `
        repeating-linear-gradient(
          0deg,
          ${PIXSELF_BRAND.colors.primary.gold}80 0px,
          ${PIXSELF_BRAND.colors.primary.gold}80 2px,
          transparent 2px,
          transparent 4px
        ),
        repeating-linear-gradient(
          90deg,
          ${PIXSELF_BRAND.colors.primary.gold}80 0px,
          ${PIXSELF_BRAND.colors.primary.gold}80 2px,
          transparent 2px,
          transparent 4px
        )
      `,
                      }}
                    />
                    <div className="absolute inset-3 flex items-center justify-center overflow-hidden">
                      <div style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
                        <PixelCanvasPreview selections={selections} scale={0.35} zoom={1} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compact Quick Actions */}
                <div className="flex items-center justify-center gap-2">
                  <PixselfButton
                    onClick={randomize}
                    disabled={loading}
                    loading={loading}
                    size="sm"
                    icon={<RefreshCw className="h-3 w-3" />}
                  >
                    RANDOM
                  </PixselfButton>
                  <PixselfButton
                    onClick={() => showDownloadConfirmation()}
                    disabled={downloadLoading}
                    loading={downloadLoading}
                    variant="accent"
                    size="sm"
                    icon={<Download className="h-3 w-3" />}
                  >
                    SAVE
                  </PixselfButton>
                  {storageAvailable && (
                    <PixselfButton
                      onClick={() => setShowGalleryModal(true)}
                      variant="secondary"
                      size="sm"
                      icon={<Grid className="h-3 w-3" />}
                    >
                      GALLERY
                    </PixselfButton>
                  )}
                </div>
              </div>
            </PixselfPanel>

            {/* Mobile Parts Navigation - Horizontal Scroll */}
            <PixselfPanel title="CHARACTER PARTS" icon={<Layers className="h-4 w-4" />}>
              <div className="space-y-4">
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-stretch gap-2 min-w-max px-1">
                    {Object.entries(partsByCategory).map(([category, parts]) => (
                      <div key={category} className="flex items-stretch gap-2">
                        {/* Inline category badge */}
                        <div className="flex items-center">
                          <div
                            className="px-2 py-2 border-2 text-[8px] font-bold rounded-sm whitespace-nowrap"
                            style={{
                              backgroundColor: PIXSELF_BRAND.colors.sky.light,
                              borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                              color: PIXSELF_BRAND.colors.primary.navy,
                            }}
                          >
                            {category}
                          </div>
                        </div>

                        {/* Category parts inline */}
                        {parts.map((p) => {
                          const active = activePart === p.key
                          const partSelection = selections[p.key]
                          const isEnabled = partSelection?.enabled ?? true

                          return (
                            <button
                              key={p.key}
                              onClick={() => {
                                setActivePart(p.key)
                                play8BitSound("click", soundEnabled)
                              }}
                              className="flex flex-col items-center gap-1 px-3 py-2 border-2 text-[8px] font-bold backdrop-blur-sm transition-all duration-200 min-w-[70px]"
                              style={{
                                backgroundColor: active
                                  ? PIXSELF_BRAND.colors.primary.gold
                                  : PIXSELF_BRAND.colors.cloud.light,
                                borderColor: active
                                  ? PIXSELF_BRAND.colors.primary.navy
                                  : PIXSELF_BRAND.colors.primary.navyLight,
                                color: PIXSELF_BRAND.colors.primary.navy,
                                opacity: isEnabled ? 1 : 0.6,
                              }}
                            >
                              <span className="text-[6px] font-mono leading-none">{p.icon}</span>
                              <span className="text-center leading-tight">{p.label}</span>
                              {active && (
                                <div
                                  className="w-1 h-1 rounded-full"
                                  style={{ backgroundColor: PIXSELF_BRAND.colors.primary.navy }}
                                />
                              )}
                              {!isEnabled && <span className="text-[5px] opacity-60">OFF</span>}
                            </button>
                          )
                        })}

                        {/* Group separator spacer */}
                        <div className="w-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Single swipe hint for the unified row */}
                <div className="text-center">
                  <div className="text-[6px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                    ← SWIPE →
                  </div>
                </div>
              </div>
            </PixselfPanel>

            {/* Mobile Customization Panel - Compact */}
            <PixselfPanel
              title={`CUSTOMIZE ${CHARACTER_PARTS.find((p) => p.key === activePart)?.label}`}
              icon={<Settings className="h-4 w-4" />}
            >
              <div className="space-y-4">
                {/* Asset Selection - Mobile */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} />
                    <div
                      className="text-[9px] font-bold tracking-wider"
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      STYLE OPTIONS
                    </div>
                  </div>
                  <AssetVariantGrid
                    activePart={activePart}
                    currentAssetId={selections[activePart]?.assetId || "default"}
                    onAssetSelect={(assetId) => onSelectAsset(activePart, assetId)}
                    isLoading={loading}
                    isMobile={true}
                  />
                </div>

                {/* Color Variants - Mobile */}
                <ColorPalettePlaceholder activePart={activePart} isMobile={true} />
              </div>
            </PixselfPanel>

            {/* Mobile Export Options */}
            <PixselfPanel title="EXPORT OPTIONS" icon={<Download className="h-4 w-4" />}>
              <div className="space-y-4">
                <div className="text-[9px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                  Choose your export size:
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <PixselfButton
                    onClick={() => showDownloadConfirmation(0.5)}
                    disabled={downloadLoading}
                    loading={downloadLoading}
                    size="sm"
                    fullWidth
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    SMALL (320×320)
                  </PixselfButton>
                  <PixselfButton
                    onClick={() => showDownloadConfirmation(1)}
                    disabled={downloadLoading}
                    loading={downloadLoading}
                    size="sm"
                    fullWidth
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    MEDIUM (640×640)
                  </PixselfButton>
                  <PixselfButton
                    onClick={() => showDownloadConfirmation(2)}
                    disabled={downloadLoading}
                    loading={downloadLoading}
                    size="sm"
                    fullWidth
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    LARGE (1280×1280)
                  </PixselfButton>
                </div>
                <div className="pt-3 border-t-4" style={{ borderTopColor: PIXSELF_BRAND.colors.primary.navy }}>
                  <PixselfButton
                    onClick={shareCharacter}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={<Share2 className="h-3.5 w-3.5" />}
                  >
                    SHARE CHARACTER
                  </PixselfButton>
                </div>
              </div>
            </PixselfPanel>
          </div>
        )}
      </div>

      {/* Download Confirmation Modal */}
      {downloadModalData && (
        <DownloadConfirmationModal
          isOpen={showDownloadModal}
          onClose={() => {
            setShowDownloadModal(false)
            setDownloadModalData(null)
          }}
          onConfirm={downloadPng}
          characterPreview={downloadModalData.preview}
          fileName={downloadModalData.fileName}
          fileSize={downloadModalData.fileSize}
          isLoading={downloadLoading}
        />
      )}

      {/* Share Template Modal */}
      {sharePreviewData && (
        <ShareTemplateModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setSharePreviewData("")
          }}
          characterPreview={sharePreviewData}
          isLoading={false}
        />
      )}

      {/* Character Gallery Modal */}
      {storageAvailable && (
        <CharacterGalleryModal
          isOpen={showGalleryModal}
          onClose={() => setShowGalleryModal(false)}
          currentSelections={selections}
          onLoadCharacter={handleLoadCharacter}
          onSaveCharacter={handleSaveCharacter}
          soundEnabled={soundEnabled}
          onPlaySound={(type) => play8BitSound(type, soundEnabled)}
        />
      )}

      {/* Pixself Footer */}
      <PixselfFooter />
    </main>
  )
}
