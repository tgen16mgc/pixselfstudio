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
    // Don't prevent body scrolling as we want the modal itself to be scrollable
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
        className={`relative w-full max-w-md md:max-w-lg lg:max-w-2xl mx-auto border-4 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-300 my-8 ${press2p.className}`}
        style={{
          backgroundColor: PIXSELF_BRAND.colors.cloud.light,
          borderColor: PIXSELF_BRAND.colors.primary.navy,
          boxShadow: PIXSELF_BRAND.shadows.glowStrong,
        }}
      >
        {/* Header with close button */}
        <div 
          className="flex items-center justify-between p-4 border-b-4"
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
        <div className="p-4 md:p-6 space-y-4">
          {/* Image container */}
          <div className="flex justify-center">
            <div 
              className="border-4 overflow-hidden w-full max-w-[300px] md:max-w-[400px] lg:max-w-[450px]"
              style={{
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                boxShadow: PIXSELF_BRAND.shadows.pixel,
              }}
            >
              <img
                src="https://scontent.fhan5-8.fna.fbcdn.net/v/t39.30808-6/547530288_122121566786970980_157883314380678539_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHC37O3q1CsXqIximNoWkPc2ktILAyMovvaS0gsDIyi-0DzbBKOtYHUrTF-nPbLgkqxI1WdqUHzIEgJgqvhWJeR&_nc_ohc=kpiaX2-FfssQ7kNvwGrLQQ-&_nc_oc=AdlouloUav_y1sesOlluzZVq2woNcPfslFTpJUmUtvhSO5XSzhIk_qIvoPp72Mn0rWE&_nc_zt=23&_nc_ht=scontent.fhan5-8.fna&_nc_gid=NsQfCrdOqSD9_HGmEaCniA&oh=00_AfY16lxuZK9PoJ2jRaZIA0X9xuCKCVgY_mBhqRvcoA-rOQ&oe=68CCE7C2"
                alt="Welcome notification"
                className="w-full h-auto block"
                style={{ imageRendering: "auto" }}
              />
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center pt-2">
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