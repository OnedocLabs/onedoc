
onedoc = Onedoc(api_key)

# Define your document
document = {
    "html": "<h1>Hello World</h1>",  # Simple HTML content
    "title": "My First Document",
    "test": True,  # Set to False to use in production
    "save": True,  # Set to True if you want to save the document
}

# Render the document
result = onedoc.render(document)

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
# f = open("hellowordpierre.pdf", "wb")
# f.write(result.get("file"))
# f.close()

print(result)