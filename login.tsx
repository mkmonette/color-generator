const Login: FC<LoginProps> = ({ onSuccess }) => {
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleSubmit = useCallback(
    async (creds: Credentials) => {
      setLoading(true)
      setError(null)
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(creds),
          signal: controller.signal,
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Login failed')
        }
        const data = await response.json()
        onSuccess(data)
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [onSuccess],
  )

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSubmit(credentials)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form
      onSubmit={onFormSubmit}
      aria-busy={loading}
      className="space-y-4 max-w-sm"
    >
      {error && (
        <div role="alert" className="text-red-500 mb-4">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          required
          autoComplete="email"
          disabled={loading}
          className="border border-gray-300 p-2 rounded w-full disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="password" className="block mb-1 font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          disabled={loading}
          className="border border-gray-300 p-2 rounded w-full disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default Login