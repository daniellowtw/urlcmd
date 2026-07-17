# List available recipes
default:
    @just --list

# Type-check and compile+minify src/main.ts -> js/main.js
build:
    bun x tsc
    bun build ./src/main.ts --minify --format iife --outfile js/main.js

# Type-check only (no output)
check:
    bun x tsc

# Build, then run the unit tests against the compiled output
test: build
    bun test

# Build, then serve the app locally at http://localhost:8000
serve: build
    python3 -m http.server 8000
