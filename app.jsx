import React, { Component, lazy, Suspense, useState, useEffect } from 'react'
import { UserProvider } from './contexts/UserContext'
import { ThemeProvider } from './contexts/ThemeContext'

const HeaderSelector = lazy(() => import('./components/HeaderSelector'))
const HeroSelector = lazy(() => import('./components/HeroSelector'))
const PaletteGenerator = lazy(() => import('./components/PaletteGenerator'))
const StyleEditor = lazy(() => import('./components/StyleEditor'))
const ExportSection = lazy(() => import('./components/ExportSection'))
const ModeToggle = lazy(() => import('./components/ModeToggle'))
const Monetization = lazy(() => import('./components/Monetization'))

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info)
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>
    }
    return this.props.children
  }
}

function AppJSX() {
  const [selectedHeader, setSelectedHeader] = useState(null)
  const [selectedHero, setSelectedHero] = useState(null)
  const [palette, setPalette] = useState([])
  const [mode, setMode] = useState('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const toggleMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'))

  return (
    <ErrorBoundary>
      <UserProvider>
        <ThemeProvider value={{ mode, toggleMode }}>
          <div className="app-container">
            <Suspense fallback={<div>Loading...</div>}>
              <header className="app-header">
                <ModeToggle mode={mode} onToggle={toggleMode} />
                <Monetization />
              </header>
              <main className="app-main">
                <HeaderSelector selected={selectedHeader} onSelect={setSelectedHeader} />
                <HeroSelector selected={selectedHero} onSelect={setSelectedHero} />
                <PaletteGenerator onGenerate={setPalette} />
                <StyleEditor
                  header={selectedHeader}
                  hero={selectedHero}
                  palette={palette}
                  mode={mode}
                />
              </main>
              <footer className="app-footer">
                <ExportSection
                  header={selectedHeader}
                  hero={selectedHero}
                  palette={palette}
                  mode={mode}
                />
              </footer>
            </Suspense>
          </div>
        </ThemeProvider>
      </UserProvider>
    </ErrorBoundary>
  )
}

export default AppJSX