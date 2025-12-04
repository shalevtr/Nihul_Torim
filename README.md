# ש.ש ניהול תורים

מערכת ניהול תורים מלאה עם Next.js, Prisma, ו-Neon Postgres.

## התקנה והרצה

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת משתני סביבה

העתק את `.env.example` ל-`.env.local`:

```bash
cp .env.example .env.local
```

ערוך את `.env.local` והוסף את הערכים הבאים:

```
DATABASE_URL=your_neon_postgres_connection_string
NEXTAUTH_SECRET=generate_a_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

**הערות:**
- `DATABASE_URL`: העתק את מחרוזת החיבור מ-Neon Dashboard
- `NEXTAUTH_SECRET`: צור מחרוזת אקראית (ניתן להשתמש ב-`openssl rand -base64 32`)
- `NEXTAUTH_URL`: כתובת האתר (localhost לפיתוח)

### 3. הגדרת מסד הנתונים

```bash
# יצירת Prisma Client
npm run db:generate

# הרצת מיגרציות
npm run db:migrate

# מילוי נתונים ראשוניים (יוצר משתמש admin)
npm run db:seed
```

### 4. הרצת השרת

```bash
npm run dev
```

האפליקציה תרוץ על `http://localhost:3000`

## פרטי כניסה למנהל

לאחר הרצת ה-seed, ניתן להתחבר עם:

- **אימייל:** `admin@example.com`
- **סיסמה:** `Admin123!`

## מבנה הפרויקט

- `src/app` - דפים ו-API routes
- `src/components` - רכיבי UI משותפים
- `src/lib` - פונקציות עזר (DB, Auth, Roles)
- `prisma` - סכמת מסד הנתונים ומיגרציות

## תכונות

- ✅ הרשמה והתחברות
- ✅ ניהול עסקים (בעלי עסקים)
- ✅ חיפוש עסקים (לקוחות)
- ✅ קביעת תורים
- ✅ ניהול תורים
- ✅ הודעות לעסקים
- ✅ גלריית תמונות
- ✅ לוח בקרה למנהל
- ✅ נגישות (גודל טקסט, ניגודיות)

## תפקידים

- **CUSTOMER** - לקוחות יכולים לחפש עסקים, לקבוע תורים ולשלוח הודעות
- **BUSINESS_OWNER** - בעלי עסקים יכולים לנהל עסקים, תורים והודעות
- **ADMIN** - מנהלים יכולים לנהל משתמשים ועסקים

