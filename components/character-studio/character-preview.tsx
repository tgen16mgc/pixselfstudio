import type { Selections } from "@/types/character"

interface CharacterPreviewProps {
  selections: Selections
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function CharacterPreview({ zoom }: CharacterPreviewProps) {
  return (
    <div className="space-y-6" data-tour="character-preview">
      {/* Placeholder for character preview */}
      <div className="relative mx-auto aspect-[64/80] w-full max-w-[500px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-4 border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.5)] overflow-hidden rounded-lg">
        <div className="absolute inset-4 flex items-center justify-center text-white text-sm">
          Character Preview (Zoom: {Math.round(zoom * 100)}%)
        </div>
      </div>
    </div>
  )
}
