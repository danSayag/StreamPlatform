# Handoff prompt: React auth frontend for StreamPlatform

Paste everything below the line into a fresh Claude session that has the repo open.

---

You are working on **StreamPlatform**, an existing Spring Boot backend at
`c:\Users\dansa\Desktop\StreamPlatform\StreamPlatformNew`. Your job is to build the
**signup and signin flow in React** and wire the paths so the frontend and this backend
work together in both dev and production.

Read this whole brief before writing code. The facts below were verified against the
running app — trust them over assumptions, but re-verify anything you change.

## Backend as it exists today

| Thing | Value |
|---|---|
| Spring Boot | 4.1.0 (pulls **Spring Security 7.0.x**) |
| Java | 17 |
| Port | 8080 (no `server.port` set) |
| Database | H2 **in-memory** — all data resets on every restart |
| Build | Maven wrapper, `./mvnw` |
| Live reload | spring-boot-devtools is on the classpath |

Key packages (note the **misspelled** `repositroies` — it is real, match it):

- `org.example.streamplatformnew.Security` — `JwtAuthFilter`, `SecurityFilterChain`
- `org.example.streamplatformnew.config` — `SecurityConfig`, `DataInitializer`
- `org.example.streamplatformnew.services` — `JwtService`, `CustomUserDetailsService`
- `org.example.streamplatformnew.repositroies` — `UserRepository`, `MovieRepository`, `CustomListRepository`
- `org.example.streamplatformnew.controllers` — `AuthController`, `MovieController`, `CustomListController`

### Current API contract (verified with curl)

**`POST /api/v1/auth/login`** — the only auth endpoint that exists.

- Request: `{"username":"admin","password":"admin"}`
- Success: `200`, `Content-Type: text/plain;charset=UTF-8`, body is the **raw JWT string** — not JSON
- Bad credentials: **`403`** with no JSON error body (an uncaught `AuthenticationException`)

Two warts you should fix as part of this work (see Task 1).

**Protected endpoints** — `GET /movies`, `GET /movies/categories`, `GET /lists`,
`POST /lists/{name}/{description}`, and others. All require
`Authorization: Bearer <token>` **and** the `ROLE_ADMIN` authority. Without a token they
return `403`.

### Current security rules

`Security/SecurityFilterChain.java`:

```java
.requestMatchers("/api/v1/auth/**").permitAll()
.requestMatchers("/", "/index.html", "/favicon.ico", "/style/**", "/javascript/**").permitAll()
.anyRequest().hasRole("ADMIN")
```

Stateless sessions, CSRF disabled, `JwtAuthFilter` runs before
`UsernamePasswordAuthenticationFilter`.

### Users

`models/User` has `id`, `username` (unique), `password` (BCrypt), and `role` (a String,
defaults to `"ROLE_USER"`). It is mapped to table **`users`** because `USER` is reserved
in H2 — do not rename it back.

`config/DataInitializer` seeds one account on startup: **`admin` / `admin`**, role
`ROLE_ADMIN`. The password comes from `app.admin.password` / the `ADMIN_PASSWORD` env var.

## ⚠️ Decision required before you write the signup endpoint

The access model is currently **admin-only**: `anyRequest().hasRole("ADMIN")`. A public
signup endpoint that creates `ROLE_USER` accounts therefore produces users who can log in
successfully but get `403` on *every* endpoint — a working login that leads to a dead app.

These two things cannot both stay as they are. Ask the repo owner which they want, and
state the tradeoff plainly:

1. **Public signup + tiered access (recommended).** Signup creates `ROLE_USER`. Relax the
   catch-all so ordinary reads (`GET /movies/**`) need only `authenticated()`, while
   `/lists/**` writes and any future admin operations keep `hasRole("ADMIN")`. The React
   app then has a real signup story.
2. **Keep it admin-only.** There is no public signup at all; accounts are provisioned
   server-side, and the React app ships a signin form only. Build the signup UI only if
   the owner picks option 1.

Do not silently pick one. If the owner is unavailable, implement option 1 but leave the
relaxed rule behind a clearly commented block so it is easy to revert.

## Task 1 — Backend auth cleanup

In `controllers/AuthController`:

- Return **JSON**, not `text/plain`: `{"token": "...", "username": "...", "role": "..."}`.
  Add proper DTOs; the current `AuthRequest` is a bare package-private class at the bottom
  of the file and should become a real record or class.
- Return **401**, not 403, on bad credentials — catch `BadCredentialsException` and map it
  to a JSON error body. A frontend cannot distinguish "wrong password" from "forbidden"
  today.
- Add **`POST /api/v1/auth/signup`** (only if the decision above allows it):
  reject duplicate usernames with `409`, validate that username and password are non-blank
  with a minimum length, BCrypt the password via the existing `PasswordEncoder` bean, save
  with role `ROLE_USER`, and return the same shape as login so the UI can log the user
  straight in.

Reuse the existing `UserRepository` and `PasswordEncoder` beans. Do not hand-roll hashing.

## Task 2 — CORS

There is **no CORS configuration anywhere** in the project. A React dev server on another
port cannot call this API until you add it. Add a CORS config allowing the dev origin
(e.g. `http://localhost:5173` for Vite), methods `GET/POST/PUT/DELETE/OPTIONS`, and the
`Authorization` and `Content-Type` headers.

Wire it into the security chain with `http.cors(Customizer.withDefaults())` and make sure
preflight `OPTIONS` requests are not blocked by the `hasRole("ADMIN")` catch-all.

## Task 3 — React app

Build a small, clean React app (Vite + TypeScript preferred) with:

- **Signin page** — username/password, calls `/api/v1/auth/login`, stores the token,
  shows a real error message on 401.
- **Signup page** — only if the decision above allows it; same fields plus confirmation,
  handles the `409` duplicate-username case.
- **Auth context/hook** holding the token and current user, with logout that clears it.
- **Protected routes** that redirect to signin when there is no valid token.
- **A single fetch wrapper** that attaches `Authorization: Bearer <token>` to every API
  call and redirects to signin on a `401`/`403`.
- One authenticated screen proving it works end to end — list movies from `GET /movies`.

Notes that will save you time:

- Decode the JWT payload for the username/expiry if useful, but **never** trust it for
  authorization decisions — the server is the authority.
- The token currently carries only `sub` (username) and timestamps. No role claim. If the
  UI needs the role, take it from the login response body you added in Task 1.
- H2 is in-memory: every backend restart wipes registered users and you are back to just
  `admin`/`admin`. Expect this while testing.

Ask the owner where the React project should live before creating it. A sibling folder
such as `frontend/` next to `src/` is the usual choice; do not scatter it into
`src/main/resources/static/`.

## Task 4 — Path integration (this is the part that usually breaks)

**Dev mode.** Run Vite on 5173 and proxy API calls to 8080 so the browser sees one origin:

```js
// vite.config.ts
server: { proxy: { "/api": "http://localhost:8080", "/movies": "http://localhost:8080", "/lists": "http://localhost:8080" } }
```

With the proxy in place, CORS (Task 2) matters mainly for direct calls and preflights —
set both up anyway so either mode works.

**Production build.** If the app should be served by Spring Boot on 8080, the Vite build
output goes into `src/main/resources/static/`. Three things will bite you:

1. There is an existing `static/index.html` (the admin panel shell, plus `static/style/`
   and `static/javascript/`). A build will **overwrite `index.html`** — confirm with the
   owner whether the old shell is being replaced or should be preserved.
2. Vite emits hashed assets into **`/assets/**`**, which is *not* in the `permitAll` list.
   Add it, or the whole app 403s exactly like the CSS and JS did before.
3. Client-side routing needs a **SPA fallback**: a deep link like `/signin` hits Spring,
   finds no controller, and 404s. Forward unmatched non-API routes to `index.html`.

Whatever you permit must stay limited to static assets. Do not weaken the API rules to
make routing work.

## Constraints

- **Do not rename the `SecurityFilterChain` class** without checking the bean name. It
  shadows Spring's own `SecurityFilterChain` interface, so its `@Bean` method is
  deliberately called `apiSecurityFilterChain` — naming it `securityFilterChain` collides
  with the config class's own bean name and fails startup with
  `BeanDefinitionOverrideException`. The return type is fully qualified for the same reason.
- **Spring Security 7 API**: `new DaoAuthenticationProvider()` and `setUserDetailsService()`
  were removed. Use `new DaoAuthenticationProvider(userDetailsService)`.
- Only one `SecurityFilterChain` bean may match every request. If you add a second chain,
  give it a `securityMatcher`.
- Keep `spring-boot-starter-security` from being declared a **third** time in `pom.xml`;
  it is already duplicated at lines ~79 and ~89 and should be collapsed to one entry.
- `./mvnw test` must still pass. Run it with a JWT secret set:
  `JWT_SECRET="0123456789abcdef0123456789abcdef0123456789" ./mvnw test`

## Known pre-existing issue — ask before touching

`services/JwtService` **hardcodes its signing secret** in the source and ignores the
`jwt.secret` property entirely, so the `JWT_SECRET` env var currently does nothing and the
committed secret signs every token. `application.properties` claims a `JwtUtil` fails fast
on a weak secret; no such class exists.

This is a genuine problem but is **out of scope** unless the owner asks. Flag it, do not
silently refactor auth while also adding features.

## Definition of done

Verify with curl against the running app and paste the actual output:

```bash
# signup (if in scope) -> 200 with JSON token
curl -s -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" -d '{"username":"viewer","password":"secret123"}'

# duplicate signup -> 409
# bad password -> 401 with JSON body
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" -d '{"username":"admin","password":"wrong"}'

# admin login -> 200, JSON with token
TOK=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}' | jq -r .token)

# authorized call -> 200
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TOK" http://localhost:8080/movies

# unauthorized call -> 403
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/movies
```

Then confirm in a browser that signin works, the protected screen loads movies, a hard
refresh on a client route does not 404, and logout returns you to signin.

Report honestly: if something is broken or you skipped part of the scope, say so
explicitly rather than reporting success.

---
