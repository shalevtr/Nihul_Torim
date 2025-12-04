# הוראות התקנה והרצה

## שלב 1: התקנת תלויות

```bash
npm install
```

## שלב 2: הגדרת משתני סביבה

1. העתק את `.env.example` ל-`.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. פתח את `.env.local` והוסף את הערכים הבאים:

   ```
   DATABASE_URL=your_neon_postgres_connection_string_here
   NEXTAUTH_SECRET=your_random_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

   **פרטים:**
   - **DATABASE_URL**: העתק את מחרוזת החיבור מ-Neon Dashboard (Project Settings → Connection String)
   - **NEXTAUTH_SECRET**: צור מחרוזת אקראית. ניתן ליצור עם:
     ```bash
     openssl rand -base64 32
     ```
     או כל מחרוזת אקראית אחרת (לפחות 32 תווים)
   - **NEXTAUTH_URL**: כתובת האתר - `http://localhost:3000` לפיתוח מקומי

## שלב 3: הגדרת מסד הנתונים

```bash
# יצירת Prisma Client
npm run db:generate

# הרצת מיגרציות (יוצר את הטבלאות ב-Neon)
npm run db:migrate

# מילוי נתונים ראשוניים (יוצר משתמש admin)
npm run db:seed
```

**הערה:** אם `db:migrate` מבקש שם למיגרציה, תוכל לתת שם כמו `init` או `initial`.

## שלב 4: הרצת השרת

```bash
npm run dev
```

האפליקציה תרוץ על `http://localhost:3000`

## פרטי כניסה למנהל

לאחר הרצת ה-seed, ניתן להתחבר עם:

- **אימייל:** `admin@example.com`
- **סיסמה:** `Admin123!`

## בדיקת המערכת

### זרימת לקוח:
1. הרשם כמשתמש חדש (תפקיד: לקוח)
2. התחבר
3. עבור ל"חיפוש עסקים"
4. פתח עמוד עסק
5. שלח הודעה לעסק
6. קבע תור
7. צפה ב"התורים שלי"

### זרימת בעל עסק:
1. הרשם כמשתמש חדש (תפקיד: בעל עסק)
2. התחבר
3. עבור ל"העסקים שלי" → "הוסף עסק חדש"
4. צור עסק
5. פתח את עמוד העסק
6. הוסף תמונה (URL)
7. צפה בתורים של העסק

### זרימת מנהל:
1. התחבר עם `admin@example.com` / `Admin123!`
2. עבור ל"אדמין"
3. שנה תפקידים של משתמשים
4. צפה בכל העסקים

## פתרון בעיות

### שגיאת חיבור למסד נתונים:
- ודא ש-`DATABASE_URL` נכון ב-`.env.local`
- ודא שהפרויקט ב-Neon פעיל
- נסה להריץ `npm run db:generate` שוב

### שגיאת NextAuth:
- ודא ש-`NEXTAUTH_SECRET` מוגדר
- ודא ש-`NEXTAUTH_URL` נכון

### שגיאת Prisma:
- ודא שהמיגרציות רצו: `npm run db:migrate`
- ודא ש-Prisma Client נוצר: `npm run db:generate`

## פקודות נוספות

```bash
# פתיחת Prisma Studio (ממשק גרפי למסד הנתונים)
npm run db:studio

# בניית הפרויקט לייצור
npm run build

# הרצת השרת בייצור
npm start
```

