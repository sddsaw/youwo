import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import {
  buildLocalIconCollections,
  getAppDirectories,
  getIconifyJsonDir,
  IconCollectionRepository,
  scanAppIcons,
  serializeJson,
} from '../shared/icons'

/** Verify that generated icon manifests exactly match all valid source references. */
export async function checkIcons() {
  const rootDir = process.cwd()
  const appDirectories = getAppDirectories(rootDir)

  if (appDirectories.length === 0) {
    consola.error('Cannot find applications under:', path.join(rootDir, 'apps'))
    process.exitCode = 1
    return
  }

  const repository = new IconCollectionRepository(getIconifyJsonDir(rootDir))
  let hasErrors = false

  for (const appPath of appDirectories) {
    const appName = path.basename(appPath)
    const scanResult = scanAppIcons(rootDir, appPath, repository)

    if (scanResult.invalidOccurrences.length > 0) {
      hasErrors = true
      consola.error(`[${appName}] Found invalid Iconify icon references:`)
      for (const occurrence of scanResult.invalidOccurrences) {
        consola.error(`- ${occurrence.iconId} at ${occurrence.file}:${occurrence.line} (${occurrence.reason})`)
      }
    }

    const expectedConfig = serializeJson(scanResult.config)
    const expectedCollections = serializeJson(buildLocalIconCollections(scanResult.config, repository))
    const iconsConfigPath = path.join(appPath, 'icons.json')
    const localIconsPath = path.join(appPath, 'src', 'plugins', 'local-icons.json')
    const staleFiles = [
      ...getStaleFile(iconsConfigPath, expectedConfig),
      ...getStaleFile(localIconsPath, expectedCollections),
    ]

    if (staleFiles.length > 0) {
      hasErrors = true
      consola.error(`[${appName}] Icon manifests are missing, stale, or contain unused icons:`)
      staleFiles.forEach(filePath => consola.error(`- ${path.relative(rootDir, filePath)}`))
      consola.info('Run `pnpm update-icons` to regenerate them.')
    }
    else if (scanResult.invalidOccurrences.length === 0) {
      const iconCount = Object.values(scanResult.config).reduce((total, names) => total + names.length, 0)
      consola.success(`[${appName}] ${iconCount} source icons are bundled locally with no extras.`)
    }
  }

  if (hasErrors)
    process.exitCode = 1
}

/** Return a file when it does not exactly match its generated content. */
function getStaleFile(filePath: string, expectedContent: string): string[] {
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== expectedContent)
    return [filePath]

  return []
}
