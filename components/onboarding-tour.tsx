"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle,
  Sparkles,
  Mouse,
  Download,
  Palette,
  Layers,
  Settings,
  Grid,
  Save,
  Info,
  Play,
  RefreshCw
} from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { Press_Start_2P } from "next/font/google"

const press2p = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface TourStep {
  id: string
  target?: string // Optional - some steps might not target specific elements
  title: string
  content: string
  action?: string // Optional action text
  position?: "top" | "bottom" | "left" | "right" | "center"
  highlight?: boolean // Whether to highlight the target element
  icon?: React.ReactNode
  category: "welcome" | "basics" | "customization" | "export" | "advanced"
}

const TOUR_STEPS: TourStep[] = [
  // Welcome & Overview
  {
    id: "welcome",
    title: "Welcome to Pixself Studio! 🎨",
    content: "Let's create your unique pixel character! This quick tour will show you everything you need to know.",
    position: "center",
    icon: <Sparkles className="h-5 w-5" />,
    category: "welcome"
  },
  {
    id: "overview",
    title: "Your Creative Workspace",
    content: "Pixself Studio lets you design custom pixel art characters with hundreds of combinations. Perfect for avatars, NFTs, game characters, or just for fun!",
    position: "center",
    icon: <Info className="h-5 w-5" />,
    category: "welcome"
  },

  // Basic Navigation
  {
    id: "preview",
    target: '[data-tour="character-preview"], [role="img"][aria-label*="character preview"]',
    title: "Live Character Preview",
    content: "This is your character canvas! Watch your pixel art come to life in real-time as you make changes.",
    action: "Try zooming in/out with the controls",
    position: "bottom",
    highlight: true,
    icon: <Mouse className="h-5 w-5" />,
    category: "basics"
  },
  {
    id: "parts",
    target: '[data-tour="parts-selection"], [title*="CHARACTER PARTS"]',
    title: "Character Parts Selection",
    content: "Click on different body parts to customize them. Each part has unique styles and colors!",
    action: "Click on 'Hair' to start customizing",
    position: "right",
    highlight: true,
    icon: <Layers className="h-5 w-5" />,
    category: "basics"
  },

  // Customization
  {
    id: "styles",
    target: '[data-tour="style-options"], [title*="STYLE OPTIONS"]',
    title: "Choose Your Style",
    content: "Select from different styles for each part. Mix and match to create your unique look!",
    action: "Try different hair styles",
    position: "left",
    highlight: true,
    icon: <Settings className="h-5 w-5" />,
    category: "customization"
  },
  {
    id: "colors",
    target: '[data-tour="color-variants"], [title*="COLOR"]',
    title: "Color Your World",
    content: "Each style comes with multiple color options. Find the perfect shade for your character!",
    action: "Experiment with different colors",
    position: "left",
    highlight: true,
    icon: <Palette className="h-5 w-5" />,
    category: "customization"
  },
  {
    id: "special",
    title: "Special Collections",
    content: "Look out for limited edition collections like 'Sac Viet' featuring unique Vietnamese-inspired designs!",
    position: "center",
    icon: <Sparkles className="h-5 w-5" />,
    category: "customization"
  },

  // Export & Save
  {
    id: "download",
    target: '[data-tour="download"], button:has(svg[class*="Download"])',
    title: "Download Your Creation",
    content: "Ready to save? Click the Download button to export your character as a high-quality PNG image.",
    action: "Choose from 3 size options",
    position: "top",
    highlight: true,
    icon: <Download className="h-5 w-5" />,
    category: "export"
  },
  {
    id: "sizes",
    target: '[title*="EXPORT OPTIONS"]',
    title: "Export Size Options",
    content: "Choose your preferred size: Small (320px) for social media, Medium (640px) for general use, or Large (1280px) for high-quality prints!",
    position: "left",
    highlight: true,
    icon: <Settings className="h-5 w-5" />,
    category: "export"
  },
  {
    id: "gallery",
    target: '[data-tour="gallery"], button:has(svg[class*="Grid"])',
    title: "Character Gallery",
    content: "Save multiple characters to your gallery! Perfect for creating a whole cast or trying different styles.",
    action: "Press Ctrl+G to open gallery",
    position: "top",
    highlight: true,
    icon: <Grid className="h-5 w-5" />,
    category: "export"
  },

  // Advanced Features
  {
    id: "undo",
    target: 'button:has(svg[class*="Undo"])',
    title: "Undo/Redo Actions",
    content: "Made a mistake? Use undo/redo buttons or keyboard shortcuts (Ctrl+Z / Ctrl+Y) to navigate your creation history.",
    position: "bottom",
    highlight: true,
    icon: <RefreshCw className="h-5 w-5" />,
    category: "advanced"
  },
  {
    id: "shortcuts",
    title: "Pro Tips & Shortcuts",
    content: "⌨️ Keyboard shortcuts:\n• Ctrl+Z: Undo\n• Ctrl+Y: Redo\n• Ctrl+S: Quick Download\n• Ctrl+G: Open Gallery",
    position: "center",
    icon: <Info className="h-5 w-5" />,
    category: "advanced"
  },
  {
    id: "purchase",
    title: "Ready to Purchase?",
    content: "Love your character? You can download it for free or support us by purchasing premium features and exclusive collections!",
    action: "Start creating now!",
    position: "center",
    icon: <Sparkles className="h-5 w-5" />,
    category: "export"
  }
]

interface OnboardingTourProps {
  onComplete?: () => void
  autoStart?: boolean
}

export function OnboardingTour({ onComplete, autoStart = false }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const tourRef = useRef<HTMLDivElement>(null)

  // Check if user has seen the tour
  useEffect(() => {
    const seen = localStorage.getItem("pixself-onboarding-tour-completed")
    if (seen) {
      setHasSeenTour(true)
    } else if (autoStart) {
      // Auto-start for new users
      const timer = setTimeout(() => {
        setIsActive(true)
      }, 2000) // Start after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [autoStart])

  // Find and highlight target elements
  useEffect(() => {
    if (!isActive || isMinimized) {
      if (highlightedElement) {
        highlightedElement.classList.remove("tour-highlight")
        setHighlightedElement(null)
      }
      return
    }

    const currentStepData = TOUR_STEPS[currentStep]
    if (!currentStepData.target) {
      if (highlightedElement) {
        highlightedElement.classList.remove("tour-highlight")
        setHighlightedElement(null)
      }
      return
    }

    // Try multiple selectors
    const selectors = currentStepData.target.split(", ")
    let element: HTMLElement | null = null

    for (const selector of selectors) {
      element = document.querySelector(selector) as HTMLElement
      if (element) break
    }

    if (element) {
      // Remove previous highlight
      if (highlightedElement && highlightedElement !== element) {
        highlightedElement.classList.remove("tour-highlight")
      }

      // Add highlight class
      element.classList.add("tour-highlight")
      setHighlightedElement(element)

      // Scroll into view
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isActive, currentStep, isMinimized])

  // Calculate tooltip position
  const getTooltipPosition = useCallback(() => {
    if (!highlightedElement || isMinimized) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    }

    const currentStepData = TOUR_STEPS[currentStep]
    const rect = highlightedElement.getBoundingClientRect()
    const position = currentStepData.position || "bottom"

    const offset = 20
    let styles: React.CSSProperties = {}

    switch (position) {
      case "top":
        styles = {
          bottom: `${window.innerHeight - rect.top + offset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translateX(-50%)",
        }
        break
      case "bottom":
        styles = {
          top: `${rect.bottom + offset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: "translateX(-50%)",
        }
        break
      case "left":
        styles = {
          top: `${rect.top + rect.height / 2}px`,
          right: `${window.innerWidth - rect.left + offset}px`,
          transform: "translateY(-50%)",
        }
        break
      case "right":
        styles = {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + offset}px`,
          transform: "translateY(-50%)",
        }
        break
      case "center":
      default:
        styles = {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }
        break
    }

    // Ensure tooltip stays within viewport
    const tooltipWidth = 400
    const tooltipHeight = 250

    if (styles.left && typeof styles.left === "string") {
      const leftValue = parseInt(styles.left)
      if (leftValue + tooltipWidth / 2 > window.innerWidth) {
        styles.left = `${window.innerWidth - tooltipWidth - offset}px`
        styles.transform = "translateY(-50%)"
      } else if (leftValue - tooltipWidth / 2 < 0) {
        styles.left = `${offset}px`
        styles.transform = "translateY(-50%)"
      }
    }

    return styles
  }, [highlightedElement, currentStep, isMinimized])

  const completeTour = () => {
    setIsActive(false)
    setHasSeenTour(true)
    localStorage.setItem("pixself-onboarding-tour-completed", "true")
    if (highlightedElement) {
      highlightedElement.classList.remove("tour-highlight")
    }
    onComplete?.()
  }

  const skipTour = () => {
    completeTour()
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const startTour = () => {
    setIsActive(true)
    setCurrentStep(0)
    setIsMinimized(false)
  }

  const restartTour = () => {
    localStorage.removeItem("pixself-onboarding-tour-completed")
    setHasSeenTour(false)
    startTour()
  }

  // Tour button (always visible)
  const TourButton = () => (
    <button
      onClick={startTour}
      className={`${press2p.className} group flex items-center gap-2 px-4 py-2.5 text-[9px] font-bold transition-all duration-200 border-4 backdrop-blur-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1`}
      style={{
        backgroundColor: PIXSELF_BRAND.colors.sky.primary,
        color: PIXSELF_BRAND.colors.primary.navy,
        borderColor: PIXSELF_BRAND.colors.primary.navy,
        boxShadow: PIXSELF_BRAND.shadows.pixel,
      }}
      title="Start onboarding tour"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">TOUR</span>
    </button>
  )

  if (!isActive) {
    return <TourButton />
  }

  const currentStepData = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  return (
    <>
      {/* Global styles for highlighting */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 1001 !important;
          box-shadow: 0 0 0 4px ${PIXSELF_BRAND.colors.primary.gold},
                      0 0 0 8px ${PIXSELF_BRAND.colors.primary.navy},
                      0 0 20px 10px rgba(244, 208, 63, 0.4) !important;
          animation: tour-pulse 2s ease-in-out infinite;
        }

        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px ${PIXSELF_BRAND.colors.primary.gold},
                        0 0 0 8px ${PIXSELF_BRAND.colors.primary.navy},
                        0 0 20px 10px rgba(244, 208, 63, 0.4);
          }
          50% {
            box-shadow: 0 0 0 4px ${PIXSELF_BRAND.colors.primary.gold},
                        0 0 0 8px ${PIXSELF_BRAND.colors.primary.navy},
                        0 0 30px 15px rgba(244, 208, 63, 0.6);
          }
        }

        .tour-overlay {
          pointer-events: none;
        }

        .tour-overlay * {
          pointer-events: auto;
        }
      `}</style>

      {/* Semi-transparent overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[999] tour-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsMinimized(true)
          }
        }}
      />

      {/* Tour Tooltip */}
      <div
        ref={tourRef}
        className={`${press2p.className} fixed z-[1000] transition-all duration-300 ${
          isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          ...getTooltipPosition(),
          maxWidth: "400px",
          minWidth: "320px",
        }}
      >
        <div
          className="border-4 rounded-lg p-5 shadow-2xl backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(240, 248, 255, 0.98)",
            borderColor: PIXSELF_BRAND.colors.primary.navy,
            boxShadow: PIXSELF_BRAND.shadows.glowStrong,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentStepData.icon && (
                <div
                  className="p-2 rounded"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                    color: PIXSELF_BRAND.colors.primary.navy,
                  }}
                >
                  {currentStepData.icon}
                </div>
              )}
              <div>
                <h3
                  className="text-[11px] font-bold mb-1"
                  style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                >
                  {currentStepData.title}
                </h3>
                <div
                  className="text-[7px]"
                  style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                >
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </div>
              </div>
            </div>
            <button
              onClick={skipTour}
              className="p-1 hover:opacity-70 transition-opacity"
              style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
              title="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div
            className="h-2 mb-4 rounded overflow-hidden"
            style={{ backgroundColor: PIXSELF_BRAND.colors.cloud.shadow }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: PIXSELF_BRAND.colors.primary.gold,
              }}
            />
          </div>

          {/* Content */}
          <div
            className="text-[9px] leading-relaxed mb-4 whitespace-pre-line"
            style={{ color: PIXSELF_BRAND.colors.primary.navy }}
          >
            {currentStepData.content}
          </div>

          {/* Action hint */}
          {currentStepData.action && (
            <div
              className="text-[8px] mb-4 p-2 rounded border-2"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.sky.alice,
                borderColor: PIXSELF_BRAND.colors.sky.primary,
                color: PIXSELF_BRAND.colors.primary.navy,
              }}
            >
              💡 <strong>Try this:</strong> {currentStepData.action}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-[8px] underline hover:no-underline"
              style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-[8px] font-bold border-2 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-0.5 hover:translate-y-0.5"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                  color: PIXSELF_BRAND.colors.primary.navy,
                }}
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-1 px-3 py-1.5 text-[8px] font-bold border-2 rounded transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                  color: PIXSELF_BRAND.colors.primary.navy,
                  boxShadow: PIXSELF_BRAND.shadows.pixel,
                }}
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Minimized indicator */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className={`${press2p.className} fixed bottom-4 right-4 z-[1000] flex items-center gap-2 px-4 py-2 text-[8px] font-bold border-2 rounded animate-pulse`}
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderColor: PIXSELF_BRAND.colors.primary.navy,
            color: PIXSELF_BRAND.colors.primary.navy,
            boxShadow: PIXSELF_BRAND.shadows.glowStrong,
          }}
        >
          <Play className="h-3 w-3" />
          Resume Tour
        </button>
      )}
    </>
  )
}

// Export a button component that can be used anywhere
export function OnboardingTourButton() {
  const [showTour, setShowTour] = useState(false)

  if (showTour) {
    return <OnboardingTour onComplete={() => setShowTour(false)} />
  }

  return (
    <button
      onClick={() => setShowTour(true)}
      className={`${press2p.className} group flex items-center gap-2 px-4 py-2.5 text-[9px] font-bold transition-all duration-200 border-4 backdrop-blur-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1`}
      style={{
        backgroundColor: PIXSELF_BRAND.colors.sky.primary,
        color: PIXSELF_BRAND.colors.primary.navy,
        borderColor: PIXSELF_BRAND.colors.primary.navy,
        boxShadow: PIXSELF_BRAND.shadows.pixel,
      }}
      title="Start onboarding tour"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">TOUR</span>
    </button>
  )
}