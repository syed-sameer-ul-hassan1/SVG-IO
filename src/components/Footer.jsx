import React from 'react';
import { Sparkles, Flame, Star, ExternalLink, ArrowUp, Github, Code2, HeartHandshake } from 'lucide-react';

export function Footer({
  theme = 'dark',
  totalIcons = 6514,
  onSelectCategory,
  onSubmitIconClick,
  onNavigate
}) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logoSrc = theme === 'light' ? '/assets/logo-light.svg' : '/assets/logo-dark.svg';
  const wordmarkSrc = theme === 'light' ? '/assets/wordmark-light.svg' : '/assets/wordmark-dark.svg';
  const orildoIconSrc = theme === 'light' ? '/assets/orildo-light.svg' : '/assets/orildo-dark.svg';

  return (
    <footer className="md-main-footer-card glass-panel" role="contentinfo">
      {}
      <div className="md-footer-top-grid">
        {}
        <div className="md-footer-brand-col">
          <a
            href="https://svg.io.orildo.tech"
            className="md-footer-logo-row"
            title="Visit SvgIo">
            
            <img
              src={wordmarkSrc}
              alt="SvgIo Logo"
              height="26"
              style={{ display: 'block', height: '26px', width: 'auto', objectFit: 'contain' }} />
            
          </a>

          <p className="md-footer-brand-desc">
            The Premier SVG Brand & Developer Icon Library. Open-source, fast, and community-driven.
          </p>

          <span className="md-footer-project-tag">
            Powered by <a href="https://orildo.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#FF5F02', fontWeight: 700 }}>Orildo</a>
          </span>

          {}
          <div className="md-footer-eco-badges">
            <a href="https://github.com/syed-sameer-ul-hassan/SVG.IO" target="_blank" rel="noopener noreferrer" className="md-eco-badge" title="GitHub">
              <Github size={14} />
            </a>
            <a href="https://www.npmjs.com/package/@hummingbirdui/hummingbird" target="_blank" rel="noopener noreferrer" className="md-eco-badge" title="NPM Package">
              <span style={{ fontSize: 10, fontWeight: 800 }}>NPM</span>
            </a>
            <a href="https://figma.com" target="_blank" rel="noopener noreferrer" className="md-eco-badge" title="Figma">
              <span style={{ fontSize: 10, fontWeight: 800 }}>FIG</span>
            </a>
            <a href="https://orildo.dev" target="_blank" rel="noopener noreferrer" className="md-eco-badge" title="Orildo Official">
              <img src={orildoIconSrc} alt="Orildo" width="14" height="14" style={{ objectFit: 'contain' }} />
            </a>
          </div>

          {}
          <a
            href="https://github.com/syed-sameer-ul-hassan/SVG.IO"
            target="_blank"
            rel="noopener noreferrer"
            className="md-footer-ph-card"
            title="Star & Follow on GitHub">
            
            <div className="md-ph-left">
              <div className="md-ph-logo md-gh-logo">
                <Github size={13} />
              </div>
              <div className="md-ph-text">
                <span className="md-ph-sub">FOLLOW ON</span>
                <span className="md-ph-main">GitHub Org</span>
              </div>
            </div>
            <Star size={14} className="md-ph-star" />
          </a>
        </div>

        {}
        <div className="md-footer-nav-col">
          <h4 className="md-footer-col-title">PRODUCT</h4>
          <ul className="md-footer-links">
            <li><button onClick={() => onNavigate?.('icons')}>Browse Icons</button></li>
            <li><button onClick={() => onNavigate?.('categories')}>Categories</button></li>
            <li><button onClick={() => onNavigate?.('extensions')}>Extensions</button></li>
            <li><button onClick={() => onSubmitIconClick ? onSubmitIconClick() : onNavigate?.('submit')}>Submit Icon</button></li>
            <li><button onClick={() => onNavigate?.('blog')}>Blog & Guides</button></li>
          </ul>
        </div>

        {}
        <div className="md-footer-nav-col">
          <h4 className="md-footer-col-title">RESOURCES</h4>
          <ul className="md-footer-links">
            <li><button onClick={() => onNavigate?.('extensions')}>Figma Plugin</button></li>
            <li><button onClick={() => onNavigate?.('extensions')}>VS Code Extension</button></li>
            <li><button onClick={() => onNavigate?.('status')}>System Status</button></li>
            <li><a href="https://www.npmjs.com/package/@hummingbirdui/hummingbird" target="_blank" rel="noopener noreferrer">npm Package</a></li>
            <li><button onClick={() => onNavigate?.('404')}>404 Preview</button></li>
          </ul>
        </div>

        {}
        <div className="md-footer-nav-col">
          <h4 className="md-footer-col-title">COMMUNITY</h4>
          <ul className="md-footer-links">
            <li><a href="https://github.com/syed-sameer-ul-hassan/SVG.IO" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://github.com/syed-sameer-ul-hassan/SVG.IO/issues" target="_blank" rel="noopener noreferrer">Issues</a></li>
            <li><a href="https://github.com/syed-sameer-ul-hassan/SVG.IO/discussions" target="_blank" rel="noopener noreferrer">Discussions</a></li>
            <li><a href="https://github.com/syed-sameer-ul-hassan/SVG.IO/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contributing</a></li>
          </ul>
        </div>

        {}
        <div className="md-footer-nav-col">
          <h4 className="md-footer-col-title">LEGAL</h4>
          <ul className="md-footer-links">
            <li><button onClick={() => onNavigate?.('privacy')}>Privacy Policy</button></li>
            <li><button onClick={() => onNavigate?.('terms')}>Terms of Service</button></li>
            <li><button onClick={() => onNavigate?.('trademark')}>Trademark Policy</button></li>
            <li><button onClick={() => onNavigate?.('status')}>Uptime & Health</button></li>
          </ul>
        </div>
      </div>

      {}
      <div className="md-footer-divider-line" />

      {}
      <div className="md-footer-split-credits">
        {}
        <div className="md-credits-section">
          <span className="md-credits-label">POWERED BY</span>
          <a
            href="https://orildo.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="md-credits-chip"
            title="Visit Orildo">
            
            <div className="md-credits-icon-wrap">
              <img src={orildoIconSrc} alt="Orildo" width="22" height="22" style={{ objectFit: 'contain' }} />
            </div>
            <div className="md-credits-info">
              <span className="md-credits-title">orildo.dev</span>
              <span className="md-credits-sub">Vector Engine & Design Studio</span>
            </div>
          </a>
        </div>

        {}
        <div className="md-credits-center-divider" />

        {}
        <div className="md-credits-section">
          <span className="md-credits-label">DEVELOPED BY</span>
          <a
            href="https://sameer.orildo.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="md-credits-chip"
            title="Visit Syed Sameer Ul Hassan's Portfolio">
            
            <div className="md-credits-icon-wrap">
              <img src={orildoIconSrc} alt="Syed Sameer Ul Hassan" width="22" height="22" style={{ objectFit: 'contain' }} />
            </div>
            <div className="md-credits-info">
              <span className="md-credits-title">Syed Sameer Ul Hassan</span>
              <span className="md-credits-sub">sameer.orildo.dev</span>
            </div>
          </a>
        </div>
      </div>

      {}
      <div className="md-footer-bottom-row">
        <span className="md-footer-copy-text">
          © {new Date().getFullYear()} <a href="https://orildo.dev" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600 }}>Orildo</a>. All rights reserved. Developed by <a href="https://sameer.orildo.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#FF5F02', fontWeight: 600 }}>Syed Sameer Ul Hassan</a>.
        </span>

        <div className="md-footer-disclaimer">
          <span>All brand logos and trademarks belong to their respective owners.</span>
          <a href="#trademark" className="md-footer-sub-link">Trademark Policy</a>
          <span>|</span>
          <span>Built with Orildo Design Studio</span>
        </div>
      </div>
    </footer>);

}

export default Footer;