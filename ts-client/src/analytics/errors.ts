

export class MarketMakingError extends Error {
  constructor(message: string, public readonly code: ErrorCode) {
    super(message);
    this.name = 'MarketMakingError';
  }
}

export enum ErrorCode {
  STALE_DATA = 'STALE_DATA',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  DATA_QUALITY = 'DATA_QUALITY',
  VALIDATION = 'VALIDATION'
}

export class DataQualityError extends MarketMakingError {
  constructor(message: string) {
    super(message, ErrorCode.DATA_QUALITY);
    this.name = 'DataQualityError';
  }
}

export class InsufficientDataError extends MarketMakingError {
  constructor(message: string) {
    super(message, ErrorCode.INSUFFICIENT_DATA);
    this.name = 'InsufficientDataError';
  }
}