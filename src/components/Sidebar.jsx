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
  Search
} from 'lucide-react';

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
      {/* Top Main Navigation */}
      <div className="md-side-nav-group">
        <button
          className={`md-side-nav-item ${currentView === 'icons' && selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => {
            onNavigate?.('icons');
            onSelectCategory('all');
          }}
        >
          <LayoutGrid size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">All Icons</span>
        </button>

        <button
          className={`md-side-nav-item ${currentView === 'categories' ? 'active' : ''}`}
          onClick={() => onNavigate?.('categories')}
        >
          <FolderTree size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">Categories</span>
        </button>

        <button
          className={`md-side-nav-item ${currentView === 'favorites' ? 'active' : ''}`}
          onClick={() => onNavigate?.('favorites')}
        >
          <Heart size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">Favorites</span>
          {favoritesCount > 0 && (
            <span className="md-side-count-badge active">{favoritesCount}</span>
          )}
        </button>

        <button
          className={`md-side-nav-item has-sub ${currentView === 'extensions' ? 'active' : ''}`}
          onClick={() => onNavigate?.('extensions')}
        >
          <div className="md-side-nav-left">
            <Puzzle size={16} className="md-side-nav-icon" />
            <span className="md-side-nav-label">Extensions</span>
          </div>
          <ChevronRight size={13} className="md-side-chevron" />
        </button>

        <button
          className="md-side-nav-item"
          onClick={() => onOpenViewer?.()}
        >
          <Eye size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">Viewer</span>
        </button>

        <button
          className={`md-side-nav-item ${currentView === 'blog' ? 'active' : ''}`}
          onClick={() => onNavigate?.('blog')}
        >
          <FileText size={16} className="md-side-nav-icon" />
          <span className="md-side-nav-label">Blog</span>
        </button>
      </div>

      {/* Primary Submit Button */}
      <button
        className="md-side-submit-btn"
        onClick={() => onSubmitIconClick?.()}
      >
        <Plus size={15} />
        <span>Submit Icon</span>
      </button>

      {/* Featured Section */}
      <div className="md-side-section">
        <button
          className="md-side-section-header"
          onClick={() => setIsFeaturedOpen(!isFeaturedOpen)}
        >
          <span>FEATURED</span>
          <ChevronDown
            size={12}
            className={`md-side-collapse-chevron ${isFeaturedOpen ? 'open' : ''}`}
          />
        </button>

        {isFeaturedOpen && (
          <div className="md-side-featured-list">
            <button
              className={`md-side-featured-item ${selectedCategory === 'Orildo' ? 'active' : ''}`}
              onClick={() => onSelectCategory('Orildo')}
            >
              <div className="md-side-featured-left">
                <img 
                  src={theme === 'light' ? '/icons/orildo/mono.svg' : '/icons/orildo/default.svg'} 
                  alt="Orildo" 
                  width="13" 
                  height="13" 
                  style={{ objectFit: 'contain' }} 
                />
                <span>Orildo </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="md-side-section md-side-categories-section">
        <div className="md-side-section-header no-toggle">
          <span>CATEGORIES</span>
          <span className="md-side-total-cat-count">{categories.length}</span>
        </div>

        {/* Scrollable Categories List */}
        <div className="md-side-category-scroll">
          {filteredCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                className={`md-side-cat-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.name)}
                title={`${cat.name} (${cat.count || 0} icons)`}
              >
                <span className="md-side-cat-name">{cat.name}</span>
                <span className={`md-side-cat-count ${isSelected ? 'active' : ''}`}>
                  {cat.count || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
