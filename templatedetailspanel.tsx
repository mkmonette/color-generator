const TemplateDetailsPanel: React.FC<TemplateDetailsPanelProps> = ({ id, onClose }) => {
  const [details, setDetails] = useState<TemplateDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplateDetails = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/templates/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal,
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data: TemplateDetails = await response.json();
        setDetails(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Request was aborted, do nothing
          return;
        }
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch template details');
        }
        setDetails(null);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (!id) {
      return;
    }
    const controller = new AbortController();
    fetchTemplateDetails(controller.signal);
    return () => {
      controller.abort();
    };
  }, [id, fetchTemplateDetails]);

  if (loading) {
    return (
      <div className="template-details-panel loading">
        <p>Loading template details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-details-panel error">
        <p>Error: {error}</p>
        <button onClick={() => fetchTemplateDetails()}>Retry</button>
      </div>
    );
  }

  if (!details) {
    return null;
  }

  return (
    <div className="template-details-panel">
      {onClose && (
        <button className="close-button" onClick={onClose} aria-label="Close">
          &times;
        </button>
      )}
      <h2 className="template-title">{details.name}</h2>
      {details.previewUrl && (
        <div className="template-preview">
          <img src={details.previewUrl} alt={`${details.name} preview`} />
        </div>
      )}
      {details.description && (
        <p className="template-description">{details.description}</p>
      )}
      <div className="template-meta">
        {details.author && <p>Author: {details.author}</p>}
        {details.createdAt && (
          <p>Created: {new Date(details.createdAt).toLocaleDateString()}</p>
        )}
        {details.updatedAt && (
          <p>Updated: {new Date(details.updatedAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

export default TemplateDetailsPanel;