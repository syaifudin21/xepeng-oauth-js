export class XepengIntegrationError extends Error {
  public statusCode?: number;
  public originalError?: any;

  constructor(message: string, statusCode?: number, originalError?: any) {
    super(message);
    this.name = 'XepengIntegrationError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}