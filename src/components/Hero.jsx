import React from 'react';

export function Hero({
  theme = 'dark',
  totalIcons = 6518
}) {
  const logoSrc = theme === 'light' ? '/assets/logo-light.svg' : '/assets/logo-dark.svg';

  return (
    <section className="md-hero-card">
      {}
      <div className="md-hero-glow glow-1" />
      <div className="md-hero-glow glow-2" />

      {}
      <div className="md-hero-content">
        {}
        <h1 className="md-hero-headline">
          The Premier <span className="md-hero-gradient-text">SVG Icon Hub</span> <br />
          for Developers & Designers
        </h1>

        {}
        <p className="md-hero-description">
          Search, customize, and copy over <strong>{totalIcons.toLocaleString()}+</strong> high-quality brand logos, developer tools, and vector assets.
          Export ready-to-use React JSX, Vue 3, Svelte components, or download high-res PNG & SVG instantly.
        </p>
      </div>

      {}
      <div className="md-hero-right-logo">
        <img
          src={logoSrc}
          alt="SvgIo Logo"
          className="md-hero-logo-img" />
        
      </div>
    </section>);

}

export default Hero;