const features: Array<{
  id: string
  title: string
  description: string
  icon: string
}> = [
  {
    id: 'template-selection',
    title: 'Template Selection',
    description: 'Choose from a wide variety of header and hero templates to kickstart your design.',
    icon: '?',
  },
  {
    id: 'palette-generator',
    title: 'Palette Generator',
    description: 'Generate cohesive color palettes with different schemes and moods in seconds.',
    icon: '??',
  },
  {
    id: 'live-editing',
    title: 'Live Editing',
    description: 'Edit text, images, and styles directly in the browser with instant preview.',
    icon: '??',
  },
  {
    id: 'dark-light-mode',
    title: 'Dark & Light Mode',
    description: 'Toggle between light and dark themes to see your designs in different environments.',
    icon: '?',
  },
  {
    id: 'export-share',
    title: 'Export & Share',
    description: 'Export your sections as code or images, ready for production or presentation.',
    icon: '?',
  },
]

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const { user } = useContext(AuthContext)

  return (
    <div className={`landing-page theme-${theme}`}>
      <Helmet>
        <title>Landing Page Builder | Home</title>
        <meta
          name="description"
          content="Build stunning landing pages with templates, color palettes, and live editing."
        />
      </Helmet>

      <header className="lp-header">
        <div className="container lp-header__content">
          <Link to="/" className="lp-logo">
            LPBuilder
          </Link>
          <nav className="lp-nav">
            <a href="#features" className="lp-nav__link">
              Features
            </a>
            <a href="#pricing" className="lp-nav__link">
              Pricing
            </a>
            <a href="#contact" className="lp-nav__link">
              Contact
            </a>
            {user ? (
              <Link to="/dashboard" className="lp-btn lp-btn--primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="lp-nav__link">
                  Login
                </Link>
                <Link to="/signup" className="lp-btn lp-btn--primary">
                  Sign Up
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="lp-btn lp-btn--icon"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '?' : '??'}
            </button>
          </nav>
        </div>
      </header>

      <main className="lp-main">
        <section className="lp-hero">
          <div className="container lp-hero__content">
            <h1 className="lp-hero__title">Build Stunning Landing Pages Effortlessly</h1>
            <p className="lp-hero__subtitle">
              Choose templates, generate palettes, edit live, and export your designs in minutes.
            </p>
            <div className="lp-hero__cta">
              <Link
                to={user ? '/templates' : '/signup'}
                className="lp-btn lp-btn--primary lp-btn--lg"
              >
                {user ? 'Get Started' : 'Sign Up Free'}
              </Link>
              <a href="#features" className="lp-btn lp-btn--secondary lp-btn--lg">
                Learn More
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="lp-features">
          <div className="container">
            <h2 className="lp-section-title">Features</h2>
            <div className="lp-features__grid">
              {features.map((feature) => (
                <div key={feature.id} className="lp-feature-card">
                  <div className="lp-feature-card__icon">{feature.icon}</div>
                  <h3 className="lp-feature-card__title">{feature.title}</h3>
                  <p className="lp-feature-card__desc">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="lp-pricing">
          <div className="container">
            <h2 className="lp-section-title">Pricing</h2>
            <p className="lp-pricing__subtitle">
              Free plan available. Upgrade to Pro for unlimited exports, premium templates, and
              priority support.
            </p>
            <Link to="/pricing" className="lp-btn lp-btn--primary lp-btn--lg">
              View Plans
            </Link>
          </div>
        </section>

        <section id="contact" className="lp-contact">
          <div className="container">
            <h2 className="lp-section-title">Get in Touch</h2>
            <p className="lp-contact__text">
              Have questions? Reach out to our support team or join our community on Discord.
            </p>
            <div className="lp-contact__links">
              <a href="mailto:support@lpbuilder.com" className="lp-btn lp-btn--secondary">
                Email Us
              </a>
              <a
                href="https://discord.gg/example"
                className="lp-btn lp-btn--secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Discord
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="container lp-footer__content">
          <div className="lp-footer__links">
            <Link to="/about">About</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/support">Support</Link>
          </div>
          <p className="lp-footer__note">? {new Date().getFullYear()} LPBuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage