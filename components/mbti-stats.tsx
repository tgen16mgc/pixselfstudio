"use client"

import type React from "react"

import { useCallback, useMemo, useRef, useState, useEffect } from "react"
import { Brain, SlidersHorizontal, RefreshCcw } from "lucide-react"
import { RETRO_UI_THEME } from "@/config/8bit-theme"
import { EnhancedRetroPixelPanel, EnhancedRetroPixelButton } from "@/components/enhanced-8bit-ui"

type DimensionKey = "IE" | "SN" | "TF" | "JP"

interface SwipeBarProps {
  label: string
  left: string
  right: string
  value: number // 0..100
  onChange: (v: number) => void
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v))
}

function MBTISwipeBar({ label, left, right, value, onChange }: SwipeBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const pos = clamp(((clientX - rect.left) / rect.width) * 100)
      onChange(Math.round(pos))
    },
    [onChange],
  )

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setFromClientX(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    setFromClientX(e.clientX)
  }

  const onPointerUp = () => {
    dragging.current = false
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = value
    const step = e.shiftKey ? 10 : 5
    switch (e.key) {
      case "ArrowLeft":
        next = clamp(value - step)
        break
      case "ArrowRight":
        next = clamp(value + step)
        break
      case "Home":
        next = 0
        break
      case "End":
        next = 100
        break
      default:
        return
    }
    e.preventDefault()
    onChange(next)
  }

  const blocks = 20 // show 20 blocks (5% per block)
  const filledBlocks = Math.round((value / 100) * blocks)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: RETRO_UI_THEME.accent.primary }} />
          <div className="text-[10px] font-bold tracking-wider" style={{ color: RETRO_UI_THEME.text.secondary }}>
            {label}
          </div>
        </div>
        <div className="text-[9px] font-bold" style={{ color: RETRO_UI_THEME.text.muted }}>
          {left} {value}% {right}
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        role="slider"
        aria-label={`${label} preference`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative h-8 border-4 grid grid-cols-20 overflow-hidden select-none focus:outline-none"
        style={{
          borderColor: RETRO_UI_THEME.border.secondary,
          backgroundColor: RETRO_UI_THEME.background.secondary,
        }}
      >
        {/* Segments */}
        {Array.from({ length: blocks }).map((_, i) => (
          <div
            key={i}
            className="border-r-2 last:border-r-0"
            style={{
              backgroundColor: i < filledBlocks ? RETRO_UI_THEME.accent.primary : "transparent",
              borderRightColor: RETRO_UI_THEME.border.muted,
            }}
          />
        ))}

        {/* Center divider */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0"
          style={{
            left: "50%",
            width: 2,
            backgroundColor: RETRO_UI_THEME.border.muted,
          }}
        />

        {/* Labels at ends */}
        <div
          className="absolute left-1 top-1/2 -translate-y-1/2 px-1 py-0.5 text-[9px] font-bold border-2"
          style={{
            backgroundColor: RETRO_UI_THEME.background.primary,
            color: RETRO_UI_THEME.text.primary,
            borderColor: RETRO_UI_THEME.border.muted,
          }}
        >
          {left}
        </div>
        <div
          className="absolute right-1 top-1/2 -translate-y-1/2 px-1 py-0.5 text-[9px] font-bold border-2"
          style={{
            backgroundColor: RETRO_UI_THEME.background.primary,
            color: RETRO_UI_THEME.text.primary,
            borderColor: RETRO_UI_THEME.border.muted,
          }}
        >
          {right}
        </div>

        {/* Knob */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 -translate-y-1/2 border-4"
          style={{
            left: `calc(${value}% - 10px)`,
            width: 20,
            height: 20,
            backgroundColor: RETRO_UI_THEME.background.primary,
            borderColor: RETRO_UI_THEME.accent.secondary,
            boxShadow: `2px 2px 0 ${RETRO_UI_THEME.border.muted}`,
          }}
        />
      </div>
    </div>
  )
}

export function MBTIStatsPanel() {
  // Initialize mid-point values
  const [ie, setIE] = useState(50)
  const [sn, setSN] = useState(50)
  const [tf, setTF] = useState(50)
  const [jp, setJP] = useState(50)

  // Support swipe bars on touch devices: ensure pointer events enabled
  useEffect(() => {
    // no-op, placeholder for potential environment adjustments
  }, [])

  const code = useMemo(() => {
    const a = ie >= 50 ? "E" : "I"
    const b = sn >= 50 ? "N" : "S"
    const c = tf >= 50 ? "F" : "T"
    const d = jp >= 50 ? "P" : "J"
    return `${a}${b}${c}${d}`
  }, [ie, sn, tf, jp])

  const description = useMemo(() => {
    const map: Record<string, string> = {
      INTJ: "Arcane Tactician",
      INTP: "Puzzle Architect",
      ENTJ: "Raid Commander",
      ENTP: "Combo Alchemist",
      INFJ: "Mystic Guide",
      INFP: "Storyweaver",
      ENFJ: "Guild Captain",
      ENFP: "Spark Adventurer",
      ISTJ: "Iron Sentinel",
      ISFJ: "Sanctuary Healer",
      ESTJ: "Battle Marshal",
      ESFJ: "Party Buffer",
      ISTP: "Techblade Rogue",
      ISFP: "Wandering Bard",
      ESTP: "Arcade Brawler",
      ESFP: "Showtime Star",
    }
    return map[code] || "Your Unique Persona"
  }, [code])

  const reset = () => {
    setIE(50)
    setSN(50)
    setTF(50)
    setJP(50)
  }

  return (
    <EnhancedRetroPixelPanel title="PERSONALITY (MBTI)" variant="accent" icon={<Brain className="h-4 w-4" />}>
      <div className="space-y-5">
        <div className="text-[9px] -mt-1" style={{ color: RETRO_UI_THEME.text.muted }}>
          Swipe or drag the bars to shape your character&apos;s personality.
        </div>

        <MBTISwipeBar label="Introversion ↔ Extraversion" left="I" right="E" value={ie} onChange={setIE} />
        <MBTISwipeBar label="Sensing ↔ Intuition" left="S" right="N" value={sn} onChange={setSN} />
        <MBTISwipeBar label="Thinking ↔ Feeling" left="T" right="F" value={tf} onChange={setTF} />
        <MBTISwipeBar label="Judging ↔ Perceiving" left="J" right="P" value={jp} onChange={setJP} />

        {/* Result */}
        <div className="pt-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-bold tracking-wider" style={{ color: RETRO_UI_THEME.text.secondary }}>
                YOUR TYPE:
              </div>
              <div
                className="px-3 py-2 text-[14px] font-black border-4"
                style={{
                  backgroundColor: RETRO_UI_THEME.background.primary,
                  color: RETRO_UI_THEME.accent.primary,
                  borderColor: RETRO_UI_THEME.accent.secondary,
                  boxShadow: `4px 4px 0 ${RETRO_UI_THEME.border.muted}`,
                  letterSpacing: 2,
                }}
              >
                {code}
              </div>
            </div>

            <EnhancedRetroPixelButton onClick={reset} size="sm" icon={<RefreshCcw className="h-3.5 w-3.5" />}>
              RESET
            </EnhancedRetroPixelButton>
          </div>

          <div className="mt-3 text-[10px] font-bold" style={{ color: RETRO_UI_THEME.text.primary }}>
            {description}
          </div>
          <div className="text-[8px]" style={{ color: RETRO_UI_THEME.text.muted }}>
            This type updates live as you adjust the sliders.
          </div>
        </div>
      </div>
    </EnhancedRetroPixelPanel>
  )
}
