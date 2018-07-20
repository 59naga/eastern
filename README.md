Eastern
---

<p align="right">
  <a href="https://www.npmjs.com/package/eastern">
    <img alt="Npm version" src="https://badge.fury.io/js/eastern.svg">
  </a>
  <a href="https://travis-ci.org/59naga/eastern">
    <img alt="Build Status" src="https://travis-ci.org/59naga/eastern.svg?branch=master">
  </a>
</p>

a minimal BDD interface / reporter for [ESM Modules](https://nodejs.org/api/esm.html#esm_enabling)

Installation
---
```
yarn add -D eastern
```

Getting started
---
```js
// test.mjs
import spec from 'eastern';
```

Importing `eastern` will immediately create a hook at process termination.
because when the test is undefined or fails, is to end in the exit code 1.

```bash
node --experimental-modules test.mjs || echo exit 1
# Eastern: was imported, but spec isn't passed
# exit 1
```

API
---
## `spec(title, context, opts = {})`

If `context` is Promise, the runner waits until 1000ms and handle it as a failure after that.

```js
// test.mjs
import spec from 'eastern';

spec('heavy task', async function(){
  await new Promise(resolve => {
    setTimeout(resolve, 2000)
  })
})
```

```bash
node --experimental-modules test.mjs || echo exit 1
# 1) heavy task
#
# 0 passing (2006 ms)
# 1 failing
#
# 1) heavy task
# Error: timeout of 1000ms
# ...
# exit 1
```

## `spec.skip`

It is handled as todo and not counted as the number of specs

```js
// test.mjs
import spec from 'eastern';

spec.skip('heavy task', async function(){
  await new Promise(resolve => {
    setTimeout(resolve, 2000)
  })
})
```

```bash
node --experimental-modules test.mjs || echo exit 1
# - heavy task
#
# Eastern: was imported, but spec isn't passed
# exit 1
```

## `spec.only`

Things that don't have ".only" will not be run and the entire test will fail unless spec and pass are the equal number.

```js
// test.mjs
import spec from './';

spec('expect passing 1', () => {});
spec.only('expect passing 2', () => {});
```

```bash
node --experimental-modules test.mjs || echo exit 1
# - expect passing 1
# ✓  expect passing 2 (1 ms)
#
# Eastern: number of spec doesn't equal the number of pass
# exit 1
```

License
---
MIT
