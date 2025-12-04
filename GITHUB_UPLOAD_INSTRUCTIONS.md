# ✅ הפרויקט מוכן להעלאה ל-GitHub!

## מה כבר נעשה:
- ✅ Git repository נוצר
- ✅ כל הקבצים נוספו (213 קבצים)
- ✅ Commit נוצר בהצלחה
- ✅ Branch שונה ל-main

## מה צריך לעשות עכשיו:

### 1. צור Repository ב-GitHub:
1. לך ל: https://github.com/new
2. תן שם (למשל: `appointments-system`)
3. בחר Public או Private
4. **אל תסמן** "Add a README file"
5. לחץ "Create repository"

### 2. העלה את הקוד:

לאחר שיצרת את ה-repository, הרץ את הפקודות הבאות ב-PowerShell:

```powershell
# החלף ב-URL שלך מ-GitHub:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# העלה את הקוד:
git push -u origin main
```

**הערה:** אם GitHub יבקש ממך להתחבר, התחבר בחלון שיפתח.

---

## או - אם יש לך כבר repository:

אם יצרת כבר repository, פשוט הרץ:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## מה לא יעלה?

הקובץ `.gitignore` מונע מהקבצים הבאים לעלות:
- ✅ `node_modules/` - תלויות (מיותר)
- ✅ `.env.local` - משתני סביבה (לא רוצים לחשוף secrets!)
- ✅ `.next/` - קבצי build

**זה טוב!** אנחנו לא רוצים לחשוף secrets.

---

## אחרי ההעלאה:

1. לך ל-GitHub ותראה את כל הקבצים
2. עכשיו תוכל להעלות ל-Vercel ישירות מ-GitHub!

