import delay from "delay";

setOptions({ concurrency: 1 });
setOptions({ timeout: 1 });
describe("foo", it => {
  it("foo", () => delay(5));
});
describe("bar", it => {
  it("foo", () => delay(10));
});

export const stdout = `
  foo
    1)  foo (ELAPSED ms)
  bar
    2)  foo (ELAPSED ms)

  0 passing (ELAPSED ms)
  2 failing
`;
export const stderr = `
  1)  foo
  Error: execution timed out (1 ms)

  2)  foo
  Error: execution timed out (1 ms)
`;
