export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface College {
  id: number;
  name: string;
  location: string;
  fees: number;
  tuition_fees: number;
  hostel_fees: number;
  rating: number;
  courses: string[];
  closing_rank: number;
  category: string;
  match_score?: number;
  match_reasons?: string[];
  reviews?: Review[];
}
