# 🚀 העלאה מהירה ל-GitHub

## אופציה 1: שימוש בסקריפט (מומלץ)

1. **ודא ש-Git מותקן:**
   ```powershell
   git --version
   ```
   אם לא מותקן: https://git-scm.com/download/win

2. **צור repository ב-GitHub:**
   - לך ל: https://github.com/new
   - תן שם (למשל: `appointments-system`)
   - לחץ "Create repository"
   - שמור את ה-URL

3. **הרץ את הסקריפט:**
   ```powershell
   .\upload-to-github.ps1
   ```
   הסקריפט יבקש ממך את ה-URL ויעלה הכל אוטומטית!

---

## אופציה 2: פקודות ידניות

אם אתה מעדיף לעשות זאת ידנית:

```powershell
# 1. אתחל Git (אם אין)
git init

# 2. הוסף קבצים
git add .

# 3. צור commit
git commit -m "Initial commit - Appointments System"

# 4. הוסף remote (החלף ב-URL שלך!)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 5. שנה branch
git branch -M main

# 6. העלה
git push -u origin main
```

---

## מה לא יעלה?

הקובץ `.gitignore` מונע מהקבצים הבאים לעלות:
- ✅ `node_modules/` - תלויות (מיותר)
- ✅ `.env.local` - משתני סביבה (לא רוצים לחשוף secrets!)
- ✅ `.next/` - קבצי build
- ✅ קבצים זמניים

**זה טוב!** אנחנו לא רוצים לחשוף secrets.

---

## אם יש שגיאה:

### "Git לא מותקן"
→ התקן מ: https://git-scm.com/download/win

### "Permission denied"
→ GitHub יבקש ממך להתחבר בחלון דפדפן

### "Repository לא קיים"
→ ודא שיצרת repository ב-GitHub לפני ההעלאה

---

## אחרי ההעלאה:

1. לך ל-GitHub ותראה את כל הקבצים
2. עכשיו תוכל להעלות ל-Vercel ישירות מ-GitHub!

