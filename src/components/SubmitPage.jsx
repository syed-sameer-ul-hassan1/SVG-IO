import React, { useState, useMemo, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  GitFork,
  FolderPlus,
  FileCode,
  GitPullRequest,
  Github,
  ExternalLink,
  Sparkles,
  Check,
  AlertCircle,
  X,
  Code2,
  Layers,
  ArrowRight,
  Info,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';

const POPULAR_CATEGORIES = [
  'Software', 'Developer Tools', 'Framework', 'AI', 'Cloud',
  'Database', 'Design', 'Analytics', 'Security', 'DevOps',
  'E-commerce', 'Crypto', 'Gaming', 'Mobile', 'Hosting',
  'Marketing', 'Finance', 'Media', 'Education', 'Social'
];

const PRESET_VARIANT_NAMES = [
  'default', 'dark', 'light', 'mono', 'wordmark', 'symbol', 'outline', 'solid', 'duotone'
];

export function SubmitPage({ onIconAdded, onShowToast, onNavigate, totalIcons = 6516 }) {
  // Form State
  const [iconName, setIconName] = useState('');
  const [iconSlug, setIconSlug] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandGuidelinesUrl, setBrandGuidelinesUrl] = useState('');
  const [hexColor, setHexColor] = useState('FF5F02');
  const [license, setLicense] = useState('Apache-2.0');
  const [selectedCategories, setSelectedCategories] = useState(['Software']);
  
  // Multi-SVG Uploaded Variants: array of { id, variantName, fileName, fileSize, svgContent }
  const [variants, setVariants] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null); // { success, slug, title, submissionId }

  const fileInputRef = useRef(null);
  const addMoreInputRef = useRef(null);

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const val = e.target.value;
    setIconName(val);
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setIconSlug(autoSlug);
  };

  // Toggle Category selection
  const handleToggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Extract color from SVG content
  const extractSvgHex = (content) => {
    const matches = content.matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{3,8})"/g);
    for (const match of matches) {
      const hex = match[1].toLowerCase();
      if (!['#fff', '#ffffff', '#000', '#000000', '#none'].includes(hex)) {
        return match[1].replace(/^#/, '').toUpperCase();
      }
    }
    return null;
  };

  // Determine smart variant name from filename
  const getSmartVariantName = (filename, existingCount) => {
    const lower = filename.toLowerCase().replace(/\.svg$/i, '');
    if (lower.includes('dark')) return 'dark';
    if (lower.includes('light')) return 'light';
    if (lower.includes('mono')) return 'mono';
    if (lower.includes('wordmark') || lower.includes('logo')) return 'wordmark';
    if (lower.includes('symbol') || lower.includes('icon')) return 'symbol';
    if (lower.includes('outline')) return 'outline';
    if (lower.includes('solid')) return 'solid';
    if (lower.includes('duotone')) return 'duotone';
    
    if (existingCount === 0) return 'default';
    return lower.replace(/[^a-z0-9-]/g, '') || `variant-${existingCount + 1}`;
  };

  // Process single or multiple SVG files
  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    const validFiles = fileList.filter((f) => f.name.endsWith('.svg') || f.type === 'image/svg+xml');
    if (validFiles.length === 0) {
      onShowToast?.({
        type: 'error',
        title: 'Invalid File Format',
        message: 'Please upload only .svg vector files.'
      });
      return;
    }

    let currentVariants = [...variants];

    validFiles.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const initialVariantName = getSmartVariantName(file.name, currentVariants.length);
        
        // Auto-extract color if not set
        const extracted = extractSvgHex(content);
        if (extracted && hexColor === 'FF5F02') {
          setHexColor(extracted);
        }

        // Auto-fill icon name from first file if blank
        if (!iconName && currentVariants.length === 0 && idx === 0) {
          const baseName = file.name
            .replace(/\.svg$/i, '')
            .replace(/-(default|dark|light|mono|wordmark|logo)/i, '')
            .replace(/[-_]+/g, ' ');
          if (baseName) {
            const formatted = baseName.charAt(0).toUpperCase() + baseName.slice(1);
            setIconName(formatted);
            setIconSlug(baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
          }
        }

        const newVariant = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          variantName: initialVariantName,
          fileName: file.name,
          fileSize: file.size,
          svgContent: content
        };

        setVariants((prev) => {
          // Avoid duplicate variant names
          let uniqueName = initialVariantName;
          let counter = 1;
          while (prev.some((v) => v.variantName === uniqueName)) {
            uniqueName = `${initialVariantName}-${counter}`;
            counter++;
          }
          newVariant.variantName = uniqueName;
          return [...prev, newVariant];
        });
      };
      reader.readAsText(file);
    });

    onShowToast?.({
      type: 'success',
      title: 'SVG Loaded',
      message: `Added ${validFiles.length} SVG variant${validFiles.length > 1 ? 's' : ''}.`
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Update variant name
  const handleUpdateVariantName = (id, newName) => {
    const sanitized = newName.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, variantName: sanitized } : v))
    );
  };

  // Remove a variant
  const handleRemoveVariant = (id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Computed JSON Schema Preview
  const schemaPreview = useMemo(() => {
    const s = iconSlug || 'your-brand';
    const variantMap = {};

    if (variants.length === 0) {
      variantMap.default = `/icons/${s}/default.svg`;
      variantMap.mono = `/icons/${s}/mono.svg`;
      variantMap.dark = `/icons/${s}/dark.svg`;
    } else {
      variants.forEach((v) => {
        const vKey = v.variantName || 'default';
        variantMap[vKey] = `/icons/${s}/${vKey}.svg`;
      });
    }

    return JSON.stringify(
      {
        slug: s,
        title: iconName || 'Your Brand',
        aliases: [],
        hex: hexColor.replace(/^#/, ''),
        categories: selectedCategories,
        variants: variantMap,
        license,
        url: websiteUrl || `https://${s}.com`
      },
      null,
      2
    );
  }, [iconSlug, iconName, hexColor, selectedCategories, variants, license, websiteUrl]);

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!iconName.trim()) newErrors.name = 'Icon name is required';
    if (!iconSlug.trim()) newErrors.slug = 'Slug is required';
    if (variants.length === 0) newErrors.svg = 'Please upload at least one SVG file';

    // Check for empty or duplicate variant names
    const variantNames = variants.map((v) => v.variantName.trim());
    if (variantNames.some((v) => !v)) {
      newErrors.variants = 'All variants must have a name';
    }
    const uniqueNames = new Set(variantNames);
    if (uniqueNames.size !== variantNames.length) {
      newErrors.variants = 'Each variant must have a unique name (e.g., default, dark, mono)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onShowToast?.({
        type: 'error',
        title: 'Validation Error',
        message: Object.values(newErrors)[0]
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const variantsPayload = {};
    variants.forEach((v) => {
      variantsPayload[v.variantName.trim().toLowerCase()] = v.svgContent;
    });

    const payload = {
      slug: iconSlug.trim().toLowerCase(),
      title: iconName.trim(),
      aliases: [],
      hex: hexColor.replace(/^#/, '').toUpperCase(),
      categories: selectedCategories,
      license,
      url: websiteUrl.trim() || `https://${iconSlug}.dev`,
      variants: variantsPayload
    };

    try {
      const res = await fetch('/api/submit-icon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok || res.status === 207) {
        // Success — icon uploaded to Supabase, GitHub Action triggered
        const isPartial = res.status === 207;
        onShowToast?.({
          type: 'success',
          title: isPartial ? 'Icon Uploaded (Action Pending)' : '🚀 Icon Submitted!',
          message: isPartial
            ? 'SVGs saved to Supabase. Check GitHub Actions to confirm the workflow triggered.'
            : `"${payload.title}" is being processed. It will appear in the library in ~1-2 minutes.`
        });
        // Show success screen
        setSubmissionResult({
          success: true,
          slug: payload.slug,
          title: payload.title,
          submissionId: data.submission_id,
          variantCount: variants.length,
          storageUrls: data.storage_urls || {}
        });
        // Reset form
        setIconName('');
        setIconSlug('');
        setWebsiteUrl('');
        setBrandGuidelinesUrl('');
        setHexColor('FF5F02');
        setLicense('Apache-2.0');
        setSelectedCategories(['Software']);
        setVariants([]);
        setErrors({});
      } else {
        const errMsg = data.error || `Server error ${res.status}`;
        onShowToast?.({
          type: 'error',
          title: 'Submission Failed',
          message: errMsg
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      onShowToast?.({
        type: 'error',
        title: 'Network Error',
        message: 'Could not reach the submission API. Check your connection.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Submission Success Screen ────────────────────────────────────────────────
  if (submissionResult?.success) {
    return (
      <div className="sv-submit-page-container">
        <div className="sv-submit-success-card glass-panel">
          <div className="sv-success-icon-wrap">
            <CheckCircle2 size={52} className="sv-success-icon" />
          </div>
          <div className="sv-submit-badge-row" style={{ marginBottom: 8 }}>
            <span className="sv-submit-hero-pill">
              <Sparkles size={11} />
              <span>Supabase → GitHub → Cloudflare Pages</span>
            </span>
          </div>
          <h2 className="sv-success-title">Icon Submitted!</h2>
          <p className="sv-success-desc">
            <strong>{submissionResult.title}</strong> has been uploaded to Supabase Storage and a GitHub
            Action has been triggered to commit it to the repository. It will appear in the icon library
            in about <strong>1–2 minutes</strong> after the action completes.
          </p>

          <div className="sv-success-meta-grid">
            <div className="sv-success-meta-item">
              <span className="sv-success-meta-label">SLUG</span>
              <code className="sv-success-meta-val">{submissionResult.slug}</code>
            </div>
            <div className="sv-success-meta-item">
              <span className="sv-success-meta-label">VARIANTS</span>
              <code className="sv-success-meta-val">{submissionResult.variantCount} uploaded</code>
            </div>
            {submissionResult.submissionId && (
              <div className="sv-success-meta-item">
                <span className="sv-success-meta-label">SUBMISSION ID</span>
                <code className="sv-success-meta-val" style={{ fontSize: 10 }}>{submissionResult.submissionId}</code>
              </div>
            )}
          </div>

          <div className="sv-success-actions-row">
            <a
              href="https://github.com/syed-sameer-ul-hassan1/SVG-IO/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="sv-repo-action-btn"
            >
              <Eye size={14} />
              <span>Watch GitHub Action ↗</span>
            </a>
            <button
              className="sv-submit-action-btn"
              style={{ flex: 1 }}
              onClick={() => setSubmissionResult(null)}
            >
              <Plus size={16} />
              <span>Submit Another Icon</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-submit-page-container">
      {/* 2-Column Main Submission Grid */}
      <div className="sv-submit-main-grid">
        {/* ================= LEFT COLUMN ================= */}
        <div className="sv-submit-left-col">
          {/* Header Hero Card */}
          <div className="sv-submit-hero-card glass-panel">
            <div className="sv-submit-badge-row">
              <span className="sv-submit-hero-pill">
                <Sparkles size={11} />
                <span>{totalIcons.toLocaleString()}+ icons and growing</span>
              </span>
            </div>

            <h1 className="sv-submit-main-title">Submit an Icon</h1>
            <p className="sv-submit-main-sub">
              Every brand deserves a place. No gatekeeping. Drop multiple SVG variants, name them, fill in the details, and auto-generate icon packages directly.
            </p>
          </div>

          {/* How It Works Section */}
          <div className="sv-how-it-works-section">
            <h2 className="sv-section-header-title">How it works</h2>
            <div className="sv-how-cards-grid">
              {/* Step 1 */}
              <div className="sv-how-card step-blue glass-panel">
                <div className="sv-how-card-header">
                  <div className="sv-how-icon-wrap">
                    <GitFork size={14} />
                  </div>
                  <span className="sv-step-tag">#1 Fork the repo</span>
                </div>
                <p className="sv-step-desc">
                  Fork <code>github.com/orildo/orildo-svg</code> and clone locally.
                </p>
              </div>

              {/* Step 2 */}
              <div className="sv-how-card step-emerald glass-panel">
                <div className="sv-how-card-header">
                  <div className="sv-how-icon-wrap">
                    <FolderPlus size={14} />
                  </div>
                  <span className="sv-step-tag">#2 Add your SVGs</span>
                </div>
                <p className="sv-step-desc">
                  Place files in <code>public/icons/[slug]/</code> with proper naming.
                </p>
              </div>

              {/* Step 3 */}
              <div className="sv-how-card step-purple glass-panel">
                <div className="sv-how-card-header">
                  <div className="sv-how-icon-wrap">
                    <FileCode size={14} />
                  </div>
                  <span className="sv-step-tag">#3 Update icons.json</span>
                </div>
                <p className="sv-step-desc">
                  Add your entry to <code>public/icons.json</code>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="sv-how-card step-amber glass-panel">
                <div className="sv-how-card-header">
                  <div className="sv-how-icon-wrap">
                    <GitPullRequest size={14} />
                  </div>
                  <span className="sv-step-tag">#4 Open a PR</span>
                </div>
                <p className="sv-step-desc">
                  Run validation, then open a pull request.
                </p>
              </div>
            </div>
          </div>

          {/* SVG Requirements Card */}
          <div className="sv-req-card glass-panel">
            <h3 className="sv-req-title">SVG Requirements</h3>
            <ul className="sv-req-list">
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>Valid SVG/XML markup</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>Under 50KB file size per variant</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>No embedded scripts or external references</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>viewBox attribute present</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>Gradients and multi-color SVGs welcome</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>Multiple named variants supported (e.g. default, dark, mono, wordmark)</span>
              </li>
            </ul>
          </div>

          {/* Action Links */}
          <div className="sv-repo-links-row">
            <a
              href="https://github.com/hummingbirdui/hummingbird"
              target="_blank"
              rel="noopener noreferrer"
              className="sv-repo-action-btn"
            >
              <Github size={14} />
              <span>View Repository ↗</span>
            </a>
            <a
              href="https://github.com/hummingbirdui/hummingbird/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="sv-repo-action-btn"
            >
              <AlertCircle size={14} />
              <span>Open Issues ↗</span>
            </a>
          </div>

          {/* Live Icon Entry Schema Preview */}
          <div className="sv-schema-preview-box glass-panel">
            <div className="sv-schema-header">
              <span className="sv-schema-title">Icon Entry Schema</span>
              <span className="sv-schema-sub">public/icons.json format ({variants.length} variant{variants.length !== 1 ? 's' : ''})</span>
            </div>
            <pre className="sv-schema-code">
              <code>{schemaPreview}</code>
            </pre>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: QUICK SUBMIT ================= */}
        <div className="sv-submit-right-col">
          <form className="sv-submit-form-card glass-panel" onSubmit={handleSubmit}>
            <div className="sv-form-header">
              <h2 className="sv-form-title">Quick Submit</h2>
              <p className="sv-form-sub">Drop one or multiple SVGs, name each variant, and save directly.</p>
            </div>

            {/* SVG Multi-File Drag & Drop Area */}
            <div className="sv-form-group">
              <div className="sv-label-with-help">
                <label className="sv-form-label">
                  SVG Variants ({variants.length}) <span className="req">*</span>
                </label>
                {variants.length > 0 && (
                  <button
                    type="button"
                    className="sv-add-more-pill-btn"
                    onClick={() => addMoreInputRef.current?.click()}
                  >
                    <Plus size={12} />
                    <span>Add Another Variant</span>
                  </button>
                )}
              </div>

              {/* Hidden file input for adding more */}
              <input
                ref={addMoreInputRef}
                type="file"
                accept=".svg"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => processFiles(e.target.files)}
              />

              {/* Dropzone (when 0 variants or user wants to drop) */}
              {variants.length === 0 ? (
                <div
                  className={`sv-dropzone ${isDragging ? 'is-dragging' : ''} ${errors.svg ? 'has-error' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => processFiles(e.target.files)}
                  />
                  <div className="sv-dropzone-icon-wrap">
                    <UploadCloud size={28} className="sv-dropzone-icon" />
                  </div>
                  <span className="sv-dropzone-main-text">Drag & drop your SVG files (Single or Multiple)</span>
                  <span className="sv-dropzone-sub-text">or click to browse • .svg files only, max 50KB each</span>
                </div>
              ) : null}

              {/* Uploaded Variants List */}
              {variants.length > 0 && (
                <div
                  className={`sv-multi-variants-container ${isDragging ? 'is-dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="sv-variants-list">
                    {variants.map((v, idx) => (
                      <div key={v.id} className="sv-variant-item-card glass-panel">
                        <div className="sv-variant-preview-circle">
                          <div
                            className="sv-variant-svg-wrapper"
                            dangerouslySetInnerHTML={{ __html: v.svgContent }}
                          />
                        </div>

                        <div className="sv-variant-fields">
                          <div className="sv-variant-name-row">
                            <label className="sv-variant-field-label">Variant Name / Key:</label>
                            <input
                              type="text"
                              className="sv-variant-name-input"
                              placeholder="e.g. default, dark, mono"
                              value={v.variantName}
                              onChange={(e) => handleUpdateVariantName(v.id, e.target.value)}
                            />
                            {idx === 0 && <span className="sv-primary-badge">PRIMARY</span>}
                          </div>

                          {/* Quick Preset Buttons */}
                          <div className="sv-variant-presets-row">
                            {PRESET_VARIANT_NAMES.map((pName) => (
                              <button
                                key={pName}
                                type="button"
                                className={`sv-preset-btn ${v.variantName === pName ? 'active' : ''}`}
                                onClick={() => handleUpdateVariantName(v.id, pName)}
                              >
                                {pName}
                              </button>
                            ))}
                          </div>

                          <div className="sv-variant-meta-row">
                            <span className="sv-variant-file-name">{v.fileName}</span>
                            <span className="sv-variant-file-size">
                              {(v.fileSize / 1024).toFixed(1)} KB • Target: <code>icons/{iconSlug || 'slug'}/{v.variantName || 'default'}.svg</code>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="sv-variant-remove-btn"
                          onClick={() => handleRemoveVariant(v.id)}
                          title="Remove variant"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Drop zone footer for adding more */}
                  <div
                    className="sv-add-drop-footer"
                    onClick={() => addMoreInputRef.current?.click()}
                  >
                    <Plus size={14} />
                    <span>Drop more SVGs or click here to add another variant</span>
                  </div>
                </div>
              )}

              {errors.svg && <span className="sv-field-error">{errors.svg}</span>}
              {errors.variants && <span className="sv-field-error">{errors.variants}</span>}
            </div>

            {/* Icon Details Section */}
            <div className="sv-form-section-title">Icon Details</div>

            {/* Name and Slug Row */}
            <div className="sv-form-row-2col">
              <div className="sv-form-group">
                <label className="sv-form-label">
                  Icon name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className={`sv-form-input ${errors.name ? 'has-error' : ''}`}
                  placeholder="e.g. Vercel"
                  value={iconName}
                  onChange={handleNameChange}
                />
                {errors.name && <span className="sv-field-error">{errors.name}</span>}
              </div>

              <div className="sv-form-group">
                <label className="sv-form-label">
                  Slug (kebab-case) <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className={`sv-form-input ${errors.slug ? 'has-error' : ''}`}
                  placeholder="e.g. vercel"
                  value={iconSlug}
                  onChange={(e) => setIconSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                />
                {errors.slug && <span className="sv-field-error">{errors.slug}</span>}
              </div>
            </div>

            {/* Website URL */}
            <div className="sv-form-group">
              <label className="sv-form-label">Website URL</label>
              <input
                type="url"
                className="sv-form-input"
                placeholder="https://vercel.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>

            {/* Brand Guidelines URL */}
            <div className="sv-form-group">
              <label className="sv-form-label">Brand guidelines URL</label>
              <input
                type="url"
                className="sv-form-input"
                placeholder="https://vercel.com/brand"
                value={brandGuidelinesUrl}
                onChange={(e) => setBrandGuidelinesUrl(e.target.value)}
              />
            </div>

            {/* Hex Color Picker */}
            <div className="sv-form-group">
              <label className="sv-form-label">Brand hex color</label>
              <div className="sv-color-input-wrap">
                <div
                  className="sv-color-swatch-preview"
                  style={{ backgroundColor: hexColor.startsWith('#') ? hexColor : `#${hexColor}` }}
                />
                <input
                  type="text"
                  className="sv-form-input sv-hex-input"
                  placeholder="FF5F02"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value.replace(/[^0-9a-fA-F#]/g, ''))}
                />
              </div>
            </div>

            {/* License Dropdown */}
            <div className="sv-form-group">
              <div className="sv-label-with-help">
                <label className="sv-form-label">
                  License <span className="req">*</span>
                </label>
                <a
                  href="https://choosealicense.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sv-help-link"
                >
                  Help me pick · Licensing guide ↗
                </a>
              </div>
              <select
                className="sv-form-select"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
              >
                <option value="Apache-2.0">Apache 2.0 (Official)</option>
                <option value="MIT">MIT</option>
                <option value="CC0-1.0">CC0-1.0 (Public Domain)</option>
                <option value="BSD-3-Clause">BSD-3-Clause</option>
                <option value="Custom">Custom Brand License</option>
              </select>
            </div>

            {/* Categories Tag Selector */}
            <div className="sv-form-group">
              <label className="sv-form-label">Categories</label>
              <div className="sv-cat-tags-selector">
                {POPULAR_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`sv-cat-pill-toggle ${isSelected ? 'active' : ''}`}
                      onClick={() => handleToggleCategory(cat)}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="sv-submit-action-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="sv-button-spinner" />
                  <span>Creating Folder & Saving {variants.length} SVG(s)...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Submit Icon ({variants.length} Variant{variants.length !== 1 ? 's' : ''}) & Auto-Create Folder</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubmitPage;
