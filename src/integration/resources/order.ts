import { XepengIntegrationClient } from '../client';
import { OrderItem, IntegrationResponse } from '../types';
import { XepengIntegrationError } from '../exceptions';

export class OrderResource {
  constructor(private client: XepengIntegrationClient) {}

  public async create(items: OrderItem[]): Promise<IntegrationResponse> {
    this.validateItems(items);
    return this.client.request('POST', '/openapi/orders', {
      data: { items }
    });
  }

  public async update(uid: string, items: OrderItem[], status: string = 'active'): Promise<IntegrationResponse> {
    if (!uid || uid.trim() === '') {
      throw new XepengIntegrationError("Order UID is required for update.");
    }
    this.validateItems(items);
    return this.client.request('PUT', `/openapi/orders/${uid}`, {
      data: { status, items }
    });
  }

  public async get(uid: string): Promise<IntegrationResponse> {
    if (!uid || uid.trim() === '') {
      throw new XepengIntegrationError("Order UID is required.");
    }
    return this.client.request('GET', `/openapi/orders/${uid}`);
  }

  public async list(page: number = 1, limit: number = 10): Promise<IntegrationResponse> {
    return this.client.request('GET', '/openapi/orders', {
      params: { page, limit }
    });
  }

  private validateItems(items: OrderItem[]): void {
    if (!items || items.length === 0) {
      throw new XepengIntegrationError("Order items cannot be empty.");
    }

    items.forEach((item, index) => {
      if (!item.amount || item.amount <= 0) {
        throw new XepengIntegrationError(`Item at index ${index} must have a positive amount.`);
      }
      if (!item.product_name) {
        throw new XepengIntegrationError(`Item at index ${index} must have a product_name.`);
      }
    });
  }
}