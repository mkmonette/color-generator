const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const loadReports = useCallback(async (signal?: AbortSignal) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const response = signal
        ? await fetch('/api/admin/reports', { signal })
        : await fetch('/api/admin/reports');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data: Report[] = await response.json();
      if (isMountedRef.current && !(signal?.aborted)) {
        setReports(data);
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      if (err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (isMountedRef.current && !(signal?.aborted)) {
        setLoading(false);
      }
    }
  }, []);

  const fetchReports = useCallback(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    loadReports(signal);
    return () => {
      isMountedRef.current = false;
      controller.abort();
    };
  }, [loadReports]);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <button onClick={fetchReports} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Reports'}
      </button>
      {loading && <p>Loading reports...</p>}
      {error && <p className="error">Failed to load reports: {error}</p>}
      {!loading && !error && reports.length > 0 && (
        <table className="reports-table">
          <caption>List of admin reports</caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Created At</th>
              <th>Status</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.title}</td>
                <td>{new Date(report.createdAt).toLocaleString()}</td>
                <td>{report.status}</td>
                <td>{report.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && !error && reports.length === 0 && (
        <p>No reports available.</p>
      )}
    </div>
  );
};

export default AdminDashboard;