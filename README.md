<p align="right">
  <img width="300" alt="Eastern" src="https://user-images.githubusercontent.com/1548478/44305426-d7365080-a3b1-11e8-9f7d-0ea817f15db0.png">
</p>

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

Getting started
---
```js
// test.mjs
import spec from 'eastern';
```

Importing `eastern` will immediately create a hook at process termination.
because when the test is undefined or fails, is to end in the exit code 1.

```bash
node --experimental-modules --no-warnings test.mjs || echo "\nTEST FAILING"
# TEST FAILING
```

API
---
## `spec(title, context)`

```js
spec("foo", () => {});
```

```
  ✓  foo (1 ms)

  1 passing (7 ms)
```

## `spec(title)`, `spec.skip`

```js
spec("foo");
spec.skip("bar");
```

```

  -  foo
  -  bar

  0 passing (6 ms)
  2 pending

TEST FAILING
```

## `spec.only`

```js
spec("foo", () => {
  throw new Error("ignored");
});
spec.only("bar", () => {});
spec.only("bar", () => {});
```

```

  -  foo
  ✓  bar (2 ms)

  1 passing (8 ms)
  1 pending

TEST FAILING
```

## `spec.before`

```js
import delay from "delay";

spec.before(() => {
  console.log("foo");
});

spec.before(async () => {
  await delay(15);
  console.log("bar");
});

spec.before(() => {
  console.log("baz");
});

spec("beep", () => {});
spec("beep", () => {});
spec("beep", () => {});
```

```
foo
bar
baz
  ✓  beep (1 ms)
  ✓  beep (1 ms)
  ✓  beep (1 ms)

  3 passing (26 ms)
```

## `spec.after`

```js
import delay from "delay";

spec.after(() => {
  console.log("bar");
});

spec.after(async () => {
  await delay(15);
  console.log("baz");
});

spec.after(() => {
  console.log("beep");
});

spec("foo", () => {});
spec("foo", () => {});
spec("foo", () => {});
```

```
  ✓  foo (1 ms)
  ✓  foo (2 ms)
  ✓  foo (2 ms)
bar
baz
beep

  3 passing (27 ms)
```

## `spec.beforeEach`

```js
spec.beforeEach(async () => {
  await delay(5);
  console.log("foo");
});
spec("bar", () => {});
spec("bar", () => {});
spec("bar", () => {});
```

```
foo
  ✓  bar (8 ms)
foo
  ✓  bar (7 ms)
foo
  ✓  bar (5 ms)

  3 passing (28 ms)
```

## `spec.afterEach`

```js
import delay from "delay";

spec.afterEach(async () => {
  await delay(5);
  console.log("bar");
});
spec("foo", () => {});
spec("foo", () => {});
spec("foo", () => {});
```

```
  ✓  foo (1 ms)
bar
  ✓  foo (0 ms)
bar
  ✓  foo (1 ms)
bar

  3 passing (28 ms)
```

## `spec.setOptions`

```js
spec.setOptions({ concurrency: 1, timeout: 100 });
```

BDD Interface
---
## `describe(title, fn)`

```js
import { describe } from "eastern";
import delay from "delay";

describe("1", ({ before, beforeEach, afterEach, after, it, describe }) => {
  before(() => {
    console.log("  1-before");
  });
  beforeEach(() => {
    console.log("  1-beforeEach");
  });
  afterEach(() => {
    console.log("  1-afterEach");
  });
  after(() => {
    console.log("  1-after");
  });

  it("1-1");
  it.skip("1-2");
  it("1-notonly-1", () => {});
  it.only("1-only-1", async () => {
    await delay(5);
  });
  it.only("1-only-2", async () => {
    await delay(5);
  });

  describe("2");
  describe("3", ({ before, beforeEach, afterEach, after, it, describe }) => {
    before(() => {
      console.log("      3-before");
    });
    beforeEach(() => {
      console.log("      3-beforeEach");
    });
    afterEach(() => {
      console.log("      3-afterEach");
    });
    after(() => {
      console.log("      3-after");
    });

    it("3-1");
    it.skip("3-2");
    it("3-notonly-1", () => {});
    it.only("3-only-1", async () => {
      await delay(5);
    });
    it.only("3-only-2", async () => {
      await delay(5);
    });

    describe("4");
    describe("5", it => {
      it("5");
    });
  });
});
```

```
  1
    -  1-1
    -  1-2
  1-before
    -  1-notonly-1
  1-beforeEach
    ✓  1-only-1 (7 ms)
  1-afterEach
  1-beforeEach
    ✓  1-only-2 (6 ms)
  1-afterEach
    2
    3
      -  3-1
      -  3-2
      3-before
      -  3-notonly-1
      3-beforeEach
      ✓  3-only-1 (7 ms)
      3-afterEach
      3-beforeEach
      ✓  3-only-2 (6 ms)
      3-afterEach
      4
      5
        -  5
      3-after
  1-after

  4 passing (39 ms)
  7 pending

TEST FAILING
```

License
---
MIT
