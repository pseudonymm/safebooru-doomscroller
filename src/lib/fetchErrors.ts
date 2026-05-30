export class FetchEmptyError extends Error {
  constructor(message = "No posts match this search.") {
    super(message);
    this.name = "FetchEmptyError";
  }
}
