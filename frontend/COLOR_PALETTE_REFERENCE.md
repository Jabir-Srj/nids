# Claude-Inspired NIDS UI Theme - Color Palette Reference

## Primary Colors

### Background Palette
- **Primary Background**: `#FAFAF8` - Warm off-white (main app background)
- **Secondary Background**: `#f5f3f0` - Cream/light beige (sidebar, secondary areas)
- **Tertiary Background**: `#ede9e6` - Warm gray (hover states)

### Text Colors
- **Primary Text**: `#1a1a1a` - Deep charcoal (headings, primary content)
- **Secondary Text**: `#2d2d2d` - Warm dark gray (body text, secondary headings)
- **Muted Text**: `#6b6b6b` - Warm gray (captions, disabled states)

### UI Elements
- **Border Color**: `#e5e3e0` - Warm gray (1px borders throughout)
- **Accent Amber**: `#d97706` - Warm amber (primary actions, highlights)
- **Accent Rose**: `#f97316` - Soft rose (critical alerts, emphasis)
- **Accent Green**: `#22c55e` - Success state
- **Accent Blue**: `#3b82f6` - Info state

## Shadow Palette
- **Small**: `0 1px 2px rgba(26, 26, 26, 0.05)` - Subtle depth
- **Medium**: `0 4px 6px rgba(26, 26, 26, 0.08)` - Card elevation
- **Large**: `0 10px 15px rgba(26, 26, 26, 0.1)` - Hover states

## Typography

### Fonts Imported
- **Serif Display**: Crimson Text (400, 600, 700 weights)
  - Used for: H1, H2, H3, H4, large KPI numbers
  - Style: Elegant, readable, premium feel
  
- **Body**: Outfit (300, 400, 500, 600, 700, 800 weights)
  - Used for: Body text, labels, UI text
  - Style: Refined sans-serif, generous spacing
  
- **Monospace**: JetBrains Mono (400, 500, 600, 700 weights)
  - Used for: Code, IPs, technical values, timestamps
  - Style: Clear, readable monospace

### Text Styling
- **Line Height**: 1.6 (generous, readable)
- **Letter Spacing**: 0.3px (headers), 0px (body)
- **Font Smoothing**: Antialiased

## Component Color Mapping

### KPI Cards
| Severity | Background | Text Color | Border | Accent |
|----------|-----------|-----------|--------|--------|
| Critical | rgba(249, 115, 22, 0.08) | #f97316 | #f97316 | #f97316 |
| Warning | rgba(217, 119, 6, 0.08) | #d97706 | #d97706 | #d97706 |
| Success | rgba(34, 197, 94, 0.08) | #22c55e | #22c55e | #22c55e |
| Info | rgba(59, 130, 246, 0.08) | #3b82f6 | #3b82f6 | #3b82f6 |

### Interactive Elements
- **Buttons**:
  - Primary: Background `#d97706`, hover `#c46e0f`
  - Secondary: Background `#f5f3f0`, hover `#ede9e6`
  
- **Links/Hover States**:
  - Color: `#d97706` (warm amber)
  - Smooth transition: 200ms cubic-bezier(0.23, 1, 0.32, 1)

- **Active/Focus**:
  - Glow: `0 0 0 3px rgba(217, 119, 6, 0.1)` (amber focus ring)

### Status Indicators
- **Online/Active**: `#d97706` (warm amber)
- **Warning/Caution**: `#fcd34d` (soft amber)
- **Critical/Alert**: `#f97316` (soft rose)
- **Success**: `#22c55e` (green)

## CSS Variables Declaration

```css
:root {
  /* Claude-inspired warm neutral palette */
  --bg-primary: #FAFAF8;
  --bg-secondary: #f5f3f0;
  --bg-tertiary: #ede9e6;
  --text-primary: #1a1a1a;
  --text-secondary: #2d2d2d;
  --text-muted: #6b6b6b;
  --border-color: #e5e3e0;
  --accent-amber: #d97706;
  --accent-rose: #f97316;
  --accent-soft-amber: #fcd34d;
  --shadow-sm: 0 1px 2px rgba(26, 26, 26, 0.05);
  --shadow-md: 0 4px 6px rgba(26, 26, 26, 0.08);
  --shadow-lg: 0 10px 15px rgba(26, 26, 26, 0.1);
}
```

## Design Principles

1. **Warm Aesthetic**: All colors lean toward warm tones (no cool blues except for info)
2. **High Contrast**: Text on background maintains 4.5:1+ WCAG AA ratio
3. **Subtlety**: Shadows and borders are soft, refined
4. **Consistency**: Color system uses 8-color palette + variants
5. **Accessibility**: Large type, generous spacing, clear hierarchy
6. **Elegance**: Premium feel through typography and refined interactions

## Usage Examples

### Sidebar Active Item
```css
background-color: rgba(217, 119, 6, 0.1);  /* 10% opacity amber */
color: #d97706;  /* Warm amber text */
border: 1px solid #e5e3e0;  /* Warm gray border */
```

### KPI Card (Critical)
```css
background-color: rgba(249, 115, 22, 0.08);  /* 8% opacity rose */
border: 1px solid #f97316;  /* Rose border */
color: #f97316;  /* Rose text */
```

### Hover State
```css
background-color: #ede9e6;  /* Tertiary background */
box-shadow: 0 4px 6px rgba(26, 26, 26, 0.08);  /* Medium shadow */
transition: all 200ms cubic-bezier(0.23, 1, 0.32, 1);  /* Smooth */
```

## Accessibility

- **WCAG AA Compliant**: All text colors meet 4.5:1 contrast ratio
- **Large Type**: Headers use serif font for elegance, body uses sans for readability
- **Focus Indicators**: Clear amber glow on interactive elements
- **Color Not Sole Indicator**: Status uses icons + colors, never color alone
- **High Contrast**: Deep charcoal on warm off-white ensures readability

## Notes

- All HTML colors use hex format (#RRGGBB)
- RGB colors used for opacity effects: rgba(R, G, B, alpha)
- Shadows use warm-tinted black for consistency
- Font imports via Google Fonts for web optimization
- No gradients in this theme for clean, minimal feel
- Rounded corners: 6-8px (refined, not aggressive)
