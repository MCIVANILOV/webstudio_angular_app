import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private isScrolling = false;

  private sections = ['services', 'about-us', 'reviews', 'contacts'];

  private activeSectionSubject = new BehaviorSubject<string>('');
  activeSection$ = this.activeSectionSubject.asObservable();

  private showBackToTopSubject = new BehaviorSubject<boolean>(false);
  showBackToTop$ = this.showBackToTopSubject.asObservable();

  private readonly backToTopThreshold = 200;

  constructor(private router: Router) {
    this.initRouterEvents();
    this.initScrollListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollTo(section: string): void {
    this.isScrolling = true;

    this.router.navigate(['/'], { fragment: section }).then(() => {
      this.setActiveSection(section);

      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }

        setTimeout(() => {
          this.isScrolling = false;
        }, 500);
      }, 100);
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isCatalogActive(): boolean {
    const url = this.router.url;
    return url === '/catalog' || url.startsWith('/articles');
  }

  isMainPage(): boolean {
    const url = this.router.url;
    return url === '/' || url.split('?')[0].split('#')[0] === '/';
  }

  setActiveSection(section: string): void {
    this.activeSectionSubject.next(section);
  }

  private initRouterEvents(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.isMainPage()) {
          setTimeout(() => this.checkActiveSection(), 100);
        } else if (!this.isCatalogActive()) {
          this.setActiveSection('');
        }
      }
    });
  }

  private initScrollListener(): void {
    fromEvent(window, 'scroll')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onWindowScroll();
      });
  }

  public onWindowScroll(): void {
    // Проверка секций на главной странице
    if (this.isMainPage() && !this.isScrolling) {
      this.checkActiveSection();
    }

    // Проверка кнопки "Наверх"
    this.checkBackToTop();
  }

  public checkActiveSection(): void {
    const scrollPosition = window.scrollY + 150;

    for (const section of this.sections) {
      const element = document.getElementById(section);
      if (element) {
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;

        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          this.setActiveSection(section);
          return;
        }
      }
    }

    const firstSection = document.getElementById(this.sections[0]);
    if (firstSection && scrollPosition < firstSection.offsetTop) {
      this.setActiveSection('');
    }
  }

  private checkBackToTop(): void {
    const shouldShow = window.scrollY > this.backToTopThreshold;
    this.showBackToTopSubject.next(shouldShow);
  }
}
