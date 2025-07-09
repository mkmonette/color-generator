# color-generator

**Color Palette Generator for Website Templates**

A React & TypeScript application that empowers designers and developers to create, customize, preview, and export cohesive color palettes for modern website sections (header + hero). Choose from free or pro templates, tweak every visual element, generate palettes by scheme or mood, toggle light/dark modes, and export client-ready HTML/CSS or PDF assets. Monetize with a coin-based subscription system and manage users via dedicated dashboards.

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Tech Stack & Architecture](#tech-stack--architecture)  
4. [Installation](#installation)  
5. [Usage](#usage)  
6. [Components](#components)  
7. [Dependencies](#dependencies)  
8. [Environment Variables](#environment-variables)  
9. [Project Structure](#project-structure)  
10. [Contributing](#contributing)  
11. [License](#license)  

---

## Overview

Color-Generator is designed to streamline the process of creating and applying harmonious color schemes to website templates. Start with header and hero sections, pick a layout, generate or manually set colors, preview in real time (full-screen or embedded), and export styled code or branded PDFs. Built for both freelancers (PRO+) and hobbyists (FREE), it features coin-based unlocks, subscription tiers, plus admin/customer dashboards.

---

## Features

### Core UI & Editing
- **Template Selection** (Header + Hero)  
  ? FREE templates: minimal, clean  
  ? PRO templates: advanced design & interactions  
- **Live Preview Cards** with hover/expand  
- **Full-Screen Preview Mode** with floating controls  
- **Editable Elements**: backgrounds, navigation links, headlines, buttons, overlays, hero images  

### Color Generation & Customization
- **One-Click Palette Generation** by scheme (random, monochromatic, analogous, complementary, triadic, tetradic) and mood (soft, balanced, vibrant, muted, professional, playful, high contrast)  
- **Manual Overrides** (hex/RGB)  
- **Automatic Layout Color Mapping** (primary?buttons, accent?headlines, etc.)  
- **Light & Dark Modes** with adjustable intensity levels  

### Save & Export
- **Save Palettes** to user dashboard  
- **Export Options**  
  ? HTML/CSS code  
  ? PDF (FREE: watermarked, plain layout; PRO: branded, high-res screenshot, no watermark)  
- **Upgrade Teasers** for PRO-only exports  

### Monetization & User Management
- **Coin-Based System**: purchase coins to unlock templates or subscription plans  
- **Subscription Tiers**: FREE, PRO, PRO+ (configurable features per tier)  
- **Admin Dashboard**: manage users, templates, coins, subscriptions, view reports  
- **Customer Dashboard**: edit, save palettes, download history, coin balance  

---

## Tech Stack & Architecture

- **Frontend**: React, TypeScript, Context API, CSS Modules / Tailwind CSS  
- **Backend**: Node.js, Express, RESTful APIs, JWT Authentication  
- **Database**: MongoDB (Mongoose schemas for users, coins, subscriptions, templates, palettes)  
- **CI/CD**: GitHub Actions (linting, unit & integration tests, deploy)  

The application follows a layered architecture:

1. **Presentation Layer**: React Components & Pages  
2. **Business Logic**: Context Providers, Controllers  
3. **Data Access**: Express Routes & Mongoose Models  

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/color-generator.git
cd color-generator

# 2. Install dependencies (frontend & backend)
npm install
# or
yarn install

# 3. Configure environment variables
cp component3.env .env
# Edit .env with your MongoDB URI, JWT secret, API keys, etc.

# 4. Run in development
npm run dev
# or
yarn dev

# 5. Build and serve
npm run build
npm start
```

---

## Usage

1. Open `http://localhost:3000` in your browser.  
2. Browse free/pro templates in the **Template Selector**.  
3. Click a preview card to open the **Template Details Panel**.  
4. Use **Generate Colors** or pick a scheme & mood.  
5. Manually override colors via the **Color Overrides** panel.  
6. Toggle **Light/Dark Mode** or enter **Full-Screen Preview**.  
7. Save your palette or click **Download/Export** to get HTML/CSS or PDF.  
8. If locked, follow the prompts in the **Subscription** or **Coin Purchase** modals.  
9. Admins can log in to `http://localhost:3000/admin` to manage the system.

---

## Components

### Frontend Components (src/components)
- **TemplateSelector.tsx**: Browse & pick free/pro templates.  
- **TemplatePreviewCard.tsx**: Live mini-preview with hover & expand.  
- **TemplateDetailsPanel.tsx**: Show template info & quick actions.  
- **ColorGenerator.tsx**: One-click palette generation (chroma-js).  
- **ColorSchemeSelector.tsx** & **ColorMoodSelector.tsx**: Scheme/mood pickers.  
- **ColorOverrides.tsx**: Hex/RGB manual color edits.  
- **ColorMapping.tsx**: Maps palette roles to UI elements.  
- **LightDarkToggle.tsx**: Toggles theme & intensity.  
- **FullScreenPreviewOverlay.tsx**: Full-screen view with action controls.  
- **HeaderSection.tsx** & **HeroSection.tsx**: Editable layout sections.  
- **DownloadExportControls.tsx**: Export HTML/CSS or PDF with PRO logic.  
- **SubscriptionModal.tsx** & **CoinPurchaseModal.tsx**: Monetization flows.  
- **LandingPage.tsx** & **LivePreviewEmbed.tsx**: Public marketing page with app embed.  
- **Navbar.tsx** & **Sidebar.tsx**: Global navigation & dashboard menu.  

### Pages & Providers
- **App.tsx**, **index.tsx**: Root components with routing & context providers.  
- **TemplateEditor.tsx**: Combines selection & editing tools.  
- **AdminDashboard.tsx** & **CustomerDashboard.tsx**: User management interfaces.  
- **Login.tsx** & **Register.tsx**: Authentication forms.  

### Backend (src/server)
- **server.js** / **app.js**: Express setup & middleware.  
- Routes: **users.js**, **coins.js**, **subscriptions.js**, **templateroutes.js**, **paletteRoutes.js**  
- Controllers: **userController.js**, **coinController.js**, **subscriptionController.js**, **templateController.js**, **paletteController.js**  
- Models: **userModel.js**, **coinModel.js**, **subscriptionModel.js**, **templateModel.js**, **paletteModel.js**  

---

## Dependencies

Frontend
- React, React DOM, React Router  
- TypeScript  
- chroma-js (color algorithms)  
- react-color-picker  
- Tailwind CSS or CSS Modules  

Backend
- Node.js, Express  
- mongoose (MongoDB ODM)  
- jsonwebtoken (JWT auth)  
- bcryptjs (password hashing)  
- cors, dotenv  

Dev & CI
- Jest, React Testing Library  
- ESLint, Prettier  
- GitHub Actions  

---

## Environment Variables

Create a `.env` file with:

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
# Optional API keys (e.g., for external color services)
COLOR_API_KEY=your_key_here
```

---

## Project Structure

```
/
?? .github/workflows/ci.yml
?? component3.env (.env example)
?? package.json
?? tsconfig.json
?? public/
?  ?? index.html
?? src/
   ?? index.tsx
   ?? App.tsx
   ?? index.css
   ?? components/
   ?? pages/
   ?? contexts/
   ?? server/
   ?? utils/
```

---

## Contributing

1. Fork the repository.  
2. Create a feature branch: `git checkout -b feature/YourFeature`  
3. Commit changes: `git commit -m "Add YourFeature"`  
4. Push branch: `git push origin feature/YourFeature`  
5. Open a Pull Request.  

Please follow the existing code style, include tests for new features, and ensure CI passes.

---

## License

MIT License ? 2024 Your Name / Your Organization.