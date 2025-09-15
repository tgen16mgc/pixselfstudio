"use client"

import React, { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { PixselfButton } from "@/components/pixself-ui-components"
import { Press_Start_2P } from "next/font/google"

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface WelcomeNotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WelcomeNotificationModal({
  isOpen,
  onClose,
}: WelcomeNotificationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.addEventListener("mousedown", handleClickOutside)
    
    // Prevent body scrolling when modal is open to fix backdrop scroll bug
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, 
              ${PIXSELF_BRAND.colors.primary.navy}40 0%, 
              rgba(0,0,0,0.8) 100%
            )
          `
        }}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto border-4 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto ${press2p.className}`}
        style={{
          backgroundColor: PIXSELF_BRAND.colors.cloud.light,
          borderColor: PIXSELF_BRAND.colors.primary.navy,
          boxShadow: PIXSELF_BRAND.shadows.glowStrong,
        }}
      >
        {/* Header with close button */}
        <div 
          className="flex items-center justify-between p-3 md:p-4 border-b-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderBottomColor: PIXSELF_BRAND.colors.primary.navy,
          }}
        >
          <h2 
            className="text-sm font-bold tracking-wider"
            style={{ color: PIXSELF_BRAND.colors.primary.navy }}
          >
            📢 NOTIFICATION!
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.cloud.light,
              borderColor: PIXSELF_BRAND.colors.primary.navy,
              color: PIXSELF_BRAND.colors.primary.navy,
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 space-y-3">
          {/* Image container */}
          <div className="flex justify-center">
            <div 
              className="border-4 overflow-hidden w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px]"
              style={{
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                boxShadow: PIXSELF_BRAND.shadows.pixel,
              }}
            >
              <img
                src="/image/xtb-notification.jpg"
                alt="XTB Trading Notification"
                className="w-full h-auto block"
                style={{ imageRendering: "auto" }}
              />
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center pt-1">
            <PixselfButton
              onClick={onClose}
              variant="accent"
              size="sm"
            >
              GOT IT!
            </PixselfButton>
          </div>
        </div>

        {/* 8-bit style decorative corners */}
        <div
          className="absolute -top-1 -left-1 w-4 h-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        <div
          className="absolute -top-1 -right-1 w-4 h-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
          }}
        />
        <div
          className="absolute -bottom-1 -left-1 w-4 h-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            clipPath: "polygon(0 0, 0 100%, 100% 100%)",
          }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
          }}
        />
      </div>
    </div>
  )
}