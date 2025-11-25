# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Niteshift Sandbox Status

**This repository is running in a Niteshift sandbox with the following already configured:**

✅ **Dev server is ALREADY RUNNING** on http://localhost:3001 with hot reload enabled
✅ Database is set up and migrated (PostgreSQL)
✅ All dependencies are installed (pnpm)
✅ Environment variables are configured (.env file exists)
✅ Tracker script and geo database are built

**Default credentials:**
- Username: `admin`
- Password: `umami`

**You can start making changes immediately** - all changes will hot reload automatically!

### TL;DR - Start Prototyping Now

```typescript
// 1. Access the running app
// http://localhost:3001 (login: admin/umami)

// 2. Make a quick UI change - edit any file in src/
import { Button } from '@umami/react-zen';  // Use component library
import { useApi } from '@/components/hooks';  // Fetch data with React Query

// 3. Save file - see changes instantly in browser!
```

**Most common tasks:**
- **New page**: Create `src/app/(main)/[feature]/page.tsx`
- **New component**: Add to `src/components/common/`
- **Fetch data**: Use `useApi()` hook or pre-built query hooks from `src/components/hooks/queries/`
- **Styles**: Use `@umami/react-zen` components (minimal custom CSS needed)

## Overview

Umami is a privacy-focused web analytics platform built with Next.js 15, TypeScript, and PostgreSQL. It serves as an alternative to Google Analytics with a focus on simplicity and privacy.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (ES2022 target)
- **Database**: PostgreSQL with Prisma ORM (supports optional ClickHouse for analytics)
- **Package Manager**: pnpm
- **UI Components**: React 19 with `@umami/react-zen` component library
- **Data Fetching**: `@tanstack/react-query` (React Query)
- **State Management**: Zustand stores
- **Styling**: Minimal custom CSS (CSS Modules with PostCSS), primarily using component library
- **Internationalization**: `react-intl` with custom `useMessages` hook
- **Charts**: Chart.js with react-spring animations
- **Build Tools**: Rollup (for tracker), Next.js with Turbo
- **Testing**: Jest with ts-jest

## Useful Commands (Niteshift Sandbox)

**Note:** The dev server is already running - you don't need to start it!

### Testing
```bash
pnpm test                       # Run Jest tests
```

### Code Quality
```bash
pnpm lint                       # Run ESLint (optional - runs automatically on commit)
```

### Database (if schema changes needed)
```bash
pnpm build-db-client            # Regenerate Prisma client after schema changes
pnpm update-db                  # Apply new migrations
```

### If You Need to Rebuild Assets
```bash
pnpm build-tracker              # Rebuild tracking script (rarely needed)
pnpm build-geo                  # Rebuild geo database (rarely needed)
```

## Rapid UI Prototyping Guide

### Quick Start for UI Changes

**The dev server is already running on http://localhost:3001 with hot reload!**

1. **Make your changes** - Edit any file in `src/`

2. **View instantly** - Changes appear in browser automatically (no manual refresh needed)

3. **Component library**: Use `@umami/react-zen` for all UI primitives:
   ```typescript
   import { Button, Form, TextField, Modal, Row, Column } from '@umami/react-zen';
   ```

4. **Import path alias**: Always use `@/` for imports:
   ```typescript
   import { useApi } from '@/components/hooks';
   import { formatDate } from '@/lib/date';
   ```

### UI Component Architecture

#### Component Library (`@umami/react-zen`)
The codebase uses a custom component library for UI primitives. Common components include:
- **Layout**: `Row`, `Column`, `Container`, `Grid`
- **Forms**: `Form`, `TextField`, `TextArea`, `Select`, `Checkbox`, `Toggle`, `SearchField`
- **Buttons**: `Button`, `ActionButton`, `IconButton`
- **Display**: `Modal`, `Dropdown`, `Menu`, `Tabs`, `Banner`, `Tooltip`
- **Data**: `Table`, `List`, `Empty`

**Example component usage**:
```typescript
import { Button, Form, TextField } from '@umami/react-zen';

export function MyForm() {
  return (
    <Form>
      <TextField name="email" placeholder="Email" />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

#### Custom Components (`@/components/common/`)
Pages typically use a **mix** of `@umami/react-zen` components and custom components from `@/components/common/`. Common custom components include:

- **Layout**: `PageBody`, `PageHeader`, `Panel`, `SectionHeader`
- **Data Display**: `DataGrid`, `Empty`, `EmptyPlaceholder`, `LoadingPanel`
- **Forms**: `ActionForm`, `ConfirmationForm`, `TypeConfirmationForm`
- **UI Elements**: `Avatar`, `Favicon`, `FilterLink`, `LinkButton`, `Pager`
- **Utilities**: `DateDisplay`, `DateDistance`, `ErrorMessage`, `ExternalLink`

**Example**: Most pages combine both:
```typescript
import { Column } from '@umami/react-zen';
import { PageBody, PageHeader, Panel } from '@/components/common';

export function MyPage() {
  return (
    <PageBody>
      <Column margin="2">
        <PageHeader title="My Page" />
        <Panel>
          {/* Content */}
        </Panel>
      </Column>
    </PageBody>
  );
}
```

#### Other Component Locations
- **`src/components/input/`**: Input/button components (DateFilter, DownloadButton, WebsiteSelect, etc.)
- **`src/components/charts/`**: Chart components (BarChart, LineChart, etc.)
- **`src/components/metrics/`**: Analytics displays (MetricCard, StatsTable, etc.)
- **`src/components/boards/`**: Dashboard board components

### Data Fetching Patterns

#### Pre-built Query Hooks (Recommended)
**Most common pattern**: Use existing query hooks from `src/components/hooks/queries/`. See `src/components/hooks/index.ts` for the full list of available hooks.

```typescript
import { useWebsitesQuery } from '@/components/hooks/queries/useWebsitesQuery';
import { useReportsQuery } from '@/components/hooks/queries/useReportsQuery';
import { useUsersQuery } from '@/components/hooks/queries/useUsersQuery';

// In component:
const { data: websites, isLoading } = useWebsitesQuery();
```

Available query hooks include: `useWebsitesQuery`, `useUsersQuery`, `useReportsQuery`, `useTeamsQuery`, `useLinksQuery`, `usePixelsQuery`, `useRealtimeQuery`, `useWebsiteMetricsQuery`, `useWebsiteEventsQuery`, `useSessionDataQuery`, and many more. Check `src/components/hooks/queries/` for the complete list.

#### Using the `useApi` Hook Directly
For custom API calls or when a pre-built hook doesn't exist, use `useApi()`:

```typescript
import { useApi } from '@/components/hooks';
import { useQuery, useMutation } from '@tanstack/react-query';

export function MyComponent() {
  const { get, post } = useApi();

  // Option 1: Use with React Query hooks directly
  const { data, isLoading, error } = useQuery({
    queryKey: ['custom-data'],
    queryFn: () => get('/custom-endpoint'),
  });

  // Option 2: Direct API call (for mutations, form submissions, etc.)
  const handleSubmit = async (values) => {
    await post('/api/resource', values);
  };

  return <div>{data?.name}</div>;
}
```

**Note**: Most query hooks internally use `useApi()` with `usePagedQuery()` for pagination support. Prefer pre-built hooks when available.

### State Management

#### Zustand Stores
Global state is managed with Zustand stores in `src/store/`:

```typescript
import { useApp } from '@/store/app';
import { setLocale, setTimezone, setUser } from '@/store/app';

// In component - read state
const user = useApp(state => state.user);
const locale = useApp(state => state.locale);

// Update state
setUser(userData);
setLocale('en-US');
```

Available stores:
- **`app.ts`**: Global app state (user, locale, theme, timezone, dateRange)
- **`dashboard.ts`**: Dashboard state
- **`websites.ts`**: Websites state
- **`cache.ts`**: Cache management
- **`version.ts`**: Version checking

### Custom Hooks

Essential hooks in `src/components/hooks/`:

#### Data Hooks
- **`useApi()`**: API wrapper with React Query integration
- **`useConfig()`**: Get app configuration
- **`useDateRange()`**: Date range management
- **`useFilters()`**: Filter state management
- **`usePagedQuery()`**: Pagination helper

#### UI Hooks
- **`useMessages()`**: Internationalization (i18n) messages and formatting
- **`useLocale()`**: Current locale
- **`useFormat()`**: Number, date, and value formatting
- **`useMobile()`**: Mobile device detection
- **`useNavigation()`**: Next.js navigation helpers (see below for detailed usage)
- **`useEscapeKey()`**: ESC key handler
- **`useDocumentClick()`**: Click outside handler

##### `useNavigation()` Hook Details

The `useNavigation()` hook is essential for handling URL query parameters and navigation in the app:

```typescript
import { useNavigation } from '@/components/hooks';

export function MyComponent() {
  const { router, pathname, query, updateParams, replaceParams } = useNavigation();

  // updateParams() - Merges new params with existing ones, returns URL
  const newUrl = updateParams({ country: 'eq.US' }); // Keeps other filters

  // IMPORTANT: To actually navigate, use router.replace() with the URL:
  const handleFilterClick = (countryCode) => {
    router.replace(updateParams({ country: `eq.${countryCode}` }));
  };

  // replaceParams() - Replaces all params, returns URL
  const resetUrl = replaceParams({ page: 1 }); // Only page param

  // Access current query params
  console.log(query); // { country: 'eq.US', browser: 'eq.Chrome' }
}
```

**Key points:**
- `updateParams()` returns a URL string - it doesn't navigate automatically
- Always call `router.replace()` with the URL to actually navigate
- Use `router.replace()` instead of `router.push()` to replace the current history entry
- `updateParams()` preserves existing filters, `replaceParams()` clears them

#### Context Hooks
These hooks provide access to React Context values for specific entities:
- **`useUser()`**: Access current user context (from `UserProvider`)
- **`useWebsite()`**: Access current website context (from `WebsiteProvider`)
- **`useTeam()`**: Access current team context (from `TeamProvider`)
- **`useLink()`**: Access current link context (from `LinkProvider`)
- **`usePixel()`**: Access current pixel context (from `PixelProvider`)

**Usage**: These hooks are typically used within components that are wrapped by their respective providers. For example:
```typescript
import { useWebsite } from '@/components/hooks';

export function MyComponent() {
  const website = useWebsite(); // Returns website data from WebsiteProvider
  return <div>{website?.name}</div>;
}
```

#### Example Usage:
```typescript
import { useMessages, useFormat, useMobile } from '@/components/hooks';

export function MyComponent() {
  const { formatMessage, labels } = useMessages();
  const { formatValue } = useFormat();
  const isMobile = useMobile();

  return (
    <div>
      {formatMessage(labels.welcome)}
      {formatValue(1000, 'number')}
    </div>
  );
}
```

### Internationalization (i18n)

All user-facing text should use `useMessages`:

```typescript
import { useMessages } from '@/components/hooks';

export function MyComponent() {
  const { formatMessage, labels } = useMessages();

  return (
    <div>
      <h1>{formatMessage(labels.dashboard)}</h1>
      <p>{formatMessage(labels.description)}</p>
    </div>
  );
}
```

Messages are defined in `src/components/messages.ts` and compiled to JSON files in `public/intl/messages/`.

### Styling

#### Approach
- **Minimal custom CSS**: The codebase relies heavily on `@umami/react-zen` components for styling
- **CSS Modules**: Use when custom styles are needed (`.module.css` files)
- **Global styles**: `src/styles/global.css` and `src/styles/variables.css`
- **CSS Variables**: Primary color customization via `--primary-color`

#### Adding Custom Styles
Only create CSS modules when absolutely necessary:

```typescript
// MyComponent.module.css
import styles from './MyComponent.module.css';

export function MyComponent() {
  return <div className={styles.container}>Content</div>;
}
```

### Common UI Patterns

#### DataGrid Pattern
For lists with search, pagination, and actions:

```typescript
import { DataGrid } from '@/components/common/DataGrid';
import { useWebsitesQuery } from '@/components/hooks/queries/useWebsitesQuery';

export function WebsiteList() {
  const query = useWebsitesQuery();

  return (
    <DataGrid
      query={query}
      allowSearch
      allowPaging
      renderActions={() => <Button>Add Website</Button>}
    >
      {(row) => <div>{row.name}</div>}
    </DataGrid>
  );
}
```

#### Form Pattern
Standard form with validation:

```typescript
import { Form, TextField, Button } from '@umami/react-zen';
import { useApi } from '@/components/hooks';

export function MyForm() {
  const { post } = useApi();

  const handleSubmit = async (values) => {
    await post('/api/resource', values);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TextField name="name" label="Name" required />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

#### Modal Pattern
```typescript
import { Modal, Button } from '@umami/react-zen';
import { useState } from 'react';

export function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Open</Button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div>Modal content</div>
        </Modal>
      )}
    </>
  );
}
```

### Page Structure

Pages in `src/app/(main)/` follow this pattern:

```typescript
'use client';  // Required for interactive components

import { useMessages } from '@/components/hooks';
import { Button } from '@umami/react-zen';

export default function MyPage() {
  const { formatMessage, labels } = useMessages();

  return (
    <div>
      <h1>{formatMessage(labels.title)}</h1>
      {/* Page content */}
    </div>
  );
}
```

**To view your new page:** Navigate to http://localhost:3001/your-route (server is already running!)

### Tips for Rapid Prototyping in Niteshift

1. **Zero setup needed**: The dev server is running, database is ready, just start coding!
2. **Instant feedback**: Hot reload is active - save a file and see changes in <1 second
3. **Leverage existing components**: Check `src/components/common/` and `src/components/input/` before creating new components
4. **Use query hooks**: Don't write custom API calls if a query hook exists in `src/components/hooks/queries/`
5. **Follow established patterns**: Look at similar pages/components for consistent patterns
6. **Internationalization**: Always use `useMessages()` for text, never hardcode strings
7. **TypeScript**: Leverage type inference - the codebase has strong typing
8. **Component library first**: Always check if `@umami/react-zen` has what you need before writing custom UI

## Niteshift Dials SDK

**New capability for design prototyping!** The Dials SDK allows you to expose design parameters as runtime-adjustable "dials" that users can tweak via an overlay UI. This gives designers and PMs fine-grained control without requiring code changes.

### Setup and Installation

The Dials SDK lives in `packages/dials/` and is automatically built when you run `pnpm install` via the repo’s postinstall script. **Do not edit the SDK source or build pipeline unless the user explicitly instructs you to do so.** Your default interaction with dials should be importing the provided hooks inside app components.

**Key files:**
- `packages/dials/src/` – SDK source **(hands-off unless asked)**
- `packages/dials/dist/` – Built package (gitignored, auto-generated)
- `src/config/niteshift-manifest.ts` – Umami’s design system manifest for reference in app code

If—*and only if*—a user asks you to modify the SDK internals, rebuild with:
```bash
pnpm --filter @niteshift/dials build
```

### When to Use Dials

Only add dials when the user explicitly says they want “dials” (or otherwise asks for adjustable controls). When they do, prioritize these scenarios:
- Subjective color/spacing/typography tweaks tied to design-system tokens
- Layout variants or experimental sections the user wants to tune live
- Feature toggles the user specifically calls out for dial-based control

**Key principle**: Follow the user's direction—never invent dials on your own; create them only when requested, and let the user decide which values need adjustment.

### Critical: Preserving Original Appearance

**⚠️ EXTREMELY IMPORTANT: When adding dials to existing code, the defaults MUST ALWAYS preserve the exact original appearance.**

Before adding dials to any component:

1. **Document the original values** - Record what props/styles existed before dials
2. **Match defaults exactly** - Dial defaults must produce identical output to pre-dial code
3. **Use empty string for "no prop"** - If original had no prop, use `default: ''` not `'inherit'` or a value
4. **Conditionally spread props** - Only pass props when they have truthy values

**Example - WRONG approach:**
```typescript
// Original code (before dials):
<Text weight="bold">{label}</Text>  // No size prop!

// ❌ WRONG - adds size prop that wasn't there:
const labelSize = useDynamicVariant('label-size', {
  default: '1',  // ❌ Original had NO size, this changes appearance!
  options: ['0', '1', '2', '3'] as const,
});
<Text size={labelSize} weight="bold">{label}</Text>
```

**Example - CORRECT approach:**
```typescript
// Original code (before dials):
<Text weight="bold">{label}</Text>  // No size prop!

// ✅ CORRECT - empty string means "no change":
const labelSize = useDynamicVariant('label-size', {
  default: '',  // ✅ Empty string = no size prop = matches original
  options: ['', '0', '1', '2', '3'] as const,  // First option is "default/none"
});

// ✅ CORRECT - only pass size if truthy:
<Text
  {...(labelSize && { size: labelSize })}
  weight="bold"
>
  {label}
</Text>
```

**Why this matters:**
- Users expect dials at default = original appearance
- Dials should enable exploration, not force changes
- Breaking the original look confuses users and defeats the purpose

**Testing your defaults:**
1. Add dials with defaults
2. View the page - should look IDENTICAL to before dials
3. Reset All in dials overlay - should look IDENTICAL to before dials
4. Only when adjusting dials should appearance change

### Design System Manifest

The design system manifest is defined in `src/config/niteshift-manifest.ts` as a TypeScript module:
- Colors (primary, base, accent, semantic)
- Spacing scale (4px to 128px)
- Typography (fonts, sizes, weights)
- Border radius, shadows

**Benefits of TypeScript manifest:**
- Type-safe with full IDE autocomplete
- Bundled with app (not publicly accessible)
- No runtime HTTP fetch (faster)
- Hot reload compatible

Reference these tokens in dial configs to provide users with design system-aligned options.

### Manifest-Powered Defaults

**Smart defaults from the design system!** When you omit the `options` parameter in color and spacing dials, the SDK automatically pulls values from the design manifest. This reduces boilerplate and ensures consistency with your design system.

**Color dials (design system defaults)**
```typescript
import { useDynamicColor } from '@niteshift/dials';

const badgeColor = useDynamicColor('hero-badge-color', {
  label: 'Hero Badge Color',
  group: 'Hero Section',
  default: 'var(--primary-color)',
  manifestCategory: 'primary', // pulls tokens from designManifest.colors.primary
  allowCustom: true,
});

return <Badge style={{ backgroundColor: badgeColor }}>Top Performer</Badge>;
```

**Spacing dials (design system defaults)**
```typescript
import { useDynamicSpacing } from '@niteshift/dials';

const cardPadding = useDynamicSpacing('hero-card-padding', {
  label: 'Hero Card Padding',
  group: 'Hero Section',
  default: 'var(--spacing-5)',
  manifestCategory: 'spacing',
});

return <Card style={{ padding: cardPadding }}>{children}</Card>;
```

// Manifest defaults (automatic - uses full spacing scale):
const margin2 = useDynamicSpacing('margin-2', {
  label: 'Margin',
  default: '24px',
  // options omitted - uses designManifest.spacing.values (4px to 128px)
});
```

**When to use manifest defaults:**
- ✅ You want design system consistency
- ✅ You're prototyping and want quick setup
- ✅ The default color category (accent) or spacing scale fits your needs
- ❌ You need a specific subset of values
- ❌ You're using custom values outside the design system

### Available Dial Types

#### Color Dials
For any color value (backgrounds, text, borders, etc.):
```typescript
import { useDynamicColor } from '@niteshift/dials';

const bgColor = useDynamicColor('hero-background', {
  label: 'Hero Background Color',
  description: 'Background color for the hero section',
  group: 'Hero Section',
  default: '#1a1a1a',
  options: ['#1a1a1a', '#2d2d2d', '#404040', '#525252'], // From design system
  allowCustom: true  // Allows custom hex input
});

<div style={{ backgroundColor: bgColor }}>...</div>
```

#### Spacing Dials
For padding, margin, gap, dimensions:
```typescript
import { useDynamicSpacing } from '@niteshift/dials';

const padding = useDynamicSpacing('card-padding', {
  label: 'Card Padding',
  group: 'Card Component',
  default: '1.5rem',
  options: ['0.5rem', '1rem', '1.5rem', '2rem', '3rem'],
  allowCustom: true
});

<div style={{ padding }}>...</div>
```

#### Variant Dials
For discrete choices (layouts, styles, chart types):
```typescript
import { useDynamicVariant } from '@niteshift/dials';

const layout = useDynamicVariant('dashboard-layout', {
  label: 'Dashboard Layout',
  group: 'Dashboard',
  default: 'grid',
  options: ['grid', 'list', 'compact'] as const
});

{layout === 'grid' && <GridView />}
{layout === 'list' && <ListView />}
{layout === 'compact' && <CompactView />}
```

#### Boolean Dials
For toggles, feature flags, show/hide:
```typescript
import { useDynamicBoolean } from '@niteshift/dials';

const showDelta = useDynamicBoolean('show-metrics-delta', {
  label: 'Show Change Indicators',
  description: 'Display +/- changes in metrics',
  default: true,
  trueLabel: 'Visible',
  falseLabel: 'Hidden',
  group: 'Metrics Bar'
});

{showDelta && <DeltaIndicator value={change} />}
```

#### Number Dials
For numeric values with constraints:
```typescript
import { useDynamicNumber } from '@niteshift/dials';

const chartHeight = useDynamicNumber('chart-height', {
  label: 'Chart Height',
  default: 400,
  min: 200,
  max: 800,
  step: 50,
  unit: 'px',
  options: [300, 400, 500, 600], // Preset options
  group: 'Chart'
});

<Chart height={chartHeight} />
```

### Advanced Use Cases

**Layout Controls:**
```typescript
const columns = useDynamicVariant('metrics-columns', {
  label: 'Metrics Layout',
  default: '4',
  options: ['2', '3', '4', '6'] as const,
  group: 'Dashboard'
});

<Grid columns={Number(columns)}>
  {metrics.map(m => <MetricCard key={m.id} {...m} />)}
</Grid>
```

**Chart Type Selection:**
```typescript
const chartType = useDynamicVariant('analytics-chart', {
  label: 'Visualization Type',
  default: 'line',
  options: ['line', 'bar', 'area'] as const,
  group: 'Analytics'
});

{chartType === 'line' && <LineChart data={data} />}
{chartType === 'bar' && <BarChart data={data} />}
{chartType === 'area' && <AreaChart data={data} />}
```

**Feature Flags:**
```typescript
const showSparklines = useDynamicBoolean('show-sparklines', {
  label: 'Show Sparklines',
  default: false,
  group: 'Metrics Display'
});

<MetricsBar data={metrics} showSparklines={showSparklines} />
```

**Icon Selection:**
```typescript
const emptyIcon = useDynamicVariant('empty-state-icon', {
  label: 'Empty State Icon',
  default: 'inbox',
  options: ['inbox', 'folder', 'archive', 'alert'] as const,
  group: 'Empty States'
});

const icons = { inbox: <Inbox />, folder: <Folder />, archive: <Archive />, alert: <Alert /> };
<EmptyState icon={icons[emptyIcon]} />
```

### Best Practices

1. **Use semantic IDs**: e.g., `'hero-background'` not `'color-1'`
2. **Provide design system options first**: Always include tokens from `.niteshift-manifest`
3. **Group related dials**: Use the `group` property to organize by component/section
4. **Add helpful labels**: Make labels clear for non-technical users
5. **Set sensible defaults**: Choose the best option; users can refine later
6. **Reference manifest colors**: Pull from design system categories:
   ```typescript
   // Colors from .niteshift-manifest
   options: ['#147af3', '#2680eb', '#0090ff', '#3e63dd'] // Primary colors
   ```

### Communicating with Users

After creating dials, tell the user:
> "I've made [X, Y, Z] adjustable via design dials. Press **Ctrl+D** on macOS (use the Control key, not Command) or **Ctrl+Alt+D** on Windows/Linux to open the panel and fine-tune these values. You can select from design system options or enter custom values."

### Accessing the Overlay

- **Keyboard shortcut**: `Ctrl+D` on macOS, `Ctrl+Alt+D` on Windows/Linux toggles the dials overlay
- **Location**: Bottom-left floating panel
- **Persistence**: Visibility state and dial values persist across reloads (localStorage)
- **Features**:
  - Search/filter dials
  - Grouped by component/section
  - Reset individual dials or all at once
  - Keyboard shortcut hint shown in overlay header

### Examples from Umami

**WebsitePage with dynamic chart:**
```typescript
const chartHeight = useDynamicNumber('website-chart-height', {
  label: 'Chart Height',
  default: 520,
  options: [400, 520, 640, 760],
  allowCustom: true,
  unit: 'px',
  group: 'Website Analytics'
});

<Panel minHeight={`${chartHeight}px`}>
  <WebsiteChart websiteId={websiteId} />
</Panel>
```

**Dashboard with layout options:**
```typescript
const layout = useDynamicVariant('dashboard-layout', {
  label: 'Board Layout',
  default: 'grid',
  options: ['grid', 'list', 'masonry'] as const,
  group: 'Dashboard'
});

{layout === 'grid' && <GridLayout boards={boards} />}
{layout === 'list' && <ListView boards={boards} />}
{layout === 'masonry' && <MasonryLayout boards={boards} />}
```

### Implementation Notes

- Dials are already integrated into the app via `DialsProvider` in `src/app/Providers.tsx`
- The overlay (`DialsOverlay`) is automatically rendered
- Values are persisted to localStorage and survive hot reloads
- No additional setup required - just import and use the hooks!

## Project Architecture

### Directory Structure

- **`src/app/`**: Next.js App Router pages and API routes
  - `src/app/(main)/`: Main application pages (authenticated area)
  - `src/app/(collect)/`: Analytics data collection endpoints
  - `src/app/api/`: REST API routes (admin, auth, teams, websites, reports, etc.)
  - `src/app/login/`, `src/app/logout/`, `src/app/sso/`: Authentication pages
  - `src/app/share/`: Public sharing pages

- **`src/lib/`**: Core utility functions and shared logic
  - Database utilities (`db.ts`)
  - Authentication (`auth.ts`)
  - Request/response helpers (`request.ts`, `response.ts`)
  - Date utilities (`date.ts`)
  - Constants (`constants.ts`)
  - IP detection (`ip.ts`)
  - Device detection (`detect.ts`)
  - Formatting utilities (`format.ts`)

- **`src/queries/`**: Database query layer
  - `src/queries/prisma/`: Prisma queries for PostgreSQL
  - `src/queries/sql/`: Raw SQL queries (organized by feature: events, pageviews, sessions, reports)

- **`src/components/`**: React components
  - `src/components/common/`: Shared UI components
  - `src/components/input/`: Form input components
  - `src/components/charts/`: Chart components
  - `src/components/metrics/`: Analytics metric displays
  - `src/components/boards/`: Dashboard boards
  - `src/components/hooks/`: Custom React hooks
  - `src/components/svg/`: SVG icon components (generated by `pnpm build-icons`)

- **`src/tracker/`**: Client-side tracking script source code

- **`src/permissions/`**: Authorization and permission checks

- **`src/store/`**: Zustand state management stores

- **`src/generated/prisma/`**: Auto-generated Prisma client (DO NOT edit manually)

- **`prisma/schema.prisma`**: Prisma schema definition

- **`scripts/`**: Build and utility scripts
  - `check-db.js`: Database connection verification
  - `build-geo.js`: GeoIP database setup

### API Architecture

API routes follow Next.js App Router conventions with `route.ts` files. Standard pattern:

1. Request parsing with `parseRequest()` from `@/lib/request`
2. Authentication via `checkAuth()` (can be skipped with `skipAuth: true`)
3. Schema validation using Zod
4. Database queries via Prisma or raw SQL
5. Response formatting via helpers from `@/lib/response`

Example:
```typescript
export async function GET(request: Request) {
  const { query, auth, error } = await parseRequest(request, schema);
  if (error) return error();
  // ... business logic
  return json(data);
}
```

### Database Query Pattern

The codebase supports multiple database backends through `runQuery()` in `src/lib/db.ts`:

- **Prisma queries** (in `src/queries/prisma/`): Used with PostgreSQL
- **Raw SQL queries** (in `src/queries/sql/`): Direct SQL for complex analytics
- **ClickHouse queries**: Optional high-performance analytics backend

Use `runQuery()` with object containing query implementations for each backend:
```typescript
return runQuery({
  [PRISMA]: () => prismaQuery(),
  [CLICKHOUSE]: () => clickhouseQuery(),
});
```

### Environment Variables

**In Niteshift:** The `.env` file is already configured with `DATABASE_URL` and any required variables.

See `next.config.ts` for full list of available environment variables.

### Key Data Models

Core entities in `prisma/schema.prisma`:
- **User**: User accounts with authentication
- **Team**: Organizations/teams
- **Website**: Tracked websites
- **Session**: User sessions with device/location data
- **WebsiteEvent**: Individual events/pageviews
- **Report**: Custom analytics reports
- **Link**: Short links (link tracking feature)
- **Pixel**: Tracking pixels

## Important Notes for Niteshift Development

### TypeScript Configuration
- Module resolution: `bundler`
- Path alias: `@/*` maps to `src/*`
- Strict mode enabled (except `strictNullChecks`)
- Target: ES2022
- Types are checked automatically - errors show in editor

### Testing
- Unit tests in `src/lib/__tests__/` using Jest
- Test pattern: `*.test.ts` or `*.spec.ts`
- Run with `pnpm test`

### Code Style
- Prettier and ESLint run automatically via pre-commit hooks
- Manually run with `pnpm lint` if needed
- Stylelint for CSS validation

### Database & Prisma
- Prisma client is in `src/generated/prisma/` (not default location)
- Never edit generated files manually
- If you modify `prisma/schema.prisma`, regenerate with: `pnpm build-db-client`
- Database is already migrated and ready to use

## Quick Reference for UI Development

### Most Common Imports
```typescript
// UI Components (from component library)
import { Button, Form, TextField, Modal, Row, Column, Grid } from '@umami/react-zen';

// Custom Components (from common)
import { PageBody, PageHeader, Panel, DataGrid, Empty } from '@/components/common';

// Hooks
import { useApi, useMessages, useFormat, useWebsite, useUser } from '@/components/hooks';

// State
import { useApp } from '@/store/app';
import { setUser, setLocale, setTimezone } from '@/store/app';
```

### Most Common Patterns
- **New page**: Create in `src/app/(main)/[feature]/page.tsx`
- **New API route**: Create in `src/app/api/[feature]/route.ts`
- **New component**: Add to `src/components/common/` or `src/components/input/`
- **New hook**: Add to `src/components/hooks/`
- **New query hook**: Add to `src/components/hooks/queries/`
- **Global state**: Add to or use existing `src/store/*.ts`

### Development Workflow (Niteshift Sandbox)
1. **Access app** - http://localhost:3001 (already running!)
2. **Login** - Use admin/umami credentials
3. **Make changes** - Edit files in `src/`
4. **See results** - Hot reload happens automatically, changes appear instantly
5. **Check types** - TypeScript errors show in editor automatically
6. **Test** - `pnpm test` (optional)
7. **Lint** - `pnpm lint` (optional, runs automatically on commit)
