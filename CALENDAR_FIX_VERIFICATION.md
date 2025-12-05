# Calendar Fix Verification

## Problem
Calendar was displaying every month starting in the same column, ignoring the actual weekday of the 1st of each month.

## Solution
Fixed the calendar logic to properly calculate and align weekdays:

1. **Calculate first day's weekday**: Use `getDay()` from `date-fns` which returns 0-6 (Sunday-Saturday)
2. **Map to Hebrew headers**: Headers are RTL: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"] = [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
3. **Add empty cells**: Create empty cells before the first day to align with the correct weekday
4. **Use useMemo**: Ensure calculations update when month changes

## Weekday Mapping

JavaScript `getDay()` returns:
- 0 = Sunday (ראשון) → Column 0 (א׳)
- 1 = Monday (שני) → Column 1 (ב׳)
- 2 = Tuesday (שלישי) → Column 2 (ג׳)
- 3 = Wednesday (רביעי) → Column 3 (ד׳)
- 4 = Thursday (חמישי) → Column 4 (ה׳)
- 5 = Friday (שישי) → Column 5 (ו׳)
- 6 = Saturday (שבת) → Column 6 (ש׳)

## Example Calculations

**January 2024** starts on Monday (1):
- Empty cells: 1 (for Sunday)
- Day 1 appears in column 1 (ב׳) ✓

**February 2024** starts on Thursday (4):
- Empty cells: 4 (for Sun, Mon, Tue, Wed)
- Day 1 appears in column 4 (ה׳) ✓

**March 2024** starts on Friday (5):
- Empty cells: 5 (for Sun, Mon, Tue, Wed, Thu)
- Day 1 appears in column 5 (ו׳) ✓

## Code Changes

```typescript
// Before: Simple calculation without memoization
const firstDayOfWeek = getDay(monthStart)
const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => i)

// After: Memoized calculation that updates when month changes
const calendarData = useMemo(() => {
  const monthStart = startOfMonth(currentMonth)
  const firstDayOfWeek = getDay(monthStart)
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => i)
  // ... rest of calculations
}, [currentMonth])
```

## Testing

To verify the fix works:
1. Navigate to calendar view
2. Check that January 2024 starts on Monday (ב׳)
3. Click "Next month" - February should start on Thursday (ה׳)
4. Click "Next month" - March should start on Friday (ו׳)
5. Each month should align correctly with its actual weekday

## Files Changed
- `src/components/calendar-view.tsx`

