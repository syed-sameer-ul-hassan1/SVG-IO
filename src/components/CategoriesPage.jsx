import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  Package,
  Grid,
  TrendingUp,
  Cpu,
  Globe,
  Code2,
  Share2,
  Database,
  Shield,
  Palette,
  Briefcase,
  Terminal,
  Compass,
  X
} from 'lucide-react';

// Dynamic icon helper based on category name
const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('ai') || n.includes('machine') || n.includes('neural')) return Cpu;
  if (n.includes('cloud') || n.includes('devops') || n.includes('infra')) return Globe;
  if (n.includes('develop') || n.includes('code') || n.includes('software') || n.includes('framework')) return Code2;
  if (n.includes('social') || n.includes('community') || n.includes('chat')) return Share2;
  if (n.includes('data') || n.includes('database') || n.includes('storage')) return Database;
  if (n.includes('security') || n.includes('auth') || n.includes('privacy')) return Shield;
  if (n.includes('design') || n.includes('creative') || n.includes('art') || n.includes('ui')) return Palette;
  if (n.includes('business') || n.includes('finance') || n.includes('payment') || n.includes('crypto')) return Briefcase;
  if (n.includes('cli') || n.includes('tool') || n.includes('terminal')) return Terminal;
  return Layers;
};

// Safe icon preview URL resolver
const getIconSvgUrl = (icon) => {
  if (!icon) return '';
  if (icon.variantPaths && typeof icon.variantPaths === 'object') {
    if (icon.variantPaths.default) return icon.variantPaths.default;
    const firstKey = Object.keys(icon.variantPaths)[0];
    if (firstKey && icon.variantPaths[firstKey]) return icon.variantPaths[firstKey];
  }
  if (icon.variants && typeof icon.variants === 'object' && !Array.isArray(icon.variants)) {
    if (icon.variants.default) return icon.variants.default;
    const firstKey = Object.keys(icon.variants)[0];
    if (firstKey && icon.variants[firstKey]) return icon.variants[firstKey];
  }
  if (icon.path) return icon.path;
  const s = icon.slug || icon.id;
  return `/icons/${s}/default.svg`;
};

export function CategoriesPage({
  categories = [],
  allIcons = [],
  onSelectCategory,
  onSelectIcon
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('count-desc'); // 'count-desc' | 'count-asc' | 'name-asc' | 'name-desc'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'popular' | 'tech' | 'design'

  // Total assets calculated
  const totalAssetsCount = useMemo(() => {
    return allIcons.length;
  }, [allIcons]);

  // Pre-index icons by category for O(1) lightning lookup
  const categoryIconMap = useMemo(() => {
    const map = {};
    for (const cat of categories) {
      map[cat.name] = [];
    }

    for (const icon of allIcons) {
      if (Array.isArray(icon.categories)) {
        for (const catName of icon.categories) {
          if (!map[catName]) map[catName] = [];
          if (map[catName].length < 8) {
            map[catName].push(icon);
          }
        }
      } else if (icon.category) {
        if (!map[icon.category]) map[icon.category] = [];
        if (map[icon.category].length < 8) {
          map[icon.category].push(icon);
        }
      }
    }
    return map;
  }, [categories, allIcons]);

  // Filtered and sorted category list
  const filteredCategories = useMemo(() => {
    let list = categories.filter((c) => {
      if (!c.name) return false;
      if (!search.trim()) return true;
      return c.name.toLowerCase().includes(search.toLowerCase().trim());
    });

    // Quick tag filters
    if (activeFilter === 'popular') {
      list = list.filter((c) => (c.count || 0) >= 20);
    } else if (activeFilter === 'tech') {
      list = list.filter((c) => {
        const n = c.name.toLowerCase();
        return n.includes('dev') || n.includes('cloud') || n.includes('software') || n.includes('code') || n.includes('data') || n.includes('ai');
      });
    } else if (activeFilter === 'creative') {
      list = list.filter((c) => {
        const n = c.name.toLowerCase();
        return n.includes('design') || n.includes('art') || n.includes('media') || n.includes('social') || n.includes('brand');
      });
    }

    if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'count-asc') {
      list.sort((a, b) => (a.count || 0) - (b.count || 0));
    } else {
      list.sort((a, b) => (b.count || 0) - (a.count || 0));
    }

    return list;
  }, [categories, search, sortBy, activeFilter]);

  return (
    <div className="md-categories-page">
      {/* Top Hero Banner */}
      <div className="md-cat-hero-banner">
        <div className="md-cat-hero-glow" aria-hidden="true" />

        <div className="md-cat-hero-content">
          <div className="md-hero-pill-badge badge-subtle-primary">
            <FolderTree size={13} />
            <span>Category Explorer</span>
          </div>

          <h1 className="md-cat-hero-title">
            Explore <span className="text-orange">{categories.length} Curated</span> Categories
          </h1>

          <p className="md-cat-hero-desc">
            Discover over <strong>{totalAssetsCount.toLocaleString()}+</strong> high-quality brand logos, developer tools, cloud platforms, and vector icons organized by topic.
          </p>

          {/* Quick Metrics Bar */}
          <div className="md-cat-stats-row">
            <div className="md-cat-stat-chip">
              <span className="md-cat-stat-val">{categories.length}</span>
              <span className="md-cat-stat-lbl">Categories</span>
            </div>
            <div className="md-cat-stat-divider" />
            <div className="md-cat-stat-chip">
              <span className="md-cat-stat-val">{totalAssetsCount.toLocaleString()}+</span>
              <span className="md-cat-stat-lbl">Vector Icons</span>
            </div>
            <div className="md-cat-stat-divider" />
            <div className="md-cat-stat-chip">
              <span className="md-cat-stat-val">100%</span>
              <span className="md-cat-stat-lbl">Free & Open</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolstrip */}
        <div className="md-cat-toolbar">
          <div className="md-cat-search-wrap">
            <Search size={15} className="md-cat-search-icon" />
            <input
              type="text"
              placeholder={`Search ${categories.length} categories...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md-cat-search-input"
            />
            {search && (
              <button
                className="md-cat-search-clear"
                onClick={() => setSearch('')}
                title="Clear search"
                aria-label="Clear category search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="md-cat-filter-pills">
            <button
              className={`md-cat-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({categories.length})
            </button>
            <button
              className={`md-cat-pill ${activeFilter === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveFilter('popular')}
            >
              <TrendingUp size={12} />
              Popular
            </button>
            <button
              className={`md-cat-pill ${activeFilter === 'tech' ? 'active' : ''}`}
              onClick={() => setActiveFilter('tech')}
            >
              <Code2 size={12} />
              Tech & Dev
            </button>
            <button
              className={`md-cat-pill ${activeFilter === 'creative' ? 'active' : ''}`}
              onClick={() => setActiveFilter('creative')}
            >
              <Palette size={12} />
              Design & Social
            </button>
          </div>

          <div className="md-cat-sort-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="md-cat-sort-select"
              aria-label="Sort categories"
            >
              <option value="count-desc">Sort: Most Icons</option>
              <option value="count-asc">Sort: Fewest Icons</option>
              <option value="name-asc">Sort: A to Z</option>
              <option value="name-desc">Sort: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="md-cat-card-grid">
          {filteredCategories.map((cat) => {
            const previewIcons = categoryIconMap[cat.name] || [];
            const CatIconComponent = getCategoryIcon(cat.name);

            return (
              <div
                key={cat.name}
                className="md-cat-premium-card"
                onClick={() => onSelectCategory(cat.name)}
                tabIndex={0}
                role="button"
                aria-label={`Explore ${cat.name} with ${cat.count || 0} icons`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCategory(cat.name);
                  }
                }}
              >
                <div className="md-cat-card-header">
                  <div className="md-cat-icon-badge">
                    <CatIconComponent size={16} />
                  </div>

                  <div className="md-cat-header-text">
                    <h2 className="md-cat-name" title={cat.name}>
                      {cat.name}
                    </h2>
                    <span className="md-cat-count-badge">
                      {cat.count || 0} {cat.count === 1 ? 'vector' : 'vectors'}
                    </span>
                  </div>

                  <div className="md-cat-action-arrow" aria-hidden="true">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* 6-Tile Live Icon Previews with Robust Error Recovery */}
                <div className="md-cat-preview-cluster">
                  {previewIcons.slice(0, 6).map((icon) => {
                    const svgUrl = getIconSvgUrl(icon);
                    const brandColor = icon.hex ? (icon.hex.startsWith('#') ? icon.hex : `#${icon.hex}`) : '#FF5F02';

                    return (
                      <div
                        key={icon.id}
                        className="md-cat-preview-item"
                        title={`${icon.name} (${icon.id})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIcon?.(icon);
                        }}
                      >
                        <img
                          src={svgUrl}
                          alt={icon.name}
                          className="md-cat-preview-img"
                          loading="lazy"
                          width="24"
                          height="24"
                          onError={(e) => {
                            // Fallback to stylized letter avatar if SVG path isn't local
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          className="md-cat-fallback-avatar"
                          style={{
                            display: 'none',
                            backgroundColor: `${brandColor}20`,
                            color: brandColor
                          }}
                        >
                          {icon.name?.charAt(0) || '•'}
                        </div>
                      </div>
                    );
                  })}

                  {previewIcons.length === 0 && (
                    <div className="md-cat-empty-preview">
                      <Layers size={16} opacity={0.4} />
                      <span>Collection preview ready</span>
                    </div>
                  )}
                </div>

                <div className="md-cat-card-footer">
                  <span className="md-cat-explore-link">
                    Explore collection
                    <ArrowRight size={12} className="md-cat-link-icon" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="md-cat-no-results">
          <div className="md-cat-no-results-icon">
            <Compass size={32} />
          </div>
          <h3 className="md-cat-no-results-title">No categories found</h3>
          <p className="md-cat-no-results-desc">
            No category matching "{search}". Try searching for another topic or reset your filters.
          </p>
          <button
            className="md-btn md-btn-primary"
            onClick={() => {
              setSearch('');
              setActiveFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;

