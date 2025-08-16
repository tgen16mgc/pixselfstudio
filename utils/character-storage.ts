import type { Selections } from "@/types/character"

export interface SavedCharacter {
  id: string
  name: string
  selections: Selections
  thumbnail: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "pixself_saved_characters"
const MAX_CHARACTERS = 50

// Get all saved characters from localStorage
export function getSavedCharacters(): SavedCharacter[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const characters = JSON.parse(stored) as SavedCharacter[]
    return characters.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error("Error loading saved characters:", error)
    return []
  }
}

// Save a character to localStorage
export function saveCharacter(
  name: string,
  selections: Selections,
  thumbnail: string,
  existingId?: string,
): SavedCharacter {
  try {
    const characters = getSavedCharacters()
    const now = Date.now()

    let character: SavedCharacter

    if (existingId) {
      // Update existing character
      const existingIndex = characters.findIndex((c) => c.id === existingId)
      if (existingIndex >= 0) {
        character = {
          ...characters[existingIndex],
          name,
          selections,
          thumbnail,
          updatedAt: now,
        }
        characters[existingIndex] = character
      } else {
        // Create new if existing not found
        character = {
          id: generateId(),
          name,
          selections,
          thumbnail,
          createdAt: now,
          updatedAt: now,
        }
        characters.unshift(character)
      }
    } else {
      // Create new character
      character = {
        id: generateId(),
        name,
        selections,
        thumbnail,
        createdAt: now,
        updatedAt: now,
      }
      characters.unshift(character)
    }

    // Limit to MAX_CHARACTERS
    const limitedCharacters = characters.slice(0, MAX_CHARACTERS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedCharacters))
    return character
  } catch (error) {
    console.error("Error saving character:", error)
    throw new Error("Failed to save character")
  }
}

// Delete a character from localStorage
export function deleteCharacter(id: string): void {
  try {
    const characters = getSavedCharacters()
    const filteredCharacters = characters.filter((c) => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCharacters))
  } catch (error) {
    console.error("Error deleting character:", error)
    throw new Error("Failed to delete character")
  }
}

// Get a specific character by ID
export function getCharacterById(id: string): SavedCharacter | null {
  try {
    const characters = getSavedCharacters()
    return characters.find((c) => c.id === id) || null
  } catch (error) {
    console.error("Error getting character by ID:", error)
    return null
  }
}

// Generate a unique ID for characters
function generateId(): string {
  return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Check if localStorage is available
export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Get storage usage info
export function getStorageInfo(): { used: number; total: number; available: number } {
  try {
    const characters = getSavedCharacters()
    const used = characters.length
    const total = MAX_CHARACTERS
    const available = total - used

    return { used, total, available }
  } catch (error) {
    return { used: 0, total: MAX_CHARACTERS, available: MAX_CHARACTERS }
  }
}

// Export all characters as JSON
export function exportCharacters(): string {
  const characters = getSavedCharacters()
  return JSON.stringify(characters, null, 2)
}

// Import characters from JSON
export function importCharacters(jsonData: string): number {
  try {
    const importedCharacters = JSON.parse(jsonData) as SavedCharacter[]
    const existingCharacters = getSavedCharacters()

    // Validate imported data
    const validCharacters = importedCharacters.filter(
      (char) => char.id && char.name && char.selections && char.thumbnail,
    )

    // Merge with existing, avoiding duplicates by ID
    const existingIds = new Set(existingCharacters.map((c) => c.id))
    const newCharacters = validCharacters.filter((char) => !existingIds.has(char.id))

    const mergedCharacters = [...existingCharacters, ...newCharacters]
      .slice(0, MAX_CHARACTERS)
      .sort((a, b) => b.updatedAt - a.updatedAt)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedCharacters))
    return newCharacters.length
  } catch (error) {
    console.error("Error importing characters:", error)
    throw new Error("Failed to import characters")
  }
}
