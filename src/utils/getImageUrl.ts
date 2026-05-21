export function getImageUrl(imageurl: string) {
  const imageUrl = import.meta.env.VITE_API_BASE_URL; 
  if (imageurl?.startsWith("http") || imageurl?.startsWith("blob:"))
    return imageurl;
  return imageUrl + imageurl;
}
