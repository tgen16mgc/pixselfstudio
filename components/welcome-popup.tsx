"use client"

import { useRef, useEffect } from "react"
import { X } from "lucide-react"
import { PixselfButton } from "./pixself-ui-components"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { Press_Start_2P } from "next/font/google"

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface WelcomePopupProps {
  isOpen: boolean
  onClose: () => void
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
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
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      style={{ imageRendering: "pixelated" }}
    >
      <div
        ref={modalRef}
        className={`relative bg-white max-w-lg w-full max-h-[90vh] overflow-hidden border-4 ${press2p.className}`}
        style={{
          backgroundColor: PIXSELF_BRAND.colors.cloud.white,
          borderColor: PIXSELF_BRAND.colors.primary.navy,
          boxShadow: PIXSELF_BRAND.shadows.pixelLarge,
          imageRendering: "pixelated",
        }}
      >
        {/* Tab-style header */}
        <div
          className="relative px-6 py-4 border-b-4"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderBottomColor: PIXSELF_BRAND.colors.primary.navy,
          }}
        >
          {/* Tab design elements */}
          <div
            className="absolute -top-1 -left-1 w-4 h-4 border-4 border-r-0 border-b-0"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.primary.gold,
              borderColor: PIXSELF_BRAND.colors.primary.navy,
            }}
          />
          <div
            className="absolute -top-1 -right-1 w-4 h-4 border-4 border-l-0 border-b-0"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.primary.gold,
              borderColor: PIXSELF_BRAND.colors.primary.navy,
            }}
          />
          
          <div className="flex items-center justify-between">
            <h2
              className="text-[14px] font-bold tracking-wider"
              style={{
                color: PIXSELF_BRAND.colors.primary.navy,
                textShadow: `2px 2px 0px ${PIXSELF_BRAND.colors.primary.goldLight}`,
              }}
            >
              Notification!
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 border-4 flex items-center justify-center transition-all duration-200 active:translate-x-0.5 active:translate-y-0.5"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                color: PIXSELF_BRAND.colors.primary.navy,
                boxShadow: PIXSELF_BRAND.shadows.pixel,
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Image container */}
          <div className="flex justify-center">
            <div
              className="border-4 p-2 max-w-full"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                boxShadow: PIXSELF_BRAND.shadows.pixel,
              }}
            >
              <img
                src="https://scontent.fhan5-8.fna.fbcdn.net/v/t39.30808-6/547530288_122121566786970980_157883314380678539_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHC37O3q1CsXqIximNoWkPc2ktILAyMovvaS0gsDIyi-0DzbBKOtYHUrTF-nPbLgkqxI1WdqUHzIEgJgqvhWJeR&_nc_ohc=kpiaX2-FfssQ7kNvwGrLQQ-&_nc_oc=AdlouloUav_y1sesOlluzZVq2woNcPfslFTpJUmUtvhSO5XSzhIk_qIvoPp72Mn0rWE&_nc_zt=23&_nc_ht=scontent.fhan5-8.fna&_nc_gid=NsQfCrdOqSD9_HGmEaCniA&oh=00_AfY16lxuZK9PoJ2jRaZIA0X9xuCKCVgY_mBhqRvcoA-rOQ&oe=68CCE7C2"
                alt="Notification"
                className="w-full h-auto border-2"
                style={{
                  borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                  imageRendering: "pixelated",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  // Fallback in case image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.parentElement!.innerHTML = `
                    <div class="flex items-center justify-center h-48 text-[12px] text-center" style="color: ${PIXSELF_BRAND.colors.primary.navy}; background-color: ${PIXSELF_BRAND.colors.cloud.light}">
                      <div>
                        <div>📷</div>
                        <div>Image Loading...</div>
                      </div>
                    </div>
                  `
                }}
              />
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center">
            <PixselfButton
              onClick={onClose}
              variant="primary"
              size="md"
              icon={<X className="h-4 w-4" />}
            >
              CLOSE
            </PixselfButton>
          </div>
        </div>

        {/* 8-bit decorative corners */}
        <div
          className="absolute bottom-0 left-0 w-4 h-4 border-4 border-t-0 border-r-0"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderColor: PIXSELF_BRAND.colors.primary.navy,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-4 h-4 border-4 border-t-0 border-l-0"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderColor: PIXSELF_BRAND.colors.primary.navy,
          }}
        />
      </div>
    </div>
  )
}