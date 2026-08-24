import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import IconGrid from './components/IconGrid';
import IconDetailPage from './components/IconDetailPage';
import CategoriesPage from './components/CategoriesPage';
import BlogPage from './components/BlogPage';
import FavoritesPage from './components/FavoritesPage';
import SubmitPage from './components/SubmitPage';
import CommunityBanner from './components/CommunityBanner';
import Footer from './components/Footer';
import NotFoundPage from './components/NotFoundPage';
import ServerErrorPage from './components/ServerErrorPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import StatusPage from './components/StatusPage';
import InfoPage from './components/InfoPage';
import CookieBanner from './components/CookieBanner';
import Fuse from 'fuse.js';

import { saveSearchHistoryItem } from './utils/historyUtils';
import { getCachedCatalog, setCachedCatalog, preloadIconBatch } from './utils/dbUtils';
import { updatePageSeo } from './utils/seoUtils';

export function App() {
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Read initial state from URL search params
  const initialParams = useMemo(() => {
    if (typeof window === 'undefined') return { view: 'icons', category: 'all', search: '', icon: '' };
    const sp = new URLSearchParams(window.location.search);
    return {
      view: sp.get('view') || (sp.get('icon') ? 'icons' : 'icons'),
      category: sp.get('category') || 'all',
      search: sp.get('search') || sp.get('q') || '',
      icon: sp.get('icon') || ''
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState(initialParams.search);
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category);
  const [currentView, setCurrentView] = useState(initialParams.view);

  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('default');


  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('orildo_svg_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });


  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);


  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('orildo_svg_theme') || 'dark';
  });

  const searchInputRef = useRef(null);


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('orildo_svg_theme', theme);
  }, [theme]);


  useEffect(() => {
    try {
      localStorage.setItem('orildo_svg_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [favorites]);


  useEffect(() => {
    let isMounted = true;

    async function loadIcons() {
      // 1. Instant Cache Layer (<10ms)
      try {
        const cached = await getCachedCatalog();
        if (cached && isMounted && cached.icons?.length > 0) {
          setMetadata(cached);
          setIsLoading(false);
          preloadIconBatch(cached.icons, 48);
        }
      } catch (e) {
        console.warn('Cache read error:', e);
      }

      // 2. Network Fetch & Revalidation
      try {
        const res = await fetch('/icons.json');
        if (!res.ok) throw new Error('Failed to load icons.json');
        const rawIcons = await res.json();

        const normalized = rawIcons.map((icon) => {
          const id = icon.slug || icon.id;
          const name = icon.title || icon.name || id;
          const category = Array.isArray(icon.categories) && icon.categories[0] || icon.category || 'Brands & Ecosystem';
          const hex = icon.hex ? icon.hex.startsWith('#') ? icon.hex : `#${icon.hex}` : '#FF5F02';
          const hexes = Array.isArray(icon.hexes) && icon.hexes.length > 0 ?
          icon.hexes.map((h) => h.startsWith('#') ? h : `#${h}`) :
          [hex];
          const url = icon.url || `https://${id}.dev`;
          const license = icon.license || 'Apache-2.0';

          let variants = [];
          let variantPaths = {};

          if (icon.variants && typeof icon.variants === 'object' && !Array.isArray(icon.variants)) {
            variants = Object.keys(icon.variants);
            variantPaths = icon.variants;
          } else if (Array.isArray(icon.variants)) {
            variants = icon.variants;
            variants.forEach((v) => {
              variantPaths[v] = `/icons/${id}/${v}.svg`;
            });
          } else {
            variants = ['default'];
            variantPaths = { default: `/icons/${id}/default.svg` };
          }

          const defaultPath = variantPaths.default || variantPaths[variants[0]] || `/icons/${id}/default.svg`;

          return {
            id,
            slug: id,
            name,
            title: name,
            aliases: Array.isArray(icon.aliases) ? icon.aliases : [],
            guidelines: icon.guidelines || '',
            category,
            categories: Array.isArray(icon.categories) && icon.categories.length > 0 ? icon.categories : [category],
            hex,
            hexes,
            url,
            license,
            path: defaultPath,
            variants,
            variantPaths,
            variantCount: variants.length,
            availableVariants: variants,
            dateAdded: icon.dateAdded || '2026-08-23',
            collection: icon.collection || 'community'
          };
        });

        normalized.sort((a, b) => {
          if (a.id === 'orildo' || a.id === 'thesvg') return -1;
          if (b.id === 'orildo' || b.id === 'thesvg') return 1;
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });

        const categoryCounts = {};
        normalized.forEach((icon) => {
          if (Array.isArray(icon.categories)) {
            icon.categories.forEach((cat) => {
              categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
          } else if (icon.category) {
            categoryCounts[icon.category] = (categoryCounts[icon.category] || 0) + 1;
          }
        });

        const categories = Object.keys(categoryCounts).
        map((name) => ({
          name,
          count: categoryCounts[name]
        })).
        sort((a, b) => a.name.localeCompare(b.name));

        const freshCatalog = {
          totalIcons: normalized.length,
          categoryCount: categories.length,
          categories,
          icons: normalized
        };

        if (isMounted) {
          setMetadata(freshCatalog);
          setIsLoading(false);
          setCachedCatalog(freshCatalog);
          preloadIconBatch(normalized, 48);

          // If URL has ?icon=slug, open it immediately
          if (initialParams.icon) {
            const found = normalized.find(
              (i) => i.id === initialParams.icon || i.slug === initialParams.icon
            );
            if (found) {
              setSelectedIcon(found);
            }
          }
        }
      } catch (err) {
        console.error('Error loading icons.json:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadIcons();
    return () => { isMounted = false; };
  }, []);

  // Dynamic SEO Engine Sync
  useEffect(() => {
    updatePageSeo({
      icon: selectedIcon,
      category: selectedCategory,
      view: currentView
    });
  }, [selectedIcon, selectedCategory, currentView]);

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
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('icon');
          window.history.pushState(null, '', url.toString());
        } catch (err) {}
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIcon]);

  const toggleTheme = () => {
    setTheme((prev) => prev === 'dark' ? 'light' : 'dark');
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
    try {
      const url = new URL(window.location.href);
      if (icon) {
        url.searchParams.set('icon', icon.slug || icon.id);
      } else {
        url.searchParams.delete('icon');
      }
      window.history.pushState(null, '', url.toString());
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedIcon(null);
    setCurrentView('icons');
    try {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.pushState(null, '', url.toString());
    } catch (e) {}
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedIcon(null);
    setCurrentView('icons');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('icon');
      if (category && category !== 'all') {
        url.searchParams.set('category', category);
      } else {
        url.searchParams.delete('category');
      }
      window.history.pushState(null, '', url.toString());
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedIcon(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('icon');
      if (view && view !== 'icons') {
        url.searchParams.set('view', view);
      } else {
        url.searchParams.delete('view');
      }
      window.history.pushState(null, '', url.toString());
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const categoriesWithCounts = useMemo(() => {
    if (!metadata || !metadata.icons) return [];
    const counts = {};
    for (const icon of metadata.icons) {
      if (Array.isArray(icon.categories) && icon.categories.length > 0) {
        for (const cat of icon.categories) {
          if (cat) counts[cat] = (counts[cat] || 0) + 1;
        }
      } else if (icon.category) {
        counts[icon.category] = (counts[icon.category] || 0) + 1;
      }
    }
    const list = Object.keys(counts).map((name) => ({
      name,
      count: counts[name]
    }));
    list.sort((a, b) => (b.count || 0) - (a.count || 0));
    return list;
  }, [metadata]);

  const fuseIndex = useMemo(() => {
    const list = metadata?.icons || [];
    if (list.length === 0) return null;
    return new Fuse(list, {
      keys: [
        { name: 'slug', weight: 0.4 },
        { name: 'title', weight: 0.35 },
        { name: 'name', weight: 0.35 },
        { name: 'id', weight: 0.35 },
        { name: 'aliases', weight: 0.2 },
        { name: 'categories', weight: 0.05 }
      ],
      threshold: 0.35,
      distance: 100,
      minMatchCharLength: 1,
      ignoreLocation: true,
      shouldSort: true
    });
  }, [metadata?.icons]);

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
      list = list.filter((icon) => {
        if (Array.isArray(icon.categories) && icon.categories.includes(selectedCategory)) return true;
        if (icon.category === selectedCategory) return true;
        return false;
      });
    }

    if (searchQuery && searchQuery.trim()) {
      if (fuseIndex) {
        const results = fuseIndex.search(searchQuery.trim());
        return results.map((r) => r.item);
      }
      const q = searchQuery.toLowerCase().trim();
      return list.filter((i) => (i.slug || i.id || '').toLowerCase().includes(q) || (i.title || i.name || '').toLowerCase().includes(q));
    }

    return list;
  }, [metadata, selectedCategory, searchQuery, fuseIndex]);

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
      {}
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
        allIcons={metadata?.icons || []}
        searchInputRef={searchInputRef}
        onNavigate={handleNavigate}
        onSubmitIconClick={handleSubmitIconModal} />
      

      {}
      <div className="md-app-layout">
        {}
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
          totalIcons={totalCount} />
        

        {}
        <main className="md-main-content">
          {}
          {selectedIcon ?
          <IconDetailPage
            icon={selectedIcon}
            initialVariant={selectedVariant}
            allIcons={metadata?.icons || []}
            onBack={() => setSelectedIcon(null)}
            onSelectIcon={handleSelectIcon}
            isFavorite={favoritesSet.has(selectedIcon.id)}
            onToggleFavorite={toggleFavorite}
            onShowToast={showToast} /> :

          currentView === 'categories' ?
          <CategoriesPage
            categories={categoriesWithCounts}
            allIcons={metadata?.icons || []}
            onSelectCategory={handleCategorySelect}
            onSelectIcon={handleSelectIcon} /> :

          currentView === 'blog' ?
          <BlogPage
            onExploreAll={() => handleNavigate('icons')} /> :

          currentView === 'submit' ?
          <SubmitPage
            totalIcons={totalCount}
            onIconAdded={handleIconAdded}
            onShowToast={showToast}
            onNavigate={handleNavigate} /> :

          currentView === 'favorites' ?
          <FavoritesPage
            favorites={favorites}
            allIcons={metadata?.icons || []}
            onSelectIcon={handleSelectIcon}
            favoritesSet={favoritesSet}
            onToggleFavorite={toggleFavorite}
            onClearFavorites={clearFavorites}
            onExploreAll={() => handleNavigate('icons')}
            onShowToast={showToast} /> :

          currentView === '404' ?
          <NotFoundPage
            onNavigate={handleNavigate}
            onSearch={(q) => {
              setSearchQuery(q);
              handleNavigate('icons');
            }} /> :

          currentView === '500' ?
          <ServerErrorPage
            onNavigate={handleNavigate}
            onRetry={() => window.location.reload()} /> :

          currentView === 'privacy' ?
          <PrivacyPage
            onNavigate={handleNavigate} /> :

          currentView === 'terms' || currentView === 'trademark' || currentView === 'legal' ?
          <TermsPage
            onNavigate={handleNavigate} /> :

          currentView === 'status' ?
          <StatusPage
            totalIcons={totalCount}
            onNavigate={handleNavigate} /> :

          currentView === 'info' || currentView === 'about' ?
          <InfoPage
            totalIcons={totalCount}
            onNavigate={handleNavigate} /> :


          <>
              {}
              {!searchQuery && selectedCategory === 'all' &&
            <Hero
              theme={theme}
              totalIcons={totalCount}
              selectedCategory={selectedCategory}
              onResetFilters={resetFilters} />

            }

              {}
              {isLoading ?
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  <p>Loading SVG icon catalog...</p>
                </div> :

            <IconGrid
              icons={filteredIcons}
              searchQuery={searchQuery}
              onSelectIcon={handleSelectIcon}
              favoritesSet={favoritesSet}
              onToggleFavorite={toggleFavorite}
              onShowToast={showToast}
              selectedCategory={selectedCategory}
              onResetFilters={resetFilters} />

            }

              {}
              <CommunityBanner
              totalIcons={totalCount}
              totalVariants={totalCount * 2}
              totalCollections={6}
              onSubmitIconClick={handleSubmitIconModal} />
            
            </>
          }

          {}
          <Footer
            theme={theme}
            totalIcons={totalCount}
            onSelectCategory={handleCategorySelect}
            onSubmitIconClick={handleSubmitIconModal}
            onNavigate={handleNavigate} />
          
        </main>
      </div>

      {}
      {toast &&
      <div className="md-snackbar-container">
          <div className="md-snackbar">
            <span>{toast.title}: {toast.message}</span>
          </div>
        </div>
      }

      {}
      <CookieBanner onNavigate={handleNavigate} />
    </div>);

}

export default App;