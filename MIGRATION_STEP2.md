# שלב 2 - הרצת מיגרציה

עכשיו צריך להריץ מיגרציה להוספת:
- טבלת Reviews (דירוגים)
- טבלת Favorites (מועדפים)
- טבלת Services (מחירון)
- שדות חדשים ב-Business (שעות פעילות, מיקום)

```bash
# עצור את השרת
Ctrl+C

# הרץ מיגרציה
npx prisma migrate dev --name add_reviews_favorites_services

# הפעל שוב
npm run dev
```

לאחר המיגרציה, אמשיך לבנות את הממשק!

