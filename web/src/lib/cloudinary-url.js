// Adds resize + modern-format transformations to a Cloudinary upload URL.
// URLs that are not Cloudinary, or already have a transformation, are returned unchanged.
export function optimizeCloudinaryUrl(url, { width = 1200, format = "auto" } = {}) {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com")) return url;

  return url.replace(
    /\/image\/upload\/(?=v\d+\/)/,
    `/image/upload/f_${format},q_auto,w_${width}/`,
  );
}