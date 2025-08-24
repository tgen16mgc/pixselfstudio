"use client"

import { Facebook, Instagram } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"

// Custom TikTok icon since Lucide doesn't have it
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export function PixselfFooter() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/wearepixself",
      icon: Facebook,
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/pixself.exe/",
      icon: Instagram,
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@pixself",
      icon: TikTokIcon,
    },
  ]

  return (
    <footer
      className="relative mt-12 border-t-4 backdrop-blur-sm"
      style={{
        borderTopColor: PIXSELF_BRAND.colors.primary.navy,
        backgroundColor: "rgba(240, 248, 255, 0.9)",
      }}
    >
      {/* Decorative corner pixels */}
      <div className="absolute top-0 left-4">
        <div className="w-2 h-2 -translate-y-1" style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold }} />
      </div>
      <div className="absolute top-0 right-4">
        <div className="w-2 h-2 -translate-y-1" style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold }} />
      </div>

      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              ${PIXSELF_BRAND.colors.primary.navy}40 0px,
              ${PIXSELF_BRAND.colors.primary.navy}40 1px,
              transparent 1px,
              transparent 8px
            )
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div
            className="text-[8px] font-bold tracking-wider"
            style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
          >
            © {currentYear} PIXSELF • ALL RIGHTS RESERVED
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const IconComponent = social.icon
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-8 h-8 border-2 flex items-center justify-center transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                    borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                    color: PIXSELF_BRAND.colors.primary.navy,
                  }}
                  title={`Follow us on ${social.name}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = PIXSELF_BRAND.colors.primary.gold
                    e.currentTarget.style.borderColor = PIXSELF_BRAND.colors.primary.navy
                    e.currentTarget.style.boxShadow = PIXSELF_BRAND.shadows.pixel
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = PIXSELF_BRAND.colors.cloud.light
                    e.currentTarget.style.borderColor = PIXSELF_BRAND.colors.primary.navyLight
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <IconComponent className="h-3.5 w-3.5" />

                  {/* Hover sparkle effect */}
                  <div
                    className="absolute -top-1 -right-1 w-1 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold }}
                  />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
