import React from 'react';
import { UploadCloud, Package, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export function Hero({
  theme = 'dark',
  totalIcons = 6500,
  onNavigate
}) {
  const logoSrc = theme === 'light' ? '/assets/logo-light.svg' : '/assets/logo-dark.svg';

  return (
    <section className="md-hero-card">
      {/* Background ambient glow */}
      <div className="md-hero-glow glow-1" />
      <div className="md-hero-glow glow-2" />

      {/* Main Text Content */}
      <div className="md-hero-content">
        <div className="md-hero-badge-row">
          <span className="md-hero-pill-badge">
            <Sparkles size={13} className="text-orange" />
            <span>Open-Source SVG Hosting &amp; Publishing Platform</span>
          </span>
        </div>

        <h1 className="md-hero-headline">
          Open-Source <span className="md-hero-gradient-text">SVG Hosting &amp; Publishing</span> <br />
          for Modern Creators &amp; Developers
        </h1>

        <p className="md-hero-description">
          Upload individual vector icons or complete icon packs. We automatically validate, optimize paths, and host them with dedicated shareable web pages, global CDN links, and 1-click integration code for React, React Native, Next.js, Vue, Svelte, and HTML.
        </p>

        {/* Action Buttons Row */}
        <div className="md-hero-actions-row">
          <button
            type="button"
            className="md-hero-cta-btn primary"
            onClick={() => onNavigate?.('submit')}>
            <UploadCloud size={16} />
            <span>Publish &amp; Host SVGs</span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            className="md-hero-cta-btn secondary"
            onClick={() => onNavigate?.('categories')}>
            <Package size={16} />
            <span>Explore {totalIcons.toLocaleString()}+ Hosted Icons</span>
          </button>
        </div>

        {/* Feature Highlights Strip */}
        <div className="md-hero-features-strip">
          <div className="md-hero-feat-item">
            <CheckCircle2 size={14} className="text-emerald" />
            <span>Single Icons &amp; Icon Packs</span>
          </div>
          <div className="md-hero-feat-item">
            <CheckCircle2 size={14} className="text-emerald" />
            <span>Automated 7-Min Ingestion</span>
          </div>
          <div className="md-hero-feat-item">
            <CheckCircle2 size={14} className="text-emerald" />
            <span>Dedicated Live Shareable Pages</span>
          </div>
          <div className="md-hero-feat-item">
            <CheckCircle2 size={14} className="text-emerald" />
            <span>React, Vue, Svelte, HTML &amp; CDN</span>
          </div>
        </div>
      </div>

      {/* Right Visual Brand Graphic */}
      <div className="md-hero-right-logo">
        <img
          src={logoSrc}
          alt="SVG.IO Vector Platform"
          className="md-hero-logo-img"
        />
      </div>
    </section>
  );
}

export default Hero;