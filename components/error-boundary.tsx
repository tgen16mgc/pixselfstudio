"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Character Studio Error:", error, errorInfo)

    // Report to error tracking service
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: false,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
            <div className="bg-[#1a1a1a] border-2 border-[#ff4444] rounded-lg p-8 max-w-md text-center">
              <AlertTriangle className="h-12 w-12 text-[#ff4444] mx-auto mb-4" />
              <h2 className="text-[14px] font-bold text-[#F5DEB3] mb-2">Oops! Something went wrong</h2>
              <p className="text-[10px] text-[#87CEEB] mb-6">
                The character studio encountered an unexpected error. Don&apos;t worry, your progress should be saved.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00d4ff] text-[#1a1a1a] text-[10px] font-bold rounded-lg hover:bg-[#20B2AA] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Studio
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
