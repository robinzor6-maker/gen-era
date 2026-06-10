---
name: SearchBar infinite loop fix
description: useCallback with an unstable dependency causes infinite re-render loops in SearchBar.
---

# SearchBar Infinite Loop Fix

**Rule:** Never use `useCallback(fn, [onSearch])` when the parent recreates the handler on every render.

**Fix:** Use `useRef` to hold the latest callback:
```ts
const onSearchRef = useRef(onSearch);
onSearchRef.current = onSearch;
useEffect(() => { onSearchRef.current(debounced); }, [debounced]);
```

**Why:** If `onSearch` changes identity on every parent render (e.g., arrow function in JSX), the effect dependency changes every render, causing an infinite loop. The ref pattern captures the latest value without re-triggering the effect.

**File:** `artifacts/gen-era/src/components/store/SearchBar.tsx`
