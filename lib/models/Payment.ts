/**
 * Payment 모델
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PlanType = 'free' | 'personal' | 'pro' | 'enterprise';

export interface Payment {
  id: string;
  user_id: string;
  plan: PlanType;
  amount: number;
  period_start: Date;
  period_end: Date;
  status: PaymentStatus;
  stripe_payment_intent_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentInput {
  user_id: string;
  plan: PlanType;
  amount: number;
  period_start: Date;
  period_end: Date;
  stripe_payment_intent_id?: string;
  status?: PaymentStatus;
}

