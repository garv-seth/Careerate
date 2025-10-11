# Careerate Design System v2.0

**Date**: October 11, 2025  
**Version**: 2.0 (Complete Rebuild)  
**Status**: Design Complete

---

## Design Philosophy

**Core Principles**:
1. **Consistency**: Every component of the same type follows identical rules
2. **Accessibility**: WCAG 2.1 AA compliant, keyboard navigable
3. **Performance**: Animations use GPU acceleration, no jank
4. **Responsiveness**: Mobile-first, works perfectly 320px → 1920px+
5. **Professionalism**: Clean, modern, trust-building aesthetic

**Brand Essence**: "AI-powered, transparent, trustworthy, no-nonsense"

---

## Color System

### Primary Palette

**Orange/Amber Gradient** (Brand signature):
```css
/* Light variant */
.gradient-primary-light {
  background: linear-gradient(135deg, #FB923C 0%, #FCD34D 100%);
  /* from-orange-400 to-amber-400 */
}

/* Default variant */
.gradient-primary {
  background: linear-gradient(135deg, #F97316 0%, #F59E0B 100%);
  /* from-orange-500 to-amber-500 */
}

/* Dark variant */
.gradient-primary-dark {
  background: linear-gradient(135deg, #EA580C 0%, #D97706 100%);
  /* from-orange-600 to-amber-600 */
}
```

### Accent Palettes

**Purple (AI Features)**:
```css
.gradient-purple {
  background: linear-gradient(135deg, #A855F7 0%, #EC4899 100%);
  /* from-purple-500 to-pink-500 */
}
```

**Blue (Cloud Providers)**:
```css
.gradient-blue {
  background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%);
  /* from-blue-500 to-cyan-500 */
}
```

**Green (Monitoring, Success)**:
```css
.gradient-green {
  background: linear-gradient(135deg, #22C55E 0%, #10B981 100%);
  /* from-green-500 to-emerald-500 */
}
```

**Red (Errors, Warnings)**:
```css
.gradient-red {
  background: linear-gradient(135deg, #EF4444 0%, #F43F5E 100%);
  /* from-red-500 to-rose-500 */
}
```

### Neutral Colors

```css
:root {
  /* Dark theme (default) */
  --background: 10 10 10;           /* #0A0A0A */
  --foreground: 250 250 250;        /* #FAFAFA */
  --card: 15 15 15;                 /* #0F0F0F */
  --card-foreground: 250 250 250;
  --popover: 15 15 15;
  --popover-foreground: 250 250 250;
  --primary: 249 115 22;            /* Orange-500 */
  --primary-foreground: 250 250 250;
  --secondary: 30 30 30;            /* #1E1E1E */
  --secondary-foreground: 250 250 250;
  --muted: 30 30 30;
  --muted-foreground: 163 163 163;  /* #A3A3A3 */
  --accent: 30 30 30;
  --accent-foreground: 250 250 250;
  --destructive: 239 68 68;         /* Red-500 */
  --destructive-foreground: 250 250 250;
  --border: 30 30 30;
  --input: 30 30 30;
  --ring: 249 115 22;               /* Orange-500 */
  --radius: 1.5rem;                 /* 24px */
}
```

---

## Typography

### Font Family
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-feature-settings: 'cv11', 'ss01';  /* Inter features */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Type Scale

| Element | Size | Weight | Line Height | Class |
|---------|------|--------|-------------|-------|
| **Display** | 48px / 3rem | 800 | 1.1 | `text-5xl font-extrabold` |
| **H1** | 36px / 2.25rem | 700 | 1.2 | `text-4xl font-bold` |
| **H2** | 30px / 1.875rem | 700 | 1.3 | `text-3xl font-bold` |
| **H3** | 24px / 1.5rem | 600 | 1.4 | `text-2xl font-semibold` |
| **H4** | 20px / 1.25rem | 600 | 1.5 | `text-xl font-semibold` |
| **Body Large** | 18px / 1.125rem | 400 | 1.6 | `text-lg` |
| **Body** | 16px / 1rem | 400 | 1.6 | `text-base` |
| **Body Small** | 14px / 0.875rem | 400 | 1.5 | `text-sm` |
| **Caption** | 12px / 0.75rem | 400 | 1.4 | `text-xs` |
| **Code** | 14px / 0.875rem | 500 | 1.5 | `text-sm font-mono` |

### Typography Rules

**Headings**:
```css
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  letter-spacing: -0.02em;  /* Tighter tracking */
  color: rgb(var(--foreground));
}
```

**Body Text**:
```css
p, li, td {
  font-weight: 400;
  color: rgba(var(--foreground), 0.8);  /* 80% opacity */
}
```

**Code**:
```css
code, pre {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
}
```

---

## Components

### Glass Pane (Universal Container)

**Usage**: All cards, modals, popups, navigation, etc.

**CSS**:
```css
.glass-pane {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;  /* 24px */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Hover state (interactive cards) */
.glass-pane-hover:hover {
  border-color: rgba(249, 115, 22, 0.5);  /* Orange-500 */
  box-shadow: 0 12px 48px rgba(249, 115, 22, 0.15);
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Rule**: ALL cards, containers, modals MUST use `.glass-pane` class.

---

### Buttons

#### Primary Button (Call-to-Action)
```tsx
<Button className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300">
  Get Started
</Button>
```

**CSS**:
```css
.btn-primary {
  border-radius: 9999px;  /* Fully rounded */
  background: linear-gradient(135deg, #F97316 0%, #F59E0B 100%);
  color: white;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #EA580C 0%, #D97706 100%);
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.3);
  transform: translateY(-2px);
}
```

#### Secondary Button
```tsx
<Button variant="outline" className="rounded-full glass-pane border-foreground/20 hover:border-primary/50">
  Learn More
</Button>
```

#### Destructive Button (Ejection, Delete, etc.)
```tsx
<Button variant="destructive" className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600">
  Eject Infrastructure
</Button>
```

**Rule**: ALL buttons MUST be fully rounded (`rounded-full`).

---

### Inputs & Forms

#### Text Input
```tsx
<Input
  className="glass-pane border-foreground/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
  placeholder="Enter your AWS account ID..."
/>
```

#### Select Dropdown
```tsx
<Select>
  <SelectTrigger className="glass-pane rounded-xl border-foreground/20">
    <SelectValue placeholder="Choose cloud provider" />
  </SelectTrigger>
  <SelectContent className="glass-pane border-foreground/20">
    <SelectItem value="aws">AWS</SelectItem>
    <SelectItem value="azure">Azure</SelectItem>
    <SelectItem value="gcp">GCP</SelectItem>
  </SelectContent>
</Select>
```

**Rule**: All inputs use `.glass-pane` + `rounded-xl` (12px).

---

### Badges & Tags

#### Status Badge
```tsx
<Badge className="bg-foreground/10 text-foreground/60 border-foreground/20">
  Connected
</Badge>

<Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
  Deployed
</Badge>
```

**Variants**:
- **Neutral**: `bg-foreground/10 text-foreground/60`
- **Success**: `bg-gradient-to-r from-green-500 to-emerald-500 text-white`
- **Warning**: `bg-gradient-to-r from-orange-500 to-amber-500 text-white`
- **Error**: `bg-gradient-to-r from-red-500 to-rose-500 text-white`
- **Info**: `bg-gradient-to-r from-blue-500 to-cyan-500 text-white`

---

### Modals & Dialogs

```tsx
<Dialog>
  <DialogContent className="glass-pane border-foreground/20 rounded-3xl max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold">Choose Autonomy Level</DialogTitle>
      <DialogDescription className="text-foreground/70">
        Control how much the AI agent can do on its own.
      </DialogDescription>
    </DialogHeader>
    <DialogBody>
      {/* Content */}
    </DialogBody>
    <DialogActions className="flex gap-3 justify-end">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogActions>
  </DialogContent>
</Dialog>
```

**Rule**: All modals use `.glass-pane` + `rounded-3xl` (48px).

---

### Cards

#### Feature Card
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
  className="glass-pane rounded-3xl p-6 flex flex-col items-start hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
>
  <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
    <Icon className="h-6 w-6 text-white" />
  </div>
  <h3 className="text-xl font-semibold mb-2">{title}</h3>
  <p className="text-foreground/60">{description}</p>
</motion.div>
```

**Rule**: All feature/product cards use `rounded-3xl` + hover lift effect.

---

## Animations

### Motion Variants (Framer Motion)

#### Page Transitions
```tsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
>
  {children}
</motion.div>
```

#### Stagger Children
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### Hover Effects
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -5 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  {/* Card content */}
</motion.div>
```

**Rule**: All animations use cubic-bezier easing: `cubic-bezier(0.4, 0, 0.2, 1)` or `"easeOut"`

---

## Hero Element (CONSTANT)

**The CybercoreBackground animated hero with orange lines MUST remain in all landing pages.**

**Usage**:
```tsx
import CybercoreBackground from '@/components/ui/cybercore-section-hero';

<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Background animation */}
  <CybercoreBackground className="absolute inset-0 opacity-20 blur-sm" />
  
  {/* Content */}
  <div className="relative z-10 text-center">
    <h1 className="text-5xl font-extrabold">Your AI DevOps Team</h1>
    <p className="text-xl text-foreground/70">Deploy to AWS, Azure, or GCP with just a conversation.</p>
  </div>
</section>
```

**Rule**: NEVER remove or significantly alter the CybercoreBackground. It's the brand signature.

---

## Responsive Design

### Breakpoints

```css
/* Tailwind default breakpoints */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Mobile-First Approach

**Example**:
```tsx
<div className="
  w-full                /* Default: full width */
  max-w-md              /* Mobile: max 28rem */
  sm:max-w-lg           /* Small: max 32rem */
  md:max-w-2xl          /* Medium: max 42rem */
  lg:max-w-4xl          /* Large: max 56rem */
  mx-auto               /* Center horizontally */
  px-4                  /* Padding 1rem */
  sm:px-6               /* Small: padding 1.5rem */
  md:px-8               /* Medium: padding 2rem */
">
  {/* Content */}
</div>
```

### Touch Targets

**Rule**: All interactive elements (buttons, links, form inputs) MUST be at least 44x44px on mobile (Apple HIG, WCAG).

```css
@media (max-width: 640px) {
  button, a, input, select {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## Accessibility

### Color Contrast

- **Normal text**: 4.5:1 minimum (WCAG AA)
- **Large text** (18px+ or 14px+ bold): 3:1 minimum
- **UI components**: 3:1 minimum

**Test**: Use https://contrast-ratio.com/

### Keyboard Navigation

```tsx
<Button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  tabIndex={0}
  aria-label="Deploy application"
>
  Deploy
</Button>
```

### Screen Reader Support

```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</button>
```

### Focus Indicators

```css
*:focus-visible {
  outline: 2px solid rgb(var(--primary));
  outline-offset: 2px;
}
```

---

## Loading States

### Skeleton Loaders

```tsx
<div className="glass-pane rounded-3xl p-6 space-y-4">
  <div className="h-4 bg-foreground/10 rounded-full w-3/4 animate-pulse" />
  <div className="h-4 bg-foreground/10 rounded-full w-full animate-pulse" />
  <div className="h-4 bg-foreground/10 rounded-full w-5/6 animate-pulse" />
</div>
```

### Loading Spinner

```tsx
<div className="flex items-center justify-center">
  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
</div>
```

---

## Error States

### Error Boundary UI

```tsx
<div className="glass-pane rounded-3xl p-8 text-center">
  <div className="mb-4 inline-flex p-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500">
    <AlertTriangle className="h-6 w-6 text-white" />
  </div>
  <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
  <p className="text-foreground/60 mb-4">
    We're sorry, but an error occurred. Please try again.
  </p>
  <Button onClick={retry}>Try Again</Button>
</div>
```

---

## Cookie Consent Banner

**Fixed position**: Bottom-center  
**Responsive sizing**: 90% width, max-width responsive  
**Z-index**: 50 (above most elements, below modals)

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md sm:max-w-lg md:max-w-2xl"
>
  <div className="glass-pane rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <p className="text-sm text-foreground/80 text-center sm:text-left">
      We use cookies to enhance your experience. By continuing, you agree to our cookie policy.
    </p>
    <div className="flex gap-2">
      <Button size="sm" variant="outline">Decline</Button>
      <Button size="sm">Accept</Button>
    </div>
  </div>
</motion.div>
```

**Rule**: Cookie banner MUST be centered horizontally, bottom of viewport, responsive width.

---

## PWA Install Prompt

**Mobile Install Guide** (`app/install/page.tsx`):

```tsx
export default function InstallPage() {
  const [browser, setBrowser] = useState<'chrome' | 'safari' | 'firefox' | 'other'>('other');
  
  useEffect(() => {
    // Detect browser
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) setBrowser('chrome');
    else if (ua.includes('Safari')) setBrowser('safari');
    else if (ua.includes('Firefox')) setBrowser('firefox');
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Install Careerate</h1>
      <p className="text-lg text-foreground/70 mb-8">
        Install Careerate on your device for a faster, app-like experience.
      </p>
      
      {browser === 'chrome' && (
        <div className="glass-pane rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Chrome/Edge</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Tap the three dots menu (⋮) in the top-right</li>
            <li>Select "Install Careerate" or "Add to Home Screen"</li>
            <li>Tap "Install" in the popup</li>
          </ol>
        </div>
      )}
      
      {browser === 'safari' && (
        <div className="glass-pane rounded-3xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Safari (iPhone/iPad)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Tap the Share button (□↑) at the bottom</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top-right</li>
          </ol>
        </div>
      )}
    </div>
  );
}
```

---

## Design Checklist

When creating or updating UI components, verify:

- [ ] Uses `.glass-pane` for containers
- [ ] Buttons are fully rounded (`rounded-full`)
- [ ] Animations use proper easing (`cubic-bezier(0.4, 0, 0.2, 1)`)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets are 44x44px minimum on mobile
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Loading states are implemented (skeleton/spinner)
- [ ] Error states are handled gracefully
- [ ] Responsive across 320px - 1920px
- [ ] CybercoreBackground is preserved on landing pages
- [ ] Cookie consent is bottom-center

---

## Documentation Updates

**Rule**: When changing ANY design rule, update ALL components of that type.

**Example**: If button border-radius changes from `rounded-full` to `rounded-2xl`:
1. Update this document
2. Update ALL button components in codebase
3. Update Storybook (if applicable)
4. Screenshot updated components
5. Notify team via Slack/email

**Uniformity is non-negotiable.**

---

## Tools & Resources

### Design Tokens (Figma)
- Export design tokens from Figma to CSS variables
- Sync colors, typography, spacing

### Component Library (Storybook)
- All components documented in Storybook
- Visual regression testing with Chromatic

### Testing
- **Visual**: Percy or Chromatic
- **Accessibility**: axe DevTools, WAVE
- **Performance**: Lighthouse CI

---

## Conclusion

This design system ensures **consistency, accessibility, and professionalism** across the entire Careerate platform.

**Key Rule**: **If a rule is changed, update ALL instances of that element type.**

🎨 **Design with intention. Build with consistency.**

