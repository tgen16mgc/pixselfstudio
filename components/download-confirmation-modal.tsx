"use client"

import { useRef, useEffect, useState } from "react"
import { Download, X, ShoppingCart, RefreshCw } from "lucide-react"
import { PixselfButton } from "./pixself-ui-components"
import { PIXSELF_BRAND } from "@/config/pixself-brand"

interface DownloadConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  characterPreview: string // base64 image data
  fileName: string
  fileSize: string
  isLoading?: boolean
}

export function DownloadConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  characterPreview,
  fileName,
  fileSize,
  isLoading = false,
}: DownloadConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [isDownloadProtected, setIsDownloadProtected] = useState(false)

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setDownloadComplete(false)
      setIsDownloadProtected(false)
    }
  }, [isOpen])

  // Simple escape key and click outside handling
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDownloadProtected) {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isDownloadProtected) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.addEventListener("mousedown", handleClickOutside)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, isDownloadProtected, onClose])

  const handleDownloadAndBuy = () => {
    // Protect modal from closing for 3 seconds
    setIsDownloadProtected(true)
    
    // Trigger the download
    onConfirm()
    
    // Wait for download to complete, then show post-download state
    setTimeout(() => {
      setDownloadComplete(true)
      setIsDownloadProtected(false)
    }, 3000) // 3 second protection window
  }

  const handleBuyNow = () => {
    // Open the order form
    window.open("https://forms.gle/kBTQL5uMEQ1qp9xP9", "_blank")
    onClose()
  }

  const handleCreateAnother = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            rgba(44, 62, 80, 0.8) 0%, 
            rgba(44, 62, 80, 0.9) 100%)`,
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md border-4 backdrop-blur-sm animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "rgba(240, 248, 255, 0.98)",
          borderColor: PIXSELF_BRAND.colors.primary.navy,
          boxShadow: PIXSELF_BRAND.shadows.glowStrong,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 sm:border-b-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderBottomColor: PIXSELF_BRAND.colors.primary.navy,
          }}
        >
          <div className="flex items-center gap-2">
            {downloadComplete ? (
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
            ) : (
              <Download className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
            )}
            <h2 className="text-[11px] sm:text-[12px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              {downloadComplete ? "DOWNLOAD COMPLETE" : "DOWNLOAD CONFIRMATION"}
            </h2>
          </div>
          <button
                        onClick={() => !isDownloadProtected && onClose()}
            className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.cloud.white,
              borderColor: PIXSELF_BRAND.colors.primary.navy,
              color: PIXSELF_BRAND.colors.primary.navy,
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {isDownloadProtected && !downloadComplete ? (
            // Download in progress state
            <div className="text-center py-8">
              <div className="text-[12px] font-bold mb-4" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                🔄 Download in Progress...
              </div>
              <div className="text-[10px] mb-4" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                Your download should start automatically. Please wait...
              </div>
              <div className="text-[8px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                Chrome may show a download notification - this is normal!
              </div>
            </div>
          ) : downloadComplete ? (
            // Post-download content
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="text-[11px] sm:text-[12px] font-bold mb-2" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                  🎉 Your character has been downloaded!
                </div>
                <div className="text-[9px] sm:text-[10px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                  <span className="block sm:hidden">On iOS? Hold the image below to save it to your photo library!</span>
                  <span className="hidden sm:block">Your character image is now saved to your device.</span>
                </div>
              </div>

              {/* Character Preview for iOS Hold-to-Save */}
              <div className="flex flex-col items-center space-y-3">
                <div
                  className="relative border-2 sm:border-4 p-3 sm:p-4"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                    borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                    boxShadow: PIXSELF_BRAND.shadows.pixel,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={characterPreview || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                    alt={fileName}
                    className="w-24 h-30 sm:w-32 sm:h-40 object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />

                  {/* iOS Instruction Overlay */}
                  <div className="block sm:hidden absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 rounded">
                    <div className="text-center p-2">
                      <div className="text-[8px] font-bold text-white mb-1">📱 iOS Users</div>
                      <div className="text-[7px] text-white">Hold image to save</div>
                    </div>
                  </div>

                  {/* Sparkle decorations */}
                  <div
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 animate-pulse"
                    style={{
                      backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
                      clipPath:
                        "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                    }}
                  />
                </div>

                {/* iOS Instruction Text */}
                <div className="block sm:hidden text-center">
                  <div className="text-[8px] font-bold mb-1" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    📱 For iPhone/iPad Users:
                  </div>
                  <div className="text-[7px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                    Hold down on the image above and select &quot;Save to Photos&quot;
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div
                className="border-2 sm:border-4 p-3 sm:p-4 space-y-3 sm:space-y-4"
                style={{
                  backgroundColor: "rgba(244, 208, 63, 0.1)",
                  borderColor: PIXSELF_BRAND.colors.primary.gold,
                  borderStyle: "dashed",
                }}
              >
                <div className="text-center">
                  <div className="text-[10px] sm:text-[11px] font-bold mb-2" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    🎮 BRING YOUR CHARACTER TO LIFE! 🎮
                  </div>
                  <div className="text-[8px] sm:text-[9px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                    Turn your pixel character into a real keychain! We&apos;ll create a custom physical keychain just for you.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <PixselfButton
                    onClick={handleCreateAnother}
                    variant="secondary"
                    size="sm"
                    fullWidth
                    icon={<RefreshCw className="h-4 w-4" />}
                  >
                    CREATE ANOTHER
                  </PixselfButton>
                  
                  <PixselfButton
                    onClick={handleBuyNow}
                    variant="accent"
                    size="sm"
                    fullWidth
                    icon={<ShoppingCart className="h-4 w-4" />}
                  >
                    BUY NOW!
                  </PixselfButton>
                </div>

                <div className="text-center">
                  <div className="text-[6px] sm:text-[7px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                    Order your custom keychain with our easy form
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Original download confirmation content
            <>
          {/* Character Preview */}
          <div className="flex flex-col items-center space-y-4">
            <div
              className="relative border-4 p-4"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                boxShadow: PIXSELF_BRAND.shadows.pixel,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={characterPreview || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                alt="Character Preview"
                className="w-32 h-40 object-contain"
                style={{ imageRendering: "pixelated" }}
              />

              {/* Sparkle decorations around preview */}
              <div
                className="absolute -top-2 -right-2 w-4 h-4 animate-pulse"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
                  clipPath:
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                }}
              />
              <div
                className="absolute -bottom-2 -left-2 w-3 h-3 animate-pulse"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.accent.star,
                  clipPath:
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  animationDelay: "0.5s",
                }}
              />
            </div>

            {/* File Info */}
            <div
              className="text-center p-3 border-2 w-full"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.sky.light,
                borderColor: PIXSELF_BRAND.colors.primary.navyLight,
              }}
            >
              <div className="text-[10px] font-bold" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                {fileName}
              </div>
              <div className="text-[8px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                {fileSize}
              </div>
            </div>
          </div>

          {/* Combined CTA Section */}
          <div
            className="border-4 p-4 space-y-4"
            style={{
              backgroundColor: "rgba(244, 208, 63, 0.1)",
              borderColor: PIXSELF_BRAND.colors.primary.gold,
              borderStyle: "dashed",
            }}
          >
            <div className="text-center">
              <div className="text-[10px] font-bold mb-2" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                🎮 BRING YOUR CHARACTER TO LIFE! 🎮
              </div>
              <div className="text-[8px] mb-3" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                Download your pixel character and turn it into a real keychain! We&apos;ll create a custom physical keychain
                just for you.
              </div>
            </div>

            <PixselfButton
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDownloadAndBuy()
              }}
              disabled={isLoading}
              loading={isLoading}
              variant="accent"
              fullWidth
              icon={<Download className="h-4 w-4" />}
            >
              {isLoading ? "DOWNLOADING..." : "DOWNLOAD AND BUY!"}
            </PixselfButton>

            <div className="text-center">
              <div className="text-[6px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                Downloads your image and opens our order form
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
