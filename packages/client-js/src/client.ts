import { HtmlBuilder } from "./htmlBuilder";
export interface PathString{
  path: string;
  content: string;
}
// export interface PathBuffer{
//   path: string;
//   content: Buffer;
// }

export interface ExternalLink{
  href: string;
}
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
    | PathString
    //| PathBuffer
    //| ExternalLink
    
  )[];
}

const DEFAULT_FILE_OPTIONS: any = {
  cacheControl: '3600',
  contentType: 'text/plain;charset=UTF-8',
  upsert: false,
}

type FileBody =
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | File
  | FormData
  | ReadableStream<Uint8Array>
  | URLSearchParams
  | string

//https://www.npmjs.com/package/@supabase/storage-js?activeTab=code
async function uploadToSignedUrl(
    urlToFS : string,
    path: string,
    token: string,
    fileBody: FileBody,
    fileOptions?: any
  ) {

    const url = new URL(urlToFS + `/object/upload/sign/${path}`)
    url.searchParams.set('token', token)


    try {
      let body
      const options = { upsert: DEFAULT_FILE_OPTIONS.upsert, ...fileOptions }
      const headers: Record<string, string> = {
        ...{ 'x-upsert': String(options.upsert as boolean) },
      }

      if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
        body = new FormData()
        body.append('cacheControl', options.cacheControl as string)
        body.append('', fileBody)
      } else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
        body = fileBody
        body.append('cacheControl', options.cacheControl as string)
      } else {
        body = fileBody
        headers['cache-control'] = `max-age=${options.cacheControl}`
        headers['content-type'] = options.contentType as string
      }

      const res = await fetch(url.toString(), {
        method: 'PUT',
        body: body as BodyInit,
        headers,
      })

      const data = await res.json()

      if (res.ok) {
        return {
          data: { path: path, fullPath: data.Key },
          error: null,
        }
      } else {
        const error = data
        return { data: null, error }
      }
    } catch (error) {
     

      throw error
    }
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
      method:"POST",
      headers: {
        "X-Api-Key": this.apiKey,
        "Content-Type": "application/json" // Set Content-Type if you are sending JSON data
      },
      body: JSON.stringify(document)
    });

    // Show the response body
    const response = await information.json();

    //--------------- UPLOAD FILES IN ASSETS ---------------

    const signedURLs = response.signedUrls;

    signedURLs.forEach( async (e) => {
      
        const asset = document.assets?.find( item => {

          return item.path == e.path;
        });

        if (asset?.content){

          await uploadToSignedUrl( e.signedUrl, e.path, e.token, asset.content);

        }else if (e.path == "/index.html") {
          
          let htmlBuilder = new HtmlBuilder("Onedoc");

          const styleSheets = document.assets?.filter(asset => asset.path.includes('.css')).map(asset => asset.path);

          const html:string = htmlBuilder.build(document.html, styleSheets);

          await uploadToSignedUrl( e.signedUrl, e.path, e.token, html);
  
        }
  
    })
  
    return response;
  }
}
