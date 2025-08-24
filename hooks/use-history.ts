"use client"

import { useState, useCallback, useRef } from "react"

const MAX_HISTORY_SIZE = 50
const CLEANUP_THRESHOLD = 100

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)
  const operationCount = useRef(0)

  const addToHistory = useCallback(
    (newState: T) => {
      operationCount.current++

      setHistory((prev) => {
        const newHistory = [...prev.slice(0, currentIndex + 1), newState]

        // Cleanup old history when threshold is reached
        if (operationCount.current > CLEANUP_THRESHOLD) {
          const cleanedHistory = newHistory.slice(-MAX_HISTORY_SIZE)
          setCurrentIndex(cleanedHistory.length - 1)
          operationCount.current = 0
          return cleanedHistory
        }

        return newHistory
      })

      setCurrentIndex((prev) => prev + 1)
    },
    [currentIndex],
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return history[currentIndex - 1]
    }
    return null
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return history[currentIndex + 1]
    }
    return null
  }, [currentIndex, history])

  return {
    currentState: history[currentIndex],
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    addToHistory,
    undo,
    redo,
  }
}
