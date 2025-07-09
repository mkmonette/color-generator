const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ userId }) => {
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchPalettes = useCallback(async (): Promise<void> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get<Palette[]>(
        `/api/users/${userId}/palettes`,
        { signal: controller.signal }
      )
      setPalettes(response.data)
    } catch (err: any) {
      const isAbort = err.name === 'CanceledError' || err.name === 'AbortError'
      if (!isAbort) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch palettes.'
        )
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false)
        abortControllerRef.current = null
      }
    }
  }, [userId])

  useEffect(() => {
    fetchPalettes()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchPalettes])

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <h1>Your Color Palettes</h1>
        <button onClick={fetchPalettes} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {loading && <div className="loading">Loading palettes...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="palettes-list">
          {palettes.length === 0 ? (
            <div className="empty-state">
              No palettes found. Create one to get started!
            </div>
          ) : (
            palettes.map((palette) => (
              <div key={palette.id} className="palette-card">
                <h2 className="palette-name">{palette.name}</h2>
                <div className="palette-meta">
                  <span>Scheme: {palette.scheme}</span>
                  <span>Mood: {palette.mood}</span>
                  <span>
                    Created: {new Date(palette.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="palette-colors">
                  {palette.colors.map((color, idx) => (
                    <div
                      key={`${color}-${idx}`}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard