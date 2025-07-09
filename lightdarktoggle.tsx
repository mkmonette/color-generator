const SunIcon: ReactNode = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" />
    <g stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
)

const MoonIcon: ReactNode = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
  </svg>
)

const LightDarkToggle: FC<LightDarkToggleProps> = ({ className = '', ...props }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setTheme('light')
      return
    }

    let initial: 'light' | 'dark' = 'light'
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') {
        initial = stored
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initial = 'dark'
      }
    } catch (e) {
      console.warn('Failed to access localStorage for theme detection', e)
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initial = 'dark'
      }
    }

    setTheme(initial)
  }, [])

  useEffect(() => {
    if (theme === null) return

    const root = document.documentElement
    root.setAttribute('data-theme', theme)

    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      console.warn('Failed to save theme to localStorage', e)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  if (theme === null) {
    return null
  }

  return (
    <button
      type="button"
      aria-label="Toggle light and dark mode"
      aria-pressed={theme === 'dark'}
      onClick={toggleTheme}
      className={className.trim()}
      {...props}
    >
      {theme === 'light' ? MoonIcon : SunIcon}
    </button>
  )
}

export default LightDarkToggle