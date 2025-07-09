import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { FaTimes, FaBars, FaCoins, FaMoon, FaSun } from 'react-icons/fa';

interface NavbarProps {
  currentPage: string;
  onNavigate: (path: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  coinCount: number;
  userName?: string;
  isAdmin?: boolean;
}

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Templates', path: '/templates' },
  { label: 'Colors', path: '/colors' },
  { label: 'Export', path: '/export' },
];

const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  theme,
  onToggleTheme,
  coinCount,
  userName,
  isAdmin,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const handleNavClick = (link: string) => {
    onNavigate(link);
    if (mobileOpen) setMobileOpen(false);
  };

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMobileOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!mobileOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen]);

  return (
    <nav ref={navRef} className={`navbar navbar--${theme}`}>
      <div className="navbar__container">
        <button
          type="button"
          className="navbar__brand"
          onClick={() => handleNavClick('/')}
          aria-label="Go to Home"
        >
          <h1>DesignLab</h1>
        </button>
        <button
          type="button"
          className="navbar__menu-button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="navbar-menu"
          onClick={handleMenuToggle}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
        <ul
          id="navbar-menu"
          className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}
        >
          {navLinks.map((link) => (
            <li key={link.path} className="navbar__item">
              <button
                type="button"
                className={`navbar__link ${
                  currentPage === link.path ? 'navbar__link--active' : ''
                }`}
                onClick={() => handleNavClick(link.path)}
              >
                {link.label}
              </button>
            </li>
          ))}
          {isAdmin && (
            <li className="navbar__item">
              <button
                type="button"
                className={`navbar__link ${
                  currentPage === '/admin' ? 'navbar__link--active' : ''
                }`}
                onClick={() => handleNavClick('/admin')}
              >
                Admin
              </button>
            </li>
          )}
        </ul>
        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          <div className="navbar__coins" aria-label={`${coinCount} coins`}>
            <FaCoins />
            <span className="navbar__coin-count">{coinCount}</span>
          </div>
          {userName ? (
            <button
              type="button"
              className="navbar__profile navbar__link"
              onClick={() => handleNavClick('/profile')}
              aria-label="Go to Profile"
            >
              {userName}
            </button>
          ) : (
            <button
              type="button"
              className="navbar__link navbar__link--login"
              onClick={() => handleNavClick('/login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;