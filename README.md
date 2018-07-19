# Eastern

a minimal BDD interface / reporter for [ESM Modules](https://nodejs.org/api/esm.html#esm_enabling)

## Installation

```
yarn add -D eastern
```

## Getting started

```js
// test.mjs
import spec from 'eastern';
```

Importing `eastern` will immediately create a hook at process termination.
because when the test is undefined or fails, is to end in the exit code 1.

```bash
node --experimental-modules test.mjs
# exit code 1
```

## API

### `spec(title, context)`

### `spec.x` / `spec.disable`

### `spec.only`

# License

MIT
