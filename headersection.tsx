const HeaderSection: React.FC<HeaderSectionProps> = ({
  logoSrc,
  logoAlt,
  navLinks,
  theme = 'light',
  primaryColor,
  onLogoClick,
  onNavLinkClick,
  onThemeToggle,
}) => {
  const themeClass =
    theme === 'dark' ? 'header-section--dark' : 'header-section--light'

  const style: React.CSSProperties = primaryColor
    ? { backgroundColor: primaryColor }
    : {}

  const handleLogoKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onLogoClick) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onLogoClick()
      }
    },
    [onLogoClick],
  )

  const handleNavLinkClick = useCallback(
    (link: NavLink, index: number) =>
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (onNavLinkClick) {
          e.preventDefault()
          onNavLinkClick(link, index)
        }
      },
    [onNavLinkClick],
  )

  return (
    <header
      className={classNames('header-section', themeClass)}
      style={style}
    >
      <div
        className="header-section__logo"
        onClick={onLogoClick}
        role={onLogoClick ? 'button' : undefined}
        tabIndex={onLogoClick ? 0 : undefined}
        onKeyDown={handleLogoKeyDown}
      >
        <img src={logoSrc} alt={logoAlt} />
      </div>

      <nav
        className="header-section__nav"
        aria-label="Main navigation"
      >
        <ul className="header-section__nav-list">
          {navLinks.map((link, idx) => (
            <li
              key={link.id}
              className="header-section__nav-item"
            >
              <a
                href={link.href}
                className="header-section__nav-link"
                onClick={handleNavLinkClick(link, idx)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {onThemeToggle && (
        <button
          className="header-section__theme-toggle"
          onClick={onThemeToggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '??' : '?'}
        </button>
      )}
    </header>
  )
}

export default React.memo(HeaderSection)