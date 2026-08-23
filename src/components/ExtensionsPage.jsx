import React from 'react';
import { Puzzle, Clock, ArrowRight } from 'lucide-react';

export function ExtensionsPage({ onExploreAll }) {
  return (
    <div className="md-placeholder-page">
      <div className="md-placeholder-card glass-panel">
        <div className="md-placeholder-icon-wrap">
          <Puzzle size={40} className="md-placeholder-icon" />
        </div>
        <div className="md-hero-pill-badge badge-subtle-primary" style={{ marginBottom: 12 }}>
          <Clock size={12} />
          <span>Under Development</span>
        </div>
        <h1 className="md-placeholder-title">Not Available Right Now</h1>
        <p className="md-placeholder-desc">
          Official browser, Figma, and VS Code extensions are currently being upgraded for the next release. Check back soon for updates.
        </p>
        {onExploreAll && (
          <button className="md-fav-explore-btn" onClick={onExploreAll}>
            <span>Explore All Icons</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default ExtensionsPage;
