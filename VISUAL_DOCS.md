# Visual Documentation - Dashboard UI

## Dashboard Layout

The Distributed Systems Observability Dashboard features a modern, responsive design with the following elements:

### Header Section
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Distributed Systems Observability Dashboard                  │
│                                     [Simulate Traffic (10 req)] │
└─────────────────────────────────────────────────────────────────┘
```
- **Title**: Large, prominent heading with search icon
- **Button**: Action button to manually simulate traffic
- **Background**: White with subtle shadow and rounded corners

### Service Cards Grid

The dashboard displays three service cards in a responsive grid layout:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 🟢 Service A     │  │ 🟡 Service B     │  │ 🔴 Service C     │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Avg Latency:     │  │ Avg Latency:     │  │ Avg Latency:     │
│ 425 ms          │  │ 685 ms (warn)    │  │ 892 ms (crit)    │
│                  │  │                  │  │                  │
│ Error Rate:      │  │ Error Rate:      │  │ Error Rate:      │
│ 8.5%            │  │ 12.3% (warn)     │  │ 24.7% (crit)     │
│                  │  │                  │  │                  │
│ Request Count:   │  │ Request Count:   │  │ Request Count:   │
│ 142             │  │ 127              │  │ 95               │
└──────────────────┘  └──────────────────┘  └──────────────────┘
  Normal State         Warning State         Critical State
```

### Service Card States

#### 🟢 Normal (Green)
- **Condition**: Latency < 600ms AND Error rate < 10%
- **Visual**: 
  - White background
  - Green pulsing status dot
  - Black text for metrics
  - Standard shadow

#### 🟡 Warning (Yellow/Orange)
- **Condition**: Latency >= 600ms OR Error rate >= 10%
- **Visual**:
  - Light yellow background (#fffbeb)
  - Orange border (2px solid)
  - Orange pulsing status dot
  - Warning metrics highlighted in orange

#### 🔴 Critical (Red)
- **Condition**: Latency >= 800ms OR Error rate >= 20%
- **Visual**:
  - Light red background (#fef2f2)
  - Red border (2px solid)
  - Red pulsing status dot
  - Critical metrics highlighted in red

### Footer Section
```
┌─────────────────────────────────────────────────────────────────┐
│     Auto-refreshing every 2 seconds | Last updated: 5:43:00 AM  │
└─────────────────────────────────────────────────────────────────┘
```
- Shows refresh interval
- Displays last update timestamp
- White background with subtle shadow

## Color Scheme

### Primary Colors
- **Background Gradient**: Purple gradient (#667eea → #764ba2)
- **Card Background**: White (#ffffff)
- **Primary Text**: Dark gray (#1f2937)
- **Secondary Text**: Medium gray (#6b7280)

### Status Colors
- **Success/Normal**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Critical/Error**: Red (#ef4444)
- **Primary Action**: Purple (#667eea)

### Shadows and Effects
- **Card Shadow**: `0 4px 16px rgba(0, 0, 0, 0.1)`
- **Hover Shadow**: `0 8px 24px rgba(0, 0, 0, 0.15)`
- **Button Shadow**: `0 4px 12px rgba(102, 126, 234, 0.4)`
- **Status Glow**: `0 0 12px rgba(color, 0.5)`

## Animations

### Pulsing Status Indicator
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```
- **Duration**: 2 seconds
- **Loop**: Infinite
- **Effect**: Creates a "breathing" effect on status dots

### Hover Effects
- **Cards**: Lift up 4px with enhanced shadow
- **Button**: Lift up 2px with glow effect
- **Transition**: Smooth 0.3s ease

## Responsive Design

The grid layout adapts to different screen sizes:
- **Large screens**: 3 columns (side by side)
- **Medium screens**: 2 columns
- **Small screens**: 1 column (stacked)

Minimum card width: 350px
Grid gap: 24px

## Typography

- **Main Heading**: 28px, Bold (700)
- **Card Titles**: 22px, Semi-bold (600)
- **Metric Labels**: 14px, Medium (500)
- **Metric Values**: 18px, Bold (700)
- **Footer Text**: 14px, Regular (400)

Font Family: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, etc.)

## Interaction Flow

1. **Application Launch**: Services start automatically, begin generating metrics
2. **Auto-Refresh**: Dashboard updates every 2 seconds
3. **Status Updates**: Cards change color/border based on thresholds
4. **Manual Traffic**: Click button to generate 10 instant requests
5. **Visual Feedback**: Button disabled during simulation with text change

## Metrics Display Logic

### Average Latency
- Calculated: `SUM(all latencies) / COUNT(requests)`
- Displayed: Rounded to nearest millisecond
- Warning: >= 600ms (yellow text)
- Critical: >= 800ms (red text)

### Error Rate
- Calculated: `(COUNT(errors) / COUNT(total)) × 100`
- Displayed: Percentage with 2 decimal places
- Warning: >= 10% (yellow text)
- Critical: >= 20% (red text)

### Request Count
- Calculated: `COUNT(all requests)`
- Displayed: Integer value
- No color coding

## Example States

### Startup (No Data)
```
Service A: 0 ms, 0%, 0 requests - 🟢
Service B: 0 ms, 0%, 0 requests - 🟢
Service C: 0 ms, 0%, 0 requests - 🟢
```

### Healthy System
```
Service A: 425 ms, 5.2%, 156 requests - 🟢
Service B: 487 ms, 8.1%, 142 requests - 🟢
Service C: 534 ms, 9.3%, 138 requests - 🟢
```

### Degraded System
```
Service A: 623 ms, 11.5%, 287 requests - 🟡
Service B: 756 ms, 14.2%, 265 requests - 🟡
Service C: 891 ms, 23.8%, 241 requests - 🔴
```

## Accessibility Features

- Semantic HTML structure
- Clear color contrast ratios
- Descriptive button text
- Status indicators supplement color with position
- Keyboard navigable (button can be tabbed to)
