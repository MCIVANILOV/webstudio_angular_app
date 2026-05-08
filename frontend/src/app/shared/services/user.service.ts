import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {UserInfoType} from "../../../types/user-info.type";
import {BehaviorSubject, catchError, Observable, tap, throwError} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {environment} from "../../../environments/environment";
import {AuthService} from "../../core/auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubject = new BehaviorSubject<UserInfoType | null>(null);

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserInfo(): Observable<UserInfoType | DefaultResponseType> {
    const tokens = this.authService.getTokens();

    if (!tokens || !tokens.accessToken) {
      // Токена нет, можно выбросить ошибку или вернуть пустой Observable
      return new Observable(observer => {
        observer.error('Нет access токена');
      });
    }

    const headers = new HttpHeaders().set('x-auth', `${tokens.accessToken}`);

    return this.http.get<UserInfoType | DefaultResponseType>(environment.api + 'users', { headers }).pipe(
      tap(response => {
        if ('name' in response) {
          this.userSubject.next(response as UserInfoType);
        } else {
          this.userSubject.next(null);
        }
      }),
      catchError(error => {
        // Обработка ошибок, например, 401 — токен просрочен
        console.error('Ошибка при получении данных пользователя', error);
        return throwError(error);
      })
    );
  }

  get currentUser$(): Observable<UserInfoType | null> {
    return this.userSubject.asObservable();
  }

  // можно добавить метод для сброса/выхода
  clearUser() {
    this.userSubject.next(null);
  }
}
