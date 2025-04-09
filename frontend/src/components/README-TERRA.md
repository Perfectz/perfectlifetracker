# Terra Design System Components

This directory contains components for the Terra Design System implementation of PerfectLifeTrack Pro. The Terra design uses a specific color palette and UI conventions to create a cohesive look and feel.

## Terra Color Palette

- **Pearl (#E8DDCB)**: Used for backgrounds
- **Soft Teal (#70A9A1)**: Used for borders and accents
- **Tropical Rain Forest (#036564)**: Used for interactive elements and buttons
- **Prussian Blue (#033649)**: Used for app bars and important text
- **Maastricht Blue (#031634)**: Used for primary text

## Component Architecture

### Layout Components

- **TerraLayout**: Main layout component that wraps all other components and handles responsive behavior
- **TerraAppBar**: App bar with searchbox and user avatar
- **TerraLeftNavigation**: Desktop navigation drawer (200px width)
- **TerraBottomNavigation**: Mobile navigation bar (bottom of screen)

### Card Components

- **GoalsCard**: Displays goals with progress bars
- **FitnessMetricsCard**: Shows fitness metrics with circular progress indicator
- **TasksCard**: Shows task checklist with interactive checkboxes
- **DevelopmentCard**: Shows personal development tracks with progress bars

### UI Elements

- **TerraFAB**: Floating Action Button with Terra styling
- **TerraMobileView**: Mockup of mobile app interface

## Usage

### Terra Layout

```jsx
<TerraLayout>
  {/* Your content here */}
</TerraLayout>
```

### Card Components

```jsx
<GoalsCard />
<FitnessMetricsCard />
<TasksCard />
<DevelopmentCard />
```

### Floating Action Button

```jsx
<TerraFAB 
  size="large" 
  aria-label="add" 
  onClick={() => console.log('FAB clicked')}
/>
```

## Demo Pages

These components are demonstrated on two pages:

1. `/terra-design`: Shows the design components in isolation
2. `/terra-layout`: Shows the components within the Terra layout system

## Implementation Notes

- All components use the `terraColors` object exported from the theme file
- Components are responsive and adapt to desktop and mobile viewports
- The layout automatically handles the switch between desktop and mobile views
- Card components use static mock data for demonstration purposes 