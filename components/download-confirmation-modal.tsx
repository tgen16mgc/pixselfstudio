"use client"

import { useRef, useEffect } from "react"
import { Download, X } from "lucide-react"
import { PixselfButton } from "./pixself-ui-components"
import { PIXSELF_BRAND } from "@/config/pixself-brand"

interface DownloadConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onDownloadComplete: () => void // New callback for when download completes
  characterPreview: string // base64 image data
  fileName: string
  fileSize: string
  isLoading?: boolean
}

export function DownloadConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onDownloadComplete,
  characterPreview,
  fileName,
  fileSize,
  isLoading = false,
}: DownloadConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
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
  }, [isOpen, onClose])

  const handleDownloadAndBuy = () => {
    // First trigger the download
    onConfirm()
    
    // Show the post-download modal immediately
    onDownloadComplete()
    
    // Close this modal
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
          className="flex items-center justify-between px-6 py-4 border-b-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderBottomColor: PIXSELF_BRAND.colors.primary.navy,
          }}
        >
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
            <h2 className="text-[12px] font-bold tracking-wider" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              DOWNLOAD CONFIRMATION
            </h2>
          </div>
          <button
            onClick={onClose}
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
        <div className="p-6 space-y-6">
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
              onClick={handleDownloadAndBuy}
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
        </div>
      </div>
    </div>
  )
}
