"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface TourStep {
  target: string
  title: string
  content: string
  position: "top" | "bottom" | "left" | "right"
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="character-preview"]',
    title: "Character Preview",
    content: "This is your pixel character! Watch it come to life as you customize it.",
    position: "bottom",
  },
  {
    target: '[data-tour="parts-selection"]',
    title: "Character Parts",
    content: "Select different parts of your character to customize. Try clicking on Hair!",
    position: "right",
  },
  {
    target: '[data-tour="color-palette"]',
    title: "Color Palette",
    content: "Choose from different colors for the selected part.",
    position: "left",
  },
  {
    target: '[data-tour="variants"]',
    title: "Style Variants",
    content: "Pick from different styles and shapes for each part.",
    position: "left",
  },
]

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem("pixel-character-tour-seen")
    if (!seen) {
      setIsActive(true)
    } else {
      setHasSeenTour(true)
    }
  }, [])

  const completeTour = () => {
    setIsActive(false)
    setHasSeenTour(true)
    localStorage.setItem("pixel-character-tour-seen", "true")
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

  if (!isActive) {
    return hasSeenTour ? (
      <button
        onClick={() => setIsActive(true)}
        className="fixed bottom-4 right-4 z-50 bg-[#00d4ff] text-[#1a1a1a] px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-[#20B2AA] transition-colors"
      >
        Show Tutorial
      </button>
    ) : null
  }

  const currentStepData = TOUR_STEPS[currentStep]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" />

      {/* Tour Tooltip */}
      <div className="fixed z-50 bg-[#1a1a1a] border-2 border-[#00d4ff] rounded-lg p-4 max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold text-[#00d4ff]">{currentStepData.title}</h3>
          <button onClick={completeTour} className="text-[#F5DEB3] hover:text-[#00d4ff] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[9px] text-[#F5DEB3] mb-4 leading-relaxed">{currentStepData.content}</p>

        <div className="flex items-center justify-between">
          <div className="text-[8px] text-[#87CEEB]">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-3 py-1 text-[8px] font-bold border border-[#555] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#00d4ff] transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
              Back
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-1 px-3 py-1 text-[8px] font-bold bg-[#00d4ff] text-[#1a1a1a] rounded hover:bg-[#20B2AA] transition-colors"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
              {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
