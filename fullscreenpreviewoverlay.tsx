const FullScreenPreviewOverlay: React.FC<FullScreenPreviewOverlayProps> = ({
  isOpen,
  onClose,
  children,
  initialMode = 'light',
}) => {
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode)
  const contentRef = useRef<HTMLDivElement>(null)

  const closeOverlay = useCallback(() => {
    onClose()
  }, [onClose])

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  // prevent background scroll
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // handle Escape key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOverlay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeOverlay])

  // set focus to dialog container when opened
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus()
    }
  }, [isOpen])

  const handleKeyDownDialog = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return
    const focusableSelectors =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]'
    const nodes = contentRef.current?.querySelectorAll<HTMLElement>(
      focusableSelectors
    )
    if (!nodes || nodes.length === 0) {
      e.preventDefault()
      return
    }
    const focusable = Array.from(nodes)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    }
  }

  if (!isOpen || typeof document === 'undefined') return null

  return ReactDOM.createPortal(
    <div
      className={`fullscreen-preview-overlay ${mode}`}
      onClick={closeOverlay}
      aria-hidden="true"
    >
      <div
        className="overlay-content-wrapper"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={contentRef}
        onKeyDown={handleKeyDownDialog}
        onClick={e => e.stopPropagation()}
      >
        <div className="overlay-toolbar">
          <button className="mode-toggle-btn" onClick={toggleMode}>
            {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button className="close-btn" onClick={closeOverlay}>
            Close
          </button>
        </div>
        <div className="overlay-content">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default FullScreenPreviewOverlay