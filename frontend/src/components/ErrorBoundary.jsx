import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App UI Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-slate-100">
          <div className="max-w-lg rounded-2xl border border-red-500/30 bg-slate-800/90 p-8 shadow-2xl backdrop-blur-md">
            <h2 className="font-display text-2xl font-bold text-red-400">Application Error</h2>
            <p className="mt-2 text-sm text-slate-300">
              {this.state.error?.message || 'An unexpected error occurred in the component tree.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500 shadow-lg"
            >
              Reload Pharos QMS
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
