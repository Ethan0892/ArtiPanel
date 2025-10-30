# ArtiPanel Logo & Branding

Modern, professional logo system for ArtiPanel server control panel.

## Logo Files

### Logo Files Location
All logo files are located in `/frontend/public/`

### Individual Files

#### `favicon.svg` (Primary Favicon)
- **Size**: 192x192 (SVG, scales infinitely)
- **Usage**: Browser tab icon, bookmarks, address bar
- **Design**: Full server panel with gradient background
- **Colors**: Purple to violet gradient (#667eea → #764ba2)
- **Style**: Modern, minimalist, tech-forward

#### `logo.svg` (Full Logo)
- **Size**: 256x256 (SVG)
- **Usage**: Splash screens, documentation, presentations
- **Design**: Detailed server panel with accent elements
- **Features**: 
  - LED indicators (showing status)
  - Power button center accent
  - Server rack grid pattern
  - Multi-gradient styling

#### `icon.svg` (Small Icon)
- **Size**: 64x64 (SVG)
- **Usage**: Navigation, buttons, social media
- **Design**: Simplified server panel grid
- **Colors**: Single gradient background
- **Advantage**: Works at any size, minimal detail for clarity

## Design Philosophy

### Modern Elements
- **Gradient backgrounds**: Professional purple to violet (#667eea → #764ba2)
- **Accent colors**: Pink/red accents (#f093fb, #f5576c) for CTAs
- **Rounded corners**: 12-16px radius for softer, modern appearance
- **Flat design**: Minimalist, no shadows, clean lines
- **Tech aesthetic**: Grid patterns and LED indicators suggest server/control panel

### Professional Touch
- **Geometric precision**: All elements align to grid
- **Consistent stroke widths**: 1.5-3px for balance
- **Negative space**: Breathing room in design
- **Scalable**: All SVG, infinite resolution
- **Accessibility**: High contrast ratios, readable at small sizes

### Visual Hierarchy
1. **Outer frame**: Main panel structure
2. **Grid pattern**: Server racks/modules
3. **Power button**: Central accent for focus
4. **LED indicators**: Status/activity suggestion
5. **Accent lines**: Tech connection feeling

## Color Palette

```
Primary Gradient:
  - Start: #667eea (Electric Blue/Indigo)
  - End:   #764ba2 (Deep Purple)

Accent Gradient:
  - Start: #f093fb (Hot Pink)
  - End:   #f5576c (Coral Red)

Theme Color: #667eea
```

## Usage Guide

### Favicon (Browser Tab)
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/logo.svg" />
<meta name="theme-color" content="#667eea" />
```

### Logo in HTML
```html
<img src="/logo.svg" alt="ArtiPanel" class="logo" />
```

### Icon in Components
```html
<img src="/icon.svg" alt="ArtiPanel" class="logo-icon" />
```

### CSS Styling
```css
.logo {
  width: 256px;
  height: 256px;
  display: block;
}

.logo-icon {
  width: 64px;
  height: 64px;
  display: inline-block;
}

.favicon {
  width: 32px;
  height: 32px;
}
```

## Placement Recommendations

### Primary Placement
- **Header/Navbar**: Use 48-64px logo or icon
- **Login Page**: Use full 256px logo with text
- **Browser Tab**: Favicon (automatic)
- **Sidebar**: Use small icon (32-48px)

### Secondary Placement
- **Documentation**: Full logo (256px)
- **Social Media**: Icon (192-256px)
- **Presentations**: Logo or combined with text
- **Emails**: Icon (64px) as email header

### Sizes for Different Uses
```
32px   → Small buttons, favicons
48px   → Navigation items
64px   → Social media icons, buttons
128px  → Card headers, badges
192px  → Medium promotional
256px  → Full logo, splash screens
512px  → Large promotional, posters
```

## Integration Points

### Currently Integrated
- ✅ `index.html` - Favicon and Apple touch icon
- ✅ `frontend/public/` - All logo files stored here

### Recommended Integration
- [ ] Logo in Sidebar component
- [ ] Logo in Login page header
- [ ] Logo in dashboard top-left
- [ ] Favicon auto-displayed by browser
- [ ] Icon in document headers (markdown)

## Customization

### To Modify Colors
Edit the gradient definitions in any SVG file:

```xml
<linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" style="stop-color:#NEW_COLOR;stop-opacity:1" />
  <stop offset="100%" style="stop-color:#ANOTHER_COLOR;stop-opacity:1" />
</linearGradient>
```

### To Change Size
SVG files automatically scale. Adjust `width` and `height` attributes:

```xml
<svg width="512" height="512" viewBox="0 0 256 256" ...>
```

### To Export as PNG
Use any online SVG to PNG converter or:
```bash
# Using ImageMagick
convert logo.svg -background none logo-256.png
convert favicon.svg -background none favicon-192.png
convert icon.svg -background none icon-64.png
```

## Browser Compatibility

All formats are supported in:
- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Mobile browsers
- ✅ Apple devices (touch icon)

## Files Summary

| File | Type | Size | Purpose |
|------|------|------|---------|
| `favicon.svg` | SVG | 192x192 | Browser tab icon |
| `logo.svg` | SVG | 256x256 | Full logo display |
| `icon.svg` | SVG | 64x64 | Small icon usage |
| `index.html` | HTML | - | Updated favicon links |

## Future Enhancements

- [ ] Create dark mode variants
- [ ] Add animated logo version (animated SVG)
- [ ] PNG exports at multiple resolutions (32, 48, 64, 128, 256, 512)
- [ ] Logo with text lockup variants
- [ ] Horizontal/vertical logo arrangements
- [ ] Icon font version

## License

ArtiPanel Logo © 2025 - Part of ArtiPanel open-source project (AGPL-3.0)

---

**Design Date**: October 30, 2025  
**Version**: 1.0  
**Status**: Production Ready
