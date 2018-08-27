setOptions({ concurrency: 1 });
before(() => {
  throw new Error("foo");
});
it("foo", () => 2);
it("bar", () => 3);

export const pass = false;
export const stdout = `
  1)  before hook

  0 passing (ELAPSED ms)
  1 failing
`;
export const stderr = `
  1)  before hook
  Error: foo
`;
