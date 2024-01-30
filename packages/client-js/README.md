# @onedoc/client

---

## Installation

Onedoctor is available as an [npm package](https://www.npmjs.com/package/@onedoc/client).

```bash
npm install @onedoc/client
```

## Usage

Below is the simplest example of using Onedoc to render a PDF from HTML. It outputs the PDF to a file called `test.pdf`.

```js
import { Onedoc } from "@onedoc/client";
import { writeFileSync } from "fs";

const onedoc = new Onedoc("xxx-xxx-xxx-xxx"); // your API key

writeFileSync(
  "./test.pdf",
  Buffer.from(
    await onedoc.render({
      html: "<h1 style='color: red;'>Hello world!</h1>",
      assets: [],
    })
  ),
  "binary"
);
```

## Documentation

For more information, please visit [https://docs.onedoclabs.com/quickstart/nodejs](https://docs.onedoclabs.com/quickstart/nodejs).

## Support

For any questions or feature requests, please get in touch on [Discord](https://discord.com/invite/uRJE6e2rgr).
