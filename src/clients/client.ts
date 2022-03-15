export abstract class Client {
  #url: string;
  #token: string | undefined;

  public constructor(url: string) {
    this.#url = url;
  }

  public setToken(token: string) {
    this.#token = `${token}`;
    return this;
  }

  protected getRoute(path: string) {
    return new URL(path, this.#url);
  }

  protected async request(method: string, path: string, body?: Record<string, unknown>) {
    const url = this.getRoute(path);

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (this.#token) {
      headers.Authorization = this.#token;
    }

    const resp = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(resp.statusText);

    const json = await resp.json();
    return json;
  }
}
