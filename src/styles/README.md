# CSS Classes Documentation

This file documents all the custom CSS classes available in the CityPulse project.

## 🎯 Usage
All classes are available globally after importing `components.css` in `globals.css`.

## 📦 Button Classes

### Base Button
- `.btn` - Base button styling (padding, font, rounded, transitions)

### Button Variants
- `.btn-primary` - Blue primary button (Book Now, etc.)
- `.btn-secondary` - Gray secondary button (Cancel, etc.)
- `.btn-cancel` - Combines btn + btn-secondary + flex-1
- `.btn-book` - Combines btn + btn-primary + flex-1

### Button Groups
- `.button-group` - Responsive flex container for buttons (column on mobile, row on desktop)

## 🎴 Card Classes

### Card Container
- `.card` - Base card styling (white background, shadow, rounded, hover effects)
- `.card-horizontal` - Horizontal card layout (flex row on desktop, column on mobile)

### Card Sections
- `.card-image-section` - Image container (1/3 width on desktop)
- `.card-image-container` - Image wrapper with gradient background
- `.card-image` - Image styling (full size, object-cover)
- `.card-image-placeholder` - Placeholder for missing images
- `.card-content-section` - Content container (2/3 width on desktop)

### Card Content
- `.card-title` - Main heading style
- `.card-description` - Description text styling
- `.card-details` - Container for detail items (duration, location, etc.)
- `.card-detail-item` - Individual detail item styling
- `.card-detail-icon` - Icons in detail items

## ⭐ Rating Classes

### Star Rating
- `.star-rating` - Container for star rating
- `.star-container` - Container for star icons
- `.star` - Individual star icon
- `.star-filled` - Filled (yellow) star
- `.star-empty` - Empty (gray) star
- `.rating-text` - Rating number text

## 💰 Price Classes

- `.price` - Price container styling
- `.price-amount` - Price amount text styling

## 🧭 Header Classes

### Header Structure
- `.header` - Main header container
- `.header-container` - Header content wrapper
- `.header-content` - Header flex layout
- `.logo` - Logo text styling

### Navigation
- `.nav-link` - Navigation links (Tours, etc.)
- `.nav-button` - Base navigation button
- `.nav-button-secondary` - Secondary nav button (Join)
- `.nav-button-primary` - Primary nav button (Sign In)
- `.responsive-nav` - Navigation container (hidden on mobile)

## 📄 Page Layout Classes

### Page Structure
- `.page-container` - Main page wrapper (min-height, background)
- `.page-content` - Page content with top padding
- `.container-wrapper` - Content container with margins and padding

### Hero Section
- `.hero-section` - Hero section styling
- `.hero-title` - Main page title
- `.hero-subtitle` - Page subtitle/description

### Tours Page
- `.tours-list` - Tours list container (vertical spacing)

## 🔄 State Classes

### Loading States
- `.loading-skeleton` - Base loading animation
- `.loading-skeleton-content` - Loading content layout
- `.loading-skeleton-image` - Loading image placeholder
- `.loading-skeleton-text` - Loading text container
- `.loading-skeleton-line` - Base loading line
- `.loading-skeleton-line-title` - Title loading line
- `.loading-skeleton-line-full` - Full width loading line
- `.loading-skeleton-line-partial` - Partial width loading line

### Error States
- `.error-container` - Error message container
- `.error-text` - Error text styling

## 📱 Responsive Utilities

- `.responsive-nav` - Hidden on mobile, flex on desktop
- `.button-group` - Stacks on mobile, row on desktop

## 🎨 Color Scheme

### Primary Colors
- Blue: `#2563eb` (blue-600)
- Light Blue: `#3b82f6` (blue-500)
- Dark Blue: `#1d4ed8` (blue-700)

### Status Colors
- Success/Price: Green (`#059669`)
- Warning/Rating: Yellow (`#f59e0b`)
- Error: Red (`#dc2626`)

### Neutral Colors
- Gray backgrounds: `#f9fafb` (gray-50)
- Text: `#374151` (gray-700)
- Light text: `#6b7280` (gray-500)

## 💡 Examples

```tsx
// Clean card component
<div className="card">
  <div className="card-horizontal">
    <div className="card-image-section">
      <img className="card-image" src="..." />
    </div>
    <div className="card-content-section">
      <h2 className="card-title">Title</h2>
      <p className="card-description">Description</p>
      <div className="button-group">
        <button className="btn-cancel">Cancel</button>
        <button className="btn-book">Book Now</button>
      </div>
    </div>
  </div>
</div>

// Clean header
<header className="header">
  <div className="header-container">
    <div className="header-content">
      <h1 className="logo">CityPulse</h1>
      <Link className="nav-link" href="/tours">Tours</Link>
    </div>
  </div>
</header>
```

## 🔧 Customization

To modify styles, edit `src/styles/components.css` and use Tailwind's `@apply` directive:

```css
.custom-button {
  @apply btn bg-purple-600 text-white hover:bg-purple-700;
}
``` 