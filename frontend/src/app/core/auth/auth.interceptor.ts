import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, switchMap, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {DefaultResponseType} from "../../../types/default-response.type";
import {LoginResponseType} from "../../../types/login-response.type";
import {Router} from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/login') || req.url.includes('/refresh')) {
      return next.handle(req);
    }

    const tokens = this.authService.getTokens();

    if (!tokens?.accessToken) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        'x-auth': tokens.accessToken,
        'x-access-token': tokens.accessToken,
        'Authorization': `Bearer ${tokens.accessToken}`
      }
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(authReq, next);
        }

        return throwError(() => error);
      })
    );
  }


  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refresh().pipe(
      switchMap((result: DefaultResponseType | LoginResponseType) => {
        console.log('REFRESH RESULT:', result);

        if ((result as DefaultResponseType).error) {
          return throwError(() => new Error((result as DefaultResponseType).message));
        }

        const refreshResult = result as LoginResponseType;

        if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.userId) {
          return throwError(() => new Error('Ошибка авторизации'));
        }

        this.authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);

        const authReq = req.clone({
          setHeaders: {
            'x-auth': refreshResult.accessToken,
            'x-access-token': refreshResult.accessToken,
            'Authorization': `Bearer ${refreshResult.accessToken}`
          }
        });

        return next.handle(authReq);
      }),
      catchError((error) => {
        this.authService.removeTokens();
        this.router.navigate(['/']);
        return throwError(() => error);
      })
    );
  }
}
