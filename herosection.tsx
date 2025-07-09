export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  backgroundImage,
  backgroundColor = '#ffffff',
  overlayColor,
  overlayOpacity = 0.5,
  buttons = [],
  theme = 'light',
  className,
  children,
}) => {
  const sectionStyle: React.CSSProperties = useMemo(() => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }
    }
    return {
      backgroundColor,
      position: 'relative',
    }
  }, [backgroundImage, backgroundColor])

  const overlayStyle: React.CSSProperties = useMemo(() => {
    if (!overlayColor) return {}
    return {
      backgroundColor: overlayColor,
      opacity: overlayOpacity,
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      pointerEvents: 'none',
      zIndex: 1,
    }
  }, [overlayColor, overlayOpacity])

  const contentStyle: React.CSSProperties = useMemo(() => {
    return {
      position: 'relative',
      zIndex: 2,
    }
  }, [])

  return (
    <section
      className={classnames(styles.heroSection, styles[theme], className)}
      style={sectionStyle}
    >
      {overlayColor && <div className={styles.overlay} style={overlayStyle} />}
      <div className={styles.content} style={contentStyle}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {buttons.length > 0 && (
          <div className={styles.buttons}>
            {buttons.map(btn => {
              const btnClass = classnames(
                styles.button,
                styles[btn.variant || 'primary']
              )
              if (btn.href) {
                return (
                  <a
                    key={btn.id}
                    href={btn.href}
                    className={btnClass}
                    onClick={btn.onClick}
                  >
                    {btn.label}
                  </a>
                )
              }
              return (
                <button
                  key={btn.id}
                  type="button"
                  className={btnClass}
                  onClick={btn.onClick}
                >
                  {btn.label}
                </button>
              )
            })}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}