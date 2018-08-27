it("foo", () => {
  throw new Error("bar");
});

export const stdout = `
  1)  foo (ELAPSED ms)

  0 passing (ELAPSED ms)
  1 failing
`;

export const stderr = `
  1)  foo
  Error: bar
`;
