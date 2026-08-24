import React, { useState } from 'react';
import {
  LayoutGrid,
  FolderTree,
  Heart,
  Puzzle,
  Eye,
  FileText,
  Plus,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Search } from
'lucide-react';

export function Sidebar({
  theme = 'dark',
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  currentView = 'icons',
  onNavigate,
  favoritesCount = 0,
  onOpenFavorites,
  onSubmitIconClick,
  onOpenViewer,
  totalIcons = 0
}) {
  const [isFeaturedOpen, setIsFeaturedOpen] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');

  const filteredCategories = categories.filter((cat) =>
  cat.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  return (
    <aside className="md-side-menu glass-panel">
      {}
      <div className="md-side-nav-group">
        <button
          className={`md-side-nav-item ${currentView === 'icons' && selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => {
            onNavigate?.('icons');
            onSelectCategory('all');
          }}>
          
          <LayoutGrid size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">All Icons</span>
        </button>

        <button
          className={`md-side-nav-item ${currentView === 'categories' ? 'active' : ''}`}
          onClick={() => onNavigate?.('categories')}>
          
          <FolderTree size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">Categories</span>
        </button>

        <button
          className={`md-side-nav-item ${currentView === 'favorites' ? 'active' : ''}`}
          onClick={() => onNavigate?.('favorites')}
          title={favoritesCount > 0 ? `${favoritesCount} Saved Icons` : 'Favorites'}>
          
          <div className="md-side-nav-left">
            <Heart size={16} className="md-side-nav-icon" />
            <span className="md-side-nav-label">Favorites</span>
          </div>
          {favoritesCount > 0 &&
          <span className="md-side-fav-dot" aria-label={`${favoritesCount} favorites`} />
          }
        </button>

        <button
          className="md-side-nav-item"
          onClick={() => onOpenViewer?.()}>
          
          <Eye size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">Viewer</span>
        </button>

        <button
          className={`md-side-nav-item ${currentView === 'blog' ? 'active' : ''}`}
          onClick={() => onNavigate?.('blog')}>
          
          <FileText size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">Blog</span>
        </button>
      </div>

      {}
      <button
        className="md-side-submit-btn"
        onClick={() => onSubmitIconClick?.()}>
        
        <Plus size={15} />
        <span>Submit Icon</span>
      </button>

      {}
      <div className="md-side-section">
        <button
          className="md-side-section-header"
          onClick={() => setIsFeaturedOpen(!isFeaturedOpen)}>
          
          <span>FEATURED</span>
          <ChevronDown
            size={12}
            className={`md-side-collapse-chevron ${isFeaturedOpen ? 'open' : ''}`} />
          
        </button>

        {isFeaturedOpen &&
        <div className="md-side-featured-list">
            <button
            className={`md-side-featured-item ${selectedCategory === 'Orildo' ? 'active' : ''}`}
            onClick={() => onSelectCategory('Orildo')}>
            
              <div className="md-side-featured-left">
                <img
                src={theme === 'light' ? '/assets/orildo-light.svg' : '/assets/orildo-dark.svg'}
                alt="Orildo"
                width="14"
                height="14"
                style={{ objectFit: 'contain' }} />
              
                <span>Orildo </span>
              </div>
            </button>
          </div>
        }
      </div>

      {}
      <div className="md-side-section md-side-categories-section">
        <div className="md-side-section-header no-toggle">
          <span>CATEGORIES</span>
          <button
            type="button"
            className="md-side-view-all-link"
            onClick={() => onNavigate?.('categories')}
            title="Open Full Categories Directory">
            
            <span>View All ({categories.length})</span>
            <ChevronRight size={11} />
          </button>
        </div>

        {}
        <div className="md-side-cat-search-box">
          <Search size={12} className="md-side-cat-search-icon" />
          <input
            type="text"
            placeholder="Filter categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="md-side-cat-search-input"
            aria-label="Filter sidebar categories" />
          
          {categorySearch &&
          <button
            type="button"
            className="md-side-cat-search-clear"
            onClick={() => setCategorySearch('')}
            title="Clear filter">
            
              ×
            </button>
          }
        </div>

        {}
        <div className="md-side-category-scroll">
          <button
            className={`md-side-cat-item ${currentView === 'icons' && selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              onNavigate?.('icons');
              onSelectCategory('all');
            }}>
            
            <span className="md-side-cat-name">All Icons</span>
            <span className="md-side-cat-count">
              {totalIcons || categories.reduce((sum, c) => sum + (c.count || 0), 0)}
            </span>
          </button>

          {filteredCategories.map((cat) => {
            const isSelected = currentView === 'icons' && selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                className={`md-side-cat-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onNavigate?.('icons');
                  onSelectCategory(cat.name);
                }}
                title={`${cat.name} (${cat.count || 0} icons)`}>
                
                <span className="md-side-cat-name">{cat.name}</span>
                <span className={`md-side-cat-count ${isSelected ? 'active' : ''}`}>
                  {cat.count || 0}
                </span>
              </button>);

          })}

          {filteredCategories.length === 0 &&
          <div className="md-side-empty-cat">
              <span>No categories matching "{categorySearch}"</span>
            </div>
          }
        </div>
      </div>
    </aside>);

}

export default Sidebar;