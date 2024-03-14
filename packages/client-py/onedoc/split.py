from pikepdf import Pdf
from typing import Tuple, BinaryIO

def split(doc: BinaryIO, page: int) -> Tuple[Pdf, Pdf]:
    """
    Split a PDF document at a specific page number.

    :param doc: The PDF document to split.
    :param page: The page number to split at. Pages before and including this page will be in the first document, and pages after will be in the second document.
    :return: A tuple containing the two split PDF documents.
    """
    pdf = Pdf.open(doc)
    pdf_a = Pdf.new()
    pdf_b = Pdf.new()

    for i, page in enumerate(pdf.pages):
        if i < page:
            pdf_a.pages.append(page)
        else:
            pdf_b.pages.append(page)

    return pdf_a, pdf_b
