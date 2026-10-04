import { HttpInterceptorFn } from '@angular/common/http';

/** Envía la cookie de sesión (JSESSIONID) en todas las peticiones a la API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => next(req.clone({ withCredentials: true }));
