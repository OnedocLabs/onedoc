

export class HtmlBuilder {

    private title: string = "Onedoc"
    private start: string = `<!DOCTYPE html>
                             <html  lang="en">
                                <head>
                                    <meta charset = "UTF-8">
                                    <meta name="viewport" content="width=device-width">`;
    private middle: string = `<title>Onedoc</title>
                                </head>
                                <body>`

    private end: string =`</body>
                        </html>`

    private styleSheets:string[];
  
    constructor(title: string) {
        this.title = title
    }

    build(react:string, styleSheets?:string[]){

        if (styleSheets){
            
            styleSheets.forEach((path) =>{
                this.start+= `<link rel = "stylesheet" href=${path} />`
            })
        }
        
        this.middle += react;

        return this.start+this.middle+this.end;
    }

}
