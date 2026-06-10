import { imageUrl } from '@/components/common/getImageUrl'

/** @deprecated Prefer `imageUrl` from `@/components/common/getImageUrl` */
export function getImageUrl(imageurl?: string | null): string {
  return imageUrl(imageurl)
}

export { imageUrl, imageUrlAbsolute } from '@/components/common/getImageUrl'
