import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import * as crypto from 'crypto';
import { IntegrationConfig, IntegrationResponse } from './types';
import { XepengIntegrationError } from './exceptions';
import { OrderResource } from './resources/order';
import { PaymentLinkResource } from './resources/payment-link';

export class XepengIntegrationClient {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor(config: IntegrationConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl.replace(/\/$/, '');
    } else {
      this.baseUrl = config.isProduction 
        ? 'https://api.xepeng.com' 
        : 'https://staging-api.xepeng.com';
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  public orders(): OrderResource {
    return new OrderResource(this);
  }

  public paymentLinks(): PaymentLinkResource {
    return new PaymentLinkResource(this);
  }

  public async request<T>(
    method: Method,
    path: string,
    options: AxiosRequestConfig = {}
  ): Promise<IntegrationResponse<T>> {
    const timestamp = Math.floor(Date.now() / 1000);
    const normalizedMethod = method.toUpperCase();
    
    let bodyString = '';
    if (options.data) {
      bodyString = JSON.stringify(options.data);
    }

    const signature = this.generateSignature(normalizedMethod, path, timestamp, bodyString);

    const config: AxiosRequestConfig = {
      ...options,
      method: normalizedMethod,
      url: path,
      headers: {
        ...options.headers,
        'X-Client-ID': this.clientId,
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature,
      },
    };

    try {
      const response = await this.axiosInstance.request<IntegrationResponse<T>>(config);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        throw new XepengIntegrationError(
          error.response.data?.message || error.message,
          error.response.status,
          error.response.data
        );
      }
      throw new XepengIntegrationError(error.message, 500, error);
    }
  }

  public generateSignature(method: string, path: string, timestamp: number, body: string): string {
    const payload = method.toUpperCase() + path + timestamp.toString() + body;
    return crypto
      .createHmac('sha256', this.clientSecret)
      .update(payload)
      .digest('hex');
  }
}