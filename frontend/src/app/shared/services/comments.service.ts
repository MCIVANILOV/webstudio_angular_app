import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {CommentType} from "../../../types/comment.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {AuthService} from "../../core/auth/auth.service";
import {CommentActionType} from "../../../types/comment-action.type";
import {CommentUserActionType} from "../../../types/comment-user-action.type";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private baseUrl = environment.api + 'comments';

  constructor(private http: HttpClient,
              private authService: AuthService) {
  }

  getCommentsResponse(articleId: string, offset = 0)
    : Observable<{ allCount: number; comments: CommentType[] }> {
    const params = new HttpParams()
      .set('article', articleId)
      .set('offset', offset.toString());

    return this.http.get<{ allCount: number; comments: CommentType[] }>(this.baseUrl, {params})
      .pipe(
        map(resp => ({
          allCount: resp.allCount,
          comments: resp.comments
        }))
      )
  }

  postComment(articleId: string, text: string): Observable<DefaultResponseType> {
    const body = { article: articleId, text };
    const tokens = this.authService.getTokens();
    const headers = new HttpHeaders().set('x-auth', `${tokens.accessToken}`);
    return this.http.post<DefaultResponseType>(this.baseUrl, body, { headers });
  }

  postCommentAction(commentId: string, action: CommentActionType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(
      `${environment.api}comments/${commentId}/apply-action`,
      { action }
    );
  }

  getCommentActions(commentId: string): Observable<DefaultResponseType | ('like' | 'dislike')[]> {
    return this.http.get<DefaultResponseType | ('like' | 'dislike')[]>(
      `${environment.api}comments/${commentId}/actions`
    );
  }

  getArticleCommentActions(articleId: string): Observable<DefaultResponseType | CommentUserActionType[]> {
    return this.http.get<DefaultResponseType | CommentUserActionType[]>(
      `${environment.api}comments/article-comment-actions`,
      {
        params: new HttpParams().set('articleId', articleId)
      }
    );
  }
}
