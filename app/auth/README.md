# Authentication Pages

This directory contains the authentication pages (login and registration) for the Pixel Auth system with both dark and light theme variants.

## 📁 Directory Structure

```
app/auth/
├── _components/              # Shared auth components
│   ├── auth-layout.tsx      # Main layout wrapper
│   ├── auth-left-section.tsx # Left visual section with mascot
│   ├── auth-input.tsx        # Input field component
│   ├── auth-button.tsx       # Button component
│   └── index.ts             # Barrel export
├── login/
│   └── page.tsx             # Dark theme login page
├── login-light/
│   └── page.tsx             # Light theme login page
├── register/
│   └── page.tsx             # Dark theme registration page
├── register-light/
│   └── page.tsx             # Light theme registration page
└── README.md                # This file
```

## 🔗 Page Routes

| Route                  | Description            | Theme |
| ---------------------- | ---------------------- | ----- |
| `/auth/login`          | User login page        | Dark  |
| `/auth/login-light`    | User login page        | Light |
| `/auth/register`       | User registration page | Dark  |
| `/auth/register-light` | User registration page | Light |

## 🎨 Features

- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Dual Theme Support**: Both dark and light theme variants
- **Accessible Components**: Proper semantic HTML and ARIA labels
- **Form Validation**: Built-in input validation
- **External Auth**: Placeholder buttons for Web3 and Nostr authentication
- **Pixel Design**: Based on Figma designs with the "Pixel Auth" aesthetic

## 🧩 Shared Components

### `AuthLayout`

Main layout wrapper that creates the two-column bento-style layout with left visual section and right form section.

```tsx
<AuthLayout
  leftSection={<AuthLeftSection ... />}
  isDarkTheme={true}
>
  {/* Form content */}
</AuthLayout>
```

### `AuthLeftSection`

The left visual column with mascot, branding, and system information.

```tsx
<AuthLeftSection
  title="ACCESSING THE"
  subtitle="VOID"
  mascotUrl={MASCOT_URL}
  isDarkTheme={true}
/>
```

### `AuthInput`

Styled input field with label and optional helper text.

```tsx
<AuthInput
  label="Email Identifier"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  helper="FORGOT?"
  isDarkTheme={true}
/>
```

### `AuthButton`

Styled button with variants (primary, secondary, tertiary).

```tsx
<AuthButton variant="primary" isDarkTheme={true} onClick={handleClick}>
  INITIALIZE SESSION
</AuthButton>
```

## 🎯 How to Integrate

### 1. Link from your app

Add navigation links to the auth pages:

```tsx
<a href="/auth/login">Login (Dark)</a>
<a href="/auth/login-light">Login (Light)</a>
<a href="/auth/register">Register (Dark)</a>
<a href="/auth/register-light">Register (Light)</a>
```

### 2. Implement authentication logic

Replace the `TODO` comments in each page with your actual authentication logic:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Call your backend API
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      // Redirect to dashboard
      window.location.href = "/dashboard";
    }
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Update external auth providers

If you want to support Web3 or Nostr authentication, implement the handlers:

```tsx
const handleWeb3 = () => {
  // Implement Web3 wallet connection
};

const handleNostr = () => {
  // Implement Nostr protocol connection
};
```

## 🎨 Customization

### Colors

The theme colors are defined inline in each component. To customize:

1. **Dark Theme Colors**:
   - Primary accent: `#a0ffc3` (green)
   - Secondary accent: `#ff51fa` (pink)
   - Background: `#0d0d19` (dark navy)

2. **Light Theme Colors**:
   - Primary accent: `#006d40` (dark green)
   - Secondary accent: `#c100ba` (dark pink)
   - Background: `#f9f8fc` (light gray)

### Mascot Images

Replace the image URLs in each page with your own mascot:

```tsx
const PIXEL_MASCOT = "https://your-image-url.com/mascot.png";
```

### Fonts

The pages use the fonts already configured in the project:

- `font-display`: Space Grotesk (headings)
- `font-sans`: Inter (body text)

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (padding-4, stacked layout)
- **Tablet**: 640px - 1024px (padding-6)
- **Desktop**: > 1024px (padding-8, full layout)

## ♿ Accessibility

- All form inputs have associated labels
- Buttons have proper `type` attributes
- Links support keyboard navigation
- Color contrast meets WCAG standards
- Semantic HTML structure

## 🆘 Troubleshooting

### Theme not applying

Ensure the `data-theme` attribute is set correctly:

```tsx
<div data-theme={isDarkTheme ? "dark" : "light"}>
```

### Images not loading

Check that image URLs are correct and the URLs are accessible.

### Styling issues

Ensure Tailwind CSS is properly configured in your project:

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

## 📦 Dependencies

- React 19+
- Next.js 16+
- Tailwind CSS 4+
- TypeScript

## 🚀 Future Enhancements

- [ ] Email verification
- [ ] Password reset flow
- [ ] Social login integrations
- [ ] Multi-factor authentication
- [ ] User profile completion
- [ ] Terms of service modal
- [ ] Privacy policy modal

---

**Created from Figma designs**: Pixel Auth System
**Design Reference**: 4 variants (Dark Login, Dark Register, Light Login, Light Register)
