(function () {
  document.documentElement.classList.add("page-config-loading");
  const loadingStyle = document.createElement("style");
  loadingStyle.textContent = ".page-config-loading [data-company-name]{visibility:hidden}";
  document.head.appendChild(loadingStyle);

  const SUPABASE_URL = "https://iwwnclfqyjygxncnitkd.supabase.co";
  const SUPABASE_KEY = "sb_publishable_9nexyqqATbzJel06RgnO5w_lFY-R6gm";
  const PAGE_SLUG = "b-j";
  const params = new URLSearchParams(location.search);

  window.PAGE_SLUG = PAGE_SLUG;
  const detectedTrafficSource = detectTrafficSource();
  if (detectedTrafficSource) rememberTrafficSource(detectedTrafficSource);
  window.TRAFFIC_SOURCE = detectedTrafficSource || rememberedTrafficSource();

  const defaults = {
    company_name: "富驛資產管理有限公司",
    line_id: "@703umlsa",
    line_url: "https://line.me/R/ti/p/@703umlsa",
    pixel_ids: [
      { id: "1543170184515924", enabled: true, platform: "facebook" },
      { id: "1563536325438766", enabled: true, platform: "facebook" },
      { id: "1771772350490833", enabled: true, platform: "facebook" }
    ]
  };

  window.PAGE_CONFIG_READY = loadConfig().finally(() => {
    document.documentElement.classList.remove("page-config-loading");
    loadingStyle.remove();
  });
  window.trackPageEvent = trackPageEvent;
  window.trackTikTokEvent = trackTikTokEvent;

  async function loadConfig() {
    let config = { ...defaults };
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/site_settings?id=eq.1&select=line_url,line_id,pixel_ids`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      if (response.ok) {
        const rows = await response.json();
        const settings = rows && rows[0];
        if (settings) {
          config = {
            ...config,
            line_url: settings.line_url || config.line_url,
            line_id: settings.line_id || config.line_id,
            pixel_ids: Array.isArray(settings.pixel_ids) ? settings.pixel_ids : config.pixel_ids
          };
        }
      }
    } catch (error) {
      console.warn("B project settings fallback used:", error);
    }

    window.PAGE_CONFIG = config;
    applyConfig(config);
    return config;
  }

  function applyConfig(config) {
    document.querySelectorAll("[data-company-name]").forEach(el => {
      el.textContent = config.company_name;
    });
    document.title = `快速評估中心｜${config.company_name}`;

    const facebookIds = config.pixel_ids
      .filter(pixel => pixel && pixel.enabled !== false && pixel.platform !== "tiktok")
      .map(pixel => String(pixel.id || ""))
      .filter(Boolean);
    const tiktokIds = config.pixel_ids
      .filter(pixel => pixel && pixel.enabled !== false && pixel.platform === "tiktok")
      .map(pixel => String(pixel.id || ""))
      .filter(Boolean);

    installPixels(facebookIds);
    installTikTokPixels(tiktokIds);
  }

  function installPixels(ids) {
    ids.forEach(id => {
      if (document.querySelector(`[data-pixel-id="${id}"]`)) return;
      const marker = document.createElement("meta");
      marker.dataset.pixelId = id;
      document.head.appendChild(marker);
      if (!window.fbq) {
        window.fbq = function () {
          window.fbq.callMethod
            ? window.fbq.callMethod.apply(window.fbq, arguments)
            : window.fbq.queue.push(arguments);
        };
        window.fbq.queue = [];
        window.fbq.loaded = true;
        window.fbq.version = "2.0";
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
      }
      window.fbq("init", id);
    });
    if (ids.length) window.fbq("track", "PageView", { page_slug: PAGE_SLUG });
  }

  function trackPageEvent(eventName, eventParams) {
    if (!window.fbq) return;
    window.fbq("track", eventName, { page_slug: PAGE_SLUG, ...(eventParams || {}) });
  }

  function installTikTokPixels(ids) {
    if (!ids.length) return;
    if (!window.ttq) {
      !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=i+"?sdkid="+e+"&lib="+t;var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)}}(window,document,"ttq");
    }
    ids.forEach(id => {
      if (document.querySelector(`[data-tiktok-pixel-id="${id}"]`)) return;
      const marker = document.createElement("meta");
      marker.dataset.tiktokPixelId = id;
      document.head.appendChild(marker);
      window.ttq.load(id);
    });
    window.ttq.page();
  }

  function trackTikTokEvent(eventName, eventParams) {
    if (!window.ttq) return;
    window.ttq.track(eventName, { page_slug: PAGE_SLUG, ...(eventParams || {}) });
  }

  function detectTrafficSource() {
    const source = String(params.get("utm_source") || params.get("source") || "").toLowerCase();
    if (params.get("fbclid") || /facebook|meta|(^|[^a-z])fb([^a-z]|$)/.test(source)) return "FB";
    if (params.get("ttclid") || /tiktok|tik_tok|(^|[^a-z])tk([^a-z]|$)/.test(source)) return "TikTok";
    return "";
  }

  function rememberTrafficSource(source) {
    try {
      localStorage.setItem(`traffic_source_${PAGE_SLUG}`, JSON.stringify({ source, saved_at: Date.now() }));
    } catch (error) {}
  }

  function rememberedTrafficSource() {
    try {
      const saved = JSON.parse(localStorage.getItem(`traffic_source_${PAGE_SLUG}`) || "null");
      return saved && Date.now() - saved.saved_at < 86400000 ? saved.source : "";
    } catch (error) {
      return "";
    }
  }
})();
