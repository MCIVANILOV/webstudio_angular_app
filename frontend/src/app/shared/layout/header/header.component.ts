import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {Subject} from "rxjs";
import {ScrollService} from "../../services/scroll.service";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isLogged: boolean = false;
  user: UserInfoType | null = null;

  activeSection: string = '';
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private userService: UserService,
              public scrollService: ScrollService) {

    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    if (this.router.url === '/') {
      this.scrollService.checkActiveSection();
    }

    this.scrollService.activeSection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(section => {
        this.activeSection = section;
      });


    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    })

    this.userService.getUserInfo().subscribe();
    this.userService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrollService.onWindowScroll();
  }

  goToSection(section: string): void {
    this.scrollService.scrollTo(section);
  }

  isCatalogActive(): boolean {
    return this.scrollService.isCatalogActive();
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      })
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
    this.userService.clearUser();
  }

}
