import React from 'react';

export function Hero({
  theme = 'dark',
  totalIcons = 6518
}) {
  const logoSrc = theme === 'light' ? '/assets/logo-light.svg' : '/assets/logo-dark.svg';

  return (
    <section className="md-hero-card">
      {/* Ambient background glows & mesh lighting */}
      <div className="md-hero-glow glow-1" />
      <div className="md-hero-glow glow-2" />

      {/* Left Text Content */}
      <div className="md-hero-content">
        {/* Headline */}
        <h1 className="md-hero-headline">
          The Premier <span className="md-hero-gradient-text">SVG Icon Hub</span> <br />
          for Developers & Designers
        </h1>

        {/* Subtitle */}
        <p className="md-hero-description">
          Search, customize, and copy over <strong>{totalIcons.toLocaleString()}+</strong> high-quality brand logos, developer tools, and vector assets.
          Export ready-to-use React JSX, Vue 3, Svelte components, or download high-res PNG & SVG instantly.
        </p>
      </div>

      {/* Right Side: Prominent Dynamic App Logo directly placed */}
      <div className="md-hero-right-logo">
        <img
          src={logoSrc}
          alt="SvgIo Logo"
          className="md-hero-logo-img"
        />
      </div>
    </section>
  );
}

export default Hero;
