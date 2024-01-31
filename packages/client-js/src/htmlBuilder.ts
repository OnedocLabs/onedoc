export class HtmlBuilder {
  private title?: string;
  private start: string = `<!DOCTYPE html>
                             <html  lang="en">
                                <head>
                                    <meta charset = "UTF-8">
                                    <meta name="viewport" content="width=device-width">`;
  private middle: string = `
                                </head>
                                <body>`;

  private end: string = `</body>
                        </html>`;

  constructor(title?: string) {
    this.title = title;
  }

  build(react: string, styleSheets?: string[]) {
    if (styleSheets) {
      styleSheets.forEach((path) => {
        this.start += `<link rel = "stylesheet" href=${path} />`;
      });
    }

    if (this.title) {
      this.start += `<title>${this.title}</title>`;
    }

    this.middle += react;

    return this.start + this.middle + this.end;
  }
}
