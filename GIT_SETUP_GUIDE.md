# 📦 מדריך העלאה ל-GitHub

## שלב 1: התקנת Git

### Windows:

1. **הורד Git:**
   - לך ל: https://git-scm.com/download/win
   - הורד את הגרסה האחרונה
   - הרץ את הקובץ שהורדת

2. **התקן:**
   - לחץ "Next" על כל המסכים
   - השאר את כל ההגדרות כברירת מחדל
   - לחץ "Install"

3. **ודא שההתקנה הצליחה:**
   - פתח PowerShell חדש
   - הקלד: `git --version`
   - אמור להציג משהו כמו: `git version 2.42.0`

---

## שלב 2: הגדרת Git (רק בפעם הראשונה)

פתח PowerShell והרץ:

```powershell
git config --global user.name "השם שלך"
git config --global user.email "your-email@example.com"
```

**הערה:** השתמש באותו אימייל שיש לך ב-GitHub.

---

## שלב 3: יצירת Repository ב-GitHub

### 3.1 הירשם/התחבר ל-GitHub:
- לך ל: https://github.com
- הירשם או התחבר

### 3.2 צור Repository חדש:
1. לחץ על הכפתור הירוק **"New"** (או לך ל: https://github.com/new)
2. תן שם ל-repository (למשל: `appointments-system`)
3. בחר **Public** או **Private** (Private = רק אתה רואה)
4. **אל תסמן** "Add a README file" (כי יש לך כבר קוד)
5. לחץ **"Create repository"**

### 3.3 שמור את ה-URL:
GitHub יראה לך משהו כמו:
```
https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

**שמור את זה** - תצטרך אותו בהמשך.

---

## שלב 4: העלאת הקוד מהמחשב שלך

### 4.1 פתח PowerShell בתיקיית הפרויקט:
```powershell
cd "C:\Users\Magshimim\Documents\Files - Shoham\aaa"
```

### 4.2 בדוק אם יש כבר Git repository:
```powershell
git status
```

אם אתה רואה שגיאה "not a git repository", המשך לשלב 4.3.
אם אתה רואה רשימת קבצים, המשך לשלב 4.5.

### 4.3 אתחל Git repository (אם אין):
```powershell
git init
```

### 4.4 הוסף את כל הקבצים:
```powershell
git add .
```

### 4.5 צור commit ראשון:
```powershell
git commit -m "Initial commit - appointments system"
```

### 4.6 הוסף את ה-remote (החלף ב-URL שלך מ-GitHub):
```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 4.7 שנה את שם ה-branch ל-main:
```powershell
git branch -M main
```

### 4.8 העלה את הקוד:
```powershell
git push -u origin main
```

**הערה:** אם זה הפעם הראשונה, GitHub יבקש ממך להתחבר:
- יפתח חלון דפדפן
- התחבר ל-GitHub
- אשר את ההרשאות

---

## שלב 5: בדיקה

1. לך ל-GitHub: https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
2. אתה אמור לראות את כל הקבצים שלך!

---

## עדכונים עתידיים

כשאתה רוצה לעדכן את הקוד ב-GitHub:

```powershell
# הוסף שינויים
git add .

# צור commit
git commit -m "תיאור השינויים"

# העלה ל-GitHub
git push
```

---

## פתרון בעיות

### שגיאה: "fatal: not a git repository"
**פתרון:** הרץ `git init` לפני `git add`

### שגיאה: "Please tell me who you are"
**פתרון:** הרץ את הפקודות מ-שלב 2

### שגיאה: "Permission denied"
**פתרון:** ודא שהתחברת ל-GitHub ב-dialog שנפתח

### שגיאה: "remote origin already exists"
**פתרון:** 
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

---

## מה לא יעלה ל-GitHub?

הקובץ `.gitignore` מונע מהקבצים הבאים לעלות:
- `.env.local` - משתני סביבה (לא רוצים לחשוף secrets!)
- `node_modules/` - תלויות (מיותר, גדול מדי)
- `.next/` - קבצי build
- קבצים זמניים אחרים

**זה טוב!** אנחנו לא רוצים לחשוף secrets.

---

## סיכום מהיר:

```powershell
# 1. אתחל Git
git init

# 2. הוסף קבצים
git add .

# 3. צור commit
git commit -m "Initial commit"

# 4. הוסף remote (החלף ב-URL שלך)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. שנה branch
git branch -M main

# 6. העלה
git push -u origin main
```

**זה הכל! 🎉**

