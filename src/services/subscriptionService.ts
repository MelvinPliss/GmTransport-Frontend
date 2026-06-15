import { httpClient } from './httpClient';
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  GetSubscriptionResponse,
  GetSubscriptionsResponse,
} from '../types';

export const subscriptionService = {
  async create(data: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const res = await httpClient.post<CreateSubscriptionResponse>('/api/subscriptions', data);
    return res.data;
  },

  async getById(id: string): Promise<GetSubscriptionResponse> {
    const res = await httpClient.get<GetSubscriptionResponse>(`/api/subscription/${id}`);
    return res.data;
  },

  async getAll(): Promise<GetSubscriptionsResponse> {
    const res = await httpClient.get<GetSubscriptionsResponse>('/api/subscriptions');
    return res.data;
  },
};
