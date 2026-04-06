import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  recentProjectsData,
  type RecentProject,
} from '@/pages/RecentProjects/recentProjectsData'

function cloneProjects(data: RecentProject[]): RecentProject[] {
  return data.map((p) => ({
    ...p,
    planFiles: p.planFiles?.map((f) => ({ ...f })) ?? [],
  }))
}

interface RecentProjectsContextValue {
  projects: RecentProject[]
  addPlanFiles: (projectId: string, files: File[]) => void
  removeProject: (projectId: string) => void
}

const RecentProjectsContext = createContext<RecentProjectsContextValue | null>(
  null
)

export function RecentProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<RecentProject[]>(() =>
    cloneProjects(recentProjectsData)
  )

  const addPlanFiles = useCallback((projectId: string, files: File[]) => {
    if (!files.length) return
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const next: RecentProject['planFiles'] = [...(p.planFiles ?? [])]
        for (const file of files) {
          next.push({
            id: crypto.randomUUID(),
            name: file.name,
            blobUrl: URL.createObjectURL(file),
          })
        }
        return { ...p, planFiles: next }
      })
    )
  }, [])

  const removeProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      const removed = prev.find((p) => p.id === projectId)
      removed?.planFiles?.forEach((f) => {
        if (f.blobUrl) URL.revokeObjectURL(f.blobUrl)
      })
      return prev.filter((p) => p.id !== projectId)
    })
  }, [])

  const value = useMemo(
    () => ({ projects, addPlanFiles, removeProject }),
    [projects, addPlanFiles, removeProject]
  )

  return (
    <RecentProjectsContext.Provider value={value}>
      {children}
    </RecentProjectsContext.Provider>
  )
}

export function useRecentProjects() {
  const ctx = useContext(RecentProjectsContext)
  if (!ctx) {
    throw new Error('useRecentProjects must be used within RecentProjectsProvider')
  }
  return ctx
}
