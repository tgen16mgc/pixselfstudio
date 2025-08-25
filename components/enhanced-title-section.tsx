"use client"

import { useEffect, useState } from "react"
import { Volume2, VolumeX, Undo2, Redo2, RotateCcw, RefreshCw, Download } from "lucide-react"
import { PixselfLogo } from "./pixself-logo"
import { PixselfButton } from "./pixself-ui-components"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { Press_Start_2P } from "next/font/google"

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface EnhancedTitleSectionProps {
  soundEnabled: boolean
  onToggleSound: () => void
  onUndo: () => void
  onRedo: () => void
  onReset: () => void
  onRandomize: () => void
  onDownload: () => void
  canUndo: boolean
  canRedo: boolean
  isLoading: boolean
  isDownloadLoading: boolean
  isDesktop: boolean
}

export function EnhancedTitleSection({
  soundEnabled,
  onToggleSound,
  onUndo,
  onRedo,
  onReset,
  onRandomize,
  onDownload,
  canUndo,
  canRedo,
  isLoading,
  isDownloadLoading,
  // isDesktop: _isDesktop,
}: EnhancedTitleSectionProps) {
  const [floatingElements, setFloatingElements] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      delay: number
      duration: number
      type: "star" | "circle" | "square"
    }>
  >([])

  useEffect(() => {
    // Generate floating decorative elements
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 4,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 4,
      type: ["star", "circle", "square"][Math.floor(Math.random() * 3)] as "star" | "circle" | "square",
    }))
    setFloatingElements(elements)
  }, [])

  const getShapeStyle = (type: string) => {
    switch (type) {
      case "star":
        return {
          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        }
      case "circle":
        return {
          borderRadius: "50%",
        }
      case "square":
      default:
        return {}
    }
  }

  return (
    <div
      className="relative border-4 backdrop-blur-sm overflow-hidden"
      style={{
        borderColor: PIXSELF_BRAND.colors.primary.navy,
        boxShadow: `
          0 0 30px rgba(244, 208, 63, 0.4),
          inset 0 0 20px rgba(255, 255, 255, 0.2)
        `,
        imageRendering: "pixelated",
      }}
    >
      {/* Background GIF */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: "url('https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/image/title%20background.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

      {/* Subtle floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute opacity-30"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
              animation: `float ${element.duration}s ease-in-out infinite`,
              animationDelay: `${element.delay}s`,
              filter: "drop-shadow(0 0 2px currentColor)",
              imageRendering: "pixelated",
              ...getShapeStyle(element.type),
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Centered Logo and Title Section */}
          <div className="flex flex-col items-center lg:items-start min-w-0 flex-1 gap-2.5">
            {/* Clickable Logo centered above title */}
            <div className="flex-shrink-0 relative">
              <div
                className="absolute inset-0 animate-pulse opacity-40 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${PIXSELF_BRAND.colors.accent.sparkle}60 0%, transparent 70%)`,
                  filter: "blur(15px)",
                  transform: "scale(1.5)",
                }}
              />
              <PixselfLogo size="lg" showText={false} animated={true} clickable={true} />
            </div>

            {/* Title centered below logo - removed underline */}
            <div className="text-center space-y-2 min-w-0">
              <div
                className={`text-[10px] sm:text-[12px] lg:text-[14px] leading-relaxed relative ${press2p.className}`}
                style={{
                  color: PIXSELF_BRAND.colors.primary.navy,
                  textShadow: `
                    3px 3px 0px ${PIXSELF_BRAND.colors.primary.gold}, 
                    1px 1px 10px ${PIXSELF_BRAND.colors.accent.sparkle},
                    0 0 20px rgba(255,255,255,0.8)
                  `,
                  animation: "textBounce 3s ease-in-out infinite",
                  imageRendering: "pixelated",
                }}
              >
                <span className="font-bold">PIXture yourSELF in PIXSELF city</span>
              </div>
            </div>
          </div>

          {/* Enhanced Controls Section */}
          <div className="flex items-center justify-center lg:justify-end gap-3 flex-wrap">
            {/* Sound Toggle with enhanced styling */}
            <button
              onClick={onToggleSound}
              className="w-8 h-8 border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 relative overflow-hidden"
              style={{
                backgroundColor: soundEnabled ? PIXSELF_BRAND.colors.primary.gold : PIXSELF_BRAND.colors.cloud.light,
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                color: PIXSELF_BRAND.colors.primary.navy,
                boxShadow: soundEnabled ? `0 0 15px ${PIXSELF_BRAND.colors.primary.gold}60` : "none",
                transform: soundEnabled ? "scale(1.1)" : "scale(1)",
                imageRendering: "pixelated",
              }}
              title={soundEnabled ? "Disable Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}

              {/* Sound wave animation when enabled */}
              {soundEnabled && (
                <div
                  className="absolute inset-0 animate-ping opacity-30"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                  }}
                />
              )}
            </button>

            <div className="hidden lg:flex items-center gap-2">
              {/* Enhanced Undo/Redo buttons */}
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50 relative"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                  color: PIXSELF_BRAND.colors.primary.navy,
                  boxShadow: canUndo ? `0 0 10px ${PIXSELF_BRAND.colors.sky.primary}40` : "none",
                  transform: canUndo ? "scale(1.05)" : "scale(1)",
                  imageRendering: "pixelated",
                }}
                title="Undo last change (Ctrl+Z)"
              >
                <Undo2 className="h-3 w-3" />
              </button>

              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50 relative"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                  color: PIXSELF_BRAND.colors.primary.navy,
                  boxShadow: canRedo ? `0 0 10px ${PIXSELF_BRAND.colors.sky.primary}40` : "none",
                  transform: canRedo ? "scale(1.05)" : "scale(1)",
                  imageRendering: "pixelated",
                }}
                title="Redo last change (Ctrl+Y)"
              >
                <Redo2 className="h-3 w-3" />
              </button>

              {/* Enhanced action buttons */}
              <PixselfButton
                onClick={onReset}
                size="sm"
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                className="hover:scale-110 transition-transform duration-200"
              >
                RESET
              </PixselfButton>

              <PixselfButton
                onClick={onRandomize}
                disabled={isLoading}
                loading={isLoading}
                size="sm"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                className="hover:scale-110 transition-transform duration-200"
              >
                RANDOM
              </PixselfButton>



              <PixselfButton
                onClick={onDownload}
                disabled={isDownloadLoading}
                loading={isDownloadLoading}
                variant="accent"
                size="sm"
                icon={<Download className="h-3.5 w-3.5" />}
                className="hover:scale-110 transition-transform duration-200 hover:rotate-3"
              >
                DOWNLOAD
              </PixselfButton>
            </div>

            {/* Mobile Action Buttons with enhanced styling */}
            <div className="flex lg:hidden items-center gap-2">
              <PixselfButton
                onClick={onRandomize}
                disabled={isLoading}
                loading={isLoading}
                size="sm"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                className="hover:scale-110 transition-transform duration-200"
              >
                RANDOM
              </PixselfButton>
              <PixselfButton
                onClick={onDownload}
                disabled={isDownloadLoading}
                loading={isDownloadLoading}
                variant="accent"
                size="sm"
                icon={<Download className="h-3.5 w-3.5" />}
                className="hover:scale-110 transition-transform duration-200 hover:rotate-3"
              >
                SAVE
              </PixselfButton>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-10px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-5px) rotate(180deg) scale(0.9); }
          75% { transform: translateY(-15px) rotate(270deg) scale(1.05); }
        }
        
        @keyframes textBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  )
}
