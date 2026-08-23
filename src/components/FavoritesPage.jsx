import React, { useState, useMemo } from 'react';
import {
  Heart,
  Download,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  Search,
  LayoutGrid,
  Grid3X3,
  List,
  Archive,
  Code2
} from 'lucide-react';
import IconCard from './IconCard';
import { downloadBulkZip, getSvgContent, convertSvgToReact } from '../utils/exportUtils';

export function FavoritesPage({
  favorites = [],
  onSelectIcon,
  favoritesSet,
  onToggleFavorite,
  onClearFavorites,
  onExploreAll,
  onShowToast
}) {
  const [search, setSearch] = useState('');
  const [layoutMode, setLayoutMode] = useState('comfortable'); // 'comfortable' | 'compact' | 'list'
  const [isZipping, setIsZipping] = useState(false);
  const [isCopyingAllJsx, setIsCopyingAllJsx] = useState(false);

  const getVariants = (fav) => (Array.isArray(fav?.variants) ? fav.variants : Object.keys(fav?.variants || {}));

  // Filter favorites by search
  const filteredFavorites = useMemo(() => {
    if (!search.trim()) return favorites;
    const q = search.toLowerCase().trim();
    return favorites.filter(
      (icon) =>
        icon.name.toLowerCase().includes(q) ||
        icon.id.toLowerCase().includes(q) ||
        icon.category?.toLowerCase().includes(q)
    );
  }, [favorites, search]);

  // Bulk ZIP Download
  const handleDownloadAllZip = async () => {
    if (favorites.length === 0) return;
    setIsZipping(true);
    try {
      const items = favorites.map((fav) => {
        const vList = getVariants(fav);
        return {
          id: fav.id,
          name: fav.name,
          variant: vList.includes('color') ? 'color' : vList[0] || 'default'
        };
      });
      await downloadBulkZip(items, `thesvg-collection-${favorites.length}-icons.zip`);
      onShowToast?.({
        type: 'success',
        title: 'ZIP Archive Exported',
        message: `${favorites.length} icons bundled into archive.`
      });
    } catch (err) {
      console.error(err);
      onShowToast?.({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not create ZIP bundle.'
      });
    } finally {
      setIsZipping(false);
    }
  };

  // Bulk Copy JSX Bundle
  const handleCopyAllJsx = async () => {
    if (favorites.length === 0) return;
    setIsCopyingAllJsx(true);
    try {
      const parts = [];
      for (const fav of favorites) {
        const vList = getVariants(fav);
        const variant = vList.includes('color') ? 'color' : vList[0] || 'default';
        const rawSvg = await getSvgContent(fav.id, variant);
        if (rawSvg) {
          const jsx = convertSvgToReact(rawSvg, fav.name);
          parts.push(`// --- ${fav.name} (${variant}) ---\n${jsx}`);
        }
      }
      const fullBundle = parts.join('\n\n');
      await navigator.clipboard.writeText(fullBundle);
      onShowToast?.({
        type: 'success',
        title: 'JSX Components Copied',
        message: `${favorites.length} React components copied to clipboard.`
      });
    } catch (err) {
      console.error(err);
      onShowToast?.({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not generate JSX bundle.'
      });
    } finally {
      setTimeout(() => setIsCopyingAllJsx(false), 1500);
    }
  };

  return (
    <div className="md-favorites-page">
      {/* Header Banner */}
      <div className="md-page-header-banner glass-panel">
        <div className="md-page-header-text">
          <div className="md-hero-pill-badge badge-subtle-primary" style={{ width: 'fit-content', marginBottom: 12 }}>
            <Heart size={13} fill="#FF5F02" color="#FF5F02" />
            <span>Saved Collection • {favorites.length} Vectors</span>
          </div>

          <h1 className="md-page-header-title">
            Your Personal <span className="text-orange">Vector Collection</span>
          </h1>

          <p className="md-page-header-desc">
            Manage, inspect, and bulk export all your saved brand logos and vector assets.
          </p>
        </div>

        {/* Batch Action Toolbar when favorites exist */}
        {favorites.length > 0 && (
          <div className="md-fav-actions-row">
            <button
              className="md-fav-btn primary"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
            >
              <Archive size={14} />
              <span>{isZipping ? 'Creating Archive...' : `Download ${favorites.length} Icons (.ZIP)`}</span>
            </button>

            <button
              className="md-fav-btn secondary"
              onClick={handleCopyAllJsx}
              disabled={isCopyingAllJsx}
            >
              {isCopyingAllJsx ? <Check size={14} color="#10B981" /> : <Code2 size={14} />}
              <span>{isCopyingAllJsx ? 'Copied Bundle!' : 'Copy All JSX'}</span>
            </button>

            <button
              className="md-fav-btn danger"
              onClick={() => {
                if (window.confirm(`Are you sure you want to remove all ${favorites.length} saved icons?`)) {
                  onClearFavorites?.();
                }
              }}
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State Card when no favorites are saved */}
      {favorites.length === 0 ? (
        <div className="md-fav-empty-card glass-panel">
          <div className="md-fav-empty-icon-wrap">
            <Heart size={44} className="md-fav-empty-heart" />
          </div>
          <h3 className="md-fav-empty-title">Your Collection is Empty</h3>
          <p className="md-fav-empty-desc">
            Browse through over 7,700+ verified brand vectors and developer icons. Click the heart icon on any vector card to save it here for quick 1-click batch exports.
          </p>
          <button
            className="md-fav-explore-btn"
            onClick={() => onExploreAll?.()}
          >
            <span>Explore All Icons</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <>
          {/* Controls Bar */}
          <div className="md-toolbar">
            <div className="md-toolbar-stats">
              Showing <strong>{filteredFavorites.length}</strong> of {favorites.length} saved vectors
            </div>

            <div className="md-toolbar-actions">
              {/* Local Search */}
              <div className="md-cat-search-box" style={{ minWidth: 200, height: 34 }}>
                <Search size={13} className="md-cat-search-icon" />
                <input
                  type="text"
                  placeholder="Filter saved icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="md-cat-search-input"
                />
              </div>

              {/* View Switcher */}
              <div className="md-segmented-btn-group">
                <button
                  className={`md-segment-btn ${layoutMode === 'comfortable' ? 'active' : ''}`}
                  onClick={() => setLayoutMode('comfortable')}
                  title="Comfortable Grid"
                  aria-label="Comfortable Grid"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  className={`md-segment-btn ${layoutMode === 'compact' ? 'active' : ''}`}
                  onClick={() => setLayoutMode('compact')}
                  title="Compact Grid"
                  aria-label="Compact Grid"
                >
                  <Grid3X3 size={15} />
                </button>
                <button
                  className={`md-segment-btn ${layoutMode === 'list' ? 'active' : ''}`}
                  onClick={() => setLayoutMode('list')}
                  title="List View"
                  aria-label="List View"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Saved Icons */}
          <div className={`md-icons-grid layout-${layoutMode}`}>
            {filteredFavorites.map((icon) => (
              <IconCard
                key={icon.id}
                icon={icon}
                onSelect={(ic, variant) => onSelectIcon?.(ic, variant)}
                isFavorite={favoritesSet?.has(icon.id)}
                onToggleFavorite={onToggleFavorite}
                onShowToast={onShowToast}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default FavoritesPage;
