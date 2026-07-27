# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Opulentes Hollywood-Red-Carpet-Design: tiefschwarzer Samt-Hintergrund, warmgoldene Akzente (#FFD700, #DAA520), elegante Playfair-Display-Serifen, Art-Deco-geometrische Zierelemente und dezente Spotlight-Glow-Effekte – wie der VIP-Eingang einer exklusiven Award-Gala.

## Colors

- `--color-bg`: **#0A0A0A**
- `--color-bg_surface`: **#141414**
- `--color-bg_card`: **#1A1A1A**
- `--color-bg_modal`: **#1C1C1C**
- `--color-fg`: **#F5F0E8**
- `--color-fg_muted`: **#B0A89A**
- `--color-accent`: **#FFD700**
- `--color-accent_dark`: **#DAA520**
- `--color-accent_glow`: **#FFF2A8**
- `--color-border`: **#2A2A2A**
- `--color-border_gold`: **#DAA520**
- `--color-error`: **#E05555**
- `--color-success`: **#5FA87A**
- `--color-overlay`: **rgba(0,0,0,0.75)**
- `--color-spotlight`: **radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%)**

## Typography

- `font_family`: 'Playfair Display', 'Georgia', 'Times New Roman', serif
- `body_family`: 'Inter', 'Helvetica Neue', 'Arial', sans-serif
- `heading_weight`: 700
- `body_weight`: 400
- `size_scale`: 12px, 14px, 16px, 18px, 24px, 32px, 48px, 64px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px
- `--space-7`: 64px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 20px
- `--radius-pill`: 999px

## Components

### Button (Primary – Gold CTA)

padding 12px 32px, radius md (8px), bg=accent (#FFD700), color=bg (#0A0A0A), font-weight 600, font-family body, letter-spacing 0.5px, text-transform uppercase, min-height 48px (mobile tap). Hover: bg=accent_glow (#FFF2A8), box-shadow 0 0 24px rgba(255,215,0,0.4), transform scale(1.03), transition all 250ms ease. Active: transform scale(0.97), box-shadow 0 0 12px rgba(255,215,0,0.3). Disabled: opacity 0.4, cursor not-allowed, no hover effects.

### Button (Secondary – Outline)

padding 12px 32px, radius md (8px), bg=transparent, color=accent (#FFD700), border 1.5px solid accent (#FFD700), font-weight 500, font-family body, letter-spacing 0.3px, min-height 48px (mobile tap). Hover: bg=rgba(255,215,0,0.08), border-color accent_glow (#FFF2A8), color accent_glow, box-shadow 0 0 16px rgba(255,215,0,0.2), transition all 250ms ease. Active: bg=rgba(255,215,0,0.14). Disabled: opacity 0.35, no hover.

### Button (Danger – Delete)

padding 12px 32px, radius md (8px), bg=transparent, color=error (#E05555), border 1.5px solid error, font-weight 500, font-family body, min-height 48px. Hover: bg=rgba(224,85,85,0.1), box-shadow 0 0 16px rgba(224,85,85,0.25). Active: bg=rgba(224,85,85,0.18). Disabled: opacity 0.35.

### Input Field

padding 12px 16px, radius md (8px), bg=bg (#0A0A0A), color=fg (#F5F0E8), border 1px solid border (#2A2A2A), font-family body, font-size 16px (prevents iOS zoom), min-height 48px, placeholder color fg_muted (#B0A89A). Focus: border-color accent (#FFD700), box-shadow 0 0 12px rgba(255,215,0,0.2), outline none. Error: border-color error, box-shadow 0 0 8px rgba(224,85,85,0.2).

### Card (Kleidungsstück & Outfit)

bg=bg_card (#1A1A1A), border 1px solid border_gold (#DAA520) with opacity 0.3, radius lg (12px), padding 0 (image-top layout), overflow hidden, box-shadow 0 4px 24px rgba(0,0,0,0.5). Hover: border-color accent (#FFD700) opacity 0.7, box-shadow 0 8px 40px rgba(255,215,0,0.15), transform translateY(-4px), transition all 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94). Card content area: padding 16px, with Art-Deco thin golden separator line (1px, border_gold 0.25 opacity) above text. Image area: aspect-ratio 3/4, object-fit cover, subtle inner shadow at bottom edge for text overlay readiness.

### Modal / Dialog

bg=bg_modal (#1C1C1C), border 1px solid border_gold (#DAA520, 0.25 opacity), radius xl (20px), padding 32px, max-width 520px, box-shadow 0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(255,215,0,0.05). Backdrop: overlay (rgba(0,0,0,0.75)) with backdrop-filter blur(8px). Top decorative element: thin 2px gold line (accent, 50% width, centered) with subtle glow. Close button: positioned top-right, 44px touch target, color fg_muted, hover color accent.

### Navbar / Header

bg=bg_surface (#141414) with subtle bottom border 1px border (#2A2A2A), height 64px, padding 0 24px, display flex, align-items center, justify-content space-between. Logo: font-family heading, font-size 24px, color accent (#FFD700), letter-spacing 1px, text-shadow 0 0 20px rgba(255,215,0,0.3). Nav links: font-family body, font-size 14px, text-transform uppercase, letter-spacing 1.5px, color fg_muted, gap 32px. Active/hover link: color accent, subtle underline (2px gold, 50% width, animated slide-in). Mobile: hamburger menu with golden lines, slide-out drawer bg=bg_surface.

### Spotlight Background (Hero / Outfit Preview)

Full-width section with bg=bg (#0A0A0A), overlay spotlight (radial-gradient ellipse at center 30%, rgba(255,215,0,0.06) 0%, transparent 65%), optional subtle Art-Deco line pattern (thin vertical/horizontal golden lines, opacity 0.04) behind content. Content centered, z-index above spotlight.

### Art-Deco Divider

Horizontal rule: height 1px, bg=linear-gradient(to right, transparent, border_gold at 0.25 opacity, transparent). Optional centered diamond/bullet: small rotated square 4x4px accent at center. Vertical variant for sidebar/panels: same gradient top-to-bottom.

### Badge / Tag (Kategorie)

padding 4px 12px, radius pill (999px), bg=rgba(255,215,0,0.08), color=accent (#FFD700), border 1px solid rgba(218,165,32,0.3), font-family body, font-size 12px, font-weight 500, letter-spacing 0.5px, text-transform uppercase.

### Toast / Notification

padding 16px 20px, radius md (8px), bg=bg_surface (#141414), border-left 3px solid, font-family body, font-size 14px, box-shadow 0 8px 32px rgba(0,0,0,0.6). Success: border-left success (#5FA87A). Error: border-left error (#E05555). Info: border-left accent (#FFD700). Contains optional icon + message + close button (44px touch). Slide-in animation from top-right, auto-dismiss 4s.

## Layout Principles

- Max content width 1280px, centered with auto margins, padding 24px on mobile / 32px on tablet / 48px on desktop
- Breakpoints: mobile < 640px, tablet 640–1024px, desktop > 1024px
- Grid: CSS Grid for gallery – cards auto-fill, minmax(240px, 1fr), gap 24px; Outfit-Creator split layout – sidebar 320px (categories/selection) + main preview area flex-1
- Vertical rhythm: section spacing 64px (mobile 48px), card groups 32px apart, inner card text block spacing 12px
- Golden Art-Deco accent line at top of major sections (Hero, Galerie, Outfit-Creator, Footer): 1px height, gradient transparent-gold-transparent, 60% container width, centered
- All interactive elements min touch target 44x44px (WCAG AAA)
- Forms (Login/Register): centered card, max-width 440px, spotlight background behind card, golden border glow on card, VIP-eingang aesthetic
- Outfit-Vorschau: immersive spotlight-section with large combined preview, Art-Deco framing, 'Dein Look' headline in Playfair Display 48px with gold text-shadow glow
