// Swiper ships its stylesheets through the package export map without type
// declarations, so TS 6 flags side-effect CSS imports (TS2882). These ambient
// declarations cover the base stylesheet and every per-module stylesheet.
declare module "swiper/css"
declare module "swiper/css/*"
