const TemplatePreviewCard: FC<TemplatePreviewCardProps> = ({
  id,
  title,
  thumbnailUrl,
  description,
  isSelected = false,
  isPremium = false,
  disabled = false,
  onSelect,
  onHover,
}) => {
  const [hovered, setHovered] = useState(false)

  const handleMouseEnter = (): void => {
    if (disabled) return
    setHovered(true)
    onHover?.(id, true)
  }

  const handleMouseLeave = (): void => {
    if (disabled) return
    setHovered(false)
    onHover?.(id, false)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (disabled) return
    onSelect(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }

  const classNames = [
    'template-preview-card',
    isSelected ? 'selected' : '',
    hovered ? 'hovered' : '',
    disabled ? 'disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={disabled}
    >
      {isPremium && <div className="premium-badge">Premium</div>}
      <div className="thumbnail-wrapper">
        <img
          src={thumbnailUrl}
          alt={`${title} preview`}
          className="template-thumbnail"
          draggable={false}
        />
      </div>
      <div className="template-info">
        <h4 className="template-title">{title}</h4>
        {description && <p className="template-description">{description}</p>}
      </div>
    </div>
  )
}

function arePropsEqual(
  prev: TemplatePreviewCardProps,
  next: TemplatePreviewCardProps
): boolean {
  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.thumbnailUrl === next.thumbnailUrl &&
    prev.description === next.description &&
    prev.isSelected === next.isSelected &&
    prev.isPremium === next.isPremium &&
    prev.disabled === next.disabled &&
    prev.onSelect === next.onSelect &&
    prev.onHover === next.onHover
  )
}

export default React.memo(TemplatePreviewCard, arePropsEqual)