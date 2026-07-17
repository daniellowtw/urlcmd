# List available recipes
default:
    @just --list

# Run the unit tests
test:
    bun test

# Serve the app locally at http://localhost:8000
serve:
    python3 -m http.server 8000

# Build the browser extension bundle
extension:
    cp -r css examples js index.html extension
    zip -r extension.zip extension
