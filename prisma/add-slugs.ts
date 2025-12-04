/**
 * Script to add slugs to existing businesses
 * Run with: tsx prisma/add-slugs.ts
 */

import { PrismaClient } from '@prisma/client'
import { generateSlug, getUniqueSlug } from '../src/lib/slug'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to add slugs to existing businesses...\n')

  const businesses = await prisma.business.findMany({
    where: { slug: null },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (businesses.length === 0) {
    console.log('✅ All businesses already have slugs!')
    return
  }

  console.log(`Found ${businesses.length} businesses without slugs\n`)

  for (const business of businesses) {
    try {
      const baseSlug = generateSlug(business.name)
      const slug = await getUniqueSlug(baseSlug, business.id)

      await prisma.business.update({
        where: { id: business.id },
        data: { slug },
      })

      console.log(`✅ Added slug "${slug}" to "${business.name}"`)
    } catch (error) {
      console.error(`❌ Error adding slug to "${business.name}":`, error)
    }
  }

  console.log('\n✅ Finished adding slugs!')
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



