import { HtmlBuilder } from "./htmlBuilder";
import mime from "mime-types";

export interface Asset {
  path: string;
  content: string;
}
export interface PathBuffer {
  path: string;
  content: Buffer;
}

export interface ExternalLink {
  href: string;
}
export interface DocumentInput {
  html: string;
  title?: string;
  test?: boolean;
  assets?: Asset[] | PathBuffer[];
  save?: boolean;
  /**
   * Number of seconds to cache the file in the CDN for.
   */
  expiresIn?: number;
  //| ExternalLink
}

const DEFAULT_FILE_OPTIONS: any = {
  cacheControl: "3600",
  contentType: "text/plain;charset=UTF-8",
  upsert: false,
};

type FileBody =
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | File
  | FormData
  | ReadableStream<Uint8Array>
  | URLSearchParams
  | string;

export class Onedoc {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint: string = "https://api.fileforge.com") {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  private buildUrl(path: string) {
    return `${this.endpoint}${path}`;
  }

  async render(document: DocumentInput): Promise<any> {
    const assets: Asset[] = document.assets ?? [];
    assets.push({ path: "/index.html", content: document.html });

    const test: boolean = document.test ?? true;
    const save: boolean = document.save ?? false;

    const expires_in: number = document.expiresIn ?? 1;
    const expires_at: Date = new Date(
      Date.now() + expires_in * 24 * 60 * 60 * 1000
    );
    const expires_at_iso: string = expires_at.toISOString();

    const formData = new FormData();

    const optionsBlob = new Blob(
      [
        JSON.stringify({
          test: test,
          host: save,
          expiresAt: expires_at_iso,
          fileName: document.title ?? "document",
        }),
      ],
      { type: "application/json" }
    );

    formData.append("options", optionsBlob);

    assets.forEach((asset) => {
      if (asset.path === "/index.html" && asset.content) {
        // Assuming _HtmlBuilder exists and is imported
        const htmlBuilder = new HtmlBuilder(document.title);
        const styleSheets = assets
          .filter((a) => a.path.endsWith(".css"))
          .map((a) => a.path);

        const html = htmlBuilder.build(document.html, styleSheets, test);

        const fileBlob = new Blob([html],{ type: "text/html" })

        formData.append('files', fileBlob, "index.html");

  
      } else if (asset.content) {

        const assetType = mime.lookup(asset.path) || "application/octet-stream";

        const fileBlob = new Blob([asset.content],{ type: assetType })

        formData.append('files', fileBlob, asset.path);

      }
    });

    const response: Response = await fetch(
      await this.buildUrl("/pdf/generate"),
      {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
        },
        body: formData,
      }
    );

    if (response.status === 201) {
      if (!save) {
        return {
          file: await response.arrayBuffer(),
          link: null,
          error: null,
          info: {},
        };
      } else {
        const jsonResponse = await response.json();
        return { file: null, link: jsonResponse.url, error: null, info: {} };
      }
    } else {
      const error = await response.json();
      return { file: null, link: null, error: error, info: {} };
    }
  }
}
