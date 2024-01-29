"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlBuilder = void 0;
var HtmlBuilder = /** @class */ (function () {
    function HtmlBuilder(title) {
        this.title = "Onedoc";
        this.start = "<!DOCTYPE html>\n                             <html  lang=\"en\">\n                                <head>\n                                    <meta charset = \"UTF-8\">\n                                    <meta name=\"viewport\" content=\"width=device-width\">";
        this.middle = "<title>Onedoc</title>\n                                </head>\n                                <body>";
        this.end = "</body>\n                        </html>";
        this.title = title;
    }
    HtmlBuilder.prototype.build = function (react, styleSheets) {
        var _this = this;
        if (styleSheets) {
            styleSheets.forEach(function (path) {
                _this.start += "<link rel = \"stylesheet\" href=".concat(path, " />");
            });
        }
        this.middle += react;
        return this.start + this.middle + this.end;
    };
    return HtmlBuilder;
}());
exports.HtmlBuilder = HtmlBuilder;
