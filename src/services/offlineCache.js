const CACHE_KEY = "routemind_partner_offline_route";

export function cachePartnerRoute(routeData) {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      route: routeData
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    console.log("Partner route cached locally to IndexedDB/localStorage.");
    return true;
  } catch (err) {
    console.error("Failed to cache partner route:", err);
    return false;
  }
}

export function getCachedPartnerRoute() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read cached partner route:", err);
    return null;
  }
}

export function clearPartnerCache() {
  localStorage.removeItem(CACHE_KEY);
}
