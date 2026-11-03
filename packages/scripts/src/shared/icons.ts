import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { getIconData } from '@iconify/utils'

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.vue'])
const ICON_LITERAL_REGEXP = /(['"`])([a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*|[a-z0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*)\1/g
const ICON_ENV_REGEXP = /^\s*VITE_[A-Z0-9_]*ICON[A-Z0-9_]*\s*=\s*['"]?([^'"\s#]+)/

type RawIconCollection = Parameters<typeof getIconData>[0]
type IconData = NonNullable<ReturnType<typeof getIconData>>

export interface IconConfig {
  [prefix: string]: string[]
}

export interface LocalIconCollection {
  prefix: string
  icons: Record<string, IconData>
  width?: number
  height?: number
}

export interface IconOccurrence {
  iconId: string
  file: string
  line: number
}

export interface InvalidIconOccurrence extends IconOccurrence {
  reason: string
}

export interface IconScanResult {
  config: IconConfig
  occurrences: IconOccurrence[]
  invalidOccurrences: InvalidIconOccurrence[]
}

interface ParsedIconName {
  prefix: string
  name: string
}

interface PackageJson {
  name?: string
  dependencies?: Record<string, string>
}

/** Resolve the installed `@iconify/json` collection directory. */
export function getIconifyJsonDir(rootDir: string): string {
  const localRequire = createRequire(import.meta.url)

  try {
    const packageJsonPath = localRequire.resolve('@iconify/json/package.json')
    return path.join(path.dirname(packageJsonPath), 'json')
  }
  catch {
    return path.resolve(rootDir, 'node_modules/@iconify/json/json')
  }
}

/** Read and cache Iconify collection data. */
export class IconCollectionRepository {
  private readonly cache = new Map<string, RawIconCollection | null>()

  constructor(private readonly iconifyJsonDir: string) {}

  get(prefix: string): RawIconCollection | null {
    const cached = this.cache.get(prefix)
    if (cached !== undefined)
      return cached

    const collectionPath = path.join(this.iconifyJsonDir, `${prefix}.json`)
    if (!fs.existsSync(collectionPath)) {
      this.cache.set(prefix, null)
      return null
    }

    const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8')) as RawIconCollection
    this.cache.set(prefix, collection)
    return collection
  }
}

/** Scan one application and the workspace packages declared in its dependency graph. */
export function scanAppIcons(
  rootDir: string,
  appPath: string,
  repository: IconCollectionRepository,
): IconScanResult {
  const sourceDirs = [path.join(appPath, 'src'), ...getWorkspaceDependencySourceDirs(rootDir, appPath)]
  const files = sourceDirs.flatMap(scanSourceFiles)
  const occurrences: IconOccurrence[] = []
  const invalidOccurrences: InvalidIconOccurrence[] = []

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      for (const match of line.matchAll(ICON_LITERAL_REGEXP)) {
        addIconCandidate(match[2], filePath, index + 1, rootDir, repository, occurrences, invalidOccurrences)
      }
    })
  }

  for (const envFilePath of getEnvironmentFiles(appPath)) {
    const lines = fs.readFileSync(envFilePath, 'utf8').split('\n')
    lines.forEach((line, index) => {
      const match = line.match(ICON_ENV_REGEXP)
      if (match)
        addIconCandidate(match[1], envFilePath, index + 1, rootDir, repository, occurrences, invalidOccurrences)
    })
  }

  return {
    config: createIconConfig(occurrences),
    occurrences,
    invalidOccurrences,
  }
}

/** Build the minimal Iconify collections represented by a generated config. */
export function buildLocalIconCollections(
  config: IconConfig,
  repository: IconCollectionRepository,
): LocalIconCollection[] {
  return Object.entries(config).map(([prefix, iconNames]) => {
    const rawCollection = repository.get(prefix)
    if (!rawCollection)
      throw new Error(`Icon collection "${prefix}" is not installed`)

    const collection: LocalIconCollection = {
      prefix,
      icons: {},
    }

    if (rawCollection.width)
      collection.width = rawCollection.width
    if (rawCollection.height)
      collection.height = rawCollection.height

    for (const name of iconNames) {
      const iconData = getIconData(rawCollection, name)
      if (!iconData)
        throw new Error(`Icon "${prefix}:${name}" does not exist`)

      collection.icons[name] = iconData
    }

    return collection
  })
}

/** Return application directories in a stable order. */
export function getAppDirectories(rootDir: string): string[] {
  const appsDir = path.join(rootDir, 'apps')
  if (!fs.existsSync(appsDir))
    return []

  return fs.readdirSync(appsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(appsDir, entry.name))
    .sort()
}

/** Serialize generated JSON consistently. */
export function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

/** Convert both `prefix:name` and Iconify's legacy `prefix-name` syntax to a canonical name. */
function parseIconName(iconName: string): ParsedIconName {
  const separatorIndex = iconName.includes(':') ? iconName.indexOf(':') : iconName.indexOf('-')

  return {
    prefix: iconName.slice(0, separatorIndex),
    name: iconName.slice(separatorIndex + 1),
  }
}

/** Validate one candidate and append it to the appropriate scan result. */
function addIconCandidate(
  rawIconName: string,
  filePath: string,
  line: number,
  rootDir: string,
  repository: IconCollectionRepository,
  occurrences: IconOccurrence[],
  invalidOccurrences: InvalidIconOccurrence[],
) {
  const parsed = parseIconName(rawIconName)
  const collection = repository.get(parsed.prefix)

  // Exact strings such as `text-primary` are not icons when their prefix is not an Iconify collection.
  if (!collection)
    return

  const occurrence: IconOccurrence = {
    iconId: `${parsed.prefix}:${parsed.name}`,
    file: path.relative(rootDir, filePath),
    line,
  }

  if (!getIconData(collection, parsed.name)) {
    invalidOccurrences.push({
      ...occurrence,
      reason: `Icon "${parsed.name}" does not exist in collection "${parsed.prefix}"`,
    })
    return
  }

  occurrences.push(occurrence)
}

/** Group unique source occurrences into a deterministic Iconify config. */
function createIconConfig(occurrences: IconOccurrence[]): IconConfig {
  const groupedIcons = new Map<string, Set<string>>()

  for (const { iconId } of occurrences) {
    const { prefix, name } = parseIconName(iconId)
    const names = groupedIcons.get(prefix) ?? new Set<string>()
    names.add(name)
    groupedIcons.set(prefix, names)
  }

  return Object.fromEntries(
    [...groupedIcons.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([prefix, names]) => [prefix, [...names].sort()]),
  )
}

/** Recursively find supported source files without entering generated dependency directories. */
function scanSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir))
    return []

  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist')
      continue

    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...scanSourceFiles(entryPath))
    }
    else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath)
    }
  }

  return files.sort()
}

/** Return application environment files that can provide icon defaults. */
function getEnvironmentFiles(appPath: string): string[] {
  return fs.readdirSync(appPath, { withFileTypes: true })
    .filter(entry => entry.isFile() && (entry.name === '.env' || entry.name.startsWith('.env.')))
    .map(entry => path.join(appPath, entry.name))
    .sort()
}

/** Resolve only workspace packages reachable from an application's runtime dependencies. */
function getWorkspaceDependencySourceDirs(rootDir: string, appPath: string): string[] {
  const workspacePackages = getWorkspacePackages(rootDir)
  const visited = new Set<string>()
  const pending = Object.keys(readPackageJson(appPath).dependencies ?? {})

  while (pending.length > 0) {
    const packageName = pending.pop()!
    if (visited.has(packageName))
      continue

    const packagePath = workspacePackages.get(packageName)
    if (!packagePath)
      continue

    visited.add(packageName)
    pending.push(...Object.keys(readPackageJson(packagePath).dependencies ?? {}))
  }

  return [...visited]
    .map(packageName => path.join(workspacePackages.get(packageName)!, 'src'))
    .sort()
}

/** Build a map of package names to workspace directories. */
function getWorkspacePackages(rootDir: string): Map<string, string> {
  const packages = new Map<string, string>()

  for (const workspaceDirName of ['packages', 'internal']) {
    const workspaceDir = path.join(rootDir, workspaceDirName)
    if (!fs.existsSync(workspaceDir))
      continue

    for (const entry of fs.readdirSync(workspaceDir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue

      const packagePath = path.join(workspaceDir, entry.name)
      const packageJson = readPackageJson(packagePath)
      if (packageJson.name)
        packages.set(packageJson.name, packagePath)
    }
  }

  return packages
}

/** Read a workspace package manifest. */
function readPackageJson(packagePath: string): PackageJson {
  const packageJsonPath = path.join(packagePath, 'package.json')
  if (!fs.existsSync(packageJsonPath))
    return {}

  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson
}
