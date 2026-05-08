export interface CommentType {
  id: string;
  text: string;
  date: string;
  likesCount: number;
  dislikesCount: number;
  "user": {
    "id": string,
    "name": string
  },
  userReaction?: 'like'|'dislike'|null;
  violateSent?: boolean;
}
