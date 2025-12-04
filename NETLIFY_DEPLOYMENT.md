# 🚀 מדריך העלאה ל-Netlify

## ✅ מה כבר מוכן:
- ✅ `netlify.toml` נוצר עם כל ההגדרות
- ✅ Build command מוגדר: `npm run build`
- ✅ Security headers מוגדרים
- ✅ Redirects ל-sitemap ו-robots.txt
- ✅ קבצים מיותרים נמחקו

---

## שלב 1: העלה את הקוד ל-GitHub

אם עדיין לא העלית:
```powershell
& "C:\Program Files\Git\bin\git.exe" add .
& "C:\Program Files\Git\bin\git.exe" commit -m "Prepare for Netlify"
& "C:\Program Files\Git\bin\git.exe" push
```

---

## שלב 2: הגדר ב-Netlify

### 2.1 הירשם/התחבר ל-Netlify:
1. לך ל: https://app.netlify.com
2. התחבר עם GitHub

### 2.2 ייבא את הפרויקט:
1. לחץ "Add new site" → "Import an existing project"
2. בחר "Deploy with GitHub"
3. בחר את ה-repository: `shalevtr/Nihul_Torim`
4. Netlify יזהה אוטומטית את `netlify.toml`

### 2.3 הגדר Environment Variables:

**חשוב מאוד!** לפני ה-deploy, הוסף:

1. לחץ על "Site settings" → "Environment variables"
2. הוסף את המשתנים הבאים:

```
DATABASE_URL=your_neon_postgres_connection_string
NEXTAUTH_SECRET=your_strong_secret_here (32+ תווים!)
NEXTAUTH_URL=https://your-site-name.netlify.app
```

**הערות:**
- `DATABASE_URL` - העתק מ-Neon Dashboard
- `NEXTAUTH_SECRET` - צור secret חזק (לפחות 32 תווים)
- `NEXTAUTH_URL` - תחילה השתמש ב-URL ש-Netlify נותן, אחר כך תשנה ל-domain שלך

### 2.4 Deploy:
1. לחץ "Deploy site"
2. המתן 3-5 דקות
3. האתר יעלה!

---

## שלב 3: הגדרת Domain מותאם אישית (אופציונלי)

### 3.1 ב-Netlify:
1. לך ל- Site settings → Domain management
2. לחץ "Add custom domain"
3. הכנס את ה-domain שלך
4. עקוב אחר ההוראות להגדרת DNS

### 3.2 עדכן NEXTAUTH_URL:
1. לך ל- Environment variables
2. עדכן `NEXTAUTH_URL` ל-`https://yourdomain.com`
3. Redeploy

---

## מה הוגדר ב-netlify.toml:

- **Build command:** `npm run build` (כולל Prisma generate)
- **Publish directory:** `.next`
- **Node version:** 20
- **Security headers:** כל ה-headers החשובים
- **Redirects:** sitemap.xml ו-robots.txt

---

## פתרון בעיות:

### שגיאת Build:
- ודא ש-`npm run build` עובד מקומית
- בדוק את ה-logs ב-Netlify Dashboard

### שגיאת Database:
- ודא שה-`DATABASE_URL` נכון
- ודא ש-Neon database פעיל
- בדוק שה-URL כולל `sslmode=require`

### שגיאת Authentication:
- ודא ש-`NEXTAUTH_SECRET` לפחות 32 תווים
- ודא ש-`NEXTAUTH_URL` נכון

---

## סיכום:

1. ✅ הקוד ב-GitHub
2. ✅ `netlify.toml` מוכן
3. ✅ קבצים מיותרים נמחקו
4. ⏳ רק צריך להגדיר ב-Netlify + Environment Variables

**האתר מוכן להעלאה! 🎉**

