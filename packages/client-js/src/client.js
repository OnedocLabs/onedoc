"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Onedoc = void 0;
var htmlBuilder_1 = require("./htmlBuilder");
var DEFAULT_FILE_OPTIONS = {
    cacheControl: '3600',
    contentType: 'text/plain;charset=UTF-8',
    upsert: false,
};
//https://www.npmjs.com/package/@supabase/storage-js?activeTab=code
function uploadToSignedUrl(urlToFS, path, token, fileBody, fileOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var url, body, options, headers, res, data, error, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = new URL(urlToFS + "/object/upload/sign/".concat(path));
                    url.searchParams.set('token', token);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    body = void 0;
                    options = __assign({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
                    headers = __assign({ 'x-upsert': String(options.upsert) });
                    if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                        body = new FormData();
                        body.append('cacheControl', options.cacheControl);
                        body.append('', fileBody);
                    }
                    else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                        body = fileBody;
                        body.append('cacheControl', options.cacheControl);
                    }
                    else {
                        body = fileBody;
                        headers['cache-control'] = "max-age=".concat(options.cacheControl);
                        headers['content-type'] = options.contentType;
                    }
                    return [4 /*yield*/, fetch(url.toString(), {
                            method: 'PUT',
                            body: body,
                            headers: headers,
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (res.ok) {
                        return [2 /*return*/, {
                                data: { path: path, fullPath: data.Key },
                                error: null,
                            }];
                    }
                    else {
                        error = data;
                        return [2 /*return*/, { data: null, error: error }];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
var Onedoc = /** @class */ (function () {
    function Onedoc(apiKey) {
        this.endpoint = "http://localhost:3000";
        this.apiKey = apiKey;
    }
    Onedoc.prototype.buildUrl = function (path) {
        return "".concat(this.endpoint).concat(path);
    };
    Onedoc.prototype.render = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var information, response, signedURLs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.buildUrl("/api/docs/initiate"), {
                            method: "POST",
                            headers: {
                                "X-Api-Key": this.apiKey,
                                "Content-Type": "application/json" // Set Content-Type if you are sending JSON data
                            },
                            body: JSON.stringify(document)
                        })];
                    case 1:
                        information = _a.sent();
                        return [4 /*yield*/, information.json()];
                    case 2:
                        response = _a.sent();
                        signedURLs = response.signedUrls;
                        signedURLs.forEach(function (e) { return __awaiter(_this, void 0, void 0, function () {
                            var asset, htmlBuilder_2, styleSheets, html_1;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        asset = (_a = document.assets) === null || _a === void 0 ? void 0 : _a.find(function (item) {
                                            return item.path == e.path;
                                        });
                                        if (!(asset === null || asset === void 0 ? void 0 : asset.content)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, uploadToSignedUrl(e.signedUrl, e.path, e.token, asset.content)];
                                    case 1:
                                        _c.sent();
                                        return [3 /*break*/, 4];
                                    case 2:
                                        if (!(e.path == "/index.html")) return [3 /*break*/, 4];
                                        htmlBuilder_2 = new htmlBuilder_1.HtmlBuilder("Onedoc");
                                        styleSheets = (_b = document.assets) === null || _b === void 0 ? void 0 : _b.filter(function (asset) { return asset.path.includes('.css'); }).map(function (asset) { return asset.path; });
                                        html_1 = htmlBuilder_2.build(document.html, styleSheets);
                                        return [4 /*yield*/, uploadToSignedUrl(e.signedUrl, e.path, e.token, html_1)];
                                    case 3:
                                        _c.sent();
                                        _c.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/, response];
                }
            });
        });
    };
    return Onedoc;
}());
exports.Onedoc = Onedoc;
var htmlBuilder = new htmlBuilder_1.HtmlBuilder("Onedoc");
var html = htmlBuilder.build("<div></div>", ["/index.css"]);
console.log(html);
