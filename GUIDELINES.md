# SVG.IO — Engineering & Design Guidelines

> Official project standards, architectural rules, security protocols, and operational guidelines for **SVG.IO**.

---

## 🎯 Core Platform Identity
**SVG.IO** is the free, open-source **SVG Hosting, Publishing, and Distribution Platform**. It empowers creators and developers to publish single vector icons or complete multi-variant icon packs with dedicated live preview pages, instant CDN delivery, and copy-paste component snippets across React, Vue, Svelte, and HTML.

---

## ✅ WHAT TO DO (Best Practices & Rules)

### 1. User Interface & Design System
* **Zero-Shadow Clean Flat / Glass Aesthetic**:
  * Keep all elements completely shadow-free. Use clean borders (`1px solid var(--md-sys-color-outline)`), backdrop blur (`backdrop-filter: blur(...)`), and crisp background surfaces for depth instead of drop/box shadows.
* **Clean Modern Aesthetics**: Use sleek glassmorphism panels (`glass-panel`), crisp modern typography, fluid transitions, and subtle background accent glows.
* **Unified Single Search Bar**: Maintain a single global search bar in the Header that dynamically filters the active view (Catalog, Categories, Favorites) and auto-routes when appropriate.
* **Auto-Clear Search**: Clear search queries automatically when the user selects an icon, chooses a category, or switches views to avoid residual search state.
* **Permissive Licensing**: Display clear Apache 2.0 license tags with verified status badges across icon cards and submission forms.
* **Categories & Organization**:
  * Include dedicated curated collections (e.g. *"Pakistani Brands"*, *"Software"*, *"AI & Machine Learning"*, *"Liquid Glass"*).
  * In the Submission form (`SubmitPage.jsx`), start with **zero categories selected by default (`[]`)** so contributors explicitly categorize their icons.
* **Submissions Pipeline Timer**:
  * Maintain the standardized **7-minute (420 seconds)** processing timer across frontend UI (`SubmitPage.jsx`) and backend functions (`submit-icon.js`).
* **Theme Token Compliance for Hero & Primary Buttons**:
  * The Hero primary CTA button and all interactive accent buttons must **always follow the site theme tokens** (`var(--md-sys-color-primary)`, `var(--md-sys-color-secondary)`, `var(--md-sys-color-on-primary)`) rather than hardcoded hex colors, dynamically adapting across dark and light themes.

### 2. Security & Backend Ingestion
* **Input Sanitization & Path Traversal Protection**:
  * Strictly sanitize all incoming slugs and variant keys using regex `replace(/[^a-z0-9_-]/g, '')` before creating directories or filesystem files.
* **Generic Client Error Responses**:
  * Return safe, professional error messages from backend functions (e.g., *"Ingestion service temporarily unavailable"*, *"Upload validation failed"*).
* **Sanitize SVG Markup**:
  * Strip out dangerous `<script>` tags, inline event handlers (`onload`, `onerror`), and external embedded references before storing vectors.

### 3. Storage & Performance
* **Dual-Layer Browser Storage**:
  * Use `localStorage` for instantaneous synchronous state hydration (favorites list, dark/light theme, search history).
  * Use persistent `IndexedDB` (`svgio_browser_cache_db`) for large binary caching: 6,500+ icon metadata registry, raw SVG text strings for 0ms offline export/copy.
* **Zero Telemetry**: Keep all user preferences, search history, and favorite collections 100% local on the client device.

---

## ❌ WHAT NOT TO DO (Forbidden Practices & Pitfalls)

### 1. Styling & Shadow Restrictions
* ❌ **NEVER USE SHADOWS ANYWHERE**:
  * **DO NOT** use `box-shadow`, `text-shadow`, or `drop-shadow` on cards, buttons, modals, dropdowns, inputs, badges, or icons.
  * All `--md-elevation-*` design tokens must remain `none`.
  * The global zero-shadow protocol (`box-shadow: none !important; text-shadow: none !important;`) is strictly enforced.

### 2. Wording & Terminology Restrictions
* ❌ **DO NOT use the word "Automation" or "Automated" anywhere** in user-facing copy, headers, badges, descriptions, or error messages.
  * *Instead, use*: `"Ingestion Pipeline"`, `"Processing Engine"`, `"Validation Pipeline"`, `"Fast 7-Min Ingestion"`, `"Instant"`, or `"Built-in"`.
* ❌ **DO NOT expose internal infrastructure terminology** to visitors (e.g., do not mention *"CI/CD"*, *"GitHub Actions trigger"*, *"Repository dispatch"*, *"Cloudflare KV"*, *"Cron worker"*).

### 3. UI Clutter & Layout
* ❌ **DO NOT place redundant upside pill badges above main headings** (e.g., avoid adding pill badges like *"Open-Source SVG Hosting & Publishing Platform"* above the main page `<h1>` headline). Keep hero sections clean and uncluttered.
* ❌ **DO NOT create duplicate search bars** inside individual sub-pages (e.g., Categories or Favorites pages). Rely solely on the unified Header search bar.
* ❌ **DO NOT pre-select categories by default** in submission workflows.

### 4. Operational & Tooling Constraints (STRICT)
* ❌ **NEVER USE SCRIPTS OR TERMINAL TO MODIFY CODE FILES**:
  * **DO NOT** write or execute ad-hoc scripts (Node, Python, Bash, etc.) to perform regex, bulk replaces, or automated edits on codebase files.
  * **ALWAYS** use built-in IDE editing tools (`replace_file_content`, `multi_replace_file_content`, `write_to_file`) with explicit verification of every change.
* ❌ **NEVER COMMIT OR PUSH TO GITHUB**:
  * **DO NOT** run `git commit`, `git push`, or alter remote repository git history under any circumstances.
  * All git commits and repository pushes must be handled exclusively by the human user.

### 5. Security & Information Leaks
* ❌ **DO NOT leak backend secrets or environment variable names** (e.g. `GH_PAT`, `SUPABASE_ANON_KEY`, `DATABASE_URL`) in API responses, console logs, or client-side bundles.
* ❌ **DO NOT leak raw database or third-party error traces** in API responses.
* ❌ **DO NOT link directly to internal repository build runs** or action logs from client UI.
* ❌ **DO NOT track users with third-party analytics cookies or keystroke loggers**.

---

## 📁 Repository Key Paths & Architecture

| Path | Purpose |
|---|---|
| `src/App.jsx` | Core routing, view controller, unified search routing, and cache synchronization |
| `src/components/Hero.jsx` | Clean hero banner with direct CTAs and platform value props |
| `src/components/SubmitPage.jsx` | Multi-variant SVG publishing flow with 7-min pipeline timer |
| `src/components/InfoPage.jsx` | Platform specifications and architectural pillars |
| `src/utils/dbUtils.js` | Dual-layer client caching engine (IndexedDB + localStorage) |
| `src/utils/exportUtils.js` | Multi-framework code snippet generator and image export engine |
| `src/styles/index.css` | Global styles, theme design tokens, zero-shadow design system |
| `functions/api/submit-icon.js` | Cloudflare Pages Function handling secure staging and ingestion dispatch |
| `scripts/process-submission.js` | Path-sanitized vector packaging script |
