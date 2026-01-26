export type UserReview = {
  id: string;
  userName: string;
  userAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

export type UserReviewsResult = {
  reviews: UserReview[];
  total?: number;
  averageRating?: number;
};
