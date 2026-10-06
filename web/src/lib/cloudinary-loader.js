export default function cloudinaryLoader({ src, width, quality }) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_${quality || "auto"},w_${width}/${src}`;
}