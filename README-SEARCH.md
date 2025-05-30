# Dreamlink Search Implementation

This document outlines the search functionality in Dreamlink, including its architecture, feature flags, and future expansion plans.

## Architecture Overview

The search implementation follows a progressive enhancement pattern:

1. **Client-side Search**: Initial implementation that filters dreams in-memory
2. **Server-side Search**: Future implementation using Supabase full-text search

This approach allows us to ship quickly with client-side filtering while laying the groundwork for more scalable server-side search when needed.

## Key Components

### 1. Feature Flags (`/utils/feature-flags.ts`)

Controls search functionality with two flags:

- `CLIENT_SEARCH`: Enables client-side filtering
- `SERVER_SEARCH`: Enables server-side search API (future)

Feature flags can be set via:
- Environment variables (`NEXT_PUBLIC_FEATURE_CLIENT_SEARCH`)
- Local storage for development and testing

### 2. Search Context (`/context/search-context.tsx`)

Provides search state management across components:

- `searchQuery`: Current user input
- `debouncedSearchQuery`: Debounced version to prevent excessive filtering
- `isLoading`: Loading state during debounce period
- `isSearchEnabled`: Whether search feature is enabled via flags

### 3. Search Hook (`/hooks/use-dream-search.ts`)

Core search logic:

- `useDreamSearch`: Filters dreams based on search query
- `useDebounce`: Debounces input to improve performance

### 4. UI Components

- **Navbar**: Search input with keyboard shortcuts (Ctrl+K)
- **AnimatedDreamGrid**: Displays filtered dreams with loading states
- **DreamCard**: Highlights search matches in dream content

### 5. API Routes

- `/api/dream-entries/search/route.ts`: Stub for future server-side search

## Search Algorithm

The client-side search filters dreams based on:

1. Original dream text
2. Dream title
3. Dream summary
4. Analysis summary
5. Tags
6. Biblical references

## User Experience

1. Type in search box or press Ctrl+K to focus
2. Results filter in real-time as you type (debounced by 300ms)
3. Matching terms are highlighted in yellow
4. Empty state shown when no matches found

## Future Enhancements

1. **Server-side Search**:
   - Implement using Supabase's full-text search
   - Add GIN index on text columns
   - Use cursor-based pagination for large result sets

2. **Search Improvements**:
   - Advanced filtering by date, tags, etc.
   - Saved searches
   - Search history

## Testing

Tests are included in:

- `/tests/components/Navbar.search.test.tsx`
- `/tests/components/AnimatedDreamGrid.filter.test.tsx`

## Usage

To enable search in development:

```
# .env.development
NEXT_PUBLIC_FEATURE_CLIENT_SEARCH=true
```

For production rollout, use gradual deployment:

1. Enable for 10% of users
2. Monitor performance and user feedback
3. Scale to 100% if stable