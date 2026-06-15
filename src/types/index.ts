export type Plan = 'monthly' | 'annual';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Payment {
  method: PaymentMethod;
  maskedIdentifier: string;
}

export interface Subscription {
  id: string;
  userId: string;
  email: string;
  plan: Plan;
  status: SubscriptionStatus;
  payment: Payment;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  userId: string;
  email: string;
  plan: Plan;
  paymentMethod: PaymentMethod;
  cardNumber: string;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  data: {
    subscriptionId: string;
    status: SubscriptionStatus;
    plan: Plan;
    expiresAt: string;
  };
}

export interface GetSubscriptionResponse {
  success: boolean;
  data: Subscription;
}

export interface GetSubscriptionsResponse {
  success: boolean;
  data: Subscription[];
}

export interface WebSocketMessage {
  type: 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'SUBSCRIPTION_CANCELLED' | 'SUBSCRIPTION_EXPIRED';
  id: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export type ApiError =
  | { kind: 'validation'; errors: Record<string, string> }
  | { kind: 'server'; message: string; status: number }
  | { kind: 'timeout'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'unknown'; message: string };
