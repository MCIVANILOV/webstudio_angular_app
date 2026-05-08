import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ArticleService} from "../../../shared/services/article.service";
import {ArticleType} from "../../../../types/article.type";
import {ActiveParams} from "../../../../types/active-params";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryType} from "../../../../types/category.type";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})

export class CatalogComponent implements OnInit {
  allArticles: ArticleType[] = [];
  categories: CategoryType[] = [];

  filteredArticles: ArticleType[] = [];
  activeParams: ActiveParams = {categories: [], page: 1};
  pages: number[] = [];
  sortingOpen = false;

  private selectedCategoryUrlsSubject = new BehaviorSubject<string[]>([]);
  selectedCategoryUrls$ = this.selectedCategoryUrlsSubject.asObservable();

  selectedCategory: string | null = null;
  selectedCategoryUrl: string | null = null;
  @ViewChild('sortingContainer', {static: true}) sortingContainer!: ElementRef;
  @ViewChild('sortingRef', {static: true}) sortingRef!: ElementRef;

  constructor(private articleService: ArticleService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private categoryService: CategoryService) {
  }

  ngOnInit(): void {
    this.categoryService.getCategories()
      .subscribe(c => this.categories = c);

    this.activatedRoute.queryParams
      .subscribe(params => {
        const urls = params['categories[]'];
        const cats = Array.isArray(urls) ? urls : urls ? [urls] : [];

        this.activeParams = {
          categories: cats,
          page: params['page'] ? +params['page'] : 1
        };

        this.loadArticles();
      });
  }

  private loadArticles(): void {
    this.articleService.getArticles({
      categories: this.activeParams.categories,
      page: this.activeParams.page
    })
      .subscribe(data => {
        this.allArticles = data.items;
        this.filteredArticles = data.items;
        this.pages = Array.from({length: data.pages}, (_, i) => i + 1);
      });
  }

  toggleFilters(): void {
    this.sortingOpen = !this.sortingOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.sortingOpen && !this.sortingContainer.nativeElement.contains(event.target)) {
      this.sortingOpen = false;
    }
  }

  toggleFilter(categoryUrl: string, event: MouseEvent): void {
    event.stopPropagation();   // не уходим наружу панели
    const set = new Set(this.activeParams.categories);
    if (set.has(categoryUrl)) set.delete(categoryUrl);
    else                       set.add(categoryUrl);

    // сбрасываем на первую страницу
    this.router.navigate([], {
      queryParams: {
        'categories[]': Array.from(set),
        page: 1
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onRemoveFilter(url: string, e: MouseEvent): void {
    e.preventDefault();
    this.toggleFilter(url, e);
  }

  isCategoryActive(url: string): boolean {
    return this.activeParams.categories.includes(url);
  }

  findCategoryName(url: string): string {
    const c = this.categories.find(x => x.url === url);
    return c ? c.name : url;
  }

  openPage(page: number): void {
    this.router.navigate([], {
      queryParams: {page},
      queryParamsHandling: 'merge',
      // replaceUrl: true
    });
  }

  applyFilter(): void {
    const selectedUrls = this.selectedCategoryUrlsSubject.value;

    if (selectedUrls.length === 0) {
      this.filteredArticles = [...this.allArticles];
      return;
    }

    this.filteredArticles = this.allArticles.filter(article => {
      const cat = this.categories.find(c => c.id === article.category || c.url === article.category);
      if (!cat) return false;

      return selectedUrls.includes(cat.url);
    });
  }

  openPrevPage() {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    }
  }

  openNextPage() {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      });
    }
  }

}
