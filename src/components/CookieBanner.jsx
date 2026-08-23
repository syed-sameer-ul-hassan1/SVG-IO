import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X, ArrowRight } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'orildo_svg_cookie_consent';

export function CookieBanner({ onNavigate }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Show after 800ms for smooth initial load
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      document.cookie = `svgio_consent=accepted; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`;
    } catch (e) {}
    setIsVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only');
      document.cookie = `svgio_consent=essential; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`;
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="md-cookie-banner-wrap" role="region" aria-label="Cookie consent">
      <div className="md-cookie-banner-card">
        <div className="md-cookie-top-row">
          <div className="md-cookie-icon-box">
            <Cookie size={20} className="md-cookie-icon" />
          </div>

          <div className="md-cookie-text-box">
            <h3 className="md-cookie-title">We Value Your Privacy</h3>
            <p className="md-cookie-desc">
              SVG.IO uses essential client-side cookies and local storage to remember your custom theme, icon favorites, and search preferences. We do not sell your data or inject third-party ad trackers.
            </p>
          </div>

          <button
            type="button"
            className="md-cookie-close-btn"
            onClick={handleReject}
            title="Dismiss & keep essential only"
            aria-label="Close cookie banner"
          >
            <X size={15} />
          </button>
        </div>

        <div className="md-cookie-bottom-row">
          <button
            type="button"
            className="md-cookie-policy-link"
            onClick={() => onNavigate?.('privacy')}
          >
            <span>Learn more in Privacy Policy</span>
            <ArrowRight size={12} />
          </button>

          <div className="md-cookie-actions">
            <button
              type="button"
              className="md-btn md-btn-secondary md-cookie-reject-btn"
              onClick={handleReject}
            >
              <span>Reject Non-Essential</span>
            </button>

            <button
              type="button"
              className="md-btn md-btn-primary md-cookie-accept-btn"
              onClick={handleAccept}
            >
              <Check size={14} />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
