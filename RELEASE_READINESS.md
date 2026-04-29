# SCT-APP Release Readiness

This document captures the pragmatic pre-submission gate for App Store and Play Store review.

## Completed Engineering Checks

- Updated parity tracker in `PARITY_MATRIX.md` to reflect current implementation status.
- Added mobile payment entry points:
  - Admin Stripe Connect setup flow in `src/components/screens/app/AdminDashboard.tsx`.
  - Student billing controls (checkout, portal, cancel/reactivate, make-up checkout) in `src/components/screens/app/UserProfile.tsx`.
- Added admin payment operations parity:
  - Admin payments route/screen (`app/(app)/company/management/payments.tsx`, `src/components/screens/app/AdminPaymentsScreen.tsx`).
  - Payment ledger + refund actions in `src/services/paymentService.ts`.
  - Admin nav includes `Payments` in `src/utils/navBarUtils.ts`.
- Added mobile booking policy parity:
  - Booking lock hour controls in `src/components/screens/app/AdminDashboard.tsx`.
  - Company update support in `src/services/companyService.ts`.
- Stabilized release dependencies + lint gate:
  - Upgraded `expo-notifications` to an Expo SDK 54-compatible version in `package.json`.
  - Cleared blocking lint errors in onboarding/calendar/master-admin copy text and notifications import resolution.
- Hardened auth/session handling:
  - Added secure token persistence via `src/services/authStorage.ts` (SecureStore with legacy migration fallback).
  - Updated auth + API layers to use secure storage in `src/services/authService.ts` and `src/services/api.ts`.
  - Added trusted Stripe URL gating in `src/utils/safeExternalUrl.ts`.
  - Added production HTTPS guard in `src/config/index.ts`.
- Reduced production-sensitive logging in critical auth/layout/onboarding flows by using `src/utils/logger.ts`.
- Added focused parity/security tests:
  - `src/__tests__/services/api.test.ts`
  - updated `src/__tests__/services/authService.test.ts`
  - updated `src/__tests__/services/paymentService.test.ts`

## Automated Verification

- Ran focused suite:
  - `npm test -- --runInBand src/__tests__/services/paymentService.test.ts src/__tests__/utils/navBarUtils.test.ts`
- Ran full mobile suite:
  - `npm test -- --runInBand`
- Ran lint gate for store-release safety:
  - `npm run lint -- --quiet`
- Result: all tests passed (`28` suites, `374` tests).

## Manual Device Smoke Checklist (iOS + Android)

- [ ] Login/logout flow works for all roles.
- [ ] Role dashboards route correctly (student, instructor, admin, master admin).
- [ ] Session booking/check-in/test-session flows are reachable and complete without crashes.
- [ ] Stripe checkout opens from mobile and returns into app success/cancel routes.
- [ ] Billing portal opens from student profile and return flow keeps auth/session intact.
- [ ] Admin Stripe Connect setup opens and can complete onboarding.
- [ ] Admin Payments tab loads ledger and can issue a refund for a refundable payment.
- [ ] Global error reporter appears for recoverable API failures and can submit issue reports.
- [ ] Notification permission UX appears only for students and does not block app navigation.
- [ ] Production build points to expected HTTPS API URL.
- [ ] iOS bundle identifier and Android package are confirmed for store submission metadata.

## Deferred Non-Critical Follow-Ups (Post-Submission)

- Broader cleanup of non-critical `console.*` logging outside critical auth/onboarding/layout paths.
- Add integration/E2E coverage for billing + return/deeplink paths (currently unit/service heavy).
- Expand mobile payment entry points beyond profile surface (for deeper web parity in dashboard UX).
- Add runtime telemetry/crash reporting integration for production observability.
