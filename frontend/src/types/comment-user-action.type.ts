export interface CommentUserActionType {
  comment: string;
  action: 'like' | 'dislike' | 'violate';
}
