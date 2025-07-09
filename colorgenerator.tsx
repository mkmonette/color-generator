const generateId = () => Math.random().toString(36).substr(2, 9)

const sanitizeColor = (value: string): string =>
  value.startsWith('#') ? value : `#${value}`

const ColorGenerator: React.FC<ColorGeneratorProps> = ({ onPaletteChange }) => {
  const schemes = ['monochrome', 'analogic', 'complement', 'triad', 'tetradic']
  const moods = ['calm', 'energetic', 'warm', 'cool', 'neutral']

  const [scheme, setScheme] = useState<string>(schemes[0])
  const [mood, setMood] = useState<string>(moods[0])
  const [palette, setPalette] = useState<ColorItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const fetchColorData = async (
    scheme: string,
    mood: string,
    signal?: AbortSignal
  ): Promise<string[]> => {
    const resp = await fetch(
      `/api/palette?scheme=${encodeURIComponent(scheme)}&mood=${encodeURIComponent(mood)}`,
      { signal }
    )
    if (!resp.ok) {
      throw new Error(`Failed to fetch palette: ${resp.statusText}`)
    }
    const data = await resp.json()
    if (!Array.isArray(data.colors)) {
      throw new Error('Invalid response format')
    }
    return data.colors
  }

  const generatePalette = async () => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)
    try {
      const colors = await fetchColorData(scheme, mood, controller.signal)
      const items = colors.map(c => ({ id: generateId(), raw: c }))
      setPalette(items)
      onPaletteChange?.(colors)
    } catch (err: unknown) {
      if ((err as DOMException).name !== 'AbortError') {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleColorEdit = (id: string, value: string) => {
    const updated = palette.map(item =>
      item.id === id ? { ...item, raw: value } : item
    )
    setPalette(updated)
    const sanitized = updated.map(item => sanitizeColor(item.raw))
    onPaletteChange?.(sanitized)
  }

  const handleColorBlur = (id: string) => {
    const updated = palette.map(item => {
      if (item.id === id) {
        const clean = sanitizeColor(item.raw)
        return { ...item, raw: clean }
      }
      return item
    })
    setPalette(updated)
    const sanitized = updated.map(item => sanitizeColor(item.raw))
    onPaletteChange?.(sanitized)
  }

  return (
    <div className="color-generator">
      <div className="controls">
        <label>
          Scheme:
          <select value={scheme} onChange={e => setScheme(e.target.value)}>
            {schemes.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mood:
          <select value={mood} onChange={e => setMood(e.target.value)}>
            {moods.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button onClick={generatePalette} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Palette'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="palette">
        {palette.map(item => (
          <div key={item.id} className="swatch-container">
            <div
              className="color-swatch"
              style={{ backgroundColor: sanitizeColor(item.raw) }}
            />
            <input
              type="text"
              value={item.raw}
              onChange={e => handleColorEdit(item.id, e.target.value)}
              onBlur={() => handleColorBlur(item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ColorGenerator