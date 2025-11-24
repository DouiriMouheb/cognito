### Project Development Guide and Architecture Overview

This document outlines the structure, technologies, and development patterns used in this React-based web application.

#### 1. Core Technologies

*   **Frontend Framework:** [React](https://reactjs.org/) (v18) for building the user interface.
*   **Build Tool:** [Vite](https://vitejs.dev/) for fast development and optimized builds.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow.
*   **Language:** JavaScript with JSDoc for type annotations.
*   **Containerization:** [Docker](https://www.docker.com/) for creating a consistent development and production environment.
*   **Web Server:** [Caddy](https://caddyserver.com/) as a reverse proxy and for serving the application.
*   **Linting:** [ESLint](https://eslint.org/) for code quality and consistency.

#### 2. Project Structure

The project follows a feature-oriented and domain-driven structure within the `src` directory. This organization keeps related logic, components, and services together, making the codebase easier to navigate and maintain.

```
/
├── Caddyfile              # Caddy web server configuration
├── docker-compose.yml     # Docker Compose for multi-container setup
├── Dockerfile             # Docker configuration for the application
├── package.json           # Project dependencies and scripts
├── vite.config.js         # Vite build and development configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── public/                # Static assets that are not processed by Vite
└── src/                   # Main application source code
    ├── assets/            # Images, fonts, and other static assets
    ├── components/        # Reusable React components
    │   ├── common/        # Generic, reusable components (Button, Modal, etc.)
    │   └── Timesheets/    # Components specific to the Timesheets feature
    ├── constants/         # Application-wide constants (e.g., API endpoints, UI strings)
    ├── context/           # React Context for global state management
    ├── hooks/             # Custom React hooks for shared logic
    ├── services/          # Modules for interacting with external APIs
    ├── types/             # JSDoc type definitions for objects and props
    └── utils/             # Utility and helper functions
```

#### 3. Development Workflow

1.  **Setup:**
    *   Run `npm install` to install dependencies.
    *   Create a `.env` file based on `.env.example` (if it exists) to configure environment variables.

2.  **Running the Development Server:**
    *   Use `npm run dev` to start the Vite development server with hot module replacement.
    *   Alternatively, use `docker-compose up` to run the application within a Docker container, which is closer to the production environment.

3.  **Building for Production:**
    *   Run `npm run build` to create an optimized production build in the `dist` directory.

4.  **Creating New Features:**
    *   **Components:** Create new components in the `src/components` directory. If a component is reusable across different features, place it in `src/components/common`. Otherwise, create a new folder within `src/components` for the feature (e.g., `src/components/NewFeature/`).
    *   **Services:** For new API endpoints, add a new service file in `src/services` (e.g., `newFeatureService.js`). This service should encapsulate all API calls related to that feature.
    *   **Hooks:** If you have complex or reusable logic (like data fetching, form handling, etc.), create a custom hook in `src/hooks`.
    *   **State Management:** For state that needs to be shared across multiple components, use the `AppContext` in `src/context/AppContext.jsx`.

#### 4. Key Concepts and Patterns

*   **Component-Based Architecture:** The UI is built from small, reusable components. This promotes separation of concerns and makes the UI easier to manage.
*   **Service Layer:** API interactions are abstracted into a service layer (`src/services`). This decouples the UI from the data fetching logic, making it easier to switch API providers or mock data for testing.
*   **Custom Hooks:** Custom hooks (`src/hooks`) are used to extract and reuse component logic. The `useApi` and `useDataFetch` hooks provide a standardized way to handle data fetching, loading states, and errors.
*   **Centralized State Management:** Global application state is managed using React's Context API (`src/context/AppContext.jsx`). This provides a single source of truth for data that is shared across the application.
*   **Utility-First CSS:** Tailwind CSS is used for styling. This approach allows for rapid UI development without writing custom CSS.
*   **Environment Variables:** The application uses environment variables for configuration (e.g., API base URLs). These are validated at runtime using `src/utils/envValidator.js`.

#### 5. Recommendations for Future Development

*   **Maintain the Structure:** Continue to follow the established project structure. This will ensure the codebase remains organized and easy to understand as it grows.
*   **Write JSDoc:** Continue to use JSDoc to document components, functions, and types. This improves code clarity and helps prevent bugs.
*   **Create Reusable Components:** When building new UI elements, always consider if they can be made into reusable components and placed in `src/components/common`.
*   **Abstract Logic into Hooks:** For any logic that is not directly related to rendering, consider extracting it into a custom hook.
*   **Write Unit and Integration Tests:** Consider adding a testing framework like [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) to ensure the application is reliable and to prevent regressions.

This guide should provide a solid foundation for working on this project and for structuring future projects. The architecture is modern, scalable, and follows best practices for React development.