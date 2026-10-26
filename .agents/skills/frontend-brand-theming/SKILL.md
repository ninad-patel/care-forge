---
name: frontend-brand-theming
description: Enforces dynamic brand color theming via CSS variables, clean component styling (CompName.styles.ts / DESIGN.md tokens), readable 1000-word blog typography, and pure utility testing without Tailwind.
---

# Frontend Brand Theming Standards

## Purpose
This skill ensures the React frontend serves as a production-grade multi-tenant platform, dynamically applying the user's specific brand aesthetics (logo and hex color) across all generated pages with clean, consistent layout and high readability.

## Key Rules

### 1. No Tailwind Dependency — Pure CSS & `CompName.styles.ts`
- Follow the design principles defined in `frontend/DESIGN.md`:
  - Neutral canvas (`#fafafa`), elevated cards (`#ffffff`), 1px hairline borders (`#ebebeb`), and crisp dark typography (`#171717`).
  - Keep styling modular using `CompName.styles.ts` or scoped CSS objects/classes instead of Tailwind utility classes.

### 2. Dynamic CSS Variable Theming (MANDATORY)
- **Never hardcode brand colors** into component styles.
- Inject the user-provided brand hex color dynamically as a CSS custom property on the page or article container:
  ```tsx
  <div className="brand-portal-root" style={{ '--brand-color': brand.brand_color } as React.CSSProperties}>
  ```
- Reference `var(--brand-color)` for:
  - Navbar top accents or brand banners.
  - Section headings (`h2`, `h3`) and link hover states.
  - Call-to-Action (CTA) buttons and border accents.
  - Reading progress bars and badge highlights.

### 3. Consistent Layout Across All 10 Blog Pages
- Every generated blog post must share a consistent header/footer:
  - **Header**: Prominently display the uploaded company logo (constrained with `max-height: 48px; object-fit: contain`) alongside the company name and navigation back to the company hub or generator.
  - **Brand Banner / Bar**: A subtle accent line or banner styled with `var(--brand-color)`.
  - **Footer**: Company attribution and Call-to-Action styled with the brand palette.

### 4. Typography & Markdown Rendering for 1,000-Word Posts
- A 1,000-word article must not look like an unformatted wall of text:
  - Render markdown with `react-markdown`.
  - Wrap in a dedicated readable container: `max-width: 720px; margin: 0 auto; line-height: 1.75; font-size: 1.05rem; color: #374151;`.
  - Headings (`h1`, `h2`, `h3`): Clean margins, font weights (`600`), and subtle brand accent borders.
  - Lists and quotes: Generous padding, readable bullet points, and italicized callouts.

### 5. Live UX Badges
- At the top of each blog post, compute and display:
  - **Word Count**: Actual word count badge (e.g. `980 words`).
  - **Reading Time**: Estimated reading time based on 200 words/min (e.g. `5 min read`).

### 6. Multiple Use Cases / History View
- The home page must feature:
  - A generator form to input new Company Name, Logo, Brand Color, and 10 Topics.
  - A **"Previous Campaigns / Workspaces"** section listing previously generated companies with their logos and color badges, allowing users to switch between different company workspaces and verify multi-tenant persistence.

### 7. Pure Utility Functions & Unit Testing
- **Decoupled Business Logic**: Keep calculations and string manipulations in pure, easily testable functions (e.g. `src/utils/formatters.ts`, `src/utils/contrast.ts`):
  - `calculateWordCount(markdown: string): number`
  - `calculateReadingTime(wordCount: number): number`
  - `generateSlug(topic: string): string`
  - `isValidHexColor(hex: string): boolean`
- **Unit Test Coverage**: Accompany all utility functions and boundary validators with unit tests to guarantee mathematical accuracy and prevent regression.
