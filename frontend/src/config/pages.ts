export type PageDefinition = {
  path: string
  label: string
  description: string
  developerTool?: boolean
}

export const pages: PageDefinition[] = [
  { path: '/', label: 'Home', description: 'Starter landing page' },
  { path: '/dev/ui', label: 'UI components', description: 'Component showcase and styling reference', developerTool: true },
]
