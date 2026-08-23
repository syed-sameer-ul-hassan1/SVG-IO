import React, { useState, useMemo } from 'react';
import { FolderTree, Search, ArrowRight, Sparkles, Layers, Package, Download } from 'lucide-react';

export function CategoriesPage({
  categories = [],
  allIcons = [],
  onSelectCategory,
  onSelectIcon
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('count'); // 'count' | 'name'

  // Map category to preview icons
  const categoryMap = useMemo(() => {
    const map = {};
    for (const cat of categories) {
      map[cat.name] = allIcons.filter((i) => i.category === cat.name).slice(0, 4);
    }
    return map;
  }, [categories, allIcons]);

  const filteredCategories = useMemo(() => {
    let list = categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim())
    );

    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => (b.count || 0) - (a.count || 0));
    }

    return list;
  }, [categories, search, sortBy]);

  return (
    <div className="md-categories-page">
      {/* Header Banner */}
      <div className="md-page-header-banner glass-panel">
        <div className="md-page-header-text">
          <div className="md-hero-pill-badge badge-subtle-primary" style={{ width: 'fit-content', marginBottom: 12 }}>
            <FolderTree size={13} />
            <span>Category Directory</span>
          </div>
          <h1 className="md-page-header-title">
            Explore {categories.length} Curated <span className="text-orange">Vector Categories</span>
          </h1>
          <p className="md-page-header-desc">
            Browse through categorized brand logos, developer tools, social networks, and design vector assets.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="md-cat-controls-row">
          <div className="md-cat-search-box">
            <Search size={14} className="md-cat-search-icon" />
            <input
              type="text"
              placeholder="Filter categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md-cat-search-input"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="md-select"
          >
            <option value="count">Sort: Most Icons</option>
            <option value="name">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="md-categories-grid">
        {filteredCategories.map((cat) => {
          const previewIcons = categoryMap[cat.name] || [];
          return (
            <div
              key={cat.name}
              className="md-category-card glass-panel"
              onClick={() => onSelectCategory(cat.name)}
            >
              <div className="md-cat-card-top">
                <div className="md-cat-card-info">
                  <h3 className="md-cat-card-title">{cat.name}</h3>
                  <span className="md-cat-card-count">{cat.count || 0} vectors</span>
                </div>
                <button
                  className="md-cat-browse-btn"
                  title={`View ${cat.name} icons`}
                  aria-label={`View ${cat.name} icons`}
                >
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Preview 4 Icon Tiles */}
              <div className="md-cat-preview-mosaic">
                {previewIcons.map((icon) => {
                  const svgUrl = icon.variants?.default?.url || `/icons/${icon.id}.svg`;
                  return (
                    <div
                      key={icon.id}
                      className="md-cat-icon-tile"
                      title={icon.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIcon?.(icon);
                      }}
                    >
                      <img
                        src={svgUrl}
                        alt={icon.name}
                        className="md-cat-tile-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  );
                })}
                {previewIcons.length === 0 && (
                  <div className="md-cat-empty-mosaic">
                    <Layers size={20} opacity={0.4} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoriesPage;
