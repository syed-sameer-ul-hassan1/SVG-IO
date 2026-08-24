import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback } from
"react";
import {
  UploadCloud,
  CheckCircle2,
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
  Package } from
"lucide-react";

const MAX_SVG_SIZE_BYTES = 20 * 1024;

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
"Social"];


const TOTAL_PIPELINE_SECONDS = 600; // 10 minutes

function formatPipelineTime(seconds) {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const CUSTOM_CATEGORIES_KEY = "svgio_custom_created_categories";

const getSavedCustomCategories = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not read custom categories from localStorage:", e);
  }
  return [];
};

const saveCustomCategoriesToStorage = (categories) => {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.warn("Could not save custom categories to localStorage:", e);
  }
};

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
"duotone"];


export function SubmitPage({
  onIconAdded,
  onShowToast,
  onNavigate,
  totalIcons = 6516
}) {

  const [iconName, setIconName] = useState("");
  const [iconSlug, setIconSlug] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandGuidelinesUrl, setBrandGuidelinesUrl] = useState("");
  const [hexColors, setHexColors] = useState(["FF5F02"]);
  const [detectedHexes, setDetectedHexes] = useState([]);
  const [license, setLicense] = useState("Apache-2.0");
  const [selectedCategories, setSelectedCategories] = useState(["Software"]);
  const [customCategories, setCustomCategories] = useState(() => getSavedCustomCategories());
  const [categoriesList, setCategoriesList] = useState(() => {
    const saved = getSavedCustomCategories();
    const unique = [...saved];
    POPULAR_CATEGORIES.forEach((c) => {
      if (!unique.some((u) => u.toLowerCase() === c.toLowerCase())) {
        unique.push(c);
      }
    });
    return unique;
  });
  const [newCategoryInput, setNewCategoryInput] = useState("");


  const [variants, setVariants] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [countdown, setCountdown] = useState(TOTAL_PIPELINE_SECONDS);

  const fileInputRef = useRef(null);
  const addMoreInputRef = useRef(null);


  const handleNameChange = (e) => {
    const val = e.target.value;
    setIconName(val);
    const autoSlug = val.
    toLowerCase().
    replace(/[^a-z0-9]+/g, "-").
    replace(/(^-|-$)/g, "");
    setIconSlug(autoSlug);
  };


  const handleToggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      } else {
        onShowToast?.({
          type: "info",
          title: "Minimum 1 Category",
          message: "An icon must belong to at least one category."
        });
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddNewCategory = (e) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;

    // Capitalize first letters neatly
    const formatted = trimmed
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Check if category already exists (case-insensitive check)
    const existing = categoriesList.find(
      (c) => c.toLowerCase() === formatted.toLowerCase()
    );
    const finalCat = existing || formatted;

    // Update categoriesList
    if (!categoriesList.some((c) => c.toLowerCase() === finalCat.toLowerCase())) {
      setCategoriesList((prev) => [finalCat, ...prev]);
    }

    // Persist permanently in customCategories state & localStorage
    const updatedCustom = [finalCat, ...customCategories.filter((c) => c.toLowerCase() !== finalCat.toLowerCase())];
    setCustomCategories(updatedCustom);
    saveCustomCategoriesToStorage(updatedCustom);

    if (!selectedCategories.includes(finalCat)) {
      setSelectedCategories((prev) => [...prev, finalCat]);
    }

    setNewCategoryInput("");
    onShowToast?.({
      type: "success",
      title: "Category Created & Saved Permanently",
      message: `"${finalCat}" is now permanently available in your categories list.`
    });
  };

  const handleRemoveCustomCategory = (e, catToRemove) => {
    e.stopPropagation();
    const updatedCustom = customCategories.filter((c) => c !== catToRemove);
    setCustomCategories(updatedCustom);
    saveCustomCategoriesToStorage(updatedCustom);
    setCategoriesList((prev) => prev.filter((c) => c !== catToRemove));
    if (selectedCategories.includes(catToRemove)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== catToRemove));
    }
    onShowToast?.({
      type: "info",
      title: "Category Removed",
      message: `"${catToRemove}" removed from custom categories.`
    });
  };


  const normalizeHex = (hexStr) => {
    if (!hexStr) return null;
    let h = hexStr.replace(/^#/, "").trim();
    if (h.length === 3) {
      h = h.
      split("").
      map((c) => c + c).
      join("");
    } else if (h.length === 8) {
      h = h.substring(0, 6);
    } else if (h.length === 4) {
      h = h.
      substring(0, 3).
      split("").
      map((c) => c + c).
      join("");
    }
    if (/^[0-9a-fA-F]{6}$/.test(h)) {
      return h.toUpperCase();
    }
    return null;
  };


  const rgbToHex = (r, g, b) => {
    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, Math.round(Number(n)))).toString(
        16
      );
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };


  const extractAllSvgColors = (svgContent) => {
    if (!svgContent || typeof svgContent !== "string") return [];
    const colorCounts = new Map();

    const addColor = (rawColor) => {
      if (!rawColor) return;
      const clean = rawColor.trim();
      if (
      ["none", "transparent", "currentcolor", "inherit", "initial"].includes(
        clean.toLowerCase()
      ))
      {
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
        /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i
      );
      if (rgbMatch) {
        const hex = rgbToHex(rgbMatch[1], rgbMatch[2], rgbMatch[3]);
        colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
        return;
      }
    };


    const attrMatches = svgContent.matchAll(
      /(?:fill|stroke|stop-color|color)\s*=\s*["']([^"']+)["']/gi
    );
    for (const m of attrMatches) {
      addColor(m[1]);
    }


    const styleMatches = svgContent.matchAll(
      /(?:fill|stroke|stop-color|color)\s*:\s*([^;}"'\s]+)/gi
    );
    for (const m of styleMatches) {
      addColor(m[1]);
    }


    const generalHexMatches = svgContent.matchAll(
      /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g
    );
    for (const m of generalHexMatches) {
      addColor(m[0]);
    }

    return Array.from(colorCounts.entries()).
    sort((a, b) => b[1] - a[1]).
    map(([hex]) => hex);
  };


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


          if (/<script|javascript:|<iframe|<embed|<object|data:text\/html/i.test(content)) {
            onShowToast?.({
              type: 'error',
              title: 'Unsafe SVG Blocked',
              message: `"${file.name}" contains prohibited scripts or external tags.`
            });
            return resolve(null);
          }


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
    } else if (allColorsArray.length > 0 && hexColors.length === 1 && hexColors[0] === 'FF5F02') {
      setHexColors(allColorsArray);
    }


    if (!iconName && variants.length === 0 && parsedResults.length > 0) {
      const firstFile = parsedResults[0].file;
      const baseName = firstFile.name.
      replace(/\.svg$/i, '').
      replace(/-(default|dark|light|mono|wordmark|wordmark-dark|wordmark-light|logo)/i, '').
      replace(/[-_]+/g, ' ');
      if (baseName) {
        const formatted = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        setIconName(formatted);
        setIconSlug(baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      }
    }


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


  const handleSelectDetectedColor = (color) => {
    const clean = color.replace(/^#/, "").toUpperCase();
    if (!hexColors.includes(clean)) {
      setHexColors((prev) => [clean, ...prev]);
    } else {

      setHexColors((prev) => [clean, ...prev.filter((c) => c !== clean)]);
    }
  };


  const handleUpdateHex = (index, newHex) => {
    const clean = newHex.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
    setHexColors((prev) => prev.map((c, i) => i === index ? clean : c));
  };


  const handleAddCustomColor = () => {
    const defaultNewColor =
    detectedHexes.find((d) => !hexColors.includes(d)) || "3B82F6";
    setHexColors((prev) => [...prev, defaultNewColor]);
  };


  const handleRemoveHex = (index) => {
    if (hexColors.length > 1) {
      setHexColors((prev) => prev.filter((_, i) => i !== index));
    }
  };


  const handleSetPrimary = (index) => {
    if (index === 0) return;
    setHexColors((prev) => [
    prev[index],
    ...prev.filter((_, i) => i !== index)]
    );
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


  const handleUpdateVariantName = (id, newName) => {
    const sanitized = newName.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    setVariants((prev) =>
    prev.map((v) => v.id === id ? { ...v, variantName: sanitized } : v)
    );
  };


  const handleRemoveVariant = (id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };


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
      url: websiteUrl || `https://${s}.com`
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
  websiteUrl]
  );


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
        message: Object.values(newErrors)[0]
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const slug = iconSlug.trim().toLowerCase();
    const title = iconName.trim();
    const primaryHex = (hexColors[0] || "FF5F02").
    replace(/^#/, "").
    toUpperCase();
    const allHexes = hexColors.map((h) => h.replace(/^#/, "").toUpperCase());
    const iconUrl = websiteUrl.trim() || `https://${slug}.com`;
    const brandGuidelines = brandGuidelinesUrl.trim() || undefined;
    const SUPABASE_URL = (
    import.meta.env.VITE_DATABASE_URL ||
    "https://wexavetbwvlazhusuouu.supabase.co").
    replace(/\/+$/, "");
    const SUPABASE_ANON_KEY =
    import.meta.env.VITE_DATABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleGF2ZXRid3ZsYXpodXN1b3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDA2NzgsImV4cCI6MjEwMzA3NjY3OH0.dWhB2MYM-yNdmvGIkHRf53tTSsgVD6sFcfY_xIAnEms";

    try {

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
              "x-upsert": "true"
            },
            body: svgBytes
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



      const edgeRes = await fetch(`${SUPABASE_URL}/functions/v1/submit-icon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY
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
          variants: storageUrls
        })
      });

      if (!edgeRes.ok) {
        const errJson = await edgeRes.json().catch(() => ({}));
        throw new Error(
          errJson.error || `Submission service error (${edgeRes.status})`
        );
      }


      onShowToast?.({
        type: "success",
        title: "Processing started",
        message: `"${title}" with ${allHexes.length} brand color${allHexes.length > 1 ? "s" : ""} is being added.`
      });

      setSubmissionResult({
        success: true,
        slug,
        title,
        variantCount: variants.length,
        colors: allHexes,
        storageUrls
      });
      setCountdown(TOTAL_PIPELINE_SECONDS);


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
        message: err.message || "Something went wrong. Check your env vars."
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    if (!submissionResult?.success) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [submissionResult, countdown]);


  if (submissionResult?.success) {
    const isDone = countdown <= 0;
    const progress = Math.min(100, Math.max(0, ((TOTAL_PIPELINE_SECONDS - countdown) / TOTAL_PIPELINE_SECONDS) * 100));

    return (
      <div className="sv-pipeline-page-container">
        <div className="sv-pipeline-hero glass-panel">
          <div className="sv-pipeline-hero-left">
            <div className="sv-pipeline-status-badge">
              <span className={`sv-pipeline-pulse-dot ${isDone ? 'done' : 'active'}`} />
              <span>{isDone ? 'DEPLOYMENT COMPLETED' : 'AUTOMATED CI/CD PIPELINE ACTIVE'}</span>
            </div>

            <h1 className="sv-pipeline-hero-title">
              {isDone ? 'Successfully Published' : 'Processing'}{' '}
              <span className="text-orange">{submissionResult.title}</span>
            </h1>

            <p className="sv-pipeline-hero-desc">
              {isDone ? (
                <>
                  <strong>{submissionResult.title}</strong> has been committed to the repository and compiled into the global index.
                </>
              ) : (
                <>
                  Vector assets uploaded and verified. Automated Edge Build Engine is compiling <code>icons.json</code> and propagating to global CDN.
                </>
              )}
            </p>
          </div>

          <div className="sv-pipeline-hero-right">
            <div className="sv-pipeline-countdown-card glass-panel">
              <div className="sv-pipeline-time-num">
                {isDone ? <CheckCircle2 size={36} className="text-emerald" /> : formatPipelineTime(countdown)}
              </div>
              <div className="sv-pipeline-time-label">
                {isDone ? 'Ready in Library' : 'Estimated Time (10m)'}
              </div>
            </div>
          </div>
        </div>

        <div className="sv-pipeline-progress-bar-wrap glass-panel">
          <div className="sv-pipeline-progress-header">
            <span>Overall Pipeline Progress</span>
            <span className="sv-pipeline-percent">{isDone ? '100%' : `${Math.round(progress)}%`}</span>
          </div>
          <div className="sv-pipeline-track">
            <div className="sv-pipeline-fill" style={{ width: `${isDone ? 100 : progress}%` }} />
          </div>
        </div>

        <div className="sv-pipeline-grid">
          <div className="sv-pipeline-stages-col">
            <h3 className="sv-pipeline-col-title">Pipeline Execution Stages</h3>

            <div className="sv-pipeline-stage-card glass-panel completed">
              <div className="sv-stage-step-num"><Check size={14} /></div>
              <div className="sv-stage-info">
                <div className="sv-stage-title-row">
                  <span className="sv-stage-title">1. Vector Asset Validation & Ingestion</span>
                  <span className="sv-stage-tag done">COMPLETED</span>
                </div>
                <p className="sv-stage-desc">
                  Validated SVG markup, verified viewBox integrity, and uploaded {submissionResult.variantCount} variant(s).
                </p>
              </div>
            </div>

            <div className={`sv-pipeline-stage-card glass-panel ${countdown <= (TOTAL_PIPELINE_SECONDS - 45) ? 'completed' : 'active'}`}>
              <div className="sv-stage-step-num">
                {countdown <= (TOTAL_PIPELINE_SECONDS - 45) ? <Check size={14} /> : <div className="sv-spinner-sm" />}
              </div>
              <div className="sv-stage-info">
                <div className="sv-stage-title-row">
                  <span className="sv-stage-title">2. Automated CI/CD Compilation Engine</span>
                  <span className={`sv-stage-tag ${countdown <= (TOTAL_PIPELINE_SECONDS - 45) ? 'done' : 'active'}`}>
                    {countdown <= (TOTAL_PIPELINE_SECONDS - 45) ? 'PROCESSED' : 'DISPATCHING'}
                  </span>
                </div>
                <p className="sv-stage-desc">
                  Triggered automated packaging workflow and verified vector asset integrity.
                </p>
              </div>
            </div>

            <div className={`sv-pipeline-stage-card glass-panel ${isDone ? 'completed' : countdown <= (TOTAL_PIPELINE_SECONDS - 90) ? 'active' : 'pending'}`}>
              <div className="sv-stage-step-num">
                {isDone ? <Check size={14} /> : countdown <= (TOTAL_PIPELINE_SECONDS - 90) ? <div className="sv-spinner-sm" /> : <span>3</span>}
              </div>
              <div className="sv-stage-info">
                <div className="sv-stage-title-row">
                  <span className="sv-stage-title">3. Catalog Compilation & Indexing</span>
                  <span className={`sv-stage-tag ${isDone ? 'done' : countdown <= (TOTAL_PIPELINE_SECONDS - 90) ? 'active' : 'pending'}`}>
                    {isDone ? 'COMPILED' : countdown <= (TOTAL_PIPELINE_SECONDS - 90) ? 'IN PROGRESS' : 'QUEUED'}
                  </span>
                </div>
                <p className="sv-stage-desc">
                  Parsing hex swatches, updating <code>public/icons.json</code>, and generating vector assets.
                </p>
              </div>
            </div>

            <div className={`sv-pipeline-stage-card glass-panel ${isDone ? 'completed' : countdown <= 90 ? 'active' : 'pending'}`}>
              <div className="sv-stage-step-num">
                {isDone ? <Check size={14} /> : countdown <= 90 ? <div className="sv-spinner-sm" /> : <span>4</span>}
              </div>
              <div className="sv-stage-info">
                <div className="sv-stage-title-row">
                  <span className="sv-stage-title">4. Edge CDN Global Release</span>
                  <span className={`sv-stage-tag ${isDone ? 'done' : countdown <= 90 ? 'active' : 'pending'}`}>
                    {isDone ? 'LIVE ON EDGE' : countdown <= 90 ? 'PROPAGATING' : 'PENDING'}
                  </span>
                </div>
                <p className="sv-stage-desc">
                  Atomic deployment to global edge CDN at <code>svg.io.orildo.tech</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="sv-pipeline-spec-col">
            <h3 className="sv-pipeline-col-title">Submitted Asset Specifications</h3>

            <div className="sv-pipeline-spec-card glass-panel">
              <div className="sv-spec-row">
                <span className="sv-spec-label">IDENTIFIER SLUG</span>
                <code className="sv-spec-val">{submissionResult.slug}</code>
              </div>

              <div className="sv-spec-row">
                <span className="sv-spec-label">CANONICAL TITLE</span>
                <span className="sv-spec-val-text">{submissionResult.title}</span>
              </div>

              <div className="sv-spec-row">
                <span className="sv-spec-label">VARIANTS UPLOADED</span>
                <span className="sv-spec-badge">{submissionResult.variantCount} Variant Sets</span>
              </div>

              <div className="sv-spec-row">
                <span className="sv-spec-label">PRIMARY HEX</span>
                <div className="sv-spec-hex-row">
                  <span
                    className="sv-spec-color-dot"
                    style={{ backgroundColor: `#${submissionResult.colors?.[0] || 'FF5F02'}` }}
                  />
                  <code>#{submissionResult.colors?.[0] || 'FF5F02'}</code>
                </div>
              </div>

              <div className="sv-spec-row">
                <span className="sv-spec-label">LICENSE</span>
                <span className="sv-spec-badge license">Apache-2.0</span>
              </div>
            </div>

            <div className="sv-pipeline-actions-row">
              <a
                href="https://github.com/Orildo-Tech/SVG-IO/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="sv-pipeline-gh-btn">
                <Github size={15} />
                <span>View GitHub Action Run</span>
                <ExternalLink size={13} />
              </a>

              <button
                type="button"
                className="sv-pipeline-new-btn"
                onClick={() => {
                  setSubmissionResult(null);
                  setCountdown(TOTAL_PIPELINE_SECONDS);
                }}>
                <Plus size={16} />
                <span>Submit Another Vector</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-submit-page-container">
      {}
      <div className="sv-submit-main-grid">
        {}
        <div className="sv-submit-left-col">
          {}
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

          {}
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

          {}
          <div className="sv-repo-links-row">
            <a
              href="https://github.com/Orildo-Tech/SVG-IO"
              target="_blank"
              rel="noopener noreferrer"
              className="sv-repo-action-btn">
              
              <Github size={14} />
              <span>GitHub Repository</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/Orildo-Tech/SVG-IO/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="sv-repo-action-btn">
              
              <AlertCircle size={14} />
              <span>Issues &amp; Requests</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {}
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

        {}
        <div className="sv-submit-right-col">
          <form
            className="sv-submit-form-card glass-panel"
            onSubmit={handleSubmit}>
            
            <div className="sv-form-header">
              <h2 className="sv-form-title">Quick Submit</h2>
              <p className="sv-form-sub">
                Drop one or multiple SVGs, name each variant, and publish directly
                to the global vector library.
              </p>
            </div>

            {}
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

            {}
            <div className="sv-form-group">
              <div className="sv-label-with-help">
                <label className="sv-form-label">
                  SVG Variants ({variants.length}){" "}
                  <span className="req">*</span>
                </label>
                {variants.length > 0 &&
                <button
                  type="button"
                  className="sv-add-more-pill-btn"
                  onClick={() => addMoreInputRef.current?.click()}>
                  
                    <Plus size={12} />
                    <span>Add Another Variant</span>
                  </button>
                }
              </div>

              {}
              <input
                ref={addMoreInputRef}
                type="file"
                accept=".svg"
                multiple
                style={{ display: "none" }}
                onChange={(e) => processFiles(e.target.files)} />
              

              {}
              {variants.length === 0 ?
              <div
                className={`sv-dropzone ${isDragging ? "is-dragging" : ""} ${errors.svg ? "has-error" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}>
                
                  <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => processFiles(e.target.files)} />
                
                  <div className="sv-dropzone-icon-wrap">
                    <UploadCloud size={28} className="sv-dropzone-icon" />
                  </div>
                  <span className="sv-dropzone-main-text">
                    Drag & drop your SVG files (Single or Multiple)
                  </span>
                  <span className="sv-dropzone-sub-text">
                    or click to browse • .svg files only, max 20KB per SVG
                  </span>
                </div> :
              null}

              {}
              {variants.length > 0 &&
              <div
                className={`sv-multi-variants-container ${isDragging ? "is-dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}>
                
                  <div className="sv-variants-list">
                    {variants.map((v, idx) =>
                  <div
                    key={v.id}
                    className="sv-variant-item-card glass-panel">
                    
                        <div className="sv-variant-preview-circle">
                          <div
                        className="sv-variant-svg-wrapper"
                        dangerouslySetInnerHTML={{ __html: v.svgContent }} />
                      
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
                          } />
                        
                            {idx === 0 &&
                        <span className="sv-primary-badge">PRIMARY</span>
                        }
                          </div>

                          {}
                          <div className="sv-variant-presets-row">
                            {PRESET_VARIANT_NAMES.map((pName) =>
                        <button
                          key={pName}
                          type="button"
                          className={`sv-preset-btn ${v.variantName === pName ? "active" : ""}`}
                          onClick={() =>
                          handleUpdateVariantName(v.id, pName)
                          }>
                          
                                {pName}
                              </button>
                        )}
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
                      title="Remove variant">
                      
                          <Trash2 size={14} />
                        </button>
                      </div>
                  )}
                  </div>

                  {}
                  <div
                  className="sv-add-drop-footer"
                  onClick={() => addMoreInputRef.current?.click()}>
                  
                    <Plus size={14} />
                    <span>
                      Drop more SVGs or click here to add another variant
                    </span>
                  </div>
                </div>
              }

              {errors.svg &&
              <span className="sv-field-error">{errors.svg}</span>
              }
              {errors.variants &&
              <span className="sv-field-error">{errors.variants}</span>
              }
            </div>

            {}
            <div className="sv-form-section-title">Icon Details</div>

            {}
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
                  onChange={handleNameChange} />
                
                {errors.name &&
                <span className="sv-field-error">{errors.name}</span>
                }
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
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                  } />
                
                {errors.slug &&
                <span className="sv-field-error">{errors.slug}</span>
                }
              </div>
            </div>

            {}
            <div className="sv-form-group">
              <label className="sv-form-label">Website URL</label>
              <input
                type="url"
                className="sv-form-input"
                placeholder="https://vercel.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)} />
              
            </div>

            {}
            <div className="sv-form-group">
              <label className="sv-form-label">Brand guidelines URL</label>
              <input
                type="url"
                className="sv-form-input"
                placeholder="https://vercel.com/brand"
                value={brandGuidelinesUrl}
                onChange={(e) => setBrandGuidelinesUrl(e.target.value)} />
              
            </div>

            {}
            {detectedHexes.length > 0 &&
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
                      title={`Click to ${isPrimary ? "use" : isSelected ? "set as primary" : "add"} #${hex}`}>
                      
                        <span
                        className="sv-detected-color-dot"
                        style={{ backgroundColor: `#${hex}` }} />
                      
                        <span className="sv-detected-color-code">#{hex}</span>
                        {isPrimary &&
                      <span className="sv-color-primary-tag">PRIMARY</span>
                      }
                        {isSelected && !isPrimary &&
                      <Check size={11} className="sv-color-check-icon" />
                      }
                      </button>);

                })}
                </div>
              </div>
            }

            {}
            <div className="sv-form-group">
              <div className="sv-label-with-help">
                <label className="sv-form-label">
                  Brand Hex Color{hexColors.length > 1 ? "s" : ""} (
                  {hexColors.length}) <span className="req">*</span>
                </label>
                <button
                  type="button"
                  className="sv-add-color-btn"
                  onClick={handleAddCustomColor}>
                  
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
                            e.target.value.replace(/^#/, "").toUpperCase()
                          )
                          }
                          className="sv-native-color-picker"
                          title="Click to open color picker" />
                        
                        <div
                          className="sv-color-swatch-preview"
                          style={{ backgroundColor: `#${safeHex}` }} />
                        
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
                            e.target.value.
                            replace(/[^0-9a-fA-F]/g, "").
                            toUpperCase()
                          )
                          } />
                        
                      </div>

                      {isPrimary ?
                      <span className="sv-primary-color-badge">PRIMARY</span> :

                      <button
                        type="button"
                        className="sv-make-primary-btn"
                        onClick={() => handleSetPrimary(idx)}
                        title="Set as primary brand color">
                        
                          Make Primary
                        </button>
                      }

                      {hexColors.length > 1 &&
                      <button
                        type="button"
                        className="sv-remove-color-btn"
                        onClick={() => handleRemoveHex(idx)}
                        title="Remove color">
                        
                          <Trash2 size={13} />
                        </button>
                      }
                    </div>);

                })}
              </div>
            </div>

            {}
            {/* License */}
            <div className="sv-form-group">
              <label className="sv-form-label">
                License <span className="req">*</span>
              </label>
              <select
                className="sv-form-select"
                value="Apache-2.0"
                disabled
                style={{ opacity: 0.9, cursor: 'default' }}>
                <option value="Apache-2.0">Apache 2.0 (Official Open-Source License)</option>
              </select>
            </div>

            {/* Categories & Multiple Category Creation */}
            <div className="sv-form-group">
              <div className="sv-cat-header-row">
                <label className="sv-form-label" style={{ marginBottom: 0 }}>
                  Categories <span className="req">*</span>
                </label>
                <span className="sv-cat-count-badge">
                  {selectedCategories.length} category{selectedCategories.length !== 1 ? 'ies' : ''} selected
                </span>
              </div>
              <p className="sv-cat-help-text">
                Select one or multiple categories, or create a new custom category for this icon:
              </p>

              {/* Create new category input row */}
              <div className="sv-add-category-row">
                <input
                  type="text"
                  className="sv-form-input sv-add-category-input"
                  placeholder="Create custom category (e.g. AI Tools, Web3, FinTech)..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewCategory();
                    }
                  }}
                  maxLength={40}
                />
                <button
                  type="button"
                  className="sv-add-category-btn"
                  onClick={handleAddNewCategory}
                  disabled={!newCategoryInput.trim()}
                  title="Create and select new category">
                  <Plus size={15} />
                  <span>Create</span>
                </button>
              </div>

              {/* Category pills */}
              <div className="sv-cat-tags-selector">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  const isCustom = customCategories.includes(cat);
                  return (
                    <div
                      key={cat}
                      className={`sv-cat-pill-toggle-wrap ${isSelected ? "active" : ""} ${isCustom ? "custom" : ""}`}
                    >
                      <button
                        type="button"
                        className={`sv-cat-pill-toggle ${isSelected ? "active" : ""}`}
                        onClick={() => handleToggleCategory(cat)}
                        title={isSelected ? `Click to deselect ${cat}` : `Click to select ${cat}`}>
                        {isSelected ? (
                          <Check size={12} style={{ marginRight: 4 }} />
                        ) : isCustom ? (
                          <Sparkles size={11} style={{ marginRight: 4, color: '#FF5F02' }} />
                        ) : null}
                        <span>{cat}</span>
                      </button>

                      {isCustom && (
                        <button
                          type="button"
                          className="sv-cat-pill-remove-btn"
                          onClick={(e) => handleRemoveCustomCategory(e, cat)}
                          title={`Delete custom category "${cat}"`}
                          aria-label={`Delete custom category "${cat}"`}
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {}
            <button
              type="submit"
              className="sv-submit-action-btn"
              disabled={isSubmitting}>
              
              {isSubmitting ?
              <>
                  <div className="sv-button-spinner" />
                  <span>
                    Creating Folder & Saving {variants.length} SVG(s)...
                  </span>
                </> :

              <>
                  <Check size={16} />
                  <span>
                    Submit Icon ({variants.length} Variant
                    {variants.length !== 1 ? "s" : ""}) & Auto-Create Folder
                  </span>
                </>
              }
            </button>
          </form>
        </div>
      </div>
    </div>);

}

export default SubmitPage;