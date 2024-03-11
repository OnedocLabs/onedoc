
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

print(result)