export interface DocumentInput {
  html: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    date?: string;
  };
  assets?: (
    | {
        path: string;
        content: Buffer;
      }
    | { href: string }
  )[];
}

export class Onedoc {
  private apiKey: string;
  private endpoint: string = "http://localhost:3000";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildUrl(path: string) {
    return `${this.endpoint}${path}`;
  }

  async render(document: DocumentInput) {
    // Fetch the /api/docs/initiate API endpoint
    const information = await fetch(this.buildUrl("/api/docs/initiate"), {
      headers: {
        "X-Api-Key": this.apiKey,
      },
    });

    // Show the response body
    console.log(await information.json());
  }
}
