# SCT-APP to sct-web-app Parity Matrix

This checklist tracks mobile parity against launch-critical web behaviors.
Status legend: `done`, `partial`, `missing`.

| Domain | Web Reference | Mobile Reference | Status | Notes |
| --- | --- | --- | --- | --- |
| Auth + onboarding routes (`welcome`, `login`, `register`, `join`, `join/sms`) | `sct-web-app/src/App.tsx` | `SCT-APP/app/welcome.tsx`, `SCT-APP/app/login.tsx`, `SCT-APP/app/register.tsx`, `SCT-APP/app/join/index.tsx`, `SCT-APP/app/join/sms.tsx` | done | Core entry flows present on mobile. |
| Dashboard role router | `sct-web-app/src/pages/dashboard/DashboardRouter.tsx` | `SCT-APP/app/(app)/dashboard.tsx` | done | Routes by role for current user. |
| Session form workflow (instructor) | `sct-web-app/src/pages/session/SessionFormPage.tsx` | `SCT-APP/src/components/screens/app/SessionFormScreen.tsx` | done | Existing instructor flow implemented. |
| Test session workflow (instructor) | `sct-web-app/src/pages/session/TestSessionFormPage.tsx` | `SCT-APP/app/(app)/company/test-session-form.tsx` + `SCT-APP/src/components/screens/app/TestSessionFormScreen.tsx` | done | Route and screen are implemented and reachable from dashboard session actions. |
| Session check-in (student) | `sct-web-app/src/pages/session/StudentSessionCheckInPage.tsx` | `SCT-APP/app/(app)/company/session-check-in.tsx` + `SCT-APP/src/components/screens/app/StudentSessionCheckInScreen.tsx` | done | Student check-in route and screen exist and are wired from session cards. |
| Payment result return routes | `sct-web-app/src/pages/payment/PaymentResultPage.tsx` + `sct-web-app/src/App.tsx` | `SCT-APP/app/(app)/payment-success.tsx`, `payment-cancel.tsx`, `makeup-payment-success.tsx`, `makeup-payment-cancel.tsx` | done | Mobile has return routes backed by `PaymentResultScreen` and checkout sync for subscription success. |
| Instructor permission model on user auth payload | `sct-web-app/src/types/auth.types.ts` | `SCT-APP/src/types/auth.types.ts` | done | Mobile auth models include instructor permission and capacity fields used by guards/nav. |
| Instructor permission-gated nav | `sct-web-app/src/utils/navBarUtils.ts` | `SCT-APP/src/utils/navBarUtils.ts` | done | Instructor Users tab is conditionally shown by permission set parity logic. |
| Test session payload contract (`drill_updates`, pass override fields) | `sct-web-app/src/types/testSessionForm.types.ts` | `SCT-APP/src/types/test.session.form.types.ts` | done | `drill_updates`, `final_passed`, and pass override fields align with current web/api usage. |
| Issue reporting service | `sct-web-app/src/services/issueReportService.ts` | `SCT-APP/src/services/issueReportService.ts` | done | Mobile issue report service is implemented and used by global error reporter flow. |
| Global error capture + report UX | `sct-web-app/src/components/ui/ErrorMessage.tsx` + `sct-web-app/src/services/api.ts` | `SCT-APP/src/services/api.ts` + `SCT-APP/src/components/GlobalErrorReporter.tsx` | done | API emits global errors and app-level reporter supports user issue submission. |
| Payment checkout sync after return | `sct-web-app/src/services/paymentService.ts` | `SCT-APP/src/services/paymentService.ts` | done | `syncCheckoutSession` is implemented and invoked in payment success handling. |
| Nav-level parity (master admin users item) | `sct-web-app/src/utils/navBarUtils.ts` | `SCT-APP/src/utils/navBarUtils.ts` | done | Master admin nav includes Users and Courses parity tabs. |
| Payment initiation from mobile role surfaces (admin connect, student subscription/makeup/portal) | `sct-web-app/src/pages/dashboard/AdminDashboard.tsx`, `sct-web-app/src/pages/learning/ProfilePage.tsx`, `sct-web-app/src/pages/dashboard/StudentDashboard.tsx` | `SCT-APP/src/components/screens/app/AdminDashboard.tsx`, `SCT-APP/src/components/screens/app/UserProfile.tsx`, `SCT-APP/src/services/paymentService.ts` | done | Mobile now has admin setup CTA and student billing controls for subscription, make-up checkout, portal, cancel, and reactivation. |
| Admin payment operations route (ledger + refunds) | `sct-web-app/src/pages/payment/AdminPaymentsPage.tsx`, `sct-web-app/src/utils/navBarUtils.ts` | `SCT-APP/app/(app)/company/management/payments.tsx`, `SCT-APP/src/components/screens/app/AdminPaymentsScreen.tsx`, `SCT-APP/src/utils/navBarUtils.ts` | done | Admin nav now includes Payments and mobile supports ledger review + refund execution. |
| Admin booking lock policy controls | `sct-web-app/src/pages/dashboard/AdminDashboard.tsx` | `SCT-APP/src/components/screens/app/AdminDashboard.tsx` | done | Mobile admin dashboard now supports editing booking lock hours with validation + persistence. |

## Validation target for completion

- Every release-blocking `missing`/`partial` row above is moved to `done`; non-blocking follow-up rows are tracked in release notes.
- Updated behavior is covered by mobile tests in `SCT-APP/src/__tests__`.
- New routes are reachable from existing mobile user flows without manual deep-link entry.
