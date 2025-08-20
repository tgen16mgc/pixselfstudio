import { useOptimizedCanvas } from "@/hooks/use-optimized-canvas"
import { drawCharacterToCanvas } from "@/utils/character-drawing"
import type { Selections } from "@/types/character"

interface CharacterPreviewProps {
  selections: Selections
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function CharacterPreview({ selections, zoom, onZoomChange }: CharacterPreviewProps) {
  // Unused parameters for now
  void onZoomChange
  
  const canvasRef = useOptimizedCanvas({
    selections,
    scale: 6,
    zoom,
    drawFunction: drawCharacterToCanvas,
  })

  return (
    <div className="space-y-6" data-tour="character-preview">
      {/* Zoom controls */}
      <div className="flex items-center justify-between">{/* ... zoom controls implementation */}</div>

      {/* Canvas container */}
      <div className="relative mx-auto aspect-[64/80] w-full max-w-[500px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-4 border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.5)] overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          className="absolute inset-4 w-auto h-auto max-w-full max-h-full"
          style={{ imageRendering: "pixelated" }}
          aria-label="Pixel character preview"
        />
      </div>
    </div>
  )
}
