"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { X, Download, Share2, Facebook, Twitter, Copy } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { PixselfButton } from "@/components/pixself-ui-components"

interface ShareTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  characterPreview: string
  isLoading: boolean
}

export function ShareTemplateModal({ isOpen, onClose, characterPreview }: ShareTemplateModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shareImageUrl, setShareImageUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateShareTemplate = useCallback(async () => {
    if (!canvasRef.current) return

    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")!

      // Set canvas size for social media (1200x630 for Facebook/Twitter)
      canvas.width = 1200
      canvas.height = 630

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create gradient background with proper color values
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, PIXSELF_BRAND.colors.sky.light || "#B0E0E6")
      gradient.addColorStop(0.5, PIXSELF_BRAND.colors.cloud.light || "#F8F9FA")
      gradient.addColorStop(1, PIXSELF_BRAND.colors.sky.primary || "#87CEEB")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add decorative pattern
      ctx.globalAlpha = 0.1
      for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.fillStyle = PIXSELF_BRAND.colors.primary.gold || "#F4D03F"
          ctx.fillRect(x, y, 4, 4)
        }
      }
      ctx.globalAlpha = 1

      // Add character preview with background circle
      const characterImg = new Image()
      characterImg.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        characterImg.onload = resolve
        characterImg.onerror = reject
        characterImg.src = characterPreview
      })

      // Draw background circle for character
      const centerX = 300
      const centerY = canvas.height / 2
      const circleRadius = 180

      ctx.beginPath()
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2)
      ctx.fillStyle = PIXSELF_BRAND.colors.cloud.white || "#FFFFFF"
      ctx.fill()
      ctx.strokeStyle = PIXSELF_BRAND.colors.primary.navy || "#2C3E50"
      ctx.lineWidth = 8
      ctx.stroke()

      // Draw character in circle
      const charSize = 280
      ctx.drawImage(characterImg, centerX - charSize / 2, centerY - charSize / 2, charSize, charSize)

      // Add text content
      ctx.textAlign = "left"
      ctx.textBaseline = "top"

      // Main heading
      ctx.fillStyle = PIXSELF_BRAND.colors.primary.navy || "#2C3E50"
      ctx.font = "bold 72px Arial"
      ctx.fillText("Check out my", 520, 120)

      // PIXSELF text with special styling
      ctx.fillStyle = PIXSELF_BRAND.colors.primary.gold || "#F4D03F"
      ctx.font = "bold 84px Arial"
      ctx.fillText("PIXSELF", 520, 200)

      // Add stroke to PIXSELF text
      ctx.strokeStyle = PIXSELF_BRAND.colors.primary.navy || "#2C3E50"
      ctx.lineWidth = 4
      ctx.strokeText("PIXSELF", 520, 200)

      // Continue text
      ctx.fillStyle = PIXSELF_BRAND.colors.primary.navy || "#2C3E50"
      ctx.font = "bold 72px Arial"
      ctx.fillText("character!", 520, 290)

      // Tagline
      ctx.fillStyle = PIXSELF_BRAND.colors.primary.navyLight || "#34495E"
      ctx.font = "bold 36px Arial"
      ctx.fillText("PIXture yourSELF in PIXSELF city", 520, 380)

      // CTA Button background
      const buttonX = 520
      const buttonY = 450
      const buttonWidth = 320
      const buttonHeight = 80

      ctx.fillStyle = PIXSELF_BRAND.colors.primary.gold || "#F4D03F"
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight)

      // CTA Button border
      ctx.strokeStyle = PIXSELF_BRAND.colors.primary.navy || "#2C3E50"
      ctx.lineWidth = 6
      ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight)

      // CTA Button text
      ctx.fillStyle = PIXSELF_BRAND.colors.primary.navy || "#2C3E50"
      ctx.font = "bold 32px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("CREATE YOURS NOW!", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2)

      // Add small logo in top-right corner
      const logoSize = 120
      const logoX = canvas.width - logoSize - 40
      const logoY = 40

      // Logo background
      ctx.fillStyle = PIXSELF_BRAND.colors.cloud.white || "#FFFFFF"
      ctx.fillRect(logoX - 10, logoY - 10, logoSize + 20, logoSize + 20)
      ctx.strokeStyle = PIXSELF_BRAND.colors.primary.navy || "#2C3E50"
      ctx.lineWidth = 4
      ctx.strokeRect(logoX - 10, logoY - 10, logoSize + 20, logoSize + 20)

      // Logo text (simplified)
      ctx.fillStyle = PIXSELF_BRAND.colors.primary.gold || "#F4D03F"
      ctx.font = "bold 24px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("PIXSELF", logoX + logoSize / 2, logoY + logoSize / 2)

      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setShareImageUrl(url)
        }
        setIsGenerating(false)
      }, "image/png")
    } catch (error) {
      console.error("Error generating share template:", error)
      setIsGenerating(false)
    }
  }, [characterPreview])

  useEffect(() => {
    if (isOpen && characterPreview && canvasRef.current) {
      generateShareTemplate()
    }
  }, [isOpen, characterPreview, generateShareTemplate])

  const downloadShareImage = () => {
    if (!shareImageUrl) return

    const link = document.createElement("a")
    link.href = shareImageUrl
    link.download = `pixself-character-share-${Date.now()}.png`
    link.click()
  }

  const shareToFacebook = () => {
    if (!shareImageUrl) return

    // For Facebook, we'll download the image and provide sharing text
    downloadShareImage()

    const shareText = encodeURIComponent(
      "Check out my PIXSELF character! PIXture yourSELF in PIXSELF city 🎮✨ #pixelart #charactercreator",
    )
    const shareUrl = encodeURIComponent("https://pixself.com") // Replace with your actual URL

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
      "_blank",
      "width=600,height=400",
    )
  }

  const shareToTwitter = () => {
    if (!shareImageUrl) return

    downloadShareImage()

    const shareText = encodeURIComponent(
      "Check out my PIXSELF character! PIXture yourSELF in PIXSELF city 🎮✨ #pixelart #charactercreator",
    )
    const shareUrl = encodeURIComponent("https://pixself.com") // Replace with your actual URL

    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, "_blank", "width=600,height=400")
  }

  const copyShareText = async () => {
    const shareText = "Check out my PIXSELF character! PIXture yourSELF in PIXSELF city 🎮✨"

    try {
      await navigator.clipboard.writeText(shareText)
      alert("Share text copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-4xl border-4 backdrop-blur-sm overflow-hidden"
        style={{
          backgroundColor: PIXSELF_BRAND.colors.cloud.white,
          borderColor: PIXSELF_BRAND.colors.primary.navy,
          boxShadow: PIXSELF_BRAND.shadows.glowStrong,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b-4 flex items-center justify-between"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderBottomColor: PIXSELF_BRAND.colors.primary.navy,
          }}
        >
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
            <h2 className="text-[14px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              SHARE YOUR CHARACTER
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.cloud.white,
              borderColor: PIXSELF_BRAND.colors.primary.navy,
              color: PIXSELF_BRAND.colors.primary.navy,
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="text-center">
            <div className="text-[12px] font-bold mb-4" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              SHARE TEMPLATE PREVIEW
            </div>

            <div
              className="relative inline-block border-4"
              style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight }}
            >
              {isGenerating ? (
                <div className="w-[600px] h-[315px] flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <div className="text-[10px] font-bold">GENERATING...</div>
                  </div>
                </div>
              ) : shareImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shareImageUrl || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                  alt="Share template"
                  className="w-[600px] h-[315px] object-cover"
                />
              ) : (
                <div className="w-[600px] h-[315px] flex items-center justify-center bg-gray-100">
                  <div className="text-[10px] font-bold">PREVIEW NOT AVAILABLE</div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="text-[12px] font-bold text-center" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              SHARE OPTIONS
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PixselfButton
                onClick={downloadShareImage}
                disabled={!shareImageUrl || isGenerating}
                variant="accent"
                size="sm"
                fullWidth
                icon={<Download className="h-4 w-4" />}
              >
                DOWNLOAD
              </PixselfButton>

              <PixselfButton
                onClick={shareToFacebook}
                disabled={!shareImageUrl || isGenerating}
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Facebook className="h-4 w-4" />}
              >
                FACEBOOK
              </PixselfButton>

              <PixselfButton
                onClick={shareToTwitter}
                disabled={!shareImageUrl || isGenerating}
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Twitter className="h-4 w-4" />}
              >
                TWITTER
              </PixselfButton>

              <PixselfButton
                onClick={copyShareText}
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Copy className="h-4 w-4" />}
              >
                COPY TEXT
              </PixselfButton>
            </div>

            <div className="text-center">
              <div className="text-[9px] mb-2" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                Share text:
              </div>
              <div
                className="text-[10px] font-bold p-3 border-2 rounded"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                  borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                  color: PIXSELF_BRAND.colors.primary.navy,
                }}
              >
                &quot;Check out my PIXSELF character! PIXture yourSELF in PIXSELF city 🎮✨&quot;
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvas for generating share template */}
        <canvas ref={canvasRef} className="hidden" width={1200} height={630} />
      </div>
    </div>
  )
}
