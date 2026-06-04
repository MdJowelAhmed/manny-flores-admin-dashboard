
export const imageUrl = (path: string): string => {
    if (!path || typeof path !== 'string') {
        return ''
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
            const { pathname } = new URL(path)
            if (pathname.startsWith('/uploads')) {
                return pathname
            }
        } catch {
            return path
        }
        return path
    }

    return path.startsWith('/') ? path : `/${path}`
}
