# Technical Decisions — ResumeLetterAI

This document explains every major architectural and technology decision made in
ResumeLetterAI. For each decision, I explain what I chose, what I considered
instead, why I made the trade-off I did, and what I would change if the context
changed.

The goal is simple: every decision here was deliberate. I could have done it
differently — and I know exactly why I didn't.

---

## Table of Contents

1. [Frontend Framework — Next.js vs React.js](#1-frontend-framework--nextjs-vs-reactjs)
2. [Database — MongoDB vs PostgreSQL vs MySQL](#2-database--mongodb-vs-postgresql-vs-mysql)
3. [Backend Architecture — Modular Monolithic vs Microservices vs Traditional Monolithic](#3-backend-architecture--modular-monolithic-vs-microservices-vs-traditional-monolithic)
4. [AI Provider — Google Gemini vs OpenAI GPT vs Claude](#4-ai-provider--google-gemini-vs-openai-gpt-vs-claude)
5. [State Management — Redux Toolkit vs Zustand vs Context API](#5-state-management--redux-toolkit-vs-zustand-vs-context-api)
6. [State Persistence — Redux Persist](#6-state-persistence--redux-persist)
7. [Styling — Tailwind CSS vs CSS Modules vs Styled Components](#7-styling--tailwind-css-vs-css-modules-vs-styled-components)
8. [HTTP Client — Axios vs Fetch API](#8-http-client--axios-vs-fetch-api)
9. [Animation — Framer Motion vs CSS Animation](#9-animation--framer-motion-vs-css-animation)
10. [Frontend Architecture — FSD + Atomic Design](#10-frontend-architecture--fsd--atomic-design)
11. [Validation — Zod + express-validator vs Either Alone](#11-validation--zod--express-validator-vs-either-alone)
12. [API Documentation — Swagger UI](#12-api-documentation--swagger-ui)
13. [PDF Generation — Puppeteer vs jsPDF vs PDFKit](#13-pdf-generation--puppeteer-vs-jspdf-vs-pdfkit)
14. [Logging — Winston vs console.log](#14-logging--winston-vs-consolelog)
15. [Authentication Strategy — JWT + httpOnly Cookies + Refresh Token Rotation](#15-authentication-strategy--jwt--httponly-cookies--refresh-token-rotation)
16. [Rate Limiting & Security Middleware](#16-rate-limiting--security-middleware)

---

## 1. Frontend Framework — Next.js vs React.js

**Chosen:** Next.js  
**Alternatives Considered:** Plain React.js with Vite, Remix

### What I could have done

Plain React with Vite is a perfectly valid choice. It is lightweight, fast to
set up, and gives full control over routing and configuration. Remix is another
strong contender with great data loading patterns.

### Why I chose Next.js

Next.js gives file-based routing, automatic code splitting, and built-in image
optimization out of the box. With plain React, I would have needed to configure
React Router manually, handle code splitting myself, and set up image
optimization separately. That is extra configuration that does not add business
value at this stage.

Remix is powerful but its ecosystem is significantly smaller than Next.js and
community support is not as mature. For a project where I need to move fast and
find solutions quickly, Next.js wins.

### The honest trade-off

I am not using SSR for authenticated pages because resume data is private —
there is no SEO benefit for logged-in views. So one of Next.js's biggest selling
points is currently unused. However, when I introduce public resume sharing in
the future, SSR will work immediately with zero migration cost. The architecture
is already ready.

I also deliberately chose not to use Next.js API Routes. The backend has Redis
caching, Prometheus monitoring, rate limiting, and a modular architecture that
Express handles cleanly. Next.js API Routes are not designed for this level of
backend complexity.

### When I would change this

If the project were a simple CRUD app with no complex backend needs, I might use
plain React with Vite. If SEO were critical from day one, Next.js would be the
obvious choice with SSR enabled from the start.

---

## 2. Database — MongoDB vs PostgreSQL vs MySQL

**Chosen:** MongoDB  
**Alternatives Considered:** PostgreSQL, MySQL

### What I could have done

PostgreSQL is arguably the most powerful open-source relational database. MySQL
is battle-tested and widely used. Either would work for this project.

### Why I chose MongoDB

Resume data is naturally document-based. A single user's resume contains
experience entries, skill lists, education records, project descriptions, and
certifications — each with different structures and varying numbers of entries.
In MySQL, this would require 10+ tables and complex JOIN queries just to fetch a
single resume. In PostgreSQL, I could use JSONB to store flexible nested data,
but JSONB indexing is limited and querying nested document structures becomes
verbose. It is a workaround, not a natural fit.

MongoDB stores each resume as a single document. Fetch one resume — one query,
no JOINs. Schema flexibility means AI-generated content with varying structures
is handled naturally. When a user has 5 projects and another has 2, MongoDB
handles this without nullable columns or separate junction tables.

### The honest trade-off

MongoDB's multi-document transactions are not as mature as PostgreSQL's ACID
guarantees. For complex financial operations or reporting, a relational database
would be better. But ResumeLetterAI's core operations — creating, reading, and
updating resume documents — are naturally atomic at the document level. The
trade-off is acceptable.

### When I would change this

If the product grows to include analytics, billing, or complex reporting
dashboards, I would introduce PostgreSQL for those specific data needs. Resume
data would stay in MongoDB. Financial and analytics data would move to
PostgreSQL. Hybrid approach, not a full migration.

---

## 3. Backend Architecture — Modular Monolithic vs Microservices vs Traditional Monolithic

**Chosen:** Modular Monolithic  
**Alternatives Considered:** Microservices, Traditional Monolithic

### What I could have done

Microservices would give maximum scalability and independent deployability.
Traditional Monolithic would be the simplest and fastest to build.

### Why I chose Modular Monolithic

**Traditional Monolithic** has no internal boundaries — auth logic, resume
logic, AI logic all mixed together. It works for small projects but becomes
unmaintainable as the codebase grows. I rejected this from the start.

**Microservices** would mean separate deployments, service discovery, network
latency between services, distributed tracing, and independent databases — all
operational overhead that adds zero business value at MVP stage. A two-person
team should not be managing Kubernetes clusters before they have product-market
fit.

**Modular Monolithic** is the best of both. Each module — `auth`,
`resume-templates`, `user-info`, `reviews`, `health` — has its own controllers,
services, models, routes, and validators. Modules only communicate through their
exported public interfaces, never through internal files directly. The codebase
is organized as if it were microservices, but deployed as one unit.

### The honest trade-off

The biggest risk with a Modular Monolith is that module boundaries get violated
over time. Developers can easily import internal files from other modules if
there is no enforcement mechanism. I mitigate this through code review and by
ensuring each module only exposes an `index.js` public interface.

### When I would change this

Two signals would trigger a move to microservices. First, when a specific module
needs to scale independently — for example, the AI generation service handling
significantly more traffic than auth. Second, when separate teams own separate
modules and deployment independence becomes a real need. Until then, the Modular
Monolith stays.

---

## 4. AI Provider — Google Gemini vs OpenAI GPT vs Claude

**Chosen:** Google Gemini  
**Alternatives Considered:** OpenAI GPT-4o, Anthropic Claude

### What I could have done

OpenAI GPT-4o is the most popular AI API with the largest ecosystem. Anthropic
Claude has excellent reasoning and natural writing quality — arguably better for
long-form content.

### Why I chose Google Gemini

Cost was the deciding factor at MVP stage. OpenAI GPT-4o is the most expensive
option and the free tier is very limited — meaningful development and testing
would incur real costs before the product even has users. Anthropic Claude has
no free API tier at all. Every request costs money from day one.

Google Gemini offers 1500 free requests per day with Gemini 1.5 Flash — enough
to build, test, and validate the entire MVP at zero cost. Output quality for
structured resume generation is more than sufficient. The difference in writing
quality between Gemini and GPT-4o matters more for creative writing than for
generating professional resume bullet points.

### The honest trade-off

Gemini's ecosystem is not as mature as OpenAI's. Third-party integrations are
fewer and some edge cases produce less consistent output than GPT-4o. If output
quality becomes a product differentiator, switching providers will be necessary.

I built an abstraction service layer around the AI provider — the application
never calls the Gemini SDK directly. When the product scales and budget allows,
switching to OpenAI or Claude requires changing only the service layer. The rest
of the codebase remains untouched.

### When I would change this

When the product has paying users and AI output quality becomes a competitive
differentiator. At that point, the cost of GPT-4o or Claude is justified by the
revenue it supports.

---

## 5. State Management — Redux Toolkit vs Zustand vs Context API

**Chosen:** Redux Toolkit  
**Alternatives Considered:** Zustand, Context API

### What I could have done

Context API requires no additional library. Zustand is lightweight, minimal
boilerplate, and increasingly popular.

### Why I chose Redux Toolkit

**Context API** causes performance issues at scale. Every Context value change
re-renders all consuming components. For a resume builder with auth state, form
data across 9 steps, AI generation status, template selection, section order,
and auto-save state — all interconnected — this would create serious unnecessary
re-renders.

**Zustand** is lightweight and would work for an MVP. But as state complexity
grows, enforcing consistent patterns across the codebase becomes difficult.
Redux Toolkit's slice-based structure means each feature owns its state in a
predictable, reviewable way. When debugging a complex async AI generation flow,
Redux DevTools lets me time-travel through every state change — Zustand's
DevTools support is not as mature.

**Redux Toolkit** removed the old Redux boilerplate problem. `createSlice` and
`createAsyncThunk` handle 90% of the patterns needed. The trade-off in verbosity
is paid back in debuggability and maintainability.

### The honest trade-off

For a simpler app, Redux Toolkit is overkill. The learning curve is steeper than
Zustand. If this were a three-page app with simple state, Zustand would be the
better choice.

Context API is still used — for theme state and modal open/close state. Redux
Toolkit handles all global complex state. They coexist.

### When I would change this

If the product pivots to something much simpler, Zustand would be revisited. For
the current complexity of a multi-step resume builder with real-time AI
generation, Redux Toolkit is the right fit.

---

## 6. State Persistence — Redux Persist

**Chosen:** Redux Persist  
**Alternatives Considered:** Manual localStorage handling, Server-side session
storage

### What I could have done

I could manually read and write to localStorage at key points in the
application. Or I could store form state on the server after every change.

### Why I chose Redux Persist

Users spend significant time filling out resume data across 9 steps — personal
info, work experience, projects, skills, education, and more. A page refresh
should never lose their work. That is an unacceptable user experience for a
productivity tool.

Redux Persist selectively persists specific Redux slices to localStorage
automatically. No manual read/write logic scattered across components. The auth
slice and resume form slice are persisted. AI generation loading state is
deliberately excluded — showing a stale loading indicator after a refresh would
confuse users.

### The honest trade-off

Persisting any data to localStorage carries XSS risk — injected scripts can read
it. This is mitigated with `isomorphic-dompurify` sanitization on the frontend
and Helmet's Content Security Policy headers on the backend. This is a known
industry trade-off. The alternative — server-side session storage with
database-backed form state — would require syncing 9 form steps to the server on
every change, adding latency and complexity that is not justified at this stage.

### When I would change this

If security requirements increase — for example, handling sensitive personal
data beyond resume information — I would move auth tokens exclusively to
httpOnly cookies and implement server-side form draft storage with explicit save
points.

---

## 7. Styling — Tailwind CSS vs CSS Modules vs Styled Components

**Chosen:** Tailwind CSS  
**Alternatives Considered:** CSS Modules, Styled Components

### What I could have done

CSS Modules give component-level scoping. Styled Components provide CSS-in-JS
with dynamic styling capabilities.

### Why I chose Tailwind CSS

**CSS Modules** require switching between files constantly. Every component has
a paired `.module.css` file. Maintaining consistent naming, finding the right
file, and enforcing design system values across hundreds of components becomes
tedious. Design inconsistency creeps in easily.

**Styled Components** introduce runtime overhead — styles are injected at
runtime which impacts performance. Configuring it correctly with Next.js SSR
adds unnecessary complexity and bundle size increases.

**Tailwind** keeps styling inside the component with utility classes — no file
switching. The design system is built-in with consistent spacing, colors, and
typography tokens. In production, unused CSS is purged automatically resulting
in a minimal bundle size. Combined with shadcn/ui which is built on Tailwind,
the component library integrates seamlessly.

`clsx` and `tailwind-merge` handle conditional class logic cleanly when class
names get complex.

### The honest trade-off

Tailwind class names get verbose on complex components. A developer unfamiliar
with Tailwind needs time to read component markup. Some engineers prefer the
separation of concerns that CSS Modules provide. These are valid concerns —
Tailwind is a style preference as much as a technical decision.

### When I would change this

I would not change this for this project. For a design-system-heavy enterprise
product with a dedicated design team, CSS Modules or a design token system might
be more appropriate.

---

## 8. HTTP Client — Axios vs Fetch API

**Chosen:** Axios  
**Alternatives Considered:** Native Fetch API

### What I could have done

The native Fetch API is built into modern browsers with no additional dependency
needed.

### Why I chose Axios

The native Fetch API requires manually calling `response.json()` on every
request. More critically, Fetch does not throw errors on HTTP error responses —
a 404 or 500 response resolves successfully and you must manually check
`response.ok` every time. There are no interceptors, and request cancellation
requires AbortController setup.

Axios handles all of this automatically. JSON is parsed automatically. HTTP
errors throw automatically. Request interceptors inject the JWT auth token into
every API call without repeating code. Response interceptors handle 401 errors
globally — triggering logout or token refresh in one place instead of in every
API call. The result is significantly cleaner API interaction code across the
entire frontend.

### The honest trade-off

Axios is roughly 13KB gzipped — a small but real addition to bundle size. For a
project where network requests are central to the user experience, this
trade-off is clearly worthwhile.

### When I would change this

For a very lightweight project with simple API needs, native Fetch with a thin
wrapper would be sufficient. For this project, Axios is the right choice.

---

## 9. Animation — Framer Motion vs CSS Animation

**Chosen:** Framer Motion  
**Alternatives Considered:** Pure CSS Animations, CSS Transitions

### What I could have done

Pure CSS animations are zero-dependency and perfectly capable for simple
transitions.

### Why I chose Framer Motion

Pure CSS animations are fine for simple fades and slides. But ResumeLetterAI has
drag-and-drop resume section reordering — users can rearrange experience,
skills, and education sections in real time. Animating this smoothly with pure
CSS becomes verbose and difficult to maintain. Orchestrating sequences — where
one animation triggers another — is significantly harder in CSS.

Framer Motion's declarative API keeps animation logic clean and directly inside
the component JSX. It integrates seamlessly with `@dnd-kit` which handles the
drag logic while Framer Motion handles the visual animation. GPU acceleration is
automatic, keeping performance smooth even with multiple animated elements on
screen.

### The honest trade-off

Framer Motion is roughly 30KB gzipped — the largest single UI dependency. For a
project where animation is a core part of the user experience, this is
justified. For a data dashboard with no complex interactions, it would be
overkill.

### When I would change this

If animation requirements were limited to simple fades and slides, pure CSS
would be sufficient and Framer Motion would be removed.

---

## 10. Frontend Architecture — FSD + Atomic Design

**Chosen:** Feature-Sliced Design (FSD) combined with Atomic Design  
**Alternatives Considered:** Standard MVC, FSD alone

### What I could have done

Standard MVC is the most familiar pattern. FSD alone would also be a clean
solution.

### Why I combined FSD and Atomic Design

These two methodologies solve completely different problems and do not overlap.

**Atomic Design** answers: how do we organize UI components?

- `atoms` — Button, Input, Label — single responsibility, no business logic
- `molecules` — FormField, SearchBar — combinations of atoms
- `organisms` — ResumeForm, NavBar — complete UI blocks

These live in `shared/components` and are pure UI with zero business logic.

**Feature-Sliced Design** answers: how do we organize features and business
logic?

- `features` — auth, resume-builder, cover-letter — user interactions and
  business logic
- `entities` — business domain objects
- `widgets` — dashboard, navigation, landing — complex page sections that
  combine multiple features
- `shared` — reusable utilities, hooks, and the Atomic Design component library

Features consume shared UI components. UI components know nothing about business
logic. The separation means UI can be redesigned without touching feature logic,
and feature logic can change without touching UI components.

A concrete example: `Button` (atom) lives in `shared/components/atoms`.
`ResumeForm` (organism) lives in `shared/components/organisms`. The
`resume-builder` feature imports `ResumeForm` and connects it to Redux state and
API calls — the organism itself has no idea Redux exists.

### The honest trade-off

Two mental models running simultaneously adds cognitive overhead. A new
developer needs to understand both FSD layer rules and Atomic Design component
hierarchy. For a solo developer or small team, this is manageable. For a larger
team, clear documentation of where things belong is essential.

### When I would change this

For a smaller project, FSD alone would be sufficient. The Atomic Design layer
adds the most value when the UI component library grows large enough to warrant
its own organization system — which is the case here with shadcn/ui integration
and custom components.

---

## 11. Validation — Zod + express-validator vs Either Alone

**Chosen:** Zod + express-validator together  
**Alternatives Considered:** Zod alone, express-validator alone

### What I could have done

Either library alone could technically handle all validation needs.

### Why I use both

They operate at two completely different layers and are not redundant.

**express-validator** works at the HTTP layer. It runs as Express middleware and
validates `req.body`, `req.params`, and `req.query` the moment a request
arrives. It catches basic issues — empty fields, invalid email formats, missing
required parameters — before the request ever reaches the service layer. Invalid
requests are rejected at the door.

**Zod** works at the business logic layer. It handles complex nested object
validation, deep type checking, and schema composition. The same Zod schemas
used on the backend are imported on the frontend with React Hook Form — a single
source of truth for validation rules across the entire application. If a resume
section's required fields change, updating the Zod schema automatically updates
validation on both frontend and backend.

This is defense in depth. express-validator is the first gate. Zod is the second
gate.

### The honest trade-off

Two validation libraries means two sets of schemas to maintain for some rules.
There is some duplication. The benefit — frontend/backend schema sharing with
Zod, clean Express middleware integration with express-validator — outweighs
this cost for this project's scale.

### When I would change this

For a simpler backend with no shared frontend validation needs,
express-validator alone would be sufficient. For a TypeScript-first project, Zod
alone with a custom Express middleware adapter would also work cleanly.

---

## 12. API Documentation — Swagger UI

**Chosen:** Swagger UI  
**Alternatives Considered:** Postman Collection only, Manual Markdown
documentation

### What I could have done

Maintain a Postman Collection and keep manual documentation in Markdown files.

### Why I chose Swagger UI

Manual documentation goes out of date the moment the code changes. Postman
Collections require every developer to install Postman and import the collection
separately — friction that slows onboarding.

Swagger UI generates interactive browser-based documentation directly from
`openapi.yaml`. Any developer can open `/api-docs` and immediately see every
endpoint, its expected request format, required parameters, and test it directly
in the browser — no tools to install, no setup required. The Postman Collection
is also maintained as a backup for developers who prefer it.

In production, the `/api-docs` route is disabled when `NODE_ENV=production` so
the API structure is never publicly exposed.

### The honest trade-off

The `openapi.yaml` file must be manually kept in sync with actual route changes.
This introduces the same problem as manual documentation if discipline slips.
The future plan is to use `swagger-jsdoc` to auto-generate the OpenAPI spec from
JSDoc comments in route files — keeping documentation and code permanently in
sync without manual effort.

### When I would change this

For an internal-only API with a small team, a well-maintained Postman Collection
is sufficient. Swagger UI adds the most value when external developers or new
team members need to onboard quickly.

---

## 13. PDF Generation — Puppeteer vs jsPDF vs PDFKit

**Chosen:** Puppeteer  
**Alternatives Considered:** jsPDF, PDFKit

### What I could have done

jsPDF generates PDFs programmatically in JavaScript. PDFKit is a Node.js PDF
generation library with a canvas-like API.

### Why I chose Puppeteer

Resume templates are built in HTML and CSS — specifically Tailwind CSS with
inline styles for user customization. jsPDF and PDFKit would require rebuilding
the entire layout logic in their own APIs — essentially maintaining two
rendering systems for the same visual output. Any CSS change in the template
would need to be mirrored in the PDF generation code. This creates a maintenance
burden and makes pixel-perfect output nearly impossible.

Puppeteer renders the final HTML exactly as a browser would and generates a PDF
from that output. The resume the user sees in the live preview is identical to
the PDF they download. One source of truth for layout. No duplicate rendering
logic.

The implementation uses a file cache — the HTML template and Tailwind CSS are
read from disk once and kept in memory. Subsequent PDF requests reuse the cached
files without hitting the filesystem again. A custom conditional resolver
handles `{{#if key}}...{{/if}}` blocks in the template using bracket depth
tracking rather than regex, because regex fails on nested conditional blocks.
The rendered PDF is uploaded directly to Cloudinary and the URL is stored on the
resume document — the buffer is never written to disk.

### The honest trade-off

Puppeteer launches a full Chromium browser instance for every PDF request. The
browser is opened, used, and closed within a single `generatePdf` call — there
is no browser pooling or reuse across concurrent requests. Under concurrent
load, this means multiple Chromium instances running simultaneously, each
consuming significant memory. At MVP scale with low traffic, this is acceptable.
It is a known bottleneck.

The `--no-sandbox`, `--disable-setuid-sandbox`, and `--disable-dev-shm-usage`
flags are required for Puppeteer to run in containerized environments like
Docker or cloud platforms. These flags reduce the Chromium sandbox security
model — a deliberate trade-off for deployment compatibility.

### When I would change this

When PDF generation becomes a performance bottleneck, the fix is browser
instance pooling — maintaining a pool of warm Chromium instances rather than
launching a new one per request. If traffic scales further, PDF generation moves
to a dedicated worker service with a job queue, isolating its memory consumption
from the main API server entirely.

---

## 14. Logging — Winston vs console.log

**Chosen:** Winston  
**Alternatives Considered:** console.log, Pino

### What I could have done

console.log works for development. Pino is a high-performance structured logger
that is increasingly popular in production Node.js applications.

### Why I chose Winston

`console.log` has no log levels, no file output, no structured format, and no
way to filter logs by severity in production. It is not production-ready.

Winston provides structured logs with configurable levels (error, warn, info,
debug), file rotation through `winston-daily-rotate-file`, and multiple
transports — console output for development, file output for production, and
future integrations with external log aggregators. The audit log, error log, and
combined log are all handled through separate Winston transports. This gives
clear separation between log types and makes debugging production issues
significantly faster.

### The honest trade-off

Pino is faster than Winston in raw benchmarks and is increasingly the community
preference for high-performance production logging. Winston is more configurable
and has broader community adoption and documentation. For this project's scale,
the performance difference is negligible.

### When I would change this

If logging throughput becomes a bottleneck — for example, handling thousands of
requests per second where logging overhead matters — I would evaluate switching
to Pino. At current scale, Winston is the right balance of features and
familiarity.

---

## 15. Authentication Strategy — JWT + httpOnly Cookies + Refresh Token Rotation

**Chosen:** Dual-token system (Access Token + Refresh Token) stored in httpOnly
cookies  
**Alternatives Considered:** Single JWT in localStorage, Session-based auth with
server-side store

### What I could have done

Single JWT stored in localStorage is the most common approach tutorials show. It
is simple — store on login, attach to every request, delete on logout.
Session-based auth with server-side storage (Redis or database) is the other
extreme — stateful, fully revocable, but requires a session store lookup on
every single request.

### Why I chose this approach

**localStorage + single JWT** has a fundamental security flaw: JavaScript can
read localStorage, which means any XSS vulnerability in the application can
steal the token. For a tool that stores personal career data, this is not an
acceptable risk.

**httpOnly cookies** cannot be read by JavaScript at all — not by the
application code, not by injected scripts. The browser attaches them to every
request automatically. This eliminates the XSS token-theft attack vector
entirely.

The dual-token design solves the revocation problem that single JWTs cannot
solve:

- **Access token** — short-lived (15 minutes), stateless JWT verified on every
  protected request. If intercepted, it expires quickly.
- **Refresh token** — long-lived (7 days), stored in httpOnly cookie. Used only
  to issue new access tokens. Validated against the database on every refresh.

The auth middleware checks validity in a deliberate order: token existence → JWT
signature verification → user still exists in database → account is active →
password was not changed after the token was issued. A token that passes all
five checks is genuinely valid. The password-changed-after check means that if a
user's account is compromised and they change their password, every existing
token — including any the attacker holds — becomes invalid immediately.

Password change and password reset both call `UserSession.revokeAllUserSessions`
— every active session in the database is invalidated at once. A stolen refresh
token from before the password change becomes useless.

### Multi-session support

The codebase includes a `UserSession` model and a `MULTI_SESSION_ENABLED`
feature flag. When enabled, every login creates a session record tracking device
info, IP address, browser, OS, and last-used timestamp. Users can view all
active sessions, revoke a specific session (logout from one device), or revoke
all other sessions simultaneously. This is behind a feature flag because it adds
a database write on every token refresh — a performance cost that is only worth
paying once the session management UI is complete and the feature is
user-facing.

### The honest trade-off

The access token is returned in both the httpOnly cookie and the response body.
This is a deliberate pragmatic decision — the Redux Persist layer on the
frontend stores the token value for use in Axios request interceptors. The
httpOnly cookie is the secure channel; the response body value is the
convenience layer for the frontend state. They are the same token. A stricter
implementation would rely exclusively on the cookie and remove the token from
the response body entirely.

httpOnly cookies introduce CSRF risk — a malicious site can trigger
authenticated requests since the browser attaches cookies automatically. This is
mitigated with `sameSite: 'strict'`, which prevents the browser from sending
cookies on any cross-site request. In production, `secure: true` ensures cookies
only travel over HTTPS.

### When I would change this

If the application introduced a public API for third-party integrations, OAuth
2.0 with client credentials flow would replace the cookie-based approach for
those consumers. The cookie strategy is designed for first-party browser
clients, not programmatic API access.

---

## 16. Rate Limiting & Security Middleware

**Chosen:** `express-rate-limit` with Redis backing via `rate-limit-redis`,
combined with layered security middleware  
**Alternatives Considered:** In-memory rate limiting only, application-level
throttling, no rate limiting

### What I could have done

`express-rate-limit` with its default in-memory store works out of the box with
zero configuration. For a single-server deployment during development, it
technically functions. No rate limiting at all is the fastest path to shipping
but leaves auth routes open to brute-force attacks.

### Why I chose Redis-backed rate limiting

In-memory rate limiting has one critical flaw: counters do not survive server
restarts and do not work across multiple server instances. If the server
restarts — during a deployment, a crash, or a scaling event — all rate limit
counters reset to zero. An attacker who knows this can time their requests
around deployments.

`rate-limit-redis` stores counters in Redis, which persists across restarts and
is shared across all instances of the API. This matters most for auth routes —
brute-force protection on login and password reset is only meaningful if the
counter cannot be reset by restarting the server.

The rate limiter middleware exists and is wired up, but is currently commented
out as a global middleware in `app.js`. This is intentional — global rate
limiting during development creates friction when running tests, seeding data,
or making rapid API calls. The plan is to apply it per-route in production with
differentiated limits: tighter on auth routes, looser on read endpoints.

Auth routes have a separate application-level brute-force protection that is
always active regardless of rate limiting: the `loginAttempts` counter with
`lockUntil` timestamp on the User model locks an account after repeated failed
login attempts for 2 minutes. This is complementary to rate limiting, not a
replacement for it.

The full security middleware stack, in deliberate order: Helmet (sets 11 HTTP
security headers including CSP, HSTS, and X-Frame-Options) → CORS with explicit
origin whitelist → cookie-parser → body size limits (5MB JSON, 3MB URL-encoded,
prevents DoS via oversized payloads) → compression → request logging. Security
middleware runs before any business logic reaches a route handler.

Additional security packages active in production: `express-mongo-sanitize`
strips `$` operators from request bodies to prevent NoSQL injection, `hpp`
prevents HTTP Parameter Pollution attacks, `xss-clean` sanitizes request data,
and `isomorphic-dompurify` sanitizes any HTML content before it reaches the
database.

### The honest trade-off

The rate limiter being commented out at the global level and not yet applied
per-route is a known gap before production deployment. The account lockout
mechanism on the User model provides partial mitigation for auth routes, but
IP-based rate limiting at the middleware level is a separate and necessary
layer. Applying Redis-backed rate limiting per route is a committed
pre-production task.

### When I would change this

If traffic patterns required differentiated limits per user tier — free users
capped at 100 AI generations per day, premium users at 1000 — the rate limiter
would need user-aware key generation instead of IP-based counting. At MVP scale,
IP-based limiting is sufficient.

---

## Summary

Every decision in this project followed the same framework:

1. **What problem am I actually solving?** Not what is trending, not what I
   already know.
2. **What are the real alternatives?** Considered seriously, not dismissed.
3. **What is the trade-off?** Every choice has a cost. Knowing the cost is as
   important as knowing the benefit.
4. **When would I change this?** Good decisions are contextual. The right answer
   changes as the product scales.

The goal was never to use the most impressive technology. The goal was to use
the right technology for this stage of this product — and to be able to explain
exactly why.
