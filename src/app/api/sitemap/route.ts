import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering - sitemap needs DB access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Get all businesses with slugs
    const businesses = await prisma.business.findMany({
      where: {
        slug: { not: null },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${businesses
  .map(
    (business) => `  <url>
    <loc>${baseUrl}/b/${business.slug}</loc>
    <lastmod>${business.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת sitemap' },
      { status: 500 }
    )
  }
}



