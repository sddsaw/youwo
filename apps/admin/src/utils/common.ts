/**
 * Translate options
 *
 * @param options
 */
export function translateOptions(options: CommonType.Option<string, string>[]) {
  return options.map(option => ({
    ...option,
  }))
}
