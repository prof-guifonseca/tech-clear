export type RewardCategory = 'gastronomia' | 'entretenimento' | 'educacao' | 'material';

export interface Reward {
  id: string;
  name: string;
  description: string;
  xpCost: number;
  category: RewardCategory;
  icon: string;
  partner: string;
  available: boolean;
  stock: number;
}

export interface Redemption {
  id: string;
  studentId: string;
  rewardId: string;
  rewardName: string;
  redeemedAt: string;
  code: string;
  xpSpent: number;
}
