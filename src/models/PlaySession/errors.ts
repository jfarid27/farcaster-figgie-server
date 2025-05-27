export class InvalidPlayerNumberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPlayerNumberError";
  }
}

export class InsufficientFundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

export class InsufficientCardsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientCardsError";
  }
}