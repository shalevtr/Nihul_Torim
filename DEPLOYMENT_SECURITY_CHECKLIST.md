# ✅ רשימת בדיקת אבטחה לפני העלייה לאינטרנט

## 🔴 קריטי - חובה לבדוק:

### 1. Environment Variables
- [x] **NEXTAUTH_SECRET** - חייב להיות לפחות 32 תווים, לא "your-secret-key"
- [x] **DATABASE_URL** - מוגדר ונכון
- [x] **NEXTAUTH_URL** - מוגדר לכתובת הפרודקשן (https://yourdomain.com)
- [x] אין secrets בקוד (כל ה-secrets ב-env vars)

### 2. Authentication & Authorization
- [x] סיסמאות מוצפנות עם bcrypt (salt rounds: 10)
- [x] JWT tokens עם expiration (7 ימים)
- [x] Cookies עם httpOnly ו-secure (בפרודקשן)
- [x] Rate limiting על login/register
- [x] אין fallback secrets

### 3. Input Validation
- [x] כל ה-inputs מאומתים עם Zod
- [x] SQL Injection מוגן (Prisma ORM)
- [x] XSS מוגן (אין dangerouslySetInnerHTML)
- [x] File upload validation (סוג וגודל)

### 4. Security Headers
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY
- [x] X-XSS-Protection: 1; mode=block
- [x] Strict-Transport-Security (HSTS)
- [x] Content-Security-Policy
- [x] Referrer-Policy
- [x] Permissions-Policy

### 5. Error Handling
- [x] אין חשיפת מידע רגיש ב-error messages
- [x] Generic error messages למשתמשים
- [x] Detailed errors רק ב-logs (לא ל-client)

### 6. Database Security
- [x] SSL connection (sslmode=require)
- [x] Connection pooling
- [x] Prepared statements (Prisma)
- [x] No raw SQL queries

### 7. API Security
- [x] Rate limiting על כל ה-APIs
- [x] CORS מוגדר נכון
- [x] Authentication checks על protected routes
- [x] Authorization checks (roles)

## 🟡 מומלץ:

### 8. Monitoring & Logging
- [ ] Sentry או שירות דומה ל-error tracking
- [ ] Logging של פעולות חשובות
- [ ] Health checks

### 9. Additional Security
- [ ] CSRF tokens (Next.js מספק הגנה מובנית)
- [ ] IP whitelisting (אם נדרש)
- [ ] 2FA (אם נדרש)
- [ ] Password strength requirements

## ✅ מה כבר תוקן:

1. ✅ הוסר fallback secret - עכשיו זורק error אם NEXTAUTH_SECRET לא מוגדר
2. ✅ הוספתי validation ל-env vars
3. ✅ הוספתי Strict-Transport-Security header
4. ✅ הוספתי Content-Security-Policy header
5. ✅ כל ה-inputs מאומתים עם Zod
6. ✅ Rate limiting על כל ה-APIs החשובים
7. ✅ Security headers מלאים

## ⚠️ מה צריך לעשות לפני העלייה:

1. **צור NEXTAUTH_SECRET חזק:**
   ```bash
   openssl rand -base64 32
   ```
   או
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **הגדר NEXTAUTH_URL:**
   ```
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **ודא שכל ה-env vars מוגדרים ב-Vercel**

4. **הרץ בדיקות:**
   - בדוק login/logout
   - בדוק rate limiting
   - בדוק שכל ה-APIs מוגנים

