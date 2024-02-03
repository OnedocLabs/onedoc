# @onedoc/client

## Installation

Onedoc is available as an [npm package](https://www.npmjs.com/package/@onedoc/client).

```bash
npm install @onedoc/client
```

## Usage

Below is the simplest example of using Onedoc to render a PDF from HTML. It outputs the PDF to a file called `test.pdf`.

```js
import { Onedoc } from "@onedoc/client";
import { writeFileSync } from "fs";

const onedoc = new Onedoc("xxx-xxx-xxx-xxx"); // your API key

const { file, error, info } = await onedoc.render({
  html: "<h1 style='color: red;'>Hello world!</h1>",
  assets: [],
});

if (error) {
  throw error;
}

writeFileSync("./test.pdf", Buffer.from(file), "binary");
```

## Documentation

For more information, please visit [our documentation](https://docs.onedoclabs.com/components/introduction).

## Support

For any questions or feature requests, please get in touch on [Discord](https://discord.com/invite/uRJE6e2rgr).
