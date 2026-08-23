import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import IconGrid from './components/IconGrid';
import IconDetailPage from './components/IconDetailPage';
import CategoriesPage from './components/CategoriesPage';
import ExtensionsPage from './components/ExtensionsPage';
import BlogPage from './components/BlogPage';
import FavoritesPage from './components/FavoritesPage';
import SubmitPage from './components/SubmitPage';
import CommunityBanner from './components/CommunityBanner';
import Footer from './components/Footer';

import { saveSearchHistoryItem } from './utils/historyUtils';

export function App() {
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentView, setCurrentView] = useState('icons'); // 'icons' | 'categories' | 'extensions' | 'blog' | 'favorites' | 'submit'

  // Selected Icon View Page State
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('default');

  // Favorites State
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('orildo_svg_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast / Snackbar State
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('orildo_svg_theme') || 'dark';
  });

  const searchInputRef = useRef(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('orildo_svg_theme', theme);
  }, [theme]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('orildo_svg_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [favorites]);

  // Fetch metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch('/icons-metadata.json');
        if (!res.ok) throw new Error('Failed to load icons metadata');
        const data = await res.json();
        setMetadata(data);
      } catch (err) {
        console.error('Error loading metadata:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetadata();
  }, []);

  // Global shortcut '/' and ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSelectedIcon(null);
        setCurrentView('icons');
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSelectedIcon(null);
        setCurrentView('icons');
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && selectedIcon) {
        setSelectedIcon(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIcon]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (toastData) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(toastData);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const favoritesSet = useMemo(() => {
    return new Set(favorites.map((f) => f.id));
  }, [favorites]);

  const toggleFavorite = (icon) => {
    if (favoritesSet.has(icon.id)) {
      setFavorites((prev) => prev.filter((i) => i.id !== icon.id));
      showToast({
        type: 'info',
        title: 'Removed from Collection',
        message: `${icon.name} removed.`
      });
    } else {
      setFavorites((prev) => [...prev, icon]);
      showToast({
        type: 'success',
        title: 'Saved to Collection',
        message: `${icon.name} added.`
      });
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
    showToast({
      type: 'info',
      title: 'Collection Cleared',
      message: 'All saved icons removed.'
    });
  };

  const handleSelectIcon = (icon, variant = 'default') => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      saveSearchHistoryItem(searchQuery);
    }
    setSelectedIcon(icon);
    setSelectedVariant(variant);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedIcon(null);
    setCurrentView('icons');
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedIcon(null);
    setCurrentView('icons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedIcon(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute categories with real icon counts
  const categoriesWithCounts = useMemo(() => {
    if (!metadata || !metadata.icons) return [];
    const counts = {};
    for (const icon of metadata.icons) {
      if (icon.category) {
        counts[icon.category] = (counts[icon.category] || 0) + 1;
      }
    }
    const list = Object.keys(counts).map((name) => ({
      name,
      count: counts[name]
    }));
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [metadata]);

  // Filter icons
  const filteredIcons = useMemo(() => {
    if (!metadata || !metadata.icons) return [];

    let list = metadata.icons;

    if (selectedCategory === 'Orildo') {
      list = list.filter(
        (icon) =>
          icon.id.toLowerCase() === 'orildo' ||
          icon.name.toLowerCase().includes('orildo')
      );
    } else if (selectedCategory === 'Google 2026') {
      list = list.filter(
        (icon) =>
          icon.id.toLowerCase().includes('google') ||
          icon.name.toLowerCase().includes('google') ||
          icon.id.toLowerCase().includes('gcp') ||
          icon.name.toLowerCase().includes('gemini') ||
          icon.name.toLowerCase().includes('deepmind') ||
          icon.name.toLowerCase().includes('colab')
      );
    } else if (selectedCategory !== 'all') {
      list = list.filter((icon) => icon.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (icon) =>
          icon.name.toLowerCase().includes(q) ||
          icon.id.toLowerCase().includes(q) ||
          icon.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [metadata, selectedCategory, searchQuery]);

  const totalCount = metadata?.totalIcons || metadata?.icons?.length || 0;

  const handleSubmitIconModal = () => {
    handleNavigate('submit');
  };

  const handleIconAdded = (newIcon) => {
    if (!newIcon) return;
    setMetadata((prev) => {
      if (!prev) return prev;
      const icons = [newIcon, ...(prev.icons || []).filter((i) => i.id !== newIcon.id && i.slug !== newIcon.slug)];
      return {
        ...prev,
        totalIcons: icons.length,
        icons
      };
    });
    handleSelectIcon(newIcon);
  };

  return (
    <div className="md-page-wrapper">
      {/* Top App Bar with Search */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        favoritesCount={favorites.length}
        openFavorites={() => handleNavigate('favorites')}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q) {
            setSelectedIcon(null);
            setCurrentView('icons');
          }
        }}
        totalIcons={totalCount}
        searchInputRef={searchInputRef}
        onNavigate={handleNavigate}
        onSubmitIconClick={handleSubmitIconModal}
      />

      {/* App Shell with Sidebar & Main Content */}
      <div className="md-app-layout">
        {/* Left Side Menu */}
        <Sidebar
          theme={theme}
          categories={categoriesWithCounts}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          currentView={currentView}
          onNavigate={handleNavigate}
          favoritesCount={favorites.length}
          onOpenFavorites={() => handleNavigate('favorites')}
          onSubmitIconClick={handleSubmitIconModal}
          onOpenViewer={() => {
            if (filteredIcons.length > 0) {
              handleSelectIcon(filteredIcons[0]);
            }
          }}
          totalIcons={totalCount}
        />

        {/* Main Content Area */}
        <main className="md-main-content">
          {/* If an icon is selected, show the full IconDetailPage */}
          {selectedIcon ? (
            <IconDetailPage
              icon={selectedIcon}
              initialVariant={selectedVariant}
              allIcons={metadata?.icons || []}
              onBack={() => setSelectedIcon(null)}
              onSelectIcon={handleSelectIcon}
              isFavorite={favoritesSet.has(selectedIcon.id)}
              onToggleFavorite={toggleFavorite}
              onShowToast={showToast}
            />
          ) : currentView === 'categories' ? (
            <CategoriesPage
              categories={categoriesWithCounts}
              allIcons={metadata?.icons || []}
              onSelectCategory={handleCategorySelect}
              onSelectIcon={handleSelectIcon}
            />
          ) : currentView === 'extensions' ? (
            <ExtensionsPage
              onExploreAll={() => handleNavigate('icons')}
            />
          ) : currentView === 'blog' ? (
            <BlogPage
              onExploreAll={() => handleNavigate('icons')}
            />
          ) : currentView === 'submit' ? (
            <SubmitPage
              totalIcons={totalCount}
              onIconAdded={handleIconAdded}
              onShowToast={showToast}
              onNavigate={handleNavigate}
            />
          ) : currentView === 'favorites' ? (
            <FavoritesPage
              favorites={favorites}
              allIcons={metadata?.icons || []}
              onSelectIcon={handleSelectIcon}
              favoritesSet={favoritesSet}
              onToggleFavorite={toggleFavorite}
              onClearFavorites={clearFavorites}
              onExploreAll={() => handleNavigate('icons')}
              onShowToast={showToast}
            />
          ) : (
            <>
              {/* Hero Banner */}
              {!searchQuery && selectedCategory === 'all' && (
                <Hero
                  theme={theme}
                  totalIcons={totalCount}
                  selectedCategory={selectedCategory}
                  onResetFilters={resetFilters}
                />
              )}

              {/* Icon Grid */}
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  <p>Loading SVG icon catalog...</p>
                </div>
              ) : (
                <IconGrid
                  icons={filteredIcons}
                  onSelectIcon={handleSelectIcon}
                  favoritesSet={favoritesSet}
                  onToggleFavorite={toggleFavorite}
                  onShowToast={showToast}
                  selectedCategory={selectedCategory}
                  onResetFilters={resetFilters}
                />
              )}

              {/* Community Banner */}
              <CommunityBanner
                totalIcons={totalCount}
                totalVariants={totalCount * 2}
                totalCollections={6}
                onSubmitIconClick={handleSubmitIconModal}
              />
            </>
          )}

          {/* Full-width Rich Footer */}
          <Footer
            theme={theme}
            totalIcons={totalCount}
            onSelectCategory={handleCategorySelect}
            onSubmitIconClick={handleSubmitIconModal}
          />
        </main>
      </div>

      {/* Toast Snackbar */}
      {toast && (
        <div className="md-snackbar-container">
          <div className="md-snackbar">
            <span>{toast.title}: {toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
