import { HtmlBuilder } from "./htmlBuilder";
export interface PathString {
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
  assets?: PathString[] | PathBuffer[];
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

//https://www.npmjs.com/package/@supabase/storage-js?activeTab=code
async function uploadToSignedUrl(
  urlToFS: string,
  path: string,
  token: string,
  fileBody: FileBody,
  fileOptions?: any
) {
  const url = new URL(urlToFS + `/object/upload/sign/${path}`);
  url.searchParams.set("token", token);

  try {
    let body;
    const options = { upsert: DEFAULT_FILE_OPTIONS.upsert, ...fileOptions };
    const headers: Record<string, string> = {
      ...{ "x-upsert": String(options.upsert as boolean) },
    };

    if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
      body = new FormData();
      body.append("cacheControl", options.cacheControl as string);
      body.append("", fileBody);
    } else if (
      typeof FormData !== "undefined" &&
      fileBody instanceof FormData
    ) {
      body = fileBody;
      body.append("cacheControl", options.cacheControl as string);
    } else {
      body = fileBody;
      headers["cache-control"] = `max-age=${options.cacheControl}`;
      headers["content-type"] = options.contentType as string;
    }

    const res = await fetch(url.toString(), {
      method: "PUT",
      body: body as BodyInit,
      headers,
    });

    const data = await res.json();

    if (res.ok) {
      return {
        data: { path: path, fullPath: data.Key },
        error: null,
      };
    } else {
      const error = data;
      return { data: null, error };
    }
  } catch (error) {
    throw error;
  }
}

export class Onedoc {
  private apiKey: string;
  private endpoint: string = "https://app.onedoclabs.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildUrl(path: string) {
    return `${this.endpoint}${path}`;
  }

  async render(document: DocumentInput) {
    const assets = [
      ...(document.assets || []),
      {
        path: "/index.html",
        content: document.html,
      },
    ];

    const test: boolean = document.test === undefined ? true : document.test;
    const save: boolean = document.save === undefined ? false : document.save;
    const expiresIn: number = document.expiresIn ? document.expiresIn : 1;

    // Fetch the /api/docs/initiate API endpoint
    const information = await fetch(this.buildUrl("/api/docs/initiate"), {
      method: "POST",
      headers: {
        "x-api-Key": this.apiKey,
        "Content-Type": "application/json", // Set Content-Type if you are sending JSON data
      },
      body: JSON.stringify({
        assets,
      }),
    });

    if (information.status !== 200) {
      return {
        file: null,
        error: ((await information.json()).error ||
          "An unknown error has occurred") as string,
        info: {
          status: information.status,
        },
      };
    }

    // Show the response body
    const response = await information.json();

    //--------------- UPLOAD FILES IN ASSETS ---------------

    const signedURLs = response.signedUrls;

    signedURLs.forEach(async (e) => {
      const asset = document.assets?.find((item) => {
        return item.path == e.path;
      });

      if (asset?.content) {
        await uploadToSignedUrl(e.signedUrl, e.path, e.token, asset.content);
      } else if (e.path == "/index.html") {
        let htmlBuilder = new HtmlBuilder(document.title);

        const styleSheets = document.assets
          ?.filter((asset) => asset.path.includes(".css"))
          .map((asset) => asset.path);

        const html: string = htmlBuilder.build(
          document.html,
          styleSheets,
          test
        );

        await uploadToSignedUrl(e.signedUrl, e.path, e.token, html);
      }
    });

    console.log(response);

    const doc = await fetch(this.buildUrl("/api/docs/generate"), {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...response,
        title: document.title || "document",
        test: test,
        save: save,
        expiresIn: expiresIn,
      }),
    });

    // If status is not 200, it means there is an error
    if (doc.status !== 200) {
      return {
        file: null,
        link: null,
        error: ((await doc.json()).error ||
          "An unknown error has occurred") as string,
        info: {},
      };
    }

    if (!save) {
      return {
        file: await doc.arrayBuffer(),
        link: null,
        error: null,
        info: {},
      };
    }
    {
      return {
        file: null,
        link: (await doc.json()).url_link,
        error: null,
        info: {},
      };
    }
  }
}

/**
 *         "raw": "{\"statusCode\":500,\"error\":\"internal\",\"originalError\":{\"length\":135,\"name\":\"error\",\"severity\":\"ERROR\",\"code\":\"22P02\",\"file\":\"uuid.c\",\"line\":\"133\",\"routine\":\"string_to_uuid\"},\"details\":\"insert into \\\"objects\\\" (\\\"bucket_id\\\", \\\"metadata\\\", \\\"name\\\", \\\"owner\\\", \\\"owner_id\\\", \\\"version\\\") values ($1, DEFAULT, $2, DEFAULT, DEFAULT, $3) - invalid input syntax for type uuid: \\\"pdf-70924304-2a67-4f75-99de-7e53bdbd7251\\\"\"}",

 */

/** allow_owned_buckets
 * ( SELECT (EXISTS ( SELECT 1
           FROM buckets
          WHERE ((buckets.id = (objects.bucket_id)::uuid) AND (buckets.api_key_id = (((current_setting('request.headers'::text, true))::json ->> 'x-api-key'::text))::uuid)))) AS "exists")
 */
