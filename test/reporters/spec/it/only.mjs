it("foo", () => 1);
it.only("bar", () => 2);
it.only("baz", () => 3);

export const stdout = `
  -  foo
  ✓  bar (ELAPSED ms)
  ✓  baz (ELAPSED ms)

  2 passing (ELAPSED ms)
  1 pending
`;
