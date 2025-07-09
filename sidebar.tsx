import React, { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'

const Sidebar: React.FC<SidebarProps> = ({
  sections,
  sectionContents,
  initialOpenSection = '',
  onToggle,
  className = '',
}) => {
  const [openSection, setOpenSection] = useState<string>(initialOpenSection)

  useEffect(() => {
    setOpenSection(initialOpenSection)
  }, [initialOpenSection])

  const toggleSection = useCallback(
    (sectionId: string): void => {
      setOpenSection(prevOpen => {
        const newOpen = prevOpen === sectionId ? '' : sectionId
        onToggle?.(newOpen)
        return newOpen
      })
    },
    [onToggle]
  )

  return (
    <aside className={classNames('sidebar', className)}>
      <nav aria-label="Sidebar Navigation">
        <ul className="sidebar__list">
          {sections.map(({ id, label, icon }) => (
            <li key={id} className="sidebar__item">
              <button
                type="button"
                id={`sidebar-button-${id}`}
                className={classNames('sidebar__button', {
                  'sidebar__button--active': openSection === id,
                })}
                aria-expanded={openSection === id}
                aria-controls={`sidebar-panel-${id}`}
                onClick={() => toggleSection(id)}
              >
                {icon && <span className="sidebar__icon">{icon}</span>}
                <span className="sidebar__label">{label}</span>
              </button>
              <div
                id={`sidebar-panel-${id}`}
                role="region"
                aria-labelledby={`sidebar-button-${id}`}
                className={classNames('sidebar__panel', {
                  'sidebar__panel--open': openSection === id,
                })}
                hidden={openSection !== id}
              >
                {sectionContents[id]}
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar