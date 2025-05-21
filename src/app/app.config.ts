// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router'; // Keep if routing might be added later
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Required for many PrimeNG components
import { PrimeNGConfig } from 'primeng/api';

// If you plan to use app.routes.ts for routing (even if empty now)
// import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // provideRouter(appRoutes), // Uncomment if you add routes
    provideClientHydration(),
    importProvidersFrom([
      BrowserAnimationsModule,
    ]),
    {
      provide: PrimeNGConfig,
      useFactory: () => {
        const config = new PrimeNGConfig();
        config.ripple = true; // Enable ripple effect globally
        return config;
      }
    }
  ]
};