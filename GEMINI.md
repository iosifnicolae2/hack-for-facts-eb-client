# Project Overview

This is a web application for analyzing public spending data. It is designed for the public sector and journalists to easily find anomalies in public spending. The application provides features for anomaly detection and data exploration through an intuitive interface. A key feature is the AI Filter Generator, which allows users to generate filters using natural language queries.

**Key Technologies:**

*   **Frontend:** React.js, Tailwind CSS, TypeScript, Shadcn UI
*   **Data Fetching:** Tanstack Query, Axios
*   **Routing:** Tanstack Router
*   **State Management:** Zustand
*   **Build Tool:** Vite
*   **Testing:** Manual testing

# Building and Running

**Installation:**

```bash
yarn install
```

**Running the development server:**

```bash
yarn dev
```

**Building the application:**

```bash
yarn build
```

**Running tests:**

No tests yet. Only manual testing.

# Development Conventions

*   The project uses TypeScript for static typing.
*   ESLint is used for linting. You can run the linter with `yarn lint`.
*   The project follows the conventional commits specification for commit messages.
*   The application uses Tanstack Router for routing. Route definitions are generated automatically. To regenerate the routes, run `yarn router:generate`.
*   For type checking, run `npx tsc -b --noEmit`.
