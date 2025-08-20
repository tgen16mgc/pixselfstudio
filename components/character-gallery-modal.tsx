"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, Save, Trash2, Download, Upload, Search, Grid, List, Star } from "lucide-react"
import { PIXSELF_BRAND } from "@/config/pixself-brand"
import { PixselfButton } from "@/components/pixself-ui-components"
import type { Selections } from "@/types/character"
import {
  getSavedCharacters,
  saveCharacter,
  deleteCharacter,
  getStorageInfo,
  exportCharacters,
  importCharacters,
  type SavedCharacter,
} from "@/utils/character-storage"
import { generateCharacterThumbnail } from "@/utils/character-drawing"

interface CharacterGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  currentSelections: Selections
  onLoadCharacter: (selections: Selections) => void
  onSaveCharacter: (name: string) => void
  soundEnabled: boolean
  onPlaySound: (type: "click" | "select" | "success" | "error") => void
}

export function CharacterGalleryModal({
  isOpen,
  onClose,
  currentSelections,
  onLoadCharacter,
  onSaveCharacter,
  // soundEnabled: _soundEnabled,
  onPlaySound,
}: CharacterGalleryModalProps) {
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"updated" | "created" | "name">("updated")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState("")
  const [selectedCharacter, setSelectedCharacter] = useState<SavedCharacter | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadCharacters = () => {
    try {
      const characters = getSavedCharacters()
      setSavedCharacters(characters)
    } catch (error) {
      console.error("Error loading characters:", error)
      onPlaySound("error")
    }
  }

  // Load saved characters when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCharacters()
    }
  }, [isOpen, loadCharacters])

  // Filter and sort characters
  const filteredAndSortedCharacters = React.useMemo(() => {
    const filtered = savedCharacters.filter((char) => char.name.toLowerCase().includes(searchQuery.toLowerCase()))

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "created":
        filtered.sort((a, b) => b.createdAt - a.createdAt)
        break
      case "updated":
      default:
        filtered.sort((a, b) => b.updatedAt - a.updatedAt)
        break
    }

    return filtered
  }, [savedCharacters, searchQuery, sortBy])

  const handleSaveCharacter = async () => {
    if (!saveDialogName.trim()) {
      onPlaySound("error")
      return
    }

    try {
      setIsLoading(true)
      const thumbnail = await generateCharacterThumbnail(currentSelections)
      const savedChar = saveCharacter(saveDialogName.trim(), currentSelections, thumbnail)

      setSavedCharacters((prev) => {
        const filtered = prev.filter((c) => c.id !== savedChar.id)
        return [savedChar, ...filtered]
      })

      setShowSaveDialog(false)
      setSaveDialogName("")
      onPlaySound("success")
      onSaveCharacter(saveDialogName.trim())
    } catch (error) {
      console.error("Error saving character:", error)
      onPlaySound("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadCharacter = (character: SavedCharacter) => {
    onLoadCharacter(character.selections)
    onPlaySound("select")
    onClose()
  }

  const handleDeleteCharacter = (id: string) => {
    try {
      deleteCharacter(id)
      setSavedCharacters((prev) => prev.filter((c) => c.id !== id))
      setShowDeleteConfirm(null)
      onPlaySound("success")
    } catch (error) {
      console.error("Error deleting character:", error)
      onPlaySound("error")
    }
  }

  const handleExportCharacters = () => {
    try {
      const data = exportCharacters()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `pixself-characters-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      onPlaySound("success")
    } catch (error) {
      console.error("Error exporting characters:", error)
      onPlaySound("error")
    }
  }

  const handleImportCharacters = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const importedCount = importCharacters(jsonData)
        loadCharacters()
        onPlaySound("success")
        alert(`Successfully imported ${importedCount} characters!`)
      } catch (error) {
        console.error("Error importing characters:", error)
        onPlaySound("error")
        alert("Failed to import characters. Please check the file format.")
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const storageInfo = getStorageInfo()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] border-2 sm:border-4 backdrop-blur-sm overflow-hidden flex flex-col"
        style={{
          backgroundColor: PIXSELF_BRAND.colors.cloud.white,
          borderColor: PIXSELF_BRAND.colors.primary.navy,
          boxShadow: PIXSELF_BRAND.shadows.glowStrong,
        }}
      >
        {/* Header */}
        <div
          className="px-3 sm:px-6 py-3 sm:py-4 border-b-2 sm:border-b-4 flex items-center justify-between flex-shrink-0"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
            borderBottomColor: PIXSELF_BRAND.colors.primary.navy,
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Grid className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
            <h2 className="text-[12px] sm:text-[14px] font-bold tracking-wider truncate" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              CHARACTER GALLERY
            </h2>
            <div
              className="px-2 py-1 text-[8px] font-bold border-2 flex-shrink-0"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                borderColor: PIXSELF_BRAND.colors.primary.navy,
                color: PIXSELF_BRAND.colors.primary.navy,
              }}
            >
              {storageInfo.used}/{storageInfo.total}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-8 sm:h-8 border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0 ml-2"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.cloud.white,
              borderColor: PIXSELF_BRAND.colors.primary.navy,
              color: PIXSELF_BRAND.colors.primary.navy,
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Controls */}
        <div
          className="px-3 sm:px-6 py-3 sm:py-4 border-b-2 sm:border-b-4 space-y-3 sm:space-y-4 flex-shrink-0"
          style={{
            backgroundColor: PIXSELF_BRAND.colors.cloud.light,
            borderBottomColor: PIXSELF_BRAND.colors.primary.navyLight,
          }}
        >
          {/* Top Row - Save and Import/Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <PixselfButton
              onClick={() => setShowSaveDialog(true)}
              variant="accent"
              size="sm"
              icon={<Save className="h-4 w-4" />}
              fullWidth
              className="sm:w-auto"
            >
              SAVE CURRENT
            </PixselfButton>

            <div className="flex items-center gap-2 justify-center sm:justify-end">
              <PixselfButton
                onClick={handleExportCharacters}
                variant="secondary"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                disabled={savedCharacters.length === 0}
                className="flex-1 sm:flex-none"
              >
                EXPORT
              </PixselfButton>
              <PixselfButton
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="sm"
                icon={<Upload className="h-4 w-4" />}
                className="flex-1 sm:flex-none"
              >
                IMPORT
              </PixselfButton>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportCharacters}
                className="hidden"
              />
            </div>
          </div>

          {/* Bottom Row - Search and View Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }} />
              </div>
              <input
                type="text"
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-[12px] border-2 sm:border-4 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                  borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                  color: PIXSELF_BRAND.colors.primary.navy,
                  outline: `2px solid ${PIXSELF_BRAND.colors.accent.sparkle}`,
                }}
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "updated" | "created" | "name")}
                className="flex-1 sm:flex-none px-3 py-2 text-[12px] border-2 sm:border-4 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                  borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                  color: PIXSELF_BRAND.colors.primary.navy,
                  outline: `2px solid ${PIXSELF_BRAND.colors.accent.sparkle}`,
                }}
              >
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="name">Name A-Z</option>
              </select>

              {/* View Mode */}
              <div className="flex border-2 sm:border-4" style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight }}>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 border-r-2 transition-all duration-200 ${
                    viewMode === "grid" ? "active:scale-95" : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === "grid" ? PIXSELF_BRAND.colors.primary.gold : PIXSELF_BRAND.colors.cloud.white,
                    borderRightColor: PIXSELF_BRAND.colors.primary.navyLight,
                    color: PIXSELF_BRAND.colors.primary.navy,
                  }}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 transition-all duration-200 ${
                    viewMode === "list" ? "active:scale-95" : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor:
                      viewMode === "list" ? PIXSELF_BRAND.colors.primary.gold : PIXSELF_BRAND.colors.cloud.white,
                    color: PIXSELF_BRAND.colors.primary.navy,
                  }}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Character List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 min-h-0">
          {filteredAndSortedCharacters.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="mb-4">
                <Star className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }} />
              </div>
              <div className="text-[12px] sm:text-[14px] font-bold mb-2" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                {searchQuery ? "No characters found" : "No saved characters"}
              </div>
              <div className="text-[10px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                {searchQuery ? "Try a different search term" : "Save your first character to get started!"}
              </div>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4" : "space-y-2 sm:space-y-3"}>
              {filteredAndSortedCharacters.map((character) => (
                <div
                  key={character.id}
                  className={`border-2 sm:border-4 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    viewMode === "grid" ? "aspect-square" : "flex items-center gap-3 sm:gap-4 p-2 sm:p-4"
                  }`}
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                    borderColor:
                      selectedCharacter?.id === character.id
                        ? PIXSELF_BRAND.colors.primary.gold
                        : PIXSELF_BRAND.colors.primary.navyLight,
                    boxShadow:
                      selectedCharacter?.id === character.id ? PIXSELF_BRAND.shadows.glow : PIXSELF_BRAND.shadows.pixel,
                  }}
                  onClick={() => setSelectedCharacter(character)}
                >
                  {viewMode === "grid" ? (
                    <div className="p-2 sm:p-3 h-full flex flex-col">
                      {/* Thumbnail */}
                      <div className="flex-1 flex items-center justify-center mb-2 sm:mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={character.thumbnail || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                          alt={character.name}
                          className="max-w-full max-h-full object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>

                      {/* Info */}
                      <div className="text-center">
                        <div
                          className="text-[9px] sm:text-[10px] font-bold mb-1 truncate"
                          style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                        >
                          {character.name}
                        </div>
                        <div className="text-[7px] sm:text-[8px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                          {new Date(character.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={character.thumbnail || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                          alt={character.name}
                          className="w-full h-full object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[11px] sm:text-[12px] font-bold mb-1 truncate"
                          style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                        >
                          {character.name}
                        </div>
                        <div className="text-[8px] sm:text-[9px] mb-1" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                          Created: {new Date(character.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[8px] sm:text-[9px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                          Updated: {new Date(character.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Character Actions */}
        {selectedCharacter && (
          <div
            className="px-3 sm:px-6 py-3 sm:py-4 border-t-2 sm:border-t-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 flex-shrink-0"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.cloud.light,
              borderTopColor: PIXSELF_BRAND.colors.primary.navyLight,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 flex-shrink-0" style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedCharacter.thumbnail || "https://raw.githubusercontent.com/tgen16mgc/pixselfstudio/main/public/placeholder.svg"}
                  alt={selectedCharacter.name}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] sm:text-[12px] font-bold truncate" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                  {selectedCharacter.name}
                </div>
                <div className="text-[8px] sm:text-[9px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                  {new Date(selectedCharacter.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PixselfButton 
                onClick={() => handleLoadCharacter(selectedCharacter)} 
                variant="accent" 
                size="sm"
                fullWidth
                className="sm:w-auto"
              >
                LOAD
              </PixselfButton>
              <PixselfButton
                onClick={() => setShowDeleteConfirm(selectedCharacter.id)}
                variant="secondary"
                size="sm"
                icon={<Trash2 className="h-4 w-4" />}
                fullWidth
                className="sm:w-auto"
              >
                DELETE
              </PixselfButton>
            </div>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4">
          <div
            className="w-full max-w-md border-2 sm:border-4 p-4 sm:p-6"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.cloud.white,
              borderColor: PIXSELF_BRAND.colors.primary.navy,
              boxShadow: PIXSELF_BRAND.shadows.glow,
            }}
          >
            <h3 className="text-[12px] sm:text-[14px] font-bold mb-4" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              SAVE CHARACTER
            </h3>

            <input
              type="text"
              placeholder="Enter character name..."
              value={saveDialogName}
              onChange={(e) => setSaveDialogName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveCharacter()}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-[12px] border-2 sm:border-4 mb-4 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{
                backgroundColor: PIXSELF_BRAND.colors.cloud.light,
                borderColor: PIXSELF_BRAND.colors.primary.navyLight,
                color: PIXSELF_BRAND.colors.primary.navy,
                outline: `2px solid ${PIXSELF_BRAND.colors.accent.sparkle}`,
              }}
              autoFocus
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <PixselfButton
                onClick={handleSaveCharacter}
                disabled={!saveDialogName.trim() || isLoading}
                loading={isLoading}
                variant="accent"
                size="sm"
                fullWidth
              >
                SAVE
              </PixselfButton>
              <PixselfButton
                onClick={() => {
                  setShowSaveDialog(false)
                  setSaveDialogName("")
                }}
                variant="secondary"
                size="sm"
                fullWidth
              >
                CANCEL
              </PixselfButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4">
          <div
            className="w-full max-w-md border-2 sm:border-4 p-4 sm:p-6"
            style={{
              backgroundColor: PIXSELF_BRAND.colors.cloud.white,
              borderColor: PIXSELF_BRAND.colors.ui.error,
              boxShadow: PIXSELF_BRAND.shadows.glow,
            }}
          >
            <h3 className="text-[12px] sm:text-[14px] font-bold mb-4" style={{ color: PIXSELF_BRAND.colors.ui.error }}>
              DELETE CHARACTER
            </h3>

            <p className="text-[11px] sm:text-[12px] mb-4" style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              Are you sure you want to delete this character? This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <PixselfButton
                onClick={() => handleDeleteCharacter(showDeleteConfirm)}
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Trash2 className="h-4 w-4" />}
              >
                DELETE
              </PixselfButton>
              <PixselfButton onClick={() => setShowDeleteConfirm(null)} variant="accent" size="sm" fullWidth>
                CANCEL
              </PixselfButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
