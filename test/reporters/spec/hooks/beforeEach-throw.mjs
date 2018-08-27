setOptions({ concurrency: 1 });
beforeEach(() => {
  throw new Error("foo");
});
it("foo", () => 2);
it("bar", () => 3);

export const pass = false;
export const stdout = `
  1)  foo (ELAPSED ms)
  2)  bar (ELAPSED ms)

  0 passing (ELAPSED ms)
  2 failing
`;
export const stderr = `
  1)  foo
  Error: foo

  2)  bar
  Error: foo
`;
