from onedoc import Onedoc
from dotenv import load_dotenv
from os import getenv

load_dotenv()

onedoc = Onedoc(getenv("ONEDOC_API_KEY"))


with open("onedoc/styles.css", 'r') as file:
    # Read the entire content of the file into a variable
    css_content = file.read()
print(css_content)

# Define your document
document = {
    "html": "<h1>Table of contents</h1><a href='file://test.pdf#page=1'>First page</a><br/><a href='file://test.pdf#page=2'>ĐSecond page</a>",  # Simple HTML content
    "title": "My First Document",
    "test": False,  # Set to False to use in production
    "save": False,  # Set to True if you want to save the document
    "assets":[
        {
            "content": css_content ,
            "path": "styles.css"
        }
    ]
}

# Start a timer
import time
start = time.time()

# Render the document
result = onedoc.render(document)

# End the timer
end = time.time()
print("Time elapsed: ", end - start)

# print(result)
#for files that are not saved, remember to use "wb" when writing file
# onedoc = Onedoc(api_key)

# # Define your document
# document = {
#     "html": "<h1>Hello World</h1>",  # Simple HTML content
#     "title": "My First Document",
#     "test": True,  # Set to False to use in production
#     "save": False,  # Set to True if you want to save the document
# }

# # Render the document
# result = onedoc.render(document)
# print(result.get("file"))
f = open("test-latin.pdf", "wb")
f.write(result.get("file"))
f.close()

# Store the result to toc.pdf
#f = open("toc.pdf", "wb")
#f.write(result.get("file"))
#f.close()

# firstFile = open("toc.pdf", "rb")
# secondFile = open("test.pdf", "rb")

# result = onedoc.merge(firstFile, "toc.pdf", secondFile, "test.pdf")

# # Result is a pdf file
# f = open("merged.pdf", "wb")
# f.write(result.get('file'))
# f.close()
