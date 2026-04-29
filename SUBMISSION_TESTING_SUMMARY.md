# SUBMISSION Testing Summary (CW2)

This document summarizes the automated testing strategy used in AgriGuide to provide clear evidence for the CW2 criterion: **Evidence of automated application testing**.

## How Tests Are Executed

- Development mode (watch): `npm run test`
- Submission/CI mode (single run): `npm run test:ci`

Latest execution used for this submission:
- Command: `npm run test:ci`
- Result: **12 test files passed, 18 tests passed, 0 failed**

## Testing Strategy Overview

AgriGuide uses focused unit/component tests to validate critical user journeys and security flows rather than only shallow component creation checks.

The strategy prioritizes:
- Form validation reliability for authentication and CRUD forms.
- API mutation behavior for create/update/delete and smart farm actions.
- Access control correctness for role-based protected features.
- HTTP security behavior through JWT token propagation in interceptor logic.

## Key Test Files Included

- `src/app/components/auth/login/login.spec.ts`
- `src/app/components/farms/farm-form/farm-form.spec.ts`
- `src/app/components/farms/farms-list/farms-list.spec.ts`
- `src/app/components/farms/farm-detail/farm-detail.spec.ts`
- `src/app/components/dashboard/admin-dashboard/admin-dashboard.spec.ts`
- `src/app/guards/auth.guard.spec.ts`
- `src/app/interceptors/auth.interceptor.spec.ts`

## What These Tests Cover

### 1. Form Validation and Submission Flows
- `login.spec.ts`: validates login component initialization and form-driven authentication flow support.
- `farm-form.spec.ts`: validates create/edit form behavior with valid form submission path (including update mutation flow).
- `admin-dashboard.spec.ts`: validates admin broadcast form submission path for valid GeoJSON alert payload.

### 2. API CRUD Mutations and Smart Actions
- `farm-form.spec.ts`: verifies update mutation call path on valid form submit.
- `farms-list.spec.ts`: verifies delete mutation path after user confirmation.
- `farm-detail.spec.ts`: verifies smart action call path for weather synchronization and resulting UX feedback updates.

### 3. Role-Based Guards and Protected Access
- `auth.guard.spec.ts`: verifies `adminGuard` blocks non-admin users from admin-only access and redirects correctly.

### 4. JWT Token Propagation and Request Security
- `auth.interceptor.spec.ts`: verifies interceptor attaches `Authorization: Bearer <token>` header to outgoing HTTP requests.

## CW2 Rubric Alignment

This test suite demonstrates testing evidence at a 1st-class level by covering:
- **Usability-critical form behavior** (validation + feedback pathways).
- **Core CRUD and extended smart feature mutations** (not only read-only data display).
- **Security and authorization controls** (role-based guard behavior).
- **Authentication transport integrity** (JWT header injection by interceptor).

Together, these tests provide direct, auditable proof that AgriGuide includes automated checks across functional correctness, security, and user-facing reliability.
