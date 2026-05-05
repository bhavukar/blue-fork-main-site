# Blue Fork Main Site

A minimalist, professional interactive 3D landing page for Blue Fork Pvt. Ltd. The site features a metallic blue utensil fork in a clean environment, emphasizing "Excellence in simplicity."

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using `@tailwindcss/vite`)
- **3D Engine**: [Three.js](https://threejs.org/)
- **React 3D Bindings**: [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) and [@react-three/drei](https://github.com/pmndrs/drei)
- **Language**: TypeScript

## Project Structure

- `src/App.tsx`: The main application entry point containing the 3D scene (`Scene`), the 3D model logic (`BlueFork`), and the UI overlay.
- `src/main.tsx`: React DOM rendering and entry.
- `src/index.css`: Global styles including custom fonts and Tailwind directives.
- `public/`: Static assets.

## Key Features

- **Interactive 3D Fork**: A custom-built 3D fork model that reacts to mouse movement and hover states.
- **Theme Support**: Dynamic Light/Dark mode with a custom circular reveal transition.
- **Responsive Design**: Adapts the 3D camera and UI for mobile and desktop viewports.
- **High-End Aesthetics**: Uses `MeshReflectorMaterial` for ground reflections and `ContactShadows` for depth.

## Development Commands

- `npm install`: Install project dependencies.
- `npm run dev`: Launch the Vite development server.
- `npm run build`: Run TypeScript type-checking (`tsc -b`) and compile the production build.
- `npm run lint`: Execute ESLint for code quality checks.
- `npm run preview`: Serve the locally built production files for testing.

## Coding Conventions

- **Component Structure**: Functional components with hooks. 3D logic is encapsulated within R3F-specific components.
- **Styling**: Utility-first CSS using Tailwind CSS v4. Custom fonts (`Bebas Neue`, `Plus Jakarta Sans`) are used for branding.
- **Type Safety**: Strict TypeScript usage for props and state.
- **3D Primitives**: The fork model is built using geometric primitives (`cylinderGeometry`, `boxGeometry`) rather than external GLTF models for performance and styling flexibility.
