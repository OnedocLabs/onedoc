import {Onedoc} from "../src/client";
import fs from "fs";
import path from "path";
import process from "process";

const ONEDOC_API_KEY = process.env.ONEDOC;
(async () => {

    const onedoc = new Onedoc(ONEDOC_API_KEY);
  
    let doc = {
      html: "<h1>Hello World</h1>",
      title: "Hello",
      test: true, // if true, produce a PDF in test mode with a Onedoc's watermark
      save: false, // if true, host the document and provide a download link in the console and your Onedoc's dashboard
      expiresIn: 30, // the number of day you want to host your document
      assets: [
        {
          path: "./stylesheet.css",
          content: fs.readFileSync(path.join(process.cwd(), "/test/stylesheet.css")).toString(),
        },
      ],
    };
  
    const { file, link, error, info } = await onedoc.render(doc);
  
    if (error) {
      throw error;
    }
  
    fs.writeFileSync("./Test.pdf", Buffer.from(file));
})();