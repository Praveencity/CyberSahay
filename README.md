# Cybercrime Complaint / FIR Assistance Portal

An independent drafting workspace for cybercrime victims in India. Users can describe an incident, answer questions, resume a private conversation, correct details and download a complaint in English, Hindi, Hinglish or Punjabi. Users submit reviewed documents themselves through official channels.

## Run locally

Use Node.js 22.12+ or 24, npm, PostgreSQL and a Chromium-compatible Linux or desktop host. Create a database owned by a dedicated application role. In psql as a database administrator:

    CREATE ROLE portal LOGIN;
    \password portal
    CREATE DATABASE portal OWNER portal;

Install and configure from this directory:

    npm ci
    cp .env.example .env
    openssl rand -base64 48

Put the generated value in AUTH_SECRET. Set DATABASE_URL to your PostgreSQL connection URL, URL-encoding special characters in the password. Set APP_ORIGIN to the exact external origin without a trailing slash. Install the browser and initialize the database:

    npx playwright install --with-deps chromium
    npx prisma generate
    npx prisma migrate deploy
    npm run dev

Visit http://localhost:3000. An existing Chromium executable can be selected with CHROMIUM_PATH. Production session cookies require HTTPS.

## Implementation

- Next.js App Router and Tailwind render the public resources and private workspace. The account and complaint route handlers perform authorization for every record access.
- Prisma stores accounts and complaints in PostgreSQL. Each complaint owns its conversation transcript and structured answers in JSONB. Updates check a version number to prevent lost edits. Account deletion cascades to drafts and conversations.
- Passwords use salted scrypt. Iron Session seals the HTTP-only cookie. Password changes rotate the user's session version. Mutations check request origin. Shared rate limits run in PostgreSQL.
- The workflow in src/lib/workflow.js uses category-specific fields and localized question dictionaries. Unknown, omitted and inapplicable answers are distinguished from known facts. The user can correct a category or edit any field. Completion and document status refer only to progress inside this application.
- Set AI_BASE_URL, AI_MODEL and AI_API_KEY on the server to enable AI suggestions in the assistant and reports started from evidence. The provider receives recognized incident keywords, language, category options and predefined question fields. Narratives, freeform answers and attachments stay private. Each turn records whether the provider wrote its question or a built-in question was used. Report facts come from the user's answers.
- src/lib/pdf.js renders escaped user text into an A4 PDF with Chromium and bundled Noto fonts. Font license information is in public/fonts. PDFs are generated on demand. The Evidence section stores image and short video uploads in PostgreSQL with owner-only downloads. PDFs list the filenames and notes. The original media is downloaded separately. Deleting the complaint or account removes its media from the active database.
- The public privacy page explains stored account and complaint information. Users may remove individual complaints, their entire history, or their account. Deleted data in operator-managed backups follows the operator's retention policy.

## Verification

    npm test
    npm run lint
    npm run build

For the integration checks, run a configured local instance on a disposable database. Tests register temporary accounts and exercise draft creation, updates, authorization, PDF downloads and deletion:

    TEST_ORIGIN=http://localhost:3000 node tests/api.mjs
    TEST_BASE_URL=http://localhost:3000 node tests/browser.mjs

The conflict recovery browser regression uses synthetic API responses and does not write to the database. With the development server running and the same local AUTH_SECRET loaded:

    node --env-file=.env tests/conflicts.mjs

The visual regression checks cover light appearance with either system theme, desktop/mobile layouts, starter prompts and guide checklists:

    node --env-file=.env tests/design.mjs

## Deployment

Use a Node.js host that can launch Chromium and reach PostgreSQL. Run npm ci, prisma generate, prisma migrate deploy and npm run build, then npm start. Supply production DATABASE_URL, AUTH_SECRET and APP_ORIGIN through the host's secret manager. Install Playwright's Chromium under the runtime account or configure CHROMIUM_PATH. Enable the Chromium OS sandbox with CHROMIUM_SANDBOX=true on compatible hosts. Size worker memory for concurrent PDF requests.

Before handling real complaints, configure HTTPS, database TLS, storage and backup encryption, a backup deletion schedule, and least-privilege database access. Keep request bodies and cookies out of infrastructure logs. Test access controls, PDF rendering and restores after deployment. Review official reporting links periodically and arrange a security and privacy review. The software does not connect to law-enforcement systems.

## Roles and the awareness library

Visitors can search 17 safety guides and select English, Hindi, Hinglish, Punjabi, Bengali or Tamil in the Cyber Awareness library. Registered members can prepare and manage their own complaints. Editors have the same private workspace plus a Guide editor link to publish or remove a language-specific public note on each guide. Their role grants no access to other accounts’ complaints. The main guide text is maintained in src/config/awareness.js.

After migrating, all existing and new accounts are members. A database operator can assign or revoke publishing permissions for an existing, verified account from the project directory:

    npm run role -- registered-email@example.com EDITOR
    npm run role -- registered-email@example.com MEMBER

Refresh the website after changing a role. The editor API checks the current database role on every request. Publishing uses version checks to prevent concurrent edits from overwriting each other.
