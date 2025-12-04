/**
 * Utility functions for generating and managing business slugs
 */

/**
 * Transliteration map for Hebrew to Latin characters
 */
const hebrewToLatin: Record<string, string> = {
  'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
  'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
  'כ': 'k', 'ל': 'l', 'מ': 'm', 'נ': 'n', 'ס': 's',
  'ע': 'a', 'פ': 'p', 'צ': 'ts', 'ק': 'k', 'ר': 'r',
  'ש': 'sh', 'ת': 't',
  'ך': 'k', 'ם': 'm', 'ן': 'n', 'ף': 'p', 'ץ': 'ts',
}

/**
 * Generates a URL-friendly slug from a business name
 * Converts Hebrew to Latin characters and removes special characters
 */
export function generateSlug(name: string): string {
  if (!name || name.trim().length === 0) {
    return 'business'
  }

  let slug = name
    .split('')
    .map((char) => {
      // Check if Hebrew character
      if (hebrewToLatin[char]) {
        return hebrewToLatin[char]
      }
      // Keep Latin characters, numbers, and spaces
      if (/[\u0590-\u05FF\u0600-\u06FFa-zA-Z0-9\s]/.test(char)) {
        return char.toLowerCase()
      }
      // Replace other characters with space
      return ' '
    })
    .join('')
    .toLowerCase()
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s\-_]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 50)

  // Ensure slug is not empty
  if (!slug || slug.length === 0) {
    slug = 'business'
  }

  return slug
}

/**
 * Gets a unique slug by appending a number if the slug already exists
 */
export async function getUniqueSlug(
  baseSlug: string,
  excludeBusinessId?: string
): Promise<string> {
  const { prisma } = await import('@/lib/db')

  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    })

    // If slug doesn't exist, or it's the same business (for updates)
    if (!existing || existing.id === excludeBusinessId) {
      return slug
    }

    // Try with counter appended
    slug = `${baseSlug}-${counter}`
    counter++

    // Safety check to prevent infinite loop
    if (counter > 1000) {
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }

  return slug
}



