import requests
import json
import time
import datetime
from datetime import timezone
import mimetypes

from pikepdf import Pdf

from .html_builder import _HtmlBuilder
from .merge import merge as lib_merge
from .split import split as lib_split

from typing import Dict, Tuple, Any, BinaryIO

DEFAULT_FILE_OPTIONS = {
    "cacheControl": "3600",
    "contentType": "text/plain;charset=UTF-8",
    "upsert": False,
}

class Onedoc:
    def __init__(self, api_key: str, endpoint: str = "https://api.fileforge.com"):
        self.api_key = api_key
        self.endpoint = endpoint

    def _build_url(self, path: str) -> str:
        return f"{self.endpoint}{path}"

    def render(self, document: Dict) -> Dict:
        assets = document.get('assets', []) + [{"path": "/index.html", "content": document['html']}]
        test = document.get('test', True)
        save = document.get('save', False)

        expires_in = document.get('expiresIn', 1)
        # Add expires_in (in days) to the current time to get the expiration time
        expires_at = int(time.time()) + (expires_in * 24 * 60 * 60)
        # Convert to timestamp with timezone
        expires_at = datetime.datetime.fromtimestamp(expires_at, timezone.utc).isoformat()

        files = (
            ('options', (None, json.dumps({
                'test': test,
                'host': save,
                'expiresAt': expires_at,
                'fileName': document.get('title', "document")
            }), 'application/json')),
        )

        for asset in assets:
            if asset and asset.get('path') == "/index.html":

                html_builder = _HtmlBuilder(document.get('title'))
                style_sheets = [asset['path'] for asset in document.get('assets', []) if asset['path'].endswith(".css")]
                html = html_builder.build(document['html'], style_sheets)

                files += (
                    ('files', ('index.html', html, 'text/html')),
                )
            elif asset and asset.get('content'):
                files += (
                    ('files', (asset['path'], asset['content'], mimetypes.guess_type(asset['path'])[0] or 'application/octet-stream')),
                )

        generation = requests.post(
            self._build_url("/pdf/generate"),
            headers={"x-api-key": self.api_key},
            files=files
        )

        if generation.status_code != 201:
            return {
                "file": None,
                "link": None,
                "error": generation.json(),
                "info": {},
            }

        if not save:
            return {
                "file": generation.content,
                "link": None,
                "error": None,
                "info": {},
            }
        else:
            return {
                "file": None,
                "link": generation.json().get('url'),
                "error": None,
                "info": {},
            }

    def merge(self, file_a: BinaryIO, file_a_name: str, file_b: BinaryIO, file_b_name: str) -> Pdf:
        return lib_merge(file_a, file_a_name, file_b, file_b_name)

    def split(self, doc: BinaryIO, page: int) -> Tuple[Pdf, Pdf]:
        return lib_split(doc, page)
