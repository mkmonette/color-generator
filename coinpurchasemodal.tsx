const CoinPurchaseModal: FC<CoinPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchaseSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const coinOptions = [100, 500, 1000];

  // Reset error and loading when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Focus trap and ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const modalEl = modalRef.current;
    if (!modalEl) return;

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(
      modalEl.querySelectorAll<HTMLElement>(focusableSelectors)
    );
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    firstEl?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePurchase = async (amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/coins/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Purchase failed');
      }
      const data = await response.json();
      onPurchaseSuccess?.(data.coins);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during purchase.');
    } finally {
      setLoading(false);
    }
  };

  const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={modalRef}
        onClick={stopPropagation}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="modal-header">
          <h2 id="modal-title">Buy Coins</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            ?
          </button>
        </header>
        <div className="modal-body" id="modal-body">
          {error && (
            <div className="modal-error" role="alert" id="modal-error">
              {error}
            </div>
          )}
          <ul className="coin-options-list" id="coin-options-list">
            {coinOptions.map((amount) => (
              <li key={amount}>
                <button
                  className="coin-option-button"
                  onClick={() => handlePurchase(amount)}
                  disabled={loading}
                >
                  {amount} Coins
                </button>
              </li>
            ))}
          </ul>
        </div>
        <footer className="modal-footer">
          <button
            className="modal-cancel-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CoinPurchaseModal;