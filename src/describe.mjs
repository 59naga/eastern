import Promise from "bluebird";
import throat from "throat";

/**
 * TODO: retry option
 *
 *   - `start`  execution started
 *   - `end`  execution complete
 *   - `suite`  (suite) test suite execution started
 *   - `suite end`  (suite) all tests (and sub-suites) have finished
 *   - `test`  (test) test execution started
 *   - `test end`  (test, err) test completed
 *   - `hook`  (hook) hook execution started
 *   - `hook end`  (hook) hook complete
 *   - `passed`  (test) test passed
 *   - `failed`  (test, err) test failed
 *   - `pending`  (test) test pending
 */

const hookNames = ["before", "beforeEach", "afterEach", "after"];
const defaultOptions = {
  timeout: 1000,
  concurrency: 100
};

export function execute(fn, options = {}) {
  const delay = options.timeout || 1000;
  return Promise.try(fn).timeout(
    delay,
    new Error(`execution timed out (${delay} ms)`)
  );
}

export default class Describe {
  constructor(parent, title, options = {}) {
    this.parent = parent;
    this.title = title;
    this.tasks = [];

    this.hooks = hookNames.reduce((hooks, key) => {
      hooks[key] = [];
      this[key] = (fn, options = {}) => {
        this.hooks[key].push(async reporter => {
          const opts = Object.assign({}, this.opts, options);
          return execute(fn, opts);
        });
      };

      return hooks;
    }, {});

    Object.defineProperty(this, "opts", {
      get() {
        if (this.parent) {
          return Object.assign({}, this.parent.opts, this._opts);
        }
        return Object.assign({}, defaultOptions, this._opts);
      },
      set(value) {
        this._opts = Object.assign({}, this._opts, value);
      }
    });
    this.opts = options;

    this.methodAllBind();
    this.it.skip = this.itSkip;
    this.it.only = this.itOnly;
    hookNames.reduce((hooks, key) => {
      this.it[key] = this[key];
      return hooks;
    }, {});

    this.describe.skip = this.descripbeSkip;
    this.describe.only = this.descripbeOnly;
  }
  methodAllBind() {
    Object.getOwnPropertyNames(this.constructor.prototype).forEach(key => {
      if (typeof this[key] === "function") {
        this[key] = this[key].bind(this);
      }
    });
  }
  setOptions(options = {}) {
    this.opts = options;
  }
  setOptionsRoot(options = {}) {
    if (this.parent) {
      return this.parent.setOptionsRoot(options);
    }
    this.setOptions(options);
  }

  async runHook(key, reporter) {
    if (this.hooks[key].length === 0) {
      return [];
    }
    reporter.emit("hook", key);

    const values = await Promise.reduce(
      this.hooks[key],
      async (values, hook) => {
        values.push(await hook());
        return values;
      },
      []
    );

    reporter.emit("hook end", key);

    return values;
  }

  it(title, fn, options = {}) {
    this.tasks.push(async reporter => {
      const opts = Object.assign({}, this.opts, options);
      const test = { title, opts };
      if (fn) {
        reporter.emit("test", test);
      }

      if (fn === undefined || (opts.only && !opts.onlyIgnore)) {
        reporter.emit("pending", test);
        return;
      }

      const start = Date.now();
      let values = [];
      let error;
      try {
        values = values.concat(await this.runHook("beforeEach", reporter));

        test.value = await execute(fn, opts);
        test.elapsed = Date.now() - start;

        if (test.value) {
          values.push(test.value);
        }

        values = values.concat(await this.runHook("afterEach", reporter));

        test.state = "passed";
      } catch (e) {
        error = e;
        test.state = "failed";
        test.elapsed = Date.now() - start;
      }

      reporter.emit(test.state, test, error);
      reporter.emit("test end", test, error);
      return values;
    });
  }
  itSkip(title, fn, options = {}) {
    this.it(title, undefined, options);
  }
  itOnly(title, fn, options = {}) {
    this.setOptionsRoot({ only: true });
    this.it(title, fn, Object.assign({}, options, { onlyIgnore: true }));
  }
  describe(title, fn, options = {}) {
    const describe = new this.constructor(this, title, options);
    if (fn) {
      fn.call(describe, describe.it, describe.describe);
    }

    this.tasks.push(async reporter => {
      if (fn) {
        reporter.emit("suite", describe);

        const values = await describe.evaluate(reporter);

        reporter.emit("suite end", describe);

        return values;
      } else {
        reporter.emit("pending", describe);
        return [];
      }
    });
  }
  descripbeSkip(title, fn, options = {}) {
    this.describe(title, undefined, options);
  }
  descripbeOnly(title, fn, options = {}) {
    this.setOptionsRoot({ only: true });
    this.describe(title, fn, Object.assign({}, options, { onlyIgnore: true }));
  }
  async evaluate(reporter) {
    const concurrent = throat(Promise);

    if (!this.parent) {
      reporter.emit("start");
    }

    let values = [];
    try {
      values = values.concat(await this.runHook("before", reporter));

      try {
        await Promise.all(
          this.tasks.map(
            concurrent(this.opts.concurrency, async task => {
              const value = await task(reporter);
              if (value) {
                values = values.concat(value);
              }
            })
          )
        );
      } catch (error) {
        throw error;
      }

      try {
        values = values.concat(await this.runHook("after", reporter));
      } catch (error) {
        reporter.emit("failed", { title: "after hook" }, error);
      }
    } catch (error) {
      reporter.emit("failed", { title: "before hook" }, error);
    }

    if (!this.parent) {
      reporter.emit("end");
    }
    return values;
  }
}
