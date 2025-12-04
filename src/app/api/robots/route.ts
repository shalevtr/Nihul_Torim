import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  const robots = `User-agent: *
Allow: /
Allow: /b/
Disallow: /api/
Disallow: /owner/
Disallow: /dashboard/
Disallow: /auth/

Sitemap: ${baseUrl}/sitemap.xml
`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}



