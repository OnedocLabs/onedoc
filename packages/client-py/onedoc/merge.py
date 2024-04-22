from pikepdf import Pdf, Array, Name
import re


def merge(doc_a_buffer, doc_a_name, doc_b_buffer, doc_b_name):
    merged = Pdf.new()

    offsets = {}
    page_count = 0

    documents = [
        {"path": doc_a_name, "data": doc_a_buffer},
        {"path": doc_b_name, "data": doc_b_buffer},
    ]

    for document in documents:
        pdf = document["data"]

        try:
            pdf = Pdf.open(document["data"])
        except:
            pass

        merged.pages.extend(pdf.pages)

        offsets[document["path"]] = (page_count, len(pdf.pages))

        page_count += len(pdf.pages)

    regex_pattern = r"/([\w\d.]+)/#page=(\d+)"

    for page in merged.pages:
        try:
            page.Annots
        except:
            continue

        annotations = page.Annots
        
        try:
            # Fixes issues where page.Annots may be a number
            iter(annotations)
        except TypeError:
            continue

        for annotation in annotations:
            try:
                uri = annotation.get("/A").get("/URI")

                if uri:
                    match = re.search(regex_pattern, str(uri))

                    if not match:
                        continue

                    path = match.group(1)
                    page_number = int(match.group(2))

                    # Check that the file exists
                    if path not in offsets:
                        raise Exception(f"File {path} not found")

                    # Check that the page number is > 1 and < the number of pages in the file
                    if page_number < 1 or page_number > offsets[path][1]:
                        raise Exception(
                            f"Page number {page_number} is out of range for file {path}. Expected 1-{offsets[path][1]}"
                        )

                    # If we have reached this point, we are ready to replace the annotation
                    target_page = merged.pages[page_number - 1 + offsets[path][0]]

                    destination = Array([target_page.obj, Name("/Fit")])

                    del annotation.A
                    annotation.Dest = destination
            except:
                pass

    return merged
