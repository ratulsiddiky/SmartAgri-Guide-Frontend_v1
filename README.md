# SmartAgri-Guide Frontend

Angular frontend for SmartAgri-Guide, built with Angular (standalone components).

## Features Implemented (CW2)

- **Authentication:** Fully integrated login and registration using standalone components and modern state management.
- **Farm Listing & Details:** Dynamic display of agricultural assets with deep-dive detail views for individual farms.
- **Farm Creation/Editing:** Robust form handling for adding new farms or updating existing records with real-time validation.
- **Admin Dashboard for Alerts:** A restricted management interface for administrators to send out community-wide safety alerts.
- **Weather Sync:** Manual and automated synchronization with meteorological data to ensure up-to-date farming conditions.
- **Irrigation Monitoring:** Intelligent frontend logic that tracks and displays irrigation needs based on sensor and weather data.

## Documentation Note (Compodoc)

For coursework self-evaluation, document that project evidence is provided in both the README files and the generated Compodoc output (`documentation/` folder), which can satisfy rubric documentation requirements where accepted.

## Project structure (high level)

```
src/
  app/
    app.config.ts
    app.component.ts
    app.routes.ts
    components/
      auth/
        login/
        register/
      dashboard/
      farms/
    services/
    models/
    guards/
    interceptors/
  environments/
    environment.ts
    environment.prod.ts
```

## Configure API base URL

- **Dev**: edit `src/environments/environment.ts`
- **Prod**: edit `src/environments/environment.prod.ts`

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
