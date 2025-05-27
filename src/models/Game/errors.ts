export class InvalidGameStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidGameStateError";
  }
}