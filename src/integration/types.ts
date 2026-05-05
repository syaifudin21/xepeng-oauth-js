export interface IntegrationConfig {
  clientId: string;
  clientSecret: string;
  isProduction?: boolean;
  baseUrl?: string;
}

export interface OrderItem {
  amount: number;
  notes?: string;
  product_description?: string;
  product_name: string;
}

export interface OrderCreateRequest {
  items: OrderItem[];
}

export interface PaymentLinkGenerateOptions {
  expired_at?: string;
  callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface IntegrationResponse<T = any> {
  status: string;
  message: string;
  data: T;
}