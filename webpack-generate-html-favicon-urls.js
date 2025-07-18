// webpack-generate-html-favicon-urls.js
// This file generates favicon URLs for HTML generation during webpack build

module.exports = function generateHtmlFaviconUrls() {
  return {
    // Standard favicon
    favicon: '/favicon.ico',
    
    // Apple touch icons
    appleTouchIcon: '/apple-touch-icon.png',
    appleTouchIcon57: '/apple-touch-icon-57x57.png',
    appleTouchIcon60: '/apple-touch-icon-60x60.png',
    appleTouchIcon72: '/apple-touch-icon-72x72.png',
    appleTouchIcon76: '/apple-touch-icon-76x76.png',
    appleTouchIcon114: '/apple-touch-icon-114x114.png',
    appleTouchIcon120: '/apple-touch-icon-120x120.png',
    appleTouchIcon144: '/apple-touch-icon-144x144.png',
    appleTouchIcon152: '/apple-touch-icon-152x152.png',
    appleTouchIcon180: '/apple-touch-icon-180x180.png',
    
    // Android/Chrome icons
    icon192: '/android-chrome-192x192.png',
    icon512: '/android-chrome-512x512.png',
    
    // Windows tiles
    msTileImage: '/mstile-144x144.png',
    
    // Manifest
    manifest: '/site.webmanifest'
  };
};

// Export as both CommonJS and ES module for compatibility
module.exports.default = module.exports;
