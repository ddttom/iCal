# iCal Manager Style Guide

This document outlines the design system used in the iCal Manager application.

## Design Philosophy

The UI aims for a "Team of Experts" aesthetic: professional, clean, and trustworthy. It uses a modern tech stack feel with glassmorphism effects, consistent iconography, and a refined color palette.

## Colors

### Light Theme

- **Primary**: Indigo 600 (`#4f46e5`) - Used for primary actions and accents.
- **Secondary**: Pink 600 (`#db2777`) - Used for gradients and secondary accents.
- **Background**: Slate 50 (`#f8fafc`) - Main page background.
- **Card Background**: White (`#ffffff`) - Content containers.
- **Text**: Slate 900 (`#0f172a`) - High contrast text.
- **Text Muted**: Slate 600 (`#475569`) - Secondary text.

### Dark Theme

- **Primary**: Indigo 400 (`#818cf8`)
- **Secondary**: Pink 400 (`#f472b6`)
- **Background**: Slate 900 (`#0f172a`)
- **Card Background**: Slate 800 (`#1e293b`)
- **Text**: Slate 50 (`#f8fafc`)

## Typography

- **Font Family**: 'Inter', sans-serif.
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold).

## Iconography

We use **Phosphor Icons** for a consistent, professional look.

- **Library**: `@phosphor-icons/web`
- **Style**: Regular weight for most icons, filled/bold for active states if needed.
- **Usage**: `<i class="ph ph-icon-name"></i>`

## Components

### Header

- **Position**: Fixed at the top.
- **Style**: Glassmorphism (blur effect) background.
- **Content**: Logo, View Toggles, Action Buttons.

### Buttons

#### Primary Button

- **Usage**: Main call to action (e.g., Save).
- **Style**: Gradient background, white text, rounded corners.

#### Secondary Button

- **Usage**: Alternative actions (e.g., Import, New Event).
- **Style**: Outline or light background, rounded corners.

#### Icon Buttons

- **Usage**: Contextual actions (Edit, Delete, View).
- **Style**: Square aspect ratio, centered icon, rounded corners (`0.5rem`).
  - **Edit**: Indigo tint background, Pencil icon.
  - **Delete**: Red tint background, Trash icon.
  - **View**: Slate tint background, Code icon.

### Toolbar

- **Position**: Below the fixed header.
- **Content**: Search bar and date filters.
- **Search Bar**: Rounded input with internal icon.
