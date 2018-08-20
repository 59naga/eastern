import Promise from "bluebird";

export default class Describe {
  constructor(parent, options = {}) {
    this.parent = parent;
    this.children = [];
    this.opts = Object.assign(
      {
        timeout: 1000,
        immediate: true,
        concurrency: Infinity
      },
      options
    );
    
    this.isOnly = false;
    this.hooks = {
      before: [],
      beforeEach: [],
      afterEach: [],
      after: []
    };
    this.tasks = [];
    this.describes = [];
    this.taskCount = 0;

    this.beforeEach = this.beforeEach.bind(this);
    this.afterEach = this.afterEach.bind(this);
    this.before = this.before.bind(this);
    this.after = this.after.bind(this);

    this.block = this.it.bind(this);
    this.block.describe = this.describe.bind(this);
    this.block.describe.skip = this.describeSkip.bind(this);
    this.block.it = this.block;
    this.block.skip = this.itSkip.bind(this);
    this.block.only = this.itOnly.bind(this);
    this.block.beforeEach = this.beforeEach.bind(this);
    this.block.afterEach = this.afterEach.bind(this);
    this.block.before = this.before.bind(this);
    this.block.after = this.after.bind(this);
    this.block.setOptions = this.setOptions.bind(this);

    this.waitForChildren = this.waitForChildren.bind(this);
    this.evaluted = new Promise(resolve => {
      if (this.opts.immediate) {
        this.evaluateBlock = () => {};
        setImmediate(resolve);
      } else {
        this.evaluateBlock = resolve;
      }
    });
    this.finish = new Promise(async finish => {
      await this.evaluted;
      try {
        await Promise.each(this.hooks.before, Promise.try);
      } catch (error) {
        this.opts.reporter.fail("before hooks", error);
        process.emit("exit");
      }

      while (this.tasks.length) {
        const tasks = this.tasks.slice();
        this.tasks.length = 0;

        if (this.opts.concurrency === 1) {
          await Promise.each(tasks, ([title, task]) => task());
        } else {
          await Promise.map(tasks, ([title, task]) => task(), {
            concurrency: this.opts.concurrency || Infinity
          });
        }
      }
      await Promise.each(this.describes, describe => describe());

      setImmediate(async () => {
        await this.waitForChildren();
        try {
          await Promise.each(this.hooks.after, Promise.try);
        } catch (error) {
          this.opts.reporter.fail("after hooks", error);
          process.emit("exit");
        }
        finish();
      });
    });
  }
  describe(title, fn, options = {}) {
    this.describes.push(() => {
      const describe = this.child(title, options);
      const reporter = this.opts.reporter;

      reporter.describe(title, fn);
      if (fn === undefined) {
        return;
      }
      fn.call(describe, describe.block);

      return describe.finish;
    });
  }
  describeSkip(title) {
    this.describes.push(() => {
      const reporter = this.opts.reporter;

      reporter.describe(title);

      return Promise.resolve();
    });
  }
  child(title, options) {
    const opts = Object.assign({}, options);
    opts.reporter = this.opts.reporter.child();
    const child = new this.constructor(this, opts);
    this.children.push(child);
    return child;
  }
  waitForChildren() {
    return Promise.map(this.children, child =>
      Promise.all([child.finish, child.waitForChildren()])
    );
  }
  count() {
    return this.children.reduce((prev, child) => {
      return prev + child.count();
    }, this.taskCount);
  }
  setOptions(extra) {
    this.opts = Object.assign(this.opts, extra);
  }

  beforeEach() {
    this.setOptions({ concurrency: 1 });

    const args = [...arguments];
    this.hooks.beforeEach.push(() => execute(...args));
  }
  afterEach() {
    this.setOptions({ concurrency: 1 });

    const args = [...arguments];
    this.hooks.afterEach.push(() => execute(...args));
  }
  before() {
    const args = [...arguments];
    this.hooks.before.push(() => execute(...args));
  }
  after() {
    const args = [...arguments];
    this.hooks.after.push(() => execute(...args));
  }
  it(title, fn, options = {}) {
    if (fn === undefined) {
      return this.itSkip(title);
    }

    const args = [...arguments];
    this.taskCount++;
    this.tasks.push([
      title,
      async () => {
        if (this.isOnly) {
          this.taskCount--;
          return this.opts.reporter.skip(title);
        }
        await this.run(...args);
      }
    ]);
  }
  itOnly(title) {
    this.taskCount++;
    this.isOnly = true;

    const args = [...arguments];
    this.tasks.push([
      title,
      async () => {
        await this.run(...args);
      }
    ]);
  }
  itSkip(title) {
    this.taskCount++;
    this.tasks.push([title, async () => this.opts.reporter.skip(title)]);
  }
  async run(title, fn, options) {
    const start = Date.now();

    try {
      await Promise.each(this.hooks.beforeEach, Promise.try);
    } catch (error) {
      this.opts.reporter.fail("beforeEach hooks", error);
      process.emit("exit");
    }

    try {
      await execute(fn, Object.assign({}, this.opts, options));

      this.opts.reporter.pass(title, start);
    } catch (error) {
      this.opts.reporter.fail(title, error, start);
    }

    try {
      await Promise.each(this.hooks.afterEach, Promise.try);
    } catch (error) {
      this.opts.reporter.fail("afterEach hooks", error);
      process.emit("exit");
    }
  }
}

export function execute(fn, options = {}) {
  let timetId;

  const delay = options.timeout || 1000;
  return Promise.try(fn).timeout(
    delay,
    new Error(`execution timed out (${delay} ms)`)
  );
}
