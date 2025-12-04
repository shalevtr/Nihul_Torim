# ⚡ התחלה מהירה - Netlify

## מה כבר מוכן:
- ✅ `netlify.toml` מוגדר
- ✅ Build command: `npm run build` (כולל Prisma generate)
- ✅ Security headers מוגדרים
- ✅ קבצים מיותרים נמחקו
- ✅ הקוד ב-GitHub

---

## שלב 1: התחבר ל-Netlify

1. לך ל: https://app.netlify.com
2. התחבר עם GitHub

---

## שלב 2: ייבא את הפרויקט

1. לחץ **"Add new site"** → **"Import an existing project"**
2. בחר **"Deploy with GitHub"**
3. בחר את ה-repository: **`shalevtr/Nihul_Torim`**
4. Netlify יזהה אוטומטית את `netlify.toml`

---

## שלב 3: הגדר Environment Variables (חובה!)

לפני ה-deploy, הוסף:

1. לחץ על **"Site settings"** → **"Environment variables"**
2. לחץ **"Add variable"** והוסף:

```
DATABASE_URL = your_neon_connection_string
NEXTAUTH_SECRET = your_strong_secret (32+ תווים!)
NEXTAUTH_URL = https://your-site-name.netlify.app
```

**איך ליצור NEXTAUTH_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## שלב 4: Deploy

1. לחץ **"Deploy site"**
2. המתן 3-5 דקות
3. האתר יעלה!

---

## אחרי ה-Deploy:

1. עדכן את `NEXTAUTH_URL` ב-Environment Variables ל-URL האמיתי
2. לחץ **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## אם יש שגיאות:

- **Build failed:** בדוק את ה-logs ב-Netlify Dashboard
- **Database error:** ודא ש-`DATABASE_URL` נכון וכולל `sslmode=require`
- **Auth error:** ודא ש-`NEXTAUTH_SECRET` לפחות 32 תווים

---

**הכל מוכן! רק צריך להגדיר ב-Netlify! 🚀**

