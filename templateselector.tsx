import React, { FC, memo, useCallback, KeyboardEvent } from 'react';

const TemplateItem: FC<TemplateItemProps> = memo(
  ({ template, isSelected, onSelect }) => {
    const { id, name, thumbnailUrl } = template

    const handleClick = useCallback(() => {
      onSelect(id)
    }, [onSelect, id])

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onSelect(id)
        }
      },
      [onSelect, id]
    )

    const handleKeyUp = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
          onSelect(id)
        }
      },
      [onSelect, id]
    )

    return (
      <div
        className={`template-item${isSelected ? ' selected' : ''}`}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        <img
          src={thumbnailUrl}
          alt={name}
          className="template-thumbnail"
        />
        <span className="template-name">{name}</span>
      </div>
    )
  }
)

const TemplateSelector: FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`template-selector ${className}`}>
      {templates.map((template) => (
        <TemplateItem
          key={template.id}
          template={template}
          isSelected={template.id === selectedTemplateId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default memo(TemplateSelector)