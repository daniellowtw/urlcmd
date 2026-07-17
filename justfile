# List available recipes
default:
    @just --list

# Type-check and compile src/*.ts -> js/main.js
build:
    bun x tsc

# Type-check only (no output)
check:
    bun x tsc --noEmit

# Build, then run the unit tests against the compiled output
test: build
    bun test

# Build, then serve the app locally at http://localhost:8000
serve: build
    python3 -m http.server 8000
