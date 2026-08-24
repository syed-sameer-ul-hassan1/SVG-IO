import React from 'react';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  Code2,
  Package,
  Heart,
  ExternalLink,
  Github,
  CheckCircle2,
  FileCode,
  Sliders,
  Cpu,
  Database
} from 'lucide-react';

export function InfoPage({
  onNavigate,
  totalIcons = 6517
}) {
  return (
    <div className="sv-info-page-wrapper">
      {/* Hero Header */}
      <div className="sv-info-hero glass-panel">
        <div className="sv-info-hero-badge">
          <Sparkles size={13} />
          <span>PLATFORM SPECIFICATIONS & ARCHITECTURE</span>
        </div>

        <h1 className="sv-info-hero-title">
          About <span className="text-orange">SVG.IO</span>
        </h1>

        <p className="sv-info-hero-desc">
          SVG.IO is the premier open-source vector icon catalog and developer hub, engineered to provide instant access to over <strong>{totalIcons.toLocaleString()}+</strong> high-quality brand logos, framework vectors, developer utilities, and modern glassmorphism icons.
        </p>

        {/* Stats Row */}
        <div className="sv-info-stats-grid">
          <div className="sv-info-stat-card glass-panel">
            <span className="sv-info-stat-num">{totalIcons.toLocaleString()}+</span>
            <span className="sv-info-stat-label">Total Vector Icons</span>
          </div>

          <div className="sv-info-stat-card glass-panel">
            <span className="sv-info-stat-num">100%</span>
            <span className="sv-info-stat-label">Open Source & Free</span>
          </div>

          <div className="sv-info-stat-card glass-panel">
            <span className="sv-info-stat-num">Apache 2.0</span>
            <span className="sv-info-stat-label">Contribution License</span>
          </div>

          <div className="sv-info-stat-card glass-panel">
            <span className="sv-info-stat-num">&lt; 10ms</span>
            <span className="sv-info-stat-label">Cached Load Speed</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="sv-info-sections-grid">
        {/* Section 1: Catalog Origin */}
        <section className="sv-info-card glass-panel">
          <div className="sv-info-card-header">
            <div className="sv-info-icon-box">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="sv-info-section-title">Catalog Origin & theSVG Core</h2>
              <span className="sv-info-section-sub">Curated foundation & multi-source ecosystem</span>
            </div>
          </div>

          <p className="sv-info-text">
            The foundation of SVG.IO comprises <strong>6,517+ core brand and developer icons</strong> curated and normalized from the established <code>theSVG</code> open-source icon catalog, Simple Icons, and trusted developer registries.
          </p>

          <p className="sv-info-text">
            Every vector path is precision-cleaned, normalized to standard bounding viewBoxes, stripped of extraneous design tool artifacts, and optimized for subpixel sharpness on Retina and high-DPI displays.
          </p>

          <div className="sv-info-highlights">
            <div className="sv-info-highlight-item">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Standardized 24x24 and responsive <code>viewBox</code> vector coordinates</span>
            </div>
            <div className="sv-info-highlight-item">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Strictly sanitized SVG markup with zero inline malicious scripts</span>
            </div>
            <div className="sv-info-highlight-item">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Hex color auto-extraction with official brand palette detection</span>
            </div>
          </div>
        </section>

        {/* Section 2: Licensing & Community */}
        <section className="sv-info-card glass-panel">
          <div className="sv-info-card-header">
            <div className="sv-info-icon-box">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="sv-info-section-title">Community & Apache 2.0 Licensing</h2>
              <span className="sv-info-section-sub">Permissive, commercial-friendly rights</span>
            </div>
          </div>

          <p className="sv-info-text">
            All user-submitted vector icons and community additions to SVG.IO are published under the permissive <strong>Apache License 2.0</strong> (along with corresponding trademark brand guidelines).
          </p>

          <p className="sv-info-text">
            Developers and designers are free to utilize these assets in commercial applications, open-source projects, design systems, websites, and mobile apps without restrictive licensing lock-in.
          </p>

          <div className="sv-info-highlights">
            <div className="sv-info-highlight-item">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Free for personal and commercial digital projects</span>
            </div>
            <div className="sv-info-highlight-item">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>No mandatory backlink or attribution required for client apps</span>
            </div>
            <div className="sv-info-highlight-item">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Automated packaging and CI/CD validation on every submission</span>
            </div>
          </div>
        </section>

        {/* Section 3: Liquid Glass Collection */}
        <section className="sv-info-card glass-panel">
          <div className="sv-info-card-header">
            <div className="sv-info-icon-box">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="sv-info-section-title">Liquid Glass & Multi-Variant Series</h2>
              <span className="sv-info-section-sub">Modern glassmorphism and multi-layer vector packs</span>
            </div>
          </div>

          <p className="sv-info-text">
            SVG.IO features specialized style categories, notably the <strong>Liquid Glass</strong> collection featuring over 160+ curated business, finance, chart, and social assets.
          </p>

          <p className="sv-info-text">
            In addition to standard monochrome vectors, the platform supports multi-variant packaging including default colored brand vectors, dark-mode variants, mono line art, and glassmorphism styling.
          </p>
        </section>

        {/* Section 4: Performance & Zero-Tracking Privacy */}
        <section className="sv-info-card glass-panel">
          <div className="sv-info-card-header">
            <div className="sv-info-icon-box">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="sv-info-section-title">Performance & Zero-Tracking Privacy</h2>
              <span className="sv-info-section-sub">Ultra-fast IndexedDB caching & no telemetry</span>
            </div>
          </div>

          <p className="sv-info-text">
            SVG.IO employs an instant <strong>IndexedDB local caching layer</strong> that pre-warms the 6,500+ icon registry into memory. Repeat visits load in less than 10 milliseconds with zero server latency.
          </p>

          <p className="sv-info-text">
            Your favorites, recent search history, and settings remain 100% in your local browser storage. We do not sell user data, track keystrokes, or employ invasive third-party telemetry cookies.
          </p>
        </section>
      </div>

      {/* Bottom CTA Card */}
      <div className="sv-info-cta-card glass-panel">
        <div className="sv-info-cta-content">
          <h3 className="sv-info-cta-title">Start Exploring Over {totalIcons.toLocaleString()}+ Icons</h3>
          <p className="sv-info-cta-desc">
            Search, customize colors, copy React/Vue/Svelte code, or contribute your own brand icon.
          </p>
        </div>

        <div className="sv-info-cta-actions">
          <button
            type="button"
            className="sv-info-btn-primary"
            onClick={() => onNavigate?.('icons')}>
            <Package size={15} />
            <span>Browse Catalog</span>
          </button>

          <button
            type="button"
            className="sv-info-btn-outline"
            onClick={() => onNavigate?.('submit')}>
            <Code2 size={15} />
            <span>Submit Vector Icon</span>
          </button>

          <a
            href="https://github.com/Orildo-Tech/SVG-IO"
            target="_blank"
            rel="noopener noreferrer"
            className="sv-info-btn-ghost">
            <Github size={15} />
            <span>Star on GitHub</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
