import requests
import json

from pikepdf import Pdf

from .html_builder import _HtmlBuilder
from .merge import merge as lib_merge
from .split import split as lib_split

from typing import Dict, Tuple, Union, List, Any, BinaryIO

DEFAULT_FILE_OPTIONS = {
    "cacheControl": "3600",
    "contentType": "text/plain;charset=UTF-8",
    "upsert": False,
}

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
                html_builder = _HtmlBuilder(document.get('title'))
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

    def merge(self, file_a: BinaryIO, file_a_name: str, file_b: BinaryIO, file_b_name: str) -> Pdf:
        return lib_merge(file_a, file_a_name, file_b, file_b_name)

    def split(self, doc: BinaryIO, page: int) -> Tuple[Pdf, Pdf]:
        return lib_split(doc, page)
