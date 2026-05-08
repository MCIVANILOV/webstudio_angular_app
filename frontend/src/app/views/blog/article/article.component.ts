// import {Component, OnInit} from '@angular/core';
// import {ArticleType} from "../../../../types/article.type";
// import {ArticleService} from "../../../shared/services/article.service";
// import {ActivatedRoute} from "@angular/router";
// import {environment} from "../../../../environments/environment";
// import {AuthService} from "../../../core/auth/auth.service";
// import {CommentType} from "../../../../types/comment.type";
// import {CommentsService} from "../../../shared/services/comments.service";
// import {CommentUserActionType} from "../../../../types/comment-user-action.type";
//
// @Component({
//   selector: 'app-article',
//   templateUrl: './article.component.html',
//   styleUrls: ['./article.component.scss']
// })
// export class ArticleComponent implements OnInit {
//
//   article!: ArticleType;
//   relatedArticles: ArticleType[] = [];
//   allComments: CommentType[] = [];
//   displayedComments: CommentType[] = [];
//   totalCommentsCount = 0;
//   readonly initialPageSize = 3;
//   readonly loadMorePageSize = 10;
//   isCommentsLoading = false;
//   serverStaticPath = environment.serverStaticPath;
//   commentsOffset = 0;
//   newCommentText = '';
//   isLoggedIn: boolean = false;
//
//   constructor(private authService: AuthService,
//               private articleService: ArticleService,
//               private commentsService: CommentsService,
//               private activatedRoute: ActivatedRoute) {
//   }
//
//   ngOnInit(): void {
//     this.isLoggedIn = this.authService.getIsLoggedIn();
//
//     this.authService.isLogged$.subscribe(status => {
//       this.isLoggedIn = status;
//
//       if (status && this.article?.id && this.allComments.length) {
//         this.loadUserActionsForComments();
//       }
//
//       if (!status) {
//         this.allComments = this.allComments.map(comment => ({
//           ...comment,
//           userReaction: null,
//           violateSent: false
//         }));
//         this.displayedComments = this.allComments.slice(0, this.commentsOffset);
//       }
//     });
//
//     this.activatedRoute.params.subscribe(params => {
//       const url = params['url'];
//
//       this.articleService.getArticle(url)
//         .subscribe(data => {
//           this.article = data;
//           this.loadComments();
//         });
//
//       this.articleService.getRelatedArticles(url)
//         .subscribe((data: ArticleType[]) => {
//           this.relatedArticles = data;
//         });
//     });
//   }
//
//   private loadComments(): void {
//     this.isCommentsLoading = true;
//
//     this.commentsService.getCommentsResponse(this.article.id)
//       .subscribe({
//         next: (resp) => {
//           // Сохраняем все комментарии
//           this.allComments = resp.comments;
//           this.totalCommentsCount = resp.allCount;
//
//           // Показываем первые initialPageSize комментариев (3)
//           this.commentsOffset = Math.min(this.initialPageSize, this.totalCommentsCount);
//           this.displayedComments = this.allComments.slice(0, this.commentsOffset);
//
//           this.isCommentsLoading = false;
//           console.log('Первая загрузка:', {
//             'всего': this.totalCommentsCount,
//             'показано': this.commentsOffset,
//             'осталось': this.totalCommentsCount - this.commentsOffset
//           });
//         },
//         error: (err) => {
//           console.error('Ошибка загрузки комментариев:', err);
//           this.isCommentsLoading = false;
//         }
//       });
//     if (this.isLoggedIn && this.allComments.length) {
//       this.loadUserActionsForComments();
//     } else {
//       this.isCommentsLoading = false;
//     }
//   }
//
//   private loadUserActionsForComments(): void {
//     this.commentsService.getArticleCommentActions(this.article.id).subscribe({
//       next: (resp) => {
//         const actionMap = new Map<string, 'like' | 'dislike'>();
//
//         if (Array.isArray(resp)) {
//           (resp as CommentUserActionType[]).forEach(item => {
//             actionMap.set(item.comment, item.action);
//           });
//         }
//
//         this.allComments = this.allComments.map(comment => ({
//           ...comment,
//           userReaction: actionMap.get(comment.id) ?? null
//         }));
//
//         this.displayedComments = this.allComments.slice(0, this.commentsOffset);
//         this.isCommentsLoading = false;
//       },
//       error: (err) => {
//         console.error('Ошибка загрузки действий пользователя:', err);
//         this.isCommentsLoading = false;
//       }
//     });
//   }
//
//   loadMoreComments(): void {
//     // Вычисляем, сколько еще можно подгрузить
//     const nextOffset = Math.min(
//       this.commentsOffset + this.loadMorePageSize,
//       this.totalCommentsCount
//     );
//
//     // Обновляем список отображаемых комментариев
//     this.displayedComments = this.allComments.slice(0, nextOffset);
//     this.commentsOffset = nextOffset;
//
//     console.log('Дозагрузка:', {
//       'теперьПоказано': this.commentsOffset,
//       'всего': this.totalCommentsCount,
//       'осталось': this.totalCommentsCount - this.commentsOffset
//     });
//   }
//
//   shouldShowLoadMoreButton(): boolean {
//     return this.commentsOffset < this.totalCommentsCount;
//   }
//
//   submitComment(): void {
//     const text = this.newCommentText.trim();
//     if (!text) return;
//
//     this.isCommentsLoading = true;
//
//     this.commentsService.postComment(this.article.id, text).subscribe({
//       next: (resp: any) => {
//         const createdComment: CommentType | null =
//           resp.comment ?? resp.newComment ?? null;
//
//         this.newCommentText = '';
//
//         if (createdComment) {
//           this.allComments.unshift({
//             ...createdComment,
//             userReaction: null,
//             violateSent: false
//           });
//
//           this.totalCommentsCount += 1;
//
//           const newDisplayedCount = Math.min(this.commentsOffset + 1, this.totalCommentsCount);
//           this.displayedComments = this.allComments.slice(0, newDisplayedCount);
//           this.commentsOffset = newDisplayedCount;
//         } else {
//           this.loadComments();
//           return;
//         }
//
//         this.isCommentsLoading = false;
//       },
//       error: (err) => {
//         console.error('Ошибка добавления комментария:', err);
//         this.isCommentsLoading = false;
//         this.newCommentText = '';
//         alert('Не удалось отправить комментарий');
//       }
//     });
//   }
//
//   reactComment(comment: CommentType, action: 'like' | 'dislike'): void {
//     if (!this.isLoggedIn) {
//       alert('Чтобы поставить реакцию, нужно авторизоваться');
//       return;
//     }
//
//     const previousReaction = comment.userReaction;
//
//     this.commentsService.postCommentAction(comment.id, action).subscribe({
//       next: () => {
//         // если нажали ту же самую реакцию — это снятие
//         if (previousReaction === action) {
//           if (action === 'like') {
//             comment.likesCount = Math.max(0, comment.likesCount - 1);
//           } else {
//             comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
//           }
//
//           comment.userReaction = null;
//           return;
//         }
//
//         // если была противоположная реакция — убираем её
//         if (previousReaction === 'like') {
//           comment.likesCount = Math.max(0, comment.likesCount - 1);
//         }
//
//         if (previousReaction === 'dislike') {
//           comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
//         }
//
//         // ставим новую реакцию
//         if (action === 'like') {
//           comment.likesCount += 1;
//         } else {
//           comment.dislikesCount += 1;
//         }
//
//         comment.userReaction = action;
//       },
//       error: (err) => {
//         console.error('Не удалось установить реакцию:', err);
//         alert('Не удалось поставить реакцию');
//       }
//     });
//   }
//
//   reportComment(comment: CommentType): void {
//     if (!this.isLoggedIn) {
//       alert('Чтобы отправить жалобу, нужно авторизоваться');
//       return;
//     }
//
//     if (comment.violateSent) {
//       return;
//     }
//
//     this.commentsService.postCommentAction(comment.id, 'violate').subscribe({
//       next: () => {
//         comment.violateSent = true;
//         alert('Жалоба отправлена');
//       },
//       error: (err) => {
//         console.error('Не удалось отправить жалобу:', err);
//         alert('Не удалось отправить жалобу');
//       }
//     });
//   }
//
// }

import {Component, OnInit} from '@angular/core';
import {ArticleType} from "../../../../types/article.type";
import {ArticleService} from "../../../shared/services/article.service";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {AuthService} from "../../../core/auth/auth.service";
import {CommentType} from "../../../../types/comment.type";
import {CommentsService} from "../../../shared/services/comments.service";
import {CommentUserActionType} from "../../../../types/comment-user-action.type";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  article!: ArticleType;
  relatedArticles: ArticleType[] = [];
  allComments: CommentType[] = [];
  displayedComments: CommentType[] = [];
  totalCommentsCount = 0;
  readonly initialPageSize = 3;
  readonly loadMorePageSize = 10;
  isCommentsLoading = false;
  serverStaticPath = environment.serverStaticPath;
  commentsOffset = 0;
  newCommentText = '';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService,
              private articleService: ArticleService,
              private commentsService: CommentsService,
              private activatedRoute: ActivatedRoute,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.getIsLoggedIn();

    this.authService.isLogged$.subscribe(status => {
      this.isLoggedIn = status;

      if (status && this.article?.id && this.allComments.length) {
        this.loadUserActionsForComments();
      }

      if (!status) {
        this.allComments = this.allComments.map(comment => ({
          ...comment,
          userReaction: null,
          violateSent: false
        }));
        this.displayedComments = this.allComments.slice(0, this.commentsOffset);
      }
    });

    this.activatedRoute.params.subscribe(params => {
      const url = params['url'];

      this.articleService.getArticle(url)
        .subscribe(data => {
          this.article = data;
          this.loadComments();
        });

      this.articleService.getRelatedArticles(url)
        .subscribe((data: ArticleType[]) => {
          this.relatedArticles = data;
        });
    });
  }

  private loadComments(): void {
    this.isCommentsLoading = true;

    this.commentsService.getCommentsResponse(this.article.id)
      .subscribe({
        next: (resp) => {
          this.allComments = resp.comments.map((comment: CommentType) => ({
            ...comment,
            userReaction: null,
            violateSent: false
          }));

          this.totalCommentsCount = resp.allCount;
          this.commentsOffset = Math.min(this.initialPageSize, this.totalCommentsCount);
          this.displayedComments = this.allComments.slice(0, this.commentsOffset);

          if (this.isLoggedIn && this.allComments.length) {
            this.loadUserActionsForComments();
          } else {
            this.isCommentsLoading = false;
          }
        },
        error: (err) => {
          console.error('Ошибка загрузки комментариев:', err);
          this.isCommentsLoading = false;
        }
      });
  }

  private loadUserActionsForComments(): void {
    this.commentsService.getArticleCommentActions(this.article.id).subscribe({
      next: (resp) => {
        const reactionMap = new Map<string, 'like' | 'dislike'>();
        const violateSet = new Set<string>();

        if (Array.isArray(resp)) {
          (resp as CommentUserActionType[]).forEach(item => {
            if (item.action === 'like' || item.action === 'dislike') {
              reactionMap.set(item.comment, item.action);
            }

            if (item.action === 'violate') {
              violateSet.add(item.comment);
            }
          });
        }

        this.allComments = this.allComments.map(comment => ({
          ...comment,
          userReaction: reactionMap.get(comment.id) ?? null,
          violateSent: violateSet.has(comment.id)
        }));

        this.displayedComments = this.allComments.slice(0, this.commentsOffset);
        this.isCommentsLoading = false;
      },
      error: (err) => {
        console.error('Ошибка загрузки действий пользователя:', err);
        this.isCommentsLoading = false;
      }
    });
  }

  loadMoreComments(): void {
    const nextOffset = Math.min(
      this.commentsOffset + this.loadMorePageSize,
      this.totalCommentsCount
    );

    this.displayedComments = this.allComments.slice(0, nextOffset);
    this.commentsOffset = nextOffset;
  }

  shouldShowLoadMoreButton(): boolean {
    return this.commentsOffset < this.totalCommentsCount;
  }

  submitComment(): void {
    const text = this.newCommentText.trim();
    if (!text) return;

    this.isCommentsLoading = true;

    this.commentsService.postComment(this.article.id, text).subscribe({
      next: (resp: any) => {
        const createdComment: CommentType | null =
          resp.comment ?? resp.newComment ?? null;

        this.newCommentText = '';

        if (createdComment) {
          this.allComments.unshift({
            ...createdComment,
            userReaction: null,
            violateSent: false
          });

          this.totalCommentsCount += 1;

          const newDisplayedCount = Math.min(this.commentsOffset + 1, this.totalCommentsCount);
          this.displayedComments = this.allComments.slice(0, newDisplayedCount);
          this.commentsOffset = newDisplayedCount;
          this.isCommentsLoading = false;
        } else {
          this.loadComments();
        }
      },
      error: (err) => {
        console.error('Ошибка добавления комментария:', err);
        this.isCommentsLoading = false;
        this.newCommentText = '';
        alert('Не удалось отправить комментарий');
      }
    });
  }

  reactComment(comment: CommentType, action: 'like' | 'dislike'): void {
    if (!this.isLoggedIn) {
      this._snackBar.open('Чтобы поставить реакцию, нужно авторизоваться');
      return;
    }

    const previousReaction = comment.userReaction;

    this.commentsService.postCommentAction(comment.id, action).subscribe({
      next: () => {
        if (previousReaction === action) {
          if (action === 'like') {
            comment.likesCount = Math.max(0, comment.likesCount - 1);
          } else {
            comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
          }

          comment.userReaction = null;
          return;
        }

        if (previousReaction === 'like') {
          comment.likesCount = Math.max(0, comment.likesCount - 1);
        }

        if (previousReaction === 'dislike') {
          comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
        }

        if (action === 'like') {
          comment.likesCount += 1;
        } else {
          comment.dislikesCount += 1;
        }

        let result = comment.userReaction = action;
        if (result) {
          this._snackBar.open('Ваш голос учтен');
        }

      },
      error: (err) => {
        console.error('Не удалось установить реакцию:', err);
        this._snackBar.open('Не удалось поставить реакцию');
      }
    });
  }

  reportComment(comment: CommentType): void {
    if (!this.isLoggedIn) {
      this._snackBar.open('Чтобы отправить жалобу, нужно авторизоваться');
      return;
    }

    if (comment.violateSent) {
      this._snackBar.open('Жалоба уже отправлена');
      return;
    }

    this.commentsService.postCommentAction(comment.id, 'violate').subscribe({
      next: () => {
        comment.violateSent = true;
        this._snackBar.open('Жалоба отправлена');
      },
      error: (err) => {
        // console.error('Не удалось отправить жалобу:', err);
        this._snackBar.open(err?.error?.message || 'Не удалось отправить жалобу');
      }
    });
  }
}
