import { XepengIntegrationClient } from '../client';
import { PaymentLinkGenerateOptions, IntegrationResponse } from '../types';
import { XepengIntegrationError } from '../exceptions';

export class PaymentLinkResource {
  constructor(private client: XepengIntegrationClient) {}

  public async generate(orderUid: string, options: PaymentLinkGenerateOptions = {}): Promise<IntegrationResponse> {
    if (!orderUid || orderUid.trim() === '') {
      throw new XepengIntegrationError("Order UID is required to generate payment link.");
    }

    return this.client.request('POST', '/openapi/payment-links/generate', {
      data: {
        order_uid: orderUid,
        ...options
      }
    });
  }
}