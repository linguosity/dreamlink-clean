# Dreamlink Development Notes

## Common Commands

```bash
# Start development server
npm run dev

# Check for TypeScript errors
npm run typecheck

# Run linting
npm run lint

# Run tests (if available)
npm run test

# Build for production
npm run build
```

## Authentication Implementation

The proper Supabase SSR approach for Next.js 15 requires using get/set/remove instead of getAll/setAll:

1. Server-side client:
   ```typescript
   createServerClient({
     cookies: {
       get(name) {
         return cookieStore.get(name)?.value
       },
       set(name, value, options) {
         cookieStore.set(name, value, options)
       },
       remove(name, options) {
         cookieStore.set(name, '', { ...options, maxAge: 0 })
       },
     },
   })
   ```

2. Middleware uses a similar pattern but with request/response cookies:
   ```typescript
   cookies: {
     get(name) {
       return request.cookies.get(name)?.value
     },
     set(name, value, options) {
       request.cookies.set({ name, value, ...options })
       response.cookies.set({ name, value, ...options })
     },
     remove(name, options) {
       request.cookies.set({ name, value: '', ...options, maxAge: 0 })
       response.cookies.set({ name, value: '', ...options, maxAge: 0 })
     },
   }
   ```

3. Server actions use the server client to handle auth operations
4. Client-side components use the browser client

## Authentication Notes

- Always use `await` when calling `createClient()` from server.ts
- Remember that `cookies()` can only be used in route handlers, server actions, and middleware
- For client components, use the browser client from client.ts
- Added singleton pattern to client.ts for better performance

## Known Issues & Fixes

1. 404 errors for webpack static files:
   - Fixed with proper next.config.ts configuration
   - Added proper static asset handling

2. Auth session errors:
   - Added graceful fallbacks in server.ts
   - Fixed error handling in middleware.ts
   - Added proper delays for cookie processing in signIn/signOut

3. UserAvatar dropdown missing:
   - Fixed client-side session fetch logic
   - Added better error handling for profile data fetching