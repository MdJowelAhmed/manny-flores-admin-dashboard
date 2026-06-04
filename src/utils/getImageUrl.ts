export function getImageUrl(imageurl: string) {
  // console.log(imageurl)
  const imageUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.10.7.28:5000';
  if (imageurl?.startsWith("http") || imageurl?.startsWith("blob:"))
    return imageurl;
  // console.log(imageUrl + imageurl)
  return imageUrl + imageurl;
}
