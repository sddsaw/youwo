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

/** Generate exact local Iconify manifests from icons referenced in application source code. */
export async function updateIcons() {
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
      continue
    }

    const localCollections = buildLocalIconCollections(scanResult.config, repository)
    const iconsConfigPath = path.join(appPath, 'icons.json')
    const localIconsPath = path.join(appPath, 'src', 'plugins', 'local-icons.json')

    fs.mkdirSync(path.dirname(localIconsPath), { recursive: true })
    writeGeneratedFile(iconsConfigPath, serializeJson(scanResult.config))
    writeGeneratedFile(localIconsPath, serializeJson(localCollections))

    const iconCount = Object.values(scanResult.config).reduce((total, names) => total + names.length, 0)
    consola.success(`[${appName}] Generated ${iconCount} local icons from source usage.`)
  }

  if (hasErrors)
    process.exitCode = 1
}

/** Write a generated file only when its content changed. */
function writeGeneratedFile(filePath: string, content: string) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content)
    return

  fs.writeFileSync(filePath, content, 'utf8')
}
