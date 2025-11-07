# First8Marketing Custom Components

This directory contains custom UI components for First8Marketing's Umami Analytics platform.

## Directory Structure

```
src/components/first8marketing/
├── woocommerce/              # WooCommerce analytics components
│   ├── WooCommerceRevenueDashboard.tsx
│   ├── ProductPerformanceTable.tsx
│   ├── CategoryConversionFunnel.tsx
│   └── CheckoutAbandonmentTracker.tsx
├── engagement/               # Engagement metrics components
│   └── EngagementMetricsDashboard.tsx
├── recommendations/          # Recommendation engine components
│   ├── UserProfileDashboard.tsx
│   ├── RecommendationPerformanceMetrics.tsx
│   └── MLModelRegistryViewer.tsx
├── index.ts                  # Component exports
└── README.md                 # This file
```

## Components

### WooCommerce Analytics

#### 1. WooCommerceRevenueDashboard
Displays WooCommerce revenue analytics with charts and top products/categories.

**Usage:**
```tsx
import { WooCommerceRevenueDashboard } from '@/components/first8marketing';

<WooCommerceRevenueDashboard
  websiteId="uuid"
  startDate={new Date('2024-01-01')}
  endDate={new Date('2024-12-31')}
  unit="day"
  timezone="utc"
/>
```

#### 2. ProductPerformanceTable
Shows product performance metrics including views, add-to-cart, purchases, and revenue.

#### 3. CategoryConversionFunnel
Displays 5-step conversion funnel from category view to purchase.

#### 4. CheckoutAbandonmentTracker
Tracks checkout abandonment with drop-off rates at each step.

### Engagement Metrics

#### 5. EngagementMetricsDashboard
Displays user engagement metrics including session duration, time on page, scroll depth, and bounce rate.

### Recommendation Engine

#### 6. UserProfileDashboard
Shows user profile analytics with lifecycle stages, funnel positions, and top users by revenue.

#### 7. RecommendationPerformanceMetrics
Displays recommendation performance by strategy, model version, and type with CTR and conversion rates.

#### 8. MLModelRegistryViewer
Shows ML model registry with performance metrics (precision, recall, NDCG) and deployment status.

## API Endpoints

All components use corresponding API endpoints:

- `/api/first8marketing/woocommerce/revenue`
- `/api/first8marketing/woocommerce/products`
- `/api/first8marketing/woocommerce/categories`
- `/api/first8marketing/woocommerce/checkout-abandonment`
- `/api/first8marketing/engagement/metrics`
- `/api/first8marketing/recommendations/user-profiles`
- `/api/first8marketing/recommendations/performance`
- `/api/first8marketing/recommendations/ml-models`

## Database Queries

Each API endpoint uses a corresponding SQL query function:

- `getWooCommerceRevenue()`
- `getProductPerformance()`
- `getCategoryFunnel()`
- `getCheckoutAbandonment()`
- `getEngagementMetrics()`
- `getUserProfiles()`
- `getRecommendationPerformance()`
- `getMLModels()`

## Architecture

All custom components follow Umami's patterns:
- Use `useApi` hook for data fetching
- Use `useFormat` hook for formatting
- Use `LoadingPanel` and `ErrorMessage` for states
- Use `MetricCard` and `MetricsTable` for display
- TypeScript with proper interfaces
- Merge-safe (isolated in `/first8marketing/` directory)

## Implementation Status

- ✅ Phase 3: Initial UI components (WooCommerce + Engagement)
- ✅ Phase 4: Additional WooCommerce components
- ✅ Phase 5: Recommendation Engine components

**Total**: 8 components, 8 API endpoints, 8 SQL queries

