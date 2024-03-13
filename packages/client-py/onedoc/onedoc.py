import requests
import json
from htmlBuilder import HtmlBuilder

from typing import Dict, Union, List, Any, BinaryIO

DEFAULT_FILE_OPTIONS = {
    "cacheControl": "3600",
    "contentType": "text/plain;charset=UTF-8",
    "upsert": False,
}

# class _HtmlBuilder:
#     def __init__(self, title: str = None):
#         self.title = title or "Document"

#     def build(self, html_content: str, stylesheets: List[str] = None, test: bool = True) -> str:
#         # Implementation of HTML building logic goes here
#         # This is a placeholder implementation
#         return "<!DOCTYPE html><html><head><title>{}</title></head><body>{}</body></html>".format(self.title, html_content)

class Onedoc:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://app.onedoclabs.com"

    def _build_url(self, path: str) -> str:
        return f"{self.endpoint}{path}"

    def _upload_to_signed_url(self, url_to_fs: str, path: str, file_body: Any, file_options: Dict = None) -> Dict:
        url = f"{url_to_fs}"

        options = {**DEFAULT_FILE_OPTIONS, **(file_options or {})}
        headers = {"x-upsert": str(options["upsert"])}
        files = None

        if isinstance(file_body, bytes):
            files = {"file": (path, file_body, options["contentType"])}
            headers["cache-control"] = f"max-age={options['cacheControl']}"
        else:
            headers["Content-Type"] = options["contentType"]
            file_body = str(file_body)

        response = requests.put(url, data=file_body, headers=headers, files=files)
        data = response.json()

        if response.ok:
            return {"data": {"path": path, "fullPath": data.get("Key")}, "error": None}
        else:
            return {"data": None, "error": data}

    def render(self, document: Dict) -> Dict:
        assets = document.get('assets', []) + [{"path": "/index.html", "content": document['html']}]
        test = document.get('test', True)
        save = document.get('save', False)

        expires_in = document.get('expiresIn', 1)

        # Initiate document rendering process
        information_response = requests.post(
            self._build_url("/api/docs/initiate"),
            headers={"x-api-key": self.api_key, "Content-Type": "application/json"},
            json={"assets": assets}
        )


        if information_response.status_code != 200:
            return {
                "file": None,
                "error": information_response.json().get('error', "An unknown error has occurred"),
                "info": {"status": information_response.status_code},
            }

        response = information_response.json()
        signed_urls = response['signedUrls']

        for e in signed_urls:
            asset = next((item for item in document.get('assets', []) if item['path'] == e['path']), None)

            if asset and asset.get('content'):
                self._upload_to_signed_url(e['signedUrl'], e['path'], asset['content'])

            elif e['path'] == "/index.html":
                html_builder = HtmlBuilder(document.get('title'))
                style_sheets = [asset['path'] for asset in document.get('assets', []) if asset['path'].endswith(".css")]
                html = html_builder.build(document['html'], style_sheets, test)
                self._upload_to_signed_url(e['signedUrl'], e['path'], html)

        doc_response = requests.post(
            self._build_url("/api/docs/generate"),
            headers={"x-api-key": self.api_key, "Content-Type": "application/json"},
            json= json.dumps({
                "uploadURL":response["uploadURL"],
                "username":response["username"],
                "bucket":response["bucket"],
                "signedUrls":response["signedUrls"],
                "password":response["password"],
                "title": document.get('title', "document"),
                "test": test,
                "save": save,
                "expiresIn": expires_in
            })
        )

        if doc_response.status_code != 200:
            return doc_response.__dict__

        if not save:
            return {
                "file": doc_response.content,
                "link": None,
                "error": None,
                "info": {},
            }
        else:
            return {
                "file": None,
                "link": doc_response.json().get('url_link'),
                "error": None,
                "info": {},
            }

    def merge(self, file_a: BinaryIO, file_a_name: str, file_b: BinaryIO, file_b_name: str):
        # The server expects a single 'file' key which contains a list of all the files.
        # The server will then merge the files and return the merged file.

        response = requests.post(
            #'http://localhost:3000/api/docs/merge',
            self._build_url("/api/docs/merge"),
            headers={"x-api-key": self.api_key},
            files=[
                ("file", (file_a_name, file_a, "application/pdf")),
                ("file", (file_b_name, file_b, "application/pdf")),
            ],
        )

        if response.status_code != 200:
            return {
                "file": None,
                "error": response.json().get('error', "An unknown error has occurred"),
                "info": {"status": response.status_code},
            }

        return {
            "file": response.content,
            "error": None,
            "info": {},
        }
