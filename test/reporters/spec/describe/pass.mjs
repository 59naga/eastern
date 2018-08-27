setOptions({ concurrency: 1 });
describe("foo", it => {
  it("bar", () => 1);
  it("baz", () => 2);
});
it("bar", () => 3);

export const pass = true;
export const stdout = `
  foo
    ✓  bar (ELAPSED ms)
    ✓  baz (ELAPSED ms)
  ✓  bar (ELAPSED ms)

  3 passing (ELAPSED ms)
`;
