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

a minimal & blazing fast BDD Framework for [ESM Modules](https://nodejs.org/api/esm.html#esm_enabling)

Installation
---

```bash
npm install eastern eastern-cli --global
# or
yarn global add eastern eastern-cli
```

The `eastern` command defines `global.it`, `global.describe`.
And find and run `test.mjs` / `test/**/*.mjs`.

```bash
eastern
# 
#   0 passing (5 ms)
```

API
---
## `it.setOptions` / `setOptions`

```js
it.setOptions({ concurrency: 1, timeout: 100 });
```

> Specs of the same level are executed in parallel, and there is a possibility that hooks conflict.
> In that case, please set the `concurrency` of that level to 1 and execute it in series. using `it.setOptions`

## `it(title, context)`

```js
it("foo", () => {});
```

```
  ✓  foo (1 ms)

  1 passing (7 ms)
```

## `it(title)`, `it.skip(title)`

```js
it("foo");
it.skip("bar");
```

```

  -  foo
  -  bar

  0 passing (6 ms)
  2 pending

```

## `it.only`

```js
it("foo", () => {
  throw new Error("ignored");
});
it.only("bar", () => {});
it.only("bar", () => {});
```

```
  -  foo
  ✓  bar (2 ms)
  ✓  bar (2 ms)

  1 passing (8 ms)
  1 pending
```

## `it.before`

```js
import delay from "delay";

it.before(() => {
  console.log("foo");
});

it.before(async () => {
  await delay(15);
  console.log("bar");
});

it.before(() => {
  console.log("baz");
});

it("beep", () => {});
it("beep", () => {});
it("beep", () => {});
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

## `it.after`

```js
import delay from "delay";

it.after(() => {
  console.log("bar");
});

it.after(async () => {
  await delay(15);
  console.log("baz");
});

it.after(() => {
  console.log("beep");
});

it("foo", () => {});
it("foo", () => {});
it("foo", () => {});
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

## `it.beforeEach`

```js
it.setOptions({ concurrency: 1 });
it.beforeEach(async () => {
  await delay(5);
  console.log("foo");
});
it("bar", () => {});
it("bar", () => {});
it("bar", () => {});
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

## `it.afterEach`

```js
import delay from "delay";

it.setOptions({ concurrency: 1 });
it.afterEach(async () => {
  await delay(5);
  console.log("bar");
});
it("foo", () => {});
it("foo", () => {});
it("foo", () => {});
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

## `describe(title, fn(it, describe){})`
## `describe(title)`, `describe.skip(title)`

```js
import delay from "delay";

it.setOptions({ concurrency: 1 });
describe("1", it, describe) => {
  it.before(() => {
    console.log("  1-before");
  });
  it.beforeEach(() => {
    console.log("  1-beforeEach");
  });
  it.afterEach(() => {
    console.log("  1-afterEach");
  });
  it.after(() => {
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
  describe("3", it, describe) => {
    it.before(() => {
      console.log("      3-before");
    });
    it.beforeEach(() => {
      console.log("      3-beforeEach");
    });
    it.afterEach(() => {
      console.log("      3-afterEach");
    });
    it.after(() => {
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
  1-before
    -  1-1
    -  1-2
    -  1-notonly-1
  1-beforeEach
    ✓  1-only-1 (7 ms)
  1-afterEach
  1-beforeEach
    ✓  1-only-2 (6 ms)
  1-afterEach
    2
    3
      3-before
      -  3-1
      -  3-2
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