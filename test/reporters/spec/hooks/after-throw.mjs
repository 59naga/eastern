setOptions({ concurrency: 1 });
after(() => {
  throw new Error("foo");
});
it("foo", () => 2);
it("bar", () => 3);

export const pass = false;
export const stdout = `
  ✓  foo (ELAPSED ms)
  ✓  bar (ELAPSED ms)
  1)  after hook

  2 passing (ELAPSED ms)
  1 failing
`;
export const stderr = `
  1)  after hook
  Error: foo
`;
