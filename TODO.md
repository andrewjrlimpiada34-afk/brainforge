# brainforge - Task checklist

## Auth init + registration redirect fix
- [ ] Investigate why `/complete-profile` renders on first load for logged-out users.
- [ ] Ensure default route for unauthenticated users is `/login` (not `/complete-profile`).
- [ ] Make loader show immediately on startup while auth/profile state resolves.
- [ ] Ensure `CompleteProfilePage` renders only when:
  - user is authenticated AND email verified AND backend indicates profile not initialized (404 from `/api/profile`)
  - or explicit “incomplete registration” flag is true.
- [ ] Fix any incorrect gating timing causing temporary false `isRegistered=false`.
- [ ] Add proper loading-state handling so pages do not flash/redirect.
- [ ] Improve gamer-style loading screen if needed (neon/glow, smooth transitions, responsive).

## After code changes
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Smoke test: logged out / logged in verified / logged in not registered.
