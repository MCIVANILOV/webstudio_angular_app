import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ArticleType} from "../../../types/article.type";
import {environment} from "../../../environments/environment";

interface ArticlesResponse {
  count: number;
  pages: number;
  items: ArticleType[];
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private baseUrl = environment.api + 'articles';
  constructor(private http: HttpClient) {
  }

  getPopularArticles(): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/top')
  }

  getRelatedArticles(url: string): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/related/' + url)
  }

  getArticles(filters?: {
    categories?: string[],
    page?: number
  }): Observable<ArticlesResponse> {
    let params = new HttpParams();

    if (filters?.categories && filters.categories.length) {
      filters.categories.forEach(url =>
        params = params.append('categories[]', url)
      );
    }

    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }

    return this.http.get<ArticlesResponse>(this.baseUrl, {params});
  }

  getArticle(url: string): Observable<ArticleType> {
    return this.http.get<ArticleType>(environment.api + 'articles/' + url);
  }
}
