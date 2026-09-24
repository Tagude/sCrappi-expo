import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
/* Importamos esta función, llamando libreria para usar llamados http */
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(), // 👈 Se agrega a la lista de proveedores
    { provide: LOCALE_ID, useValue: 'es-CO' }, // 👈 Establece español de Colombia
  ],
};
