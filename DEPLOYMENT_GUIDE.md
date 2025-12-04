# מדריך העלאה לאינטרנט ויצירת קישורים לעסקים

## 🎯 מטרה
להעלות את האתר לאינטרנט ולאפשר לכל בעל עסק לקבל קישור משלו.

---

## 📋 שלב 1: הכנת הפרויקט להעלאה

### 1.1 בדיקת Build
```bash
npm run build
```
**אם יש שגיאות - תקן אותן לפני שתמשיך!**

### 1.2 יצירת קובץ `.env.example`
צור קובץ `.env.example` עם כל המשתנים הנדרשים:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Auth
NEXTAUTH_SECRET=your-secret-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Production URL (יתעדכן אחרי deployment)
# NEXTAUTH_URL=https://yourdomain.com
```

### 1.3 עדכון `.gitignore`
ודא ש-`.env.local` ו-`.env.production` ב-`.gitignore` (כבר קיים ✅)

---

## 📋 שלב 2: הוספת Slug לעסקים (חובה!)

### למה זה חשוב?
- קישורים ידידותיים: `yoursite.com/b/mispra-yafa` במקום `yoursite.com/b/clx123abc456`
- SEO טוב יותר
- קל יותר לשיתוף

### 2.1 עדכון Schema
הוסף שדה `slug` ל-Business:

```prisma
model Business {
  id                    String             @id @default(cuid())
  name                  String
  slug                  String?            @unique  // הוספה
  // ... שאר השדות
}
```

### 2.2 יצירת Migration
```bash
npm run db:migrate
```
תן שם למיגרציה: `add_slug_to_business`

### 2.3 יצירת Utility ל-Slug
צור קובץ `src/lib/slug.ts`:

```typescript
export function generateSlug(name: string): string {
  // המרת עברית ואנגלית ל-slug
  const transliteration: Record<string, string> = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
    'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
    'כ': 'k', 'ל': 'l', 'מ': 'm', 'נ': 'n', 'ס': 's',
    'ע': 'a', 'פ': 'p', 'צ': 'ts', 'ק': 'k', 'ר': 'r',
    'ש': 'sh', 'ת': 't',
  }

  let slug = name
    .split('')
    .map(char => transliteration[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^\u0590-\u05FF\u0600-\u06FFa-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)

  return slug || 'business'
}

export async function getUniqueSlug(baseSlug: string, businessId?: string): Promise<string> {
  const { prisma } = await import('@/lib/db')
  
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const existing = await prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    })
    
    // אם לא קיים או זה אותו עסק (במקרה של עדכון)
    if (!existing || existing.id === businessId) {
      return slug
    }
    
    slug = `${baseSlug}-${counter}`
    counter++
  }
}
```

### 2.4 עדכון יצירת עסק
עדכן `src/app/api/businesses/route.ts`:

```typescript
import { generateSlug, getUniqueSlug } from '@/lib/slug'

export async function POST(request: Request) {
  // ... קוד קיים ...
  
  const baseSlug = generateSlug(body.name)
  const slug = await getUniqueSlug(baseSlug)
  
  const business = await prisma.business.create({
    data: {
      name: body.name,
      slug, // הוספה
      // ... שאר השדות
    },
  })
  
  // ...
}
```

### 2.5 עדכון Routes
עדכן `src/app/b/[id]/page.tsx` לתמוך גם ב-slug:

```typescript
async function getBusiness(idOrSlug: string) {
  const business = await prisma.business.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug }
      ]
    },
    // ...
  })
  return business
}
```

### 2.6 עדכון קישור ציבורי
עדכן `src/app/owner/businesses/[id]/page.tsx`:

```typescript
const publicUrl = business.slug 
  ? `${process.env.NEXTAUTH_URL}/b/${business.slug}`
  : `${process.env.NEXTAUTH_URL}/b/${business.id}`
```

### 2.7 יצירת Slug לעסקים קיימים
צור script `prisma/add-slugs.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { generateSlug, getUniqueSlug } from '../src/lib/slug'

const prisma = new PrismaClient()

async function main() {
  const businesses = await prisma.business.findMany({
    where: { slug: null },
  })

  for (const business of businesses) {
    const baseSlug = generateSlug(business.name)
    const slug = await getUniqueSlug(baseSlug, business.id)
    
    await prisma.business.update({
      where: { id: business.id },
      data: { slug },
    })
    
    console.log(`Added slug "${slug}" to "${business.name}"`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

הרץ:
```bash
tsx prisma/add-slugs.ts
```

---

## 📋 שלב 3: העלאה ל-Vercel

### 3.1 הכנה
1. ודא שהפרויקט ב-GitHub/GitLab/Bitbucket
2. הירשם ל-[Vercel](https://vercel.com) (חינמי)

### 3.2 ייבוא הפרויקט
1. לחץ על "Add New Project"
2. בחר את ה-repository שלך
3. Vercel יזהה אוטומטית שזה Next.js

### 3.3 הגדרת Environment Variables
ב-Vercel Dashboard → Settings → Environment Variables, הוסף:

```
DATABASE_URL = [הקונקט סטרינג שלך מ-Neon]
NEXTAUTH_SECRET = [מחרוזת אקראית, לפחות 32 תווים]
NEXTAUTH_URL = https://your-project.vercel.app
```

**איך ליצור NEXTAUTH_SECRET:**
```bash
# ב-PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

או באתר: https://generate-secret.vercel.app/32

### 3.4 Deploy
1. לחץ על "Deploy"
2. חכה שהבילד יסתיים (2-3 דקות)
3. האתר יעלה על `https://your-project.vercel.app`

### 3.5 עדכון NEXTAUTH_URL
לאחר ה-deploy:
1. לך ל-Settings → Environment Variables
2. עדכן את `NEXTAUTH_URL` לכתובת האמיתית
3. Redeploy

---

## 📋 שלב 4: הגדרת Domain מותאם אישית

### 4.1 רכישת Domain
קנה domain מ:
- [Namecheap](https://www.namecheap.com)
- [Google Domains](https://domains.google)
- [GoDaddy](https://www.godaddy.com)

### 4.2 הגדרה ב-Vercel
1. ב-Vercel: Settings → Domains
2. הוסף את ה-domain שלך
3. עקוב אחר ההוראות ל-DNS

**DNS Records שצריך להוסיף:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 עדכון NEXTAUTH_URL
עדכן את `NEXTAUTH_URL` ב-Vercel ל-domain החדש:
```
NEXTAUTH_URL = https://yourdomain.com
```

Redeploy.

---

## 📋 שלב 5: יצירת קישורים לכל בעל עסק

### 5.1 איך זה עובד
לכל עסק יש קישור ייחודי:
- עם slug: `https://yourdomain.com/b/mispra-yafa`
- בלי slug (fallback): `https://yourdomain.com/b/[business-id]`

### 5.2 איפה בעל העסק רואה את הקישור?
1. בעל עסק נכנס ל-`/owner/businesses/[id]`
2. רואה כרטיס "קישור ציבורי לשיתוף"
3. יכול להעתיק את הקישור
4. יכול לשתף ב-WhatsApp, פייסבוק, וכו'

### 5.3 שיפור: QR Code
ניתן להוסיף QR code לקישור:
1. התקן: `npm install qrcode`
2. הוסף component ל-`src/components/qr-code.tsx`
3. הצג ב-`src/app/owner/businesses/[id]/page.tsx`

### 5.4 שיפור: דף נחיתה מותאם
ניתן ליצור דף נחיתה מותאם לכל עסק:
- `https://yourdomain.com/b/mispra-yafa`
- עם עיצוב מותאם
- עם CTA ברור לקביעת תור

---

## 📋 שלב 6: בדיקות אחרי העלאה

### 6.1 בדיקות בסיסיות
- [ ] האתר נטען
- [ ] התחברות עובדת
- [ ] יצירת עסק עובד
- [ ] קישור ציבורי עובד
- [ ] קביעת תור עובד
- [ ] העלאת תמונות עובדת

### 6.2 בדיקת קישורים ציבוריים
1. צור עסק חדש
2. העתק את הקישור הציבורי
3. פתח בחלון גלישה בסתר (incognito)
4. ודא שהעמוד נטען
5. ודא שאפשר לקבוע תור

### 6.3 בדיקת Mobile
- [ ] האתר נראה טוב על mobile
- [ ] כל הפונקציות עובדות
- [ ] קישורים עובדים

---

## 📋 שלב 7: שיפורים נוספים

### 7.1 Analytics
הוסף Google Analytics או Vercel Analytics:
```bash
npm install @vercel/analytics
```

ב-`src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 7.2 Monitoring
הוסף Sentry לשגיאות:
```bash
npm install @sentry/nextjs
```

### 7.3 Backup
הגדר backup אוטומטי ל-Neon:
1. לך ל-Neon Dashboard
2. Settings → Backups
3. הפעל automatic backups

---

## 🎉 סיכום

לאחר שתסיים את כל השלבים:

1. ✅ האתר יעלה על האינטרנט
2. ✅ כל בעל עסק יקבל קישור משלו
3. ✅ הלקוחות יוכלו לקבוע תורים דרך הקישור
4. ✅ הכל יעבוד על mobile ו-desktop

### קישורים שימושיים:
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech
- **Domain Provider:** (תלוי איפה קנית)

### תמיכה:
אם יש בעיות:
1. בדוק את ה-logs ב-Vercel
2. בדוק את ה-console בדפדפן
3. בדוק את ה-Database connection

---

**תאריך:** 2024-12-01
**גרסה:** 1.0



