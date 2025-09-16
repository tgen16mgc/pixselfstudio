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

// Spotlight overlay component that creates a cutout around highlighted elements
function SpotlightOverlay({ 
  highlightedElement, 
  onMinimize,
  isPaused = false
}: { 
  highlightedElement: HTMLElement | null
  onMinimize: () => void
  isPaused?: boolean
}) {
  const [overlayParts, setOverlayParts] = useState<React.CSSProperties[]>([])

  useEffect(() => {
    if (!highlightedElement) {
      // No highlight - full overlay
      setOverlayParts([{ 
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)'
      }])
      return
    }

    const updateOverlay = () => {
      const rect = highlightedElement.getBoundingClientRect()
      const padding = 12 // Extra space around the element
      
      // Check if element is visible in viewport
      const isVisible = rect.top < window.innerHeight && 
                       rect.bottom > 0 && 
                       rect.left < window.innerWidth && 
                       rect.right > 0

      if (!isVisible) {
        console.log(`🔍 Highlighted element scrolled out of view, showing full overlay`)
        // Element is off-screen, show full overlay
        setOverlayParts([{
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          position: 'absolute'
        }])
        return
      }

      // Calculate safe boundaries to prevent overlapping
      const topBoundary = Math.max(0, rect.top - padding)
      const bottomBoundary = Math.min(window.innerHeight, rect.bottom + padding)
      const leftBoundary = Math.max(0, rect.left - padding)
      const rightBoundary = Math.min(window.innerWidth, rect.right + padding)

      console.log(`🎯 Overlay boundaries:`, {
        element: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
        safe: { top: topBoundary, bottom: bottomBoundary, left: leftBoundary, right: rightBoundary },
        viewport: { width: window.innerWidth, height: window.innerHeight }
      })

      // Check if element is too close to edges for safe 4-part overlay
      const minSafeSize = 20 // Minimum size for overlay parts
      const hasTopSpace = topBoundary >= minSafeSize
      const hasBottomSpace = (window.innerHeight - bottomBoundary) >= minSafeSize
      const hasLeftSpace = leftBoundary >= minSafeSize
      const hasRightSpace = (window.innerWidth - rightBoundary) >= minSafeSize

      // If element is too close to multiple edges, use simpler overlay
      const edgeCount = [hasTopSpace, hasBottomSpace, hasLeftSpace, hasRightSpace].filter(Boolean).length
      
      if (edgeCount < 2) {
        console.log(`⚠️ Element too close to edges (${edgeCount} safe sides), using simple overlay`)
        // Use a simple radial gradient overlay instead
        setOverlayParts([{
          top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle at ${rect.left + rect.width/2}px ${rect.top + rect.height/2}px, transparent ${Math.max(rect.width, rect.height)/2 + padding}px, rgba(0,0,0,0.6) ${Math.max(rect.width, rect.height)/2 + padding + 40}px)`,
          position: 'absolute'
        }])
        return
      }

      // Create 4 non-overlapping overlay parts
      const parts: React.CSSProperties[] = []

      // Top part - only if there's space above the element
      if (topBoundary > 0) {
        parts.push({
          top: 0,
          left: 0,
          right: 0,
          height: `${topBoundary}px`,
          background: 'rgba(0,0,0,0.6)',
          position: 'absolute'
        })
      }

      // Bottom part - only if there's space below the element
      if (bottomBoundary < window.innerHeight) {
        parts.push({
          top: `${bottomBoundary}px`,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          position: 'absolute'
        })
      }

      // Left part - only if there's space to the left, and only in the middle band
      if (leftBoundary > 0) {
        parts.push({
          top: `${topBoundary}px`,
          left: 0,
          width: `${leftBoundary}px`,
          height: `${bottomBoundary - topBoundary}px`,
          background: 'rgba(0,0,0,0.6)',
          position: 'absolute'
        })
      }

      // Right part - only if there's space to the right, and only in the middle band
      if (rightBoundary < window.innerWidth) {
        parts.push({
          top: `${topBoundary}px`,
          left: `${rightBoundary}px`,
          right: 0,
          height: `${bottomBoundary - topBoundary}px`,
          background: 'rgba(0,0,0,0.6)',
          position: 'absolute'
        })
      }

      setOverlayParts(parts)
    }

    updateOverlay()

    // Throttled scroll handler for better performance
    let scrollTimeout: NodeJS.Timeout | null = null
    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      scrollTimeout = setTimeout(updateOverlay, 16) // ~60fps
    }

    // Immediate resize handler
    const handleResize = () => updateOverlay()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [highlightedElement])

  // Don't render overlay when paused for popup
  if (isPaused) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[40] pointer-events-none">
      {overlayParts.map((style, index) => (
        <div
          key={index}
          style={style}
          className="pointer-events-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onMinimize()
            }
          }}
        />
      ))}
    </div>
  )
}

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
    content: "Create your perfect pixel art character and turn it into a real keychain! Design with hundreds of combinations for avatars, profiles, or bring your creation to life as a physical keychain you can hold and show off.",
    position: "center",
    icon: <Info className="h-5 w-5" />,
    category: "welcome"
  },

  // Basic Navigation
  {
    id: "preview",
    target: '[data-tour="character-preview"], [role="img"][aria-label*="character preview"]',
    title: "Live Character Preview",
    content: "This is your future keychain! Watch your pixel art come to life in real-time as you customize it. What you see here is exactly how your physical keychain will look.",
    action: "Try zooming in/out with the controls",
    position: "left", // Changed from "bottom" to "left" to avoid covering canvas
    highlight: true,
    icon: <Mouse className="h-5 w-5" />,
    category: "basics"
  },
  {
    id: "parts",
    target: '[data-tour="parts-selection"], [title*="CHARACTER PARTS"]',
    title: "Character Parts Selection",
    content: "Design every detail of your keychain character! Click on different body parts to customize them. Each part will be perfectly crafted in your physical keychain.",
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
    content: "Select from different styles for each part. Mix and match to create your unique look! Every detail matters for your custom keychain.",
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
    content: "Each style comes with multiple color options. Find the perfect shade for your character! These vibrant colors will look amazing on your physical keychain.",
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
    content: "Ready to save? Download your character as a high-quality PNG image. Use it as an avatar, profile pic, or keep the design for your future keychain order!",
    action: "Choose from 3 size options",
    position: "top",
    highlight: true,
    icon: <Download className="h-5 w-5" />,
    category: "export"
  },
  {
    id: "sizes",
    target: '[data-tour="export-options"], [title*="EXPORT OPTIONS"]',
    title: "Export Size Options",
    content: "Choose your preferred size: Small (320px) for social media, Medium (640px) for general use, or Large (1280px) for high-quality prints and keychain production!",
    position: "left",
    highlight: true,
    icon: <Settings className="h-5 w-5" />,
    category: "export"
  },
  {
    id: "gallery",
    target: '[data-tour="gallery"], button:has(svg[class*="Grid"])',
    title: "Character Gallery",
    content: "Save multiple characters to your gallery! Perfect for creating a whole cast, trying different styles, or collecting designs for multiple keychain orders.",
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
    title: "Turn It Into Reality! 🔑",
    content: "Love your character? Download it for free, or better yet - turn your digital creation into a real keychain! We'll craft your pixel art into a high-quality physical keychain you can carry everywhere.",
    action: "Start creating your keychain design!",
    position: "center",
    icon: <Sparkles className="h-5 w-5" />,
    category: "export"
  }
]

interface OnboardingTourProps {
  onComplete?: () => void
  autoStart?: boolean
  startDelayMs?: number
  isModalOpen?: boolean // Simple prop to indicate if any modal is open
}

export function OnboardingTour({ onComplete, autoStart = false, startDelayMs = 2000, isModalOpen = false }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isPausedForPopup, setIsPausedForPopup] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const tourRef = useRef<HTMLDivElement>(null)

  // Handle auto-start logic
  useEffect(() => {
    if (!autoStart) return

    const seen = localStorage.getItem("pixself-onboarding-tour-completed")
    
    // For immediate start (startDelayMs = 0), start right away regardless of seen status
    if (startDelayMs === 0) {
      setIsActive(true)
      return
    }
    
    // For delayed start, respect the seen flag
    if (seen) {
      setHasSeenTour(true)
      return
    }
    
    // Start after delay
    const timer = setTimeout(() => {
      setIsActive(true)
    }, startDelayMs)
    
    return () => clearTimeout(timer)
  }, [autoStart, startDelayMs])

  // Handle modal state changes - much simpler and more reliable
  useEffect(() => {
    const currentStepData = TOUR_STEPS[currentStep]
    const isPopupTriggerStep = ['download', 'gallery'].includes(currentStepData.id)
    
    if (!isActive || !isPopupTriggerStep) {
      setIsPausedForPopup(false)
      return
    }

    if (isModalOpen && !isPausedForPopup) {
      console.log(`🔔 Modal opened on step "${currentStepData.id}", pausing tour`)
      setIsPausedForPopup(true)
    } else if (!isModalOpen && isPausedForPopup) {
      console.log(`🔔 Modal closed on step "${currentStepData.id}", resuming tour`)
      setIsPausedForPopup(false)
    }
  }, [isActive, currentStep, isModalOpen, isPausedForPopup])

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
    console.log(`🎯 Tour Step ${currentStep + 1}: "${currentStepData.title}"`, {
      target: currentStepData.target,
      position: currentStepData.position
    })

    if (!currentStepData.target) {
      if (highlightedElement) {
        highlightedElement.classList.remove("tour-highlight")
        setHighlightedElement(null)
      }
      return
    }

    // Try multiple selectors with retry mechanism
    const selectors = currentStepData.target.split(", ")
    let element: HTMLElement | null = null

    const findElement = () => {
      for (const selector of selectors) {
        console.log(`🔍 Trying selector: "${selector}"`)
        try {
          element = document.querySelector(selector) as HTMLElement
          if (element) {
            console.log(`✅ Found element:`, {
              tagName: element.tagName,
              className: element.className,
              id: element.id,
              rect: element.getBoundingClientRect(),
              isVisible: element.offsetWidth > 0 && element.offsetHeight > 0
            })
            return element
          }
        } catch (selectorError) {
          console.error(`❌ Error with selector "${selector}":`, selectorError)
        }
      }
      console.warn(`❌ No element found with selectors:`, selectors)
      return null
    }

    element = findElement()

    // If element not found, try again after a short delay (DOM might still be rendering)
    if (!element) {
      console.log(`⏳ Element not found immediately, retrying in 100ms...`)
      setTimeout(() => {
        element = findElement()
        if (element) {
          console.log(`✅ Found element on retry:`, element)
          // Remove previous highlight
          if (highlightedElement && highlightedElement !== element) {
            highlightedElement.classList.remove("tour-highlight")
          }

          // Add highlight class
          element.classList.add("tour-highlight")
          setHighlightedElement(element)

          // Scroll into view
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        } else {
          console.warn(`❌ Still could not find target element after retry for step ${currentStep + 1}:`, {
            selectors,
            stepData: currentStepData
          })
          setHighlightedElement(null)
        }
      }, 100)
    } else {
      // Element found immediately
      // Remove previous highlight
      if (highlightedElement && highlightedElement !== element) {
        highlightedElement.classList.remove("tour-highlight")
      }

      // Add highlight class
      element.classList.add("tour-highlight")
      setHighlightedElement(element)

      // Check if element is already visible in viewport
      const elementRect = element.getBoundingClientRect()
      const isElementVisible = (
        elementRect.top >= 0 &&
        elementRect.left >= 0 &&
        elementRect.bottom <= window.innerHeight &&
        elementRect.right <= window.innerWidth
      )
      
      if (!isElementVisible) {
        console.log(`📜 Element not visible, scrolling into view...`)
        setIsScrolling(true)
        
        // Use a promise-based approach to wait for scroll completion
        const scrollPromise = new Promise<void>((resolve) => {
          let scrollTimeout: NodeJS.Timeout
          
          const handleScroll = () => {
            clearTimeout(scrollTimeout)
            scrollTimeout = setTimeout(() => {
              window.removeEventListener('scroll', handleScroll)
              console.log(`📜 Scroll completed`)
              setIsScrolling(false)
              resolve()
            }, 100) // Wait 100ms after last scroll event
          }
          
          window.addEventListener('scroll', handleScroll)
          
          // Use different scroll behavior based on device
          const isMobile = window.innerWidth <= 768
          const scrollOptions = {
            behavior: isMobile ? "auto" as ScrollBehavior : "smooth" as ScrollBehavior,
            block: "center" as ScrollLogicalPosition
          }
          
          console.log(`📜 Scrolling with options:`, scrollOptions)
          element.scrollIntoView(scrollOptions)
          
          // Fallback timeout in case scroll doesn't fire events
          // Use shorter timeout for instant scroll on mobile
          const fallbackTimeout = isMobile ? 200 : 1000
          setTimeout(() => {
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(scrollTimeout)
            console.log(`📜 Scroll completed (timeout fallback after ${fallbackTimeout}ms)`)
            setIsScrolling(false)
            resolve()
          }, fallbackTimeout)
        })
        
        // Wait for scroll to complete before continuing
        scrollPromise.then(() => {
          console.log(`📜 Scroll animation finished, positioning should now be accurate`)
        })
      } else {
        console.log(`📜 Element already visible, no scroll needed`)
      }
    }
  }, [isActive, currentStep, isMinimized, highlightedElement])

  // Calculate tooltip position
  const getTooltipPosition = useCallback(() => {
    if (!highlightedElement || isMinimized) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    }

    // If we're currently scrolling, delay positioning calculation
    if (isScrolling) {
      console.log(`📜 Waiting for scroll to complete before positioning...`)
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    }

    try {
      const currentStepData = TOUR_STEPS[currentStep]
      const rect = highlightedElement.getBoundingClientRect()
      const position = currentStepData.position || "bottom"

      // Validate rect dimensions
      if (!rect || rect.width === 0 || rect.height === 0) {
        console.warn(`⚠️ Invalid element rect for step ${currentStep + 1}:`, rect)
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
      }

    const offset = 20
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Use responsive dimensions for mobile compatibility
    const isMobile = viewportWidth < 640
    const tooltipWidth = isMobile ? Math.min(viewportWidth - 40, 350) : 400
    const tooltipHeight = isMobile ? 280 : 250

    console.log(`📐 Positioning tooltip for step ${currentStep + 1}:`, {
      position,
      elementRect: rect,
      viewport: { width: viewportWidth, height: viewportHeight },
      tooltip: { width: tooltipWidth, height: tooltipHeight }
    })

    let top = 0
    let left = 0
    let transform = ""

    // Special positioning logic for different steps and screen sizes
    let effectivePosition = position
    
    if (currentStepData.id === "preview") {
      // For canvas preview, use smart positioning based on screen size and layout
      if (isMobile) {
        // Mobile: canvas is at top, use bottom positioning
        effectivePosition = "bottom"
      } else {
        // Desktop: canvas is in center column, use left sidebar positioning  
        effectivePosition = "left"
      }
      console.log(`🎨 Canvas preview positioning: ${position} → ${effectivePosition} (mobile: ${isMobile})`)
    } else if (currentStepData.id === "parts") {
      // For parts selection, use smart positioning to avoid covering the parts
      if (isMobile) {
        // Mobile: parts are horizontal scroll at top, use bottom positioning
        effectivePosition = "bottom"
      } else {
        // Desktop: parts are in left sidebar, use right positioning (toward center)
        effectivePosition = "right"
      }
      console.log(`🧩 Parts selection positioning: ${position} → ${effectivePosition} (mobile: ${isMobile})`)
    } else if (isMobile && (position === "left" || position === "right")) {
      // For other steps on mobile, prefer center positioning
      effectivePosition = "center"
      console.log(`📱 Mobile adjustment: ${position} → ${effectivePosition}`)
    }

    // Calculate initial position based on preferred placement
    switch (effectivePosition) {
      case "top":
        top = rect.top - tooltipHeight - offset
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        transform = ""
        break
      case "bottom":
        top = rect.bottom + offset
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        transform = ""
        break
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - offset
        transform = ""
        break
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + offset
        transform = ""
        break
      case "center":
      default:
        top = (viewportHeight - tooltipHeight) / 2
        left = (viewportWidth - tooltipWidth) / 2
        transform = ""
        break
    }

    // Smart repositioning if tooltip would go off-screen
    if (position === "bottom" && top + tooltipHeight > viewportHeight - offset) {
      // Try above instead
      top = rect.top - tooltipHeight - offset
      console.log(`📐 Repositioned from bottom to top due to viewport constraint`)
    }

    if (position === "top" && top < offset) {
      // Try below instead
      top = rect.bottom + offset
      console.log(`📐 Repositioned from top to bottom due to viewport constraint`)
    }

    if (position === "right" && left + tooltipWidth > viewportWidth - offset) {
      // Try left instead
      left = rect.left - tooltipWidth - offset
      console.log(`📐 Repositioned from right to left due to viewport constraint`)
    }

    if (position === "left" && left < offset) {
      // Try right instead
      left = rect.right + offset
      console.log(`📐 Repositioned from left to right due to viewport constraint`)
    }

    // Check for collision with highlighted element BEFORE final clamping
    const tooltipRect = { 
      left, 
      top, 
      right: left + tooltipWidth, 
      bottom: top + tooltipHeight 
    }
    
    const elementRect = {
      left: rect.left,
      top: rect.top, 
      right: rect.right,
      bottom: rect.bottom
    }
    
    // Check if tooltip overlaps with highlighted element or is too close
    const minDistance = (currentStepData.id === "preview" || currentStepData.id === "parts") ? 30 : 10 // Extra space for canvas and parts
    const expandedElementRect = {
      left: elementRect.left - minDistance,
      top: elementRect.top - minDistance,
      right: elementRect.right + minDistance,
      bottom: elementRect.bottom + minDistance
    }
    
    const hasCollision = !(tooltipRect.right < expandedElementRect.left || 
                          tooltipRect.left > expandedElementRect.right || 
                          tooltipRect.bottom < expandedElementRect.top || 
                          tooltipRect.top > expandedElementRect.bottom)
    
    if (hasCollision) {
      console.log(`⚠️ Tooltip collision detected, finding alternative position`)
      
      // Try alternative positions in order of preference
      const alternatives = [
        // Try opposite side first
        ...(effectivePosition === "top" ? ["bottom"] : []),
        ...(effectivePosition === "bottom" ? ["top"] : []),
        ...(effectivePosition === "left" ? ["right"] : []),
        ...(effectivePosition === "right" ? ["left"] : []),
        // Then try other sides
        "top", "bottom", "left", "right", "center"
      ].filter(pos => pos !== effectivePosition)
      
      for (const altPos of alternatives) {
        let altTop = top
        let altLeft = left
        
        switch (altPos) {
          case "top":
            altTop = rect.top - tooltipHeight - offset
            altLeft = rect.left + rect.width / 2 - tooltipWidth / 2
            break
          case "bottom":
            altTop = rect.bottom + offset
            altLeft = rect.left + rect.width / 2 - tooltipWidth / 2
            break
          case "left":
            altTop = rect.top + rect.height / 2 - tooltipHeight / 2
            altLeft = rect.left - tooltipWidth - offset
            break
          case "right":
            altTop = rect.top + rect.height / 2 - tooltipHeight / 2
            altLeft = rect.right + offset
            break
          case "center":
            altTop = (viewportHeight - tooltipHeight) / 2
            altLeft = (viewportWidth - tooltipWidth) / 2
            break
        }
        
        // Check if alternative position fits in viewport
        if (altTop >= offset && 
            altTop + tooltipHeight <= viewportHeight - offset &&
            altLeft >= offset && 
            altLeft + tooltipWidth <= viewportWidth - offset) {
          
          // Check if alternative position avoids collision
          const altTooltipRect = {
            left: altLeft,
            top: altTop,
            right: altLeft + tooltipWidth,
            bottom: altTop + tooltipHeight
          }
          
          const altHasCollision = !(altTooltipRect.right < expandedElementRect.left || 
                                   altTooltipRect.left > expandedElementRect.right || 
                                   altTooltipRect.bottom < expandedElementRect.top || 
                                   altTooltipRect.top > expandedElementRect.bottom)
          
          if (!altHasCollision) {
            console.log(`✅ Found collision-free position: ${altPos}`)
            top = altTop
            left = altLeft
            break
          }
        }
      }
      
      // If still colliding after trying all alternatives, push tooltip away from element
      const finalTooltipRect = { left, top, right: left + tooltipWidth, bottom: top + tooltipHeight }
      const finalHasCollision = !(finalTooltipRect.right < expandedElementRect.left || 
                                  finalTooltipRect.left > expandedElementRect.right || 
                                  finalTooltipRect.bottom < expandedElementRect.top || 
                                  finalTooltipRect.top > expandedElementRect.bottom)
      
      if (finalHasCollision) {
        console.log(`🚨 No collision-free position found, using emergency positioning`)
        // Emergency positioning: place tooltip in corner away from element
        const elementCenterX = rect.left + rect.width / 2
        const elementCenterY = rect.top + rect.height / 2
        const viewportCenterX = viewportWidth / 2
        const viewportCenterY = viewportHeight / 2
        
        // Place tooltip in opposite corner from element
        if (elementCenterX < viewportCenterX && elementCenterY < viewportCenterY) {
          // Element in top-left, place tooltip in bottom-right
          top = viewportHeight - tooltipHeight - offset
          left = viewportWidth - tooltipWidth - offset
        } else if (elementCenterX > viewportCenterX && elementCenterY < viewportCenterY) {
          // Element in top-right, place tooltip in bottom-left
          top = viewportHeight - tooltipHeight - offset
          left = offset
        } else if (elementCenterX < viewportCenterX && elementCenterY > viewportCenterY) {
          // Element in bottom-left, place tooltip in top-right
          top = offset
          left = viewportWidth - tooltipWidth - offset
        } else {
          // Element in bottom-right, place tooltip in top-left
          top = offset
          left = offset
        }
      }
    }

    // Final viewport clamping (after collision avoidance)
    left = Math.max(offset, Math.min(left, viewportWidth - tooltipWidth - offset))
    top = Math.max(offset, Math.min(top, viewportHeight - tooltipHeight - offset))

    const finalStyles = {
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      transform
    }

    console.log(`📐 Final tooltip position:`, finalStyles)
    return finalStyles
    
    } catch (positioningError) {
      console.error(`❌ Error calculating tooltip position for step ${currentStep + 1}:`, positioningError)
      console.error(`❌ Positioning error details:`, {
        highlightedElement: highlightedElement?.tagName,
        currentStep,
        stepData: TOUR_STEPS[currentStep],
        error: positioningError.message,
        stack: positioningError.stack
      })
      // Fallback to center positioning
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    }
  }, [highlightedElement, currentStep, isMinimized, isScrolling])

  const completeTour = () => {
    console.log(`🎯 completeTour called`)
    try {
      setIsActive(false)
      setHasSeenTour(true)
      localStorage.setItem("pixself-onboarding-tour-completed", "true")
      if (highlightedElement) {
        highlightedElement.classList.remove("tour-highlight")
      }
      console.log(`✅ Tour completed, calling onComplete callback`)
      onComplete?.()
    } catch (error) {
      console.error(`❌ Error in completeTour:`, error)
    }
  }

  const skipTour = () => {
    completeTour()
  }

  const nextStep = () => {
    console.log(`⏭️ Next step called. Current: ${currentStep}, Total: ${TOUR_STEPS.length}`)
    try {
      if (currentStep < TOUR_STEPS.length - 1) {
        const newStep = currentStep + 1
        const currentStepData = TOUR_STEPS[currentStep]
        const nextStepData = TOUR_STEPS[newStep]
        
        console.log(`📈 Moving from step ${currentStep + 1} ("${currentStepData.id}": "${currentStepData.title}") to step ${newStep + 1} ("${nextStepData.id}": "${nextStepData.title}")`)
        
        // Clear any existing highlighting before moving to next step
        if (highlightedElement) {
          highlightedElement.classList.remove("tour-highlight")
          setHighlightedElement(null)
          console.log(`🧹 Cleared highlighting from previous element`)
        }
        
        // Small delay to ensure DOM has updated before moving to next step
        // This helps with transitions between different layout areas
        setTimeout(() => {
          setCurrentStep(newStep)
        }, 50)
      } else {
        console.log(`🏁 Tour complete, calling completeTour()`)
        completeTour()
      }
    } catch (error) {
      console.error(`❌ Error in nextStep:`, error)
      console.error(`❌ Error details:`, {
        currentStep,
        totalSteps: TOUR_STEPS.length,
        currentStepData: TOUR_STEPS[currentStep],
        highlightedElement: highlightedElement?.tagName,
        stack: error.stack
      })
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
    setHasSeenTour(false) // Allow tour to start even if previously seen
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

  console.log(`🎭 Tour render state:`, {
    isActive,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    isMinimized,
    isPausedForPopup,
    hasSeenTour,
    autoStart,
    startDelayMs
  })

  if (!isActive) {
    console.log(`🚫 Tour not active, showing TourButton`)
    return <TourButton />
  }

  if (isPausedForPopup) {
    console.log(`⏸️ Tour paused for popup, hiding tour UI`)
    return null // Hide tour completely when popup is open
  }

  const currentStepData = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100
  const isMobile = window.innerWidth < 640

  console.log(`🎬 Rendering tour step ${currentStep + 1}:`, currentStepData.title)

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
      `}</style>

      {/* Smart overlay with spotlight cutout */}
      <SpotlightOverlay 
        highlightedElement={highlightedElement}
        onMinimize={() => setIsMinimized(true)}
        isPaused={isPausedForPopup}
      />

      {/* Tour Tooltip */}
      <div
        ref={tourRef}
        className={`${press2p.className} fixed z-[45] transition-all duration-300 ${
          isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{
          ...getTooltipPosition(),
          maxWidth: window.innerWidth < 640 ? "calc(100vw - 20px)" : "400px",
          minWidth: window.innerWidth < 640 ? "280px" : "320px",
          margin: window.innerWidth < 640 ? "10px" : "0",
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
              className={`${isMobile ? 'text-[9px] py-2 px-2' : 'text-[8px]'} underline hover:no-underline touch-manipulation`}
              style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 ${isMobile ? 'px-4 py-2.5 text-[9px]' : 'px-3 py-1.5 text-[8px]'} font-bold border-2 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-0.5 hover:translate-y-0.5 touch-manipulation`}
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                  color: PIXSELF_BRAND.colors.primary.navy,
                  minHeight: isMobile ? '44px' : 'auto', // iOS touch target size
                }}
              >
                <ChevronLeft className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
                Back
              </button>

              <button
                onClick={nextStep}
                className={`flex items-center gap-1 ${isMobile ? 'px-4 py-2.5 text-[9px]' : 'px-3 py-1.5 text-[8px]'} font-bold border-2 rounded transition-all duration-200 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 touch-manipulation`}
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                  color: PIXSELF_BRAND.colors.primary.navy,
                  boxShadow: PIXSELF_BRAND.shadows.pixel,
                  minHeight: isMobile ? '44px' : 'auto', // iOS touch target size
                }}
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />}
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
export function OnboardingTourButton({ onStartTour }: { onStartTour?: () => void }) {
  return (
    <button
      onClick={onStartTour}
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