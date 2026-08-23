import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
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
  Eye,
  Package,
} from "lucide-react";

const MAX_SVG_SIZE_BYTES = 20 * 1024; // Strict 20 KB maximum limit per SVG

const POPULAR_CATEGORIES = [
  "Software",
  "Developer Tools",
  "Framework",
  "AI",
  "Cloud",
  "Database",
  "Design",
  "Analytics",
  "Security",
  "DevOps",
  "E-commerce",
  "Crypto",
  "Gaming",
  "Mobile",
  "Hosting",
  "Marketing",
  "Finance",
  "Media",
  "Education",
  "Social",
];

const PRESET_VARIANT_NAMES = [
  "default",
  "light",
  "dark",
  "wordmark-dark",
  "wordmark-light",
  "mono",
  "symbol",
  "outline",
  "solid",
  "duotone",
];

export function SubmitPage({
  onIconAdded,
  onShowToast,
  onNavigate,
  totalIcons = 6516,
}) {
  // Form State
  const [iconName, setIconName] = useState("");
  const [iconSlug, setIconSlug] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandGuidelinesUrl, setBrandGuidelinesUrl] = useState("");
  const [hexColors, setHexColors] = useState(["FF5F02"]); // Multiple brand hex colors (primary is index 0)
  const [detectedHexes, setDetectedHexes] = useState([]); // All auto-detected hexes from uploaded SVGs
  const [license, setLicense] = useState("Apache-2.0");
  const [selectedCategories, setSelectedCategories] = useState(["Software"]);

  // Multi-SVG Uploaded Variants: array of { id, variantName, fileName, fileSize, svgContent }
  const [variants, setVariants] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [countdown, setCountdown] = useState(60); // 60-second live countdown after submit

  const fileInputRef = useRef(null);
  const addMoreInputRef = useRef(null);

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const val = e.target.value;
    setIconName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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

  // Normalize any hex code to 6-char uppercase hex without '#'
  const normalizeHex = (hexStr) => {
    if (!hexStr) return null;
    let h = hexStr.replace(/^#/, "").trim();
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    } else if (h.length === 8) {
      h = h.substring(0, 6);
    } else if (h.length === 4) {
      h = h
        .substring(0, 3)
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (/^[0-9a-fA-F]{6}$/.test(h)) {
      return h.toUpperCase();
    }
    return null;
  };

  // Convert rgb/rgba to hex
  const rgbToHex = (r, g, b) => {
    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, Math.round(Number(n)))).toString(
        16,
      );
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // Extract all unique colors from SVG content
  const extractAllSvgColors = (svgContent) => {
    if (!svgContent || typeof svgContent !== "string") return [];
    const colorCounts = new Map();

    const addColor = (rawColor) => {
      if (!rawColor) return;
      const clean = rawColor.trim();
      if (
        ["none", "transparent", "currentcolor", "inherit", "initial"].includes(
          clean.toLowerCase(),
        )
      ) {
        return;
      }

      if (clean.startsWith("#")) {
        const norm = normalizeHex(clean);
        if (norm) {
          colorCounts.set(norm, (colorCounts.get(norm) || 0) + 1);
          return;
        }
      }

      const rgbMatch = clean.match(
        /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
      );
      if (rgbMatch) {
        const hex = rgbToHex(rgbMatch[1], rgbMatch[2], rgbMatch[3]);
        colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
        return;
      }
    };

    // 1. Attributes: fill, stroke, stop-color, color
    const attrMatches = svgContent.matchAll(
      /(?:fill|stroke|stop-color|color)\s*=\s*["']([^"']+)["']/gi,
    );
    for (const m of attrMatches) {
      addColor(m[1]);
    }

    // 2. CSS styles
    const styleMatches = svgContent.matchAll(
      /(?:fill|stroke|stop-color|color)\s*:\s*([^;}"'\s]+)/gi,
    );
    for (const m of styleMatches) {
      addColor(m[1]);
    }

    // 3. Fallback general hex pattern search
    const generalHexMatches = svgContent.matchAll(
      /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g,
    );
    for (const m of generalHexMatches) {
      addColor(m[0]);
    }

    return Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([hex]) => hex);
  };

  // Determine smart variant name from filename
  const getSmartVariantName = (filename, existingCount) => {
    const lower = filename.toLowerCase().replace(/\.svg$/i, "");
    if (lower.includes("wordmark-dark") || lower.includes("wordmark_dark"))
      return "wordmark-dark";
    if (lower.includes("wordmark-light") || lower.includes("wordmark_light"))
      return "wordmark-light";
    if (lower.includes("dark")) return "dark";
    if (lower.includes("light")) return "light";
    if (lower.includes("mono")) return "mono";
    if (lower.includes("wordmark") || lower.includes("logo")) return "wordmark";
    if (lower.includes("symbol") || lower.includes("icon")) return "symbol";
    if (lower.includes("outline")) return "outline";
    if (lower.includes("solid")) return "solid";
    if (lower.includes("duotone")) return "duotone";

    if (existingCount === 0) return "default";
    return lower.replace(/[^a-z0-9-]/g, "") || `variant-${existingCount + 1}`;
  };

  // Process single or multiple SVG files with 20 KB limit and security scanner
  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    const validFiles = fileList.filter(
      (f) =>
        f.name.toLowerCase().endsWith('.svg') ||
        f.type.includes('svg') ||
        f.type.includes('xml') ||
        f.type === ''
    );

    if (validFiles.length === 0) {
      onShowToast?.({
        type: 'error',
        title: 'Invalid File Format',
        message: 'Only .svg vector files are allowed.'
      });
      return;
    }

    const fileReadPromises = validFiles.map((file, idx) => {
      return new Promise((resolve) => {
        // 1. Strict 20 KB size limit enforcement
        if (file.size > MAX_SVG_SIZE_BYTES) {
          onShowToast?.({
            type: 'error',
            title: 'File Size Exceeded (Max 20 KB)',
            message: `"${file.name}" (${(file.size / 1024).toFixed(1)} KB) exceeds the 20 KB limit.`
          });
          return resolve(null);
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          let content = event.target?.result;
          if (typeof content !== 'string') return resolve(null);

          // 2. Strict Security Scan: Block scripts and executable markup
          if (/<script|javascript:|<iframe|<embed|<object|data:text\/html/i.test(content)) {
            onShowToast?.({
              type: 'error',
              title: 'Unsafe SVG Blocked',
              message: `"${file.name}" contains prohibited scripts or external tags.`
            });
            return resolve(null);
          }

          // 3. Ensure viewBox is present
          if (!/<svg[^>]*\bviewBox=/i.test(content)) {
            const wMatch = content.match(/\bwidth=["']?(\d+)/i);
            const hMatch = content.match(/\bheight=["']?(\d+)/i);
            if (wMatch && hMatch) {
              content = content.replace(/<svg\b/i, `<svg viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`);
            }
          }

          resolve({
            file,
            content,
            idx
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      });
    });

    const parsedResults = (await Promise.all(fileReadPromises)).filter(Boolean);
    if (parsedResults.length === 0) return;

    // Collect all detected colors across all uploaded SVGs
    const combinedColorsSet = new Set(detectedHexes);
    parsedResults.forEach(({ content }) => {
      const colors = extractAllSvgColors(content);
      colors.forEach((c) => combinedColorsSet.add(c));
    });

    const allColorsArray = Array.from(combinedColorsSet);
    setDetectedHexes(allColorsArray);

    const nonNeutralColors = allColorsArray.filter(
      (c) => !['FFFFFF', '000000', 'FFF', '000'].includes(c)
    );

    if (nonNeutralColors.length > 0) {
      setHexColors(nonNeutralColors);
    } else if (allColorsArray.length > 0 && (hexColors.length === 1 && hexColors[0] === 'FF5F02')) {
      setHexColors(allColorsArray);
    }

    // Auto-fill icon name from first file if blank
    if (!iconName && variants.length === 0 && parsedResults.length > 0) {
      const firstFile = parsedResults[0].file;
      const baseName = firstFile.name
        .replace(/\.svg$/i, '')
        .replace(/-(default|dark|light|mono|wordmark|wordmark-dark|wordmark-light|logo)/i, '')
        .replace(/[-_]+/g, ' ');
      if (baseName) {
        const formatted = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        setIconName(formatted);
        setIconSlug(baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      }
    }

    // Atomically append all new variants with deduplicated smart names
    setVariants((prev) => {
      const updated = [...prev];
      const usedNames = new Set(updated.map((v) => v.variantName.toLowerCase()));

      parsedResults.forEach(({ file, content }, i) => {
        let smartName = getSmartVariantName(file.name, updated.length);
        let finalName = smartName;
        let counter = 1;
        while (usedNames.has(finalName.toLowerCase())) {
          finalName = `${smartName}-${counter}`;
          counter++;
        }
        usedNames.add(finalName.toLowerCase());

        updated.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i}`,
          variantName: finalName,
          fileName: file.name,
          fileSize: file.size,
          svgContent: content
        });
      });

      return updated;
    });

    onShowToast?.({
      type: 'success',
      title: 'SVG Assets Loaded',
      message: `Successfully loaded ${parsedResults.length} SVG variant(s).`
    });
  };

  // Handle selecting a detected color chip
  const handleSelectDetectedColor = (color) => {
    const clean = color.replace(/^#/, "").toUpperCase();
    if (!hexColors.includes(clean)) {
      setHexColors((prev) => [clean, ...prev]);
    } else {
      // Move to primary (index 0)
      setHexColors((prev) => [clean, ...prev.filter((c) => c !== clean)]);
    }
  };

  // Update a specific hex color by index
  const handleUpdateHex = (index, newHex) => {
    const clean = newHex.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
    setHexColors((prev) => prev.map((c, i) => (i === index ? clean : c)));
  };

  // Add another custom color input
  const handleAddCustomColor = () => {
    const defaultNewColor =
      detectedHexes.find((d) => !hexColors.includes(d)) || "3B82F6";
    setHexColors((prev) => [...prev, defaultNewColor]);
  };

  // Remove a color from list
  const handleRemoveHex = (index) => {
    if (hexColors.length > 1) {
      setHexColors((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Set color as primary (index 0)
  const handleSetPrimary = (index) => {
    if (index === 0) return;
    setHexColors((prev) => [
      prev[index],
      ...prev.filter((_, i) => i !== index),
    ]);
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
    const sanitized = newName.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, variantName: sanitized } : v)),
    );
  };

  // Remove a variant
  const handleRemoveVariant = (id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Computed JSON Schema Preview
  const schemaPreview = useMemo(() => {
    const s = iconSlug || "your-brand";
    const variantMap = {};

    if (variants.length === 0) {
      variantMap.default = `/icons/${s}/default.svg`;
      variantMap.mono = `/icons/${s}/mono.svg`;
      variantMap.dark = `/icons/${s}/dark.svg`;
    } else {
      variants.forEach((v) => {
        const vKey = v.variantName || "default";
        variantMap[vKey] = `/icons/${s}/${vKey}.svg`;
      });
    }

    const primaryHex = (hexColors[0] || "FF5F02").replace(/^#/, "");
    const cleanHexes = hexColors.map((h) => h.replace(/^#/, ""));

    const schemaObj = {
      slug: s,
      title: iconName || "Your Brand",
      aliases: [],
      hex: primaryHex,
      categories: selectedCategories,
      variants: variantMap,
      license,
      url: websiteUrl || `https://${s}.com`,
    };

    if (cleanHexes.length > 1) {
      schemaObj.hexes = cleanHexes;
    }

    return JSON.stringify(schemaObj, null, 2);
  }, [
    iconSlug,
    iconName,
    hexColors,
    selectedCategories,
    variants,
    license,
    websiteUrl,
  ]);

  // ── Form Submit Handler (fully client-side — no Cloudflare Function needed) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!iconName.trim()) newErrors.name = "Icon name is required";
    if (!iconSlug.trim()) newErrors.slug = "Slug is required";
    if (variants.length === 0)
      newErrors.svg = "Please upload at least one SVG file";

    const variantNames = variants.map((v) => v.variantName.trim());
    if (variantNames.some((v) => !v))
      newErrors.variants = "All variants must have a name";
    const uniqueNames = new Set(variantNames);
    if (uniqueNames.size !== variantNames.length)
      newErrors.variants =
        "Each variant must have a unique name (e.g., default, dark, mono)";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onShowToast?.({
        type: "error",
        title: "Validation Error",
        message: Object.values(newErrors)[0],
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const slug = iconSlug.trim().toLowerCase();
    const title = iconName.trim();
    const primaryHex = (hexColors[0] || "FF5F02")
      .replace(/^#/, "")
      .toUpperCase();
    const allHexes = hexColors.map((h) => h.replace(/^#/, "").toUpperCase());
    const iconUrl = websiteUrl.trim() || `https://${slug}.com`;
    const brandGuidelines = brandGuidelinesUrl.trim() || undefined;
    const SUPABASE_URL = (
      import.meta.env.VITE_DATABASE_URL ||
      "https://wexavetbwvlazhusuouu.supabase.co"
    ).replace(/\/+$/, "");
    const SUPABASE_ANON_KEY =
      import.meta.env.VITE_DATABASE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleGF2ZXRid3ZsYXpodXN1b3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDA2NzgsImV4cCI6MjEwMzA3NjY3OH0.dWhB2MYM-yNdmvGIkHRf53tTSsgVD6sFcfY_xIAnEms";

    try {
      // ── Step 1: Upload all SVG variants in parallel to Supabase Storage ──
      const uploadPromises = variants.map(async (v) => {
        const variantKey = v.variantName.trim().toLowerCase();
        const filePath = `${slug}/${variantKey}.svg`;
        const svgBytes = new TextEncoder().encode(v.svgContent);

        const uploadRes = await fetch(
          `${SUPABASE_URL}/storage/v1/object/svg-icons/${filePath}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              apikey: SUPABASE_ANON_KEY,
              "Content-Type": "image/svg+xml",
              "x-upsert": "true",
            },
            body: svgBytes,
          }
        );

        if (!uploadRes.ok) {
          const err = await uploadRes.text();
          throw new Error(`Upload failed for "${variantKey}": ${err}`);
        }

        return {
          key: variantKey,
          url: `${SUPABASE_URL}/storage/v1/object/public/svg-icons/${filePath}`
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      const storageUrls = {};
      uploadResults.forEach((r) => {
        storageUrls[r.key] = r.url;
      });

      // ── Step 2: Trigger submission via Supabase Edge Function ─────────────
      // (The Edge function securely reads GitHub PAT from Supabase app_config and fires GitHub Action)
      const edgeRes = await fetch(`${SUPABASE_URL}/functions/v1/submit-icon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          slug,
          title,
          hex: primaryHex,
          hexes: allHexes,
          categories: selectedCategories,
          aliases: [],
          license,
          url: iconUrl,
          guidelines: brandGuidelines,
          variants: storageUrls,
        }),
      });

      if (!edgeRes.ok) {
        const errJson = await edgeRes.json().catch(() => ({}));
        throw new Error(
          errJson.error || `Submission service error (${edgeRes.status})`,
        );
      }

      // ── Step 3: Show success + start 60-second countdown ─────────────────
      onShowToast?.({
        type: "success",
        title: "Processing started",
        message: `"${title}" with ${allHexes.length} brand color${allHexes.length > 1 ? "s" : ""} is being added.`,
      });

      setSubmissionResult({
        success: true,
        slug,
        title,
        variantCount: variants.length,
        colors: allHexes,
        storageUrls,
      });
      setCountdown(60);

      // Reset form
      setIconName("");
      setIconSlug("");
      setWebsiteUrl("");
      setBrandGuidelinesUrl("");
      setHexColors(["FF5F02"]);
      setDetectedHexes([]);
      setLicense("Apache-2.0");
      setSelectedCategories(["Software"]);
      setVariants([]);
      setErrors({});
    } catch (err) {
      console.error("Submit error:", err);
      onShowToast?.({
        type: "error",
        title: "Submission Failed",
        message: err.message || "Something went wrong. Check your env vars.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Countdown timer (ticks every second while success screen is shown) ────
  useEffect(() => {
    if (!submissionResult?.success) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [submissionResult, countdown]);

  // ── Submission Success Screen with Live Countdown ────────────────────────────
  if (submissionResult?.success) {
    const isDone = countdown <= 0;
    const progress = ((60 - countdown) / 60) * 100;
    const circumference = 2 * Math.PI * 44; // radius 44

    return (
      <div className="sv-submit-page-container">
        <div className="sv-submit-success-card glass-panel">
          {/* Circular countdown ring */}
          <div className="sv-countdown-ring-wrap">
            <svg className="sv-countdown-svg" viewBox="0 0 100 100">
              {/* background track */}
              <circle cx="50" cy="50" r="44" className="sv-ring-track" />
              {/* animated fill */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`sv-ring-fill ${isDone ? "sv-ring-done" : ""}`}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset:
                    circumference - (circumference * progress) / 100,
                }}
              />
            </svg>
            <div className="sv-countdown-center">
              {isDone ? (
                <CheckCircle2 size={32} className="sv-success-icon" />
              ) : (
                <span className="sv-countdown-number">{countdown}</span>
              )}
            </div>
          </div>

          <div className="sv-submit-badge-row" style={{ marginBottom: 4 }}>
            <span className="sv-submit-hero-pill">
              <Sparkles size={11} />
              <span>Supabase → GitHub Action → Cloudflare Pages</span>
            </span>
          </div>

          <h2 className="sv-success-title">
            {isDone ? "Icon Live" : "Processing..."}
          </h2>

          <p className="sv-success-desc">
            {isDone ? (
              <>
                <strong>{submissionResult.title}</strong> has been committed to
                the repo. Refresh the icon library to see it!
              </>
            ) : (
              <>
                GitHub Action is downloading{" "}
                <strong>{submissionResult.title}</strong> from Supabase and
                committing it to the repo. Should be live in{" "}
                <strong>{countdown}s</strong>.
              </>
            )}
          </p>

          {/* Meta chips */}
          <div className="sv-success-meta-grid">
            <div className="sv-success-meta-item">
              <span className="sv-success-meta-label">SLUG</span>
              <code className="sv-success-meta-val">
                {submissionResult.slug}
              </code>
            </div>
            <div className="sv-success-meta-item">
              <span className="sv-success-meta-label">VARIANTS</span>
              <code className="sv-success-meta-val">
                {submissionResult.variantCount} uploaded
              </code>
            </div>
            {submissionResult.colors && submissionResult.colors.length > 0 && (
              <div className="sv-success-meta-item sv-success-colors-item">
                <span className="sv-success-meta-label">BRAND COLORS</span>
                <div className="sv-success-color-dots-row">
                  {submissionResult.colors.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className="sv-success-color-pill"
                      style={{ borderLeftColor: `#${c}` }}
                      title={`#${c}`}
                    >
                      <span
                        className="sv-dot"
                        style={{ backgroundColor: `#${c}` }}
                      />
                      #{c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sv-success-actions-row">
            <a
              href="https://github.com/syed-sameer-ul-hassan/SVG.IO/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="sv-repo-action-btn"
            >
              <Eye size={14} />
              <span>Watch Action</span>
              <ExternalLink size={12} />
            </a>
            <button
              className="sv-submit-action-btn"
              style={{ flex: 1 }}
              onClick={() => {
                setSubmissionResult(null);
                setCountdown(60);
              }}
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
            <h1 className="sv-submit-main-title">Submit SVG Icons</h1>
            <p className="sv-submit-main-sub">
              Contribute new brands or submit icon variants. Quick submit
              directly on the site, or fork the repository to contribute.
            </p>
          </div>

          {/* Icon Pack & Full Variant Sets Card */}
          <div className="sv-pack-requirement-card glass-panel">
            <div className="sv-pack-header">
              <div className="sv-pack-badge">
                ICON PACK &amp; VARIANT STANDARD
              </div>
              <h3 className="sv-pack-title">Full Variant Sets Coverage</h3>
            </div>
            <p className="sv-pack-desc">
              To maintain complete library coverage, submissions should provide
              all standard brand variants:
            </p>
            <div className="sv-pack-variants-grid">
              <div className="sv-pack-variant-pill">
                <code>default</code>
                <span className="sv-pv-sub">Standard Color</span>
              </div>
              <div className="sv-pack-variant-pill">
                <code>light</code>
                <span className="sv-pv-sub">For Dark Mode</span>
              </div>
              <div className="sv-pack-variant-pill">
                <code>dark</code>
                <span className="sv-pv-sub">For Light Mode</span>
              </div>
              <div className="sv-pack-variant-pill">
                <code>wordmark-dark</code>
                <span className="sv-pv-sub">Logo + Typography</span>
              </div>
              <div className="sv-pack-variant-pill">
                <code>wordmark-light</code>
                <span className="sv-pv-sub">Logo + Dark Mode</span>
              </div>
              <div className="sv-pack-variant-pill">
                <code>mono</code>
                <span className="sv-pv-sub">Single Color Glyph</span>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="sv-how-it-works-section">
            <h2 className="sv-section-header-title">
              How to Contribute via Fork & PR
            </h2>
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
                  Fork <code>github.com/syed-sameer-ul-hassan/SVG.IO</code> and
                  clone locally.
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
                  Place files in <code>public/icons/[slug]/</code> with proper
                  naming.
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
                  Add entries to <code>public/icons.json</code> and run{" "}
                  <code>npm run build:icons</code>.
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
                  Verify metadata and open your PR for automated CI merge.
                </p>
              </div>
            </div>
          </div>

          {/* SVG Requirements Card */}
          <div className="sv-req-card glass-panel">
            <h3 className="sv-req-title">SVG Limits & Quality Standards</h3>
            <ul className="sv-req-list">
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>
                  <strong>Maximum 20 KB</strong> file size limit per SVG
                </span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>
                  <strong>Only .svg</strong> vector format accepted
                </span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>
                  <strong>viewBox attribute</strong> mandatory on root
                  &lt;svg&gt;
                </span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>
                  <strong>Strictly no scripts</strong>, foreign objects, or
                  embedded raster images
                </span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>
                  <strong>Full variant coverage</strong>: default, light, dark,
                  wordmark-dark, wordmark-light
                </span>
              </li>
              <li>
                <CheckCircle2 size={15} className="sv-req-check" />
                <span>
                  <strong>Multi-color &amp; gradients</strong> fully supported
                  with auto-detected hex palette
                </span>
              </li>
            </ul>
          </div>

          {/* Action Links */}
          <div className="sv-repo-links-row">
            <a
              href="https://github.com/syed-sameer-ul-hassan/SVG.IO"
              target="_blank"
              rel="noopener noreferrer"
              className="sv-repo-action-btn"
            >
              <Github size={14} />
              <span>GitHub Repository</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/syed-sameer-ul-hassan/SVG.IO/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="sv-repo-action-btn"
            >
              <AlertCircle size={14} />
              <span>Issues &amp; Requests</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Live Icon Entry Schema Preview */}
          <div className="sv-schema-preview-box glass-panel">
            <div className="sv-schema-header">
              <span className="sv-schema-title">Icon Entry Schema</span>
              <span className="sv-schema-sub">
                public/icons.json format ({variants.length} variant
                {variants.length !== 1 ? "s" : ""})
              </span>
            </div>
            <pre className="sv-schema-code">
              <code>{schemaPreview}</code>
            </pre>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: QUICK SUBMIT ================= */}
        <div className="sv-submit-right-col">
          <form
            className="sv-submit-form-card glass-panel"
            onSubmit={handleSubmit}
          >
            <div className="sv-form-header">
              <h2 className="sv-form-title">Quick Submit</h2>
              <p className="sv-form-sub">
                Drop one or multiple SVGs, name each variant, and save directly
                to Supabase &amp; GitHub.
              </p>
            </div>

            {/* Quality Checklist Badges */}
            <div className="sv-quality-badges-row">
              <span className="sv-q-badge">
                <Check size={11} /> Max 20 KB / SVG
              </span>
              <span className="sv-q-badge">
                <Check size={11} /> .svg Only
              </span>
              <span className="sv-q-badge">
                <Check size={11} /> viewBox Ready
              </span>
              <span className="sv-q-badge">
                <Check size={11} /> Auto Hex Detection
              </span>
            </div>

            {/* SVG Multi-File Drag & Drop Area */}
            <div className="sv-form-group">
              <div className="sv-label-with-help">
                <label className="sv-form-label">
                  SVG Variants ({variants.length}){" "}
                  <span className="req">*</span>
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
                style={{ display: "none" }}
                onChange={(e) => processFiles(e.target.files)}
              />

              {/* Dropzone (when 0 variants or user wants to drop) */}
              {variants.length === 0 ? (
                <div
                  className={`sv-dropzone ${isDragging ? "is-dragging" : ""} ${errors.svg ? "has-error" : ""}`}
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
                    style={{ display: "none" }}
                    onChange={(e) => processFiles(e.target.files)}
                  />
                  <div className="sv-dropzone-icon-wrap">
                    <UploadCloud size={28} className="sv-dropzone-icon" />
                  </div>
                  <span className="sv-dropzone-main-text">
                    Drag & drop your SVG files (Single or Multiple)
                  </span>
                  <span className="sv-dropzone-sub-text">
                    or click to browse • .svg files only, max 20KB per SVG
                  </span>
                </div>
              ) : null}

              {/* Uploaded Variants List */}
              {variants.length > 0 && (
                <div
                  className={`sv-multi-variants-container ${isDragging ? "is-dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="sv-variants-list">
                    {variants.map((v, idx) => (
                      <div
                        key={v.id}
                        className="sv-variant-item-card glass-panel"
                      >
                        <div className="sv-variant-preview-circle">
                          <div
                            className="sv-variant-svg-wrapper"
                            dangerouslySetInnerHTML={{ __html: v.svgContent }}
                          />
                        </div>

                        <div className="sv-variant-fields">
                          <div className="sv-variant-name-row">
                            <label className="sv-variant-field-label">
                              Variant Name / Key:
                            </label>
                            <input
                              type="text"
                              className="sv-variant-name-input"
                              placeholder="e.g. default, dark, mono"
                              value={v.variantName}
                              onChange={(e) =>
                                handleUpdateVariantName(v.id, e.target.value)
                              }
                            />
                            {idx === 0 && (
                              <span className="sv-primary-badge">PRIMARY</span>
                            )}
                          </div>

                          {/* Quick Preset Buttons */}
                          <div className="sv-variant-presets-row">
                            {PRESET_VARIANT_NAMES.map((pName) => (
                              <button
                                key={pName}
                                type="button"
                                className={`sv-preset-btn ${v.variantName === pName ? "active" : ""}`}
                                onClick={() =>
                                  handleUpdateVariantName(v.id, pName)
                                }
                              >
                                {pName}
                              </button>
                            ))}
                          </div>

                          <div className="sv-variant-meta-row">
                            <span className="sv-variant-file-name">
                              {v.fileName}
                            </span>
                            <span className="sv-variant-file-size">
                              {(v.fileSize / 1024).toFixed(1)} KB • Target:{" "}
                              <code>
                                icons/{iconSlug || "slug"}/
                                {v.variantName || "default"}.svg
                              </code>
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
                    <span>
                      Drop more SVGs or click here to add another variant
                    </span>
                  </div>
                </div>
              )}

              {errors.svg && (
                <span className="sv-field-error">{errors.svg}</span>
              )}
              {errors.variants && (
                <span className="sv-field-error">{errors.variants}</span>
              )}
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
                  className={`sv-form-input ${errors.name ? "has-error" : ""}`}
                  placeholder="e.g. Vercel"
                  value={iconName}
                  onChange={handleNameChange}
                />
                {errors.name && (
                  <span className="sv-field-error">{errors.name}</span>
                )}
              </div>

              <div className="sv-form-group">
                <label className="sv-form-label">
                  Slug (kebab-case) <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className={`sv-form-input ${errors.slug ? "has-error" : ""}`}
                  placeholder="e.g. vercel"
                  value={iconSlug}
                  onChange={(e) =>
                    setIconSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                />
                {errors.slug && (
                  <span className="sv-field-error">{errors.slug}</span>
                )}
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

            {/* Auto-Detected Colors from Uploaded SVGs */}
            {detectedHexes.length > 0 && (
              <div className="sv-form-group sv-detected-colors-group">
                <div className="sv-label-with-help">
                  <label className="sv-form-label">
                    Auto-Detected Colors from SVGs ({detectedHexes.length})
                  </label>
                  <span className="sv-detected-hint">
                    Click a color to add or set as primary
                  </span>
                </div>
                <div className="sv-detected-chips-grid">
                  {detectedHexes.map((hex) => {
                    const isSelected = hexColors.includes(hex);
                    const isPrimary = hexColors[0] === hex;
                    return (
                      <button
                        key={hex}
                        type="button"
                        className={`sv-detected-color-chip ${isSelected ? "is-selected" : ""} ${isPrimary ? "is-primary" : ""}`}
                        onClick={() => handleSelectDetectedColor(hex)}
                        title={`Click to ${isPrimary ? "use" : isSelected ? "set as primary" : "add"} #${hex}`}
                      >
                        <span
                          className="sv-detected-color-dot"
                          style={{ backgroundColor: `#${hex}` }}
                        />
                        <span className="sv-detected-color-code">#{hex}</span>
                        {isPrimary && (
                          <span className="sv-color-primary-tag">PRIMARY</span>
                        )}
                        {isSelected && !isPrimary && (
                          <Check size={11} className="sv-color-check-icon" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Brand Hex Colors (Supports Multiple) */}
            <div className="sv-form-group">
              <div className="sv-label-with-help">
                <label className="sv-form-label">
                  Brand Hex Color{hexColors.length > 1 ? "s" : ""} (
                  {hexColors.length}) <span className="req">*</span>
                </label>
                <button
                  type="button"
                  className="sv-add-color-btn"
                  onClick={handleAddCustomColor}
                >
                  <Plus size={12} />
                  <span>Add Another Color</span>
                </button>
              </div>

              <div className="sv-multi-colors-list">
                {hexColors.map((color, idx) => {
                  const safeHex = color.replace(/^#/, "").toUpperCase();
                  const isPrimary = idx === 0;

                  return (
                    <div key={idx} className="sv-color-row-item">
                      <div className="sv-color-picker-box">
                        <input
                          type="color"
                          value={
                            safeHex.length === 6 ? `#${safeHex}` : "#FF5F02"
                          }
                          onChange={(e) =>
                            handleUpdateHex(
                              idx,
                              e.target.value.replace(/^#/, "").toUpperCase(),
                            )
                          }
                          className="sv-native-color-picker"
                          title="Click to open color picker"
                        />
                        <div
                          className="sv-color-swatch-preview"
                          style={{ backgroundColor: `#${safeHex}` }}
                        />
                      </div>

                      <div className="sv-hex-input-group">
                        <span className="sv-hex-prefix">#</span>
                        <input
                          type="text"
                          className="sv-form-input sv-hex-input"
                          placeholder="FF5F02"
                          maxLength={6}
                          value={safeHex}
                          onChange={(e) =>
                            handleUpdateHex(
                              idx,
                              e.target.value
                                .replace(/[^0-9a-fA-F]/g, "")
                                .toUpperCase(),
                            )
                          }
                        />
                      </div>

                      {isPrimary ? (
                        <span className="sv-primary-color-badge">PRIMARY</span>
                      ) : (
                        <button
                          type="button"
                          className="sv-make-primary-btn"
                          onClick={() => handleSetPrimary(idx)}
                          title="Set as primary brand color"
                        >
                          Make Primary
                        </button>
                      )}

                      {hexColors.length > 1 && (
                        <button
                          type="button"
                          className="sv-remove-color-btn"
                          onClick={() => handleRemoveHex(idx)}
                          title="Remove color"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
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
                  Help me pick · Licensing guide
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
                      className={`sv-cat-pill-toggle ${isSelected ? "active" : ""}`}
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
                  <span>
                    Creating Folder & Saving {variants.length} SVG(s)...
                  </span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>
                    Submit Icon ({variants.length} Variant
                    {variants.length !== 1 ? "s" : ""}) & Auto-Create Folder
                  </span>
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
