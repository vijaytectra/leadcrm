# CRM Frontend

A modern Customer Relationship Management (CRM) dashboard built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful UI components
- **ESLint** for code quality
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   └── ui/             # shadcn/ui components
└── lib/                # Utility functions
    └── utils.ts         # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Beautiful icons
- **ESLint** - Code linting

## Components

The project includes these shadcn/ui components:

- Button
- Card
- Input
- Label

## Customization

### Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

### Styling

The project uses Tailwind CSS for styling. You can customize the design system in:

- `tailwind.config.ts` - Tailwind configuration
- `src/app/globals.css` - Global styles and CSS variables

## Deployment

The project is ready for deployment on Vercel, Netlify, or any other platform that supports Next.js.

## License

This project is private and proprietary.
