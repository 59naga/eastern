setOptions({ concurrency: 1 });
describe("foo", (it, describe) => {
  it("foo", () => 1);
  it.only("bar", () => 2);
  describe("baz", it => {
    it.only("foo", () => 3);
  });
});
it("bar", () => 4);
describe("baz", (it, describe) => {
  it("foo", () => 5);
  describe.only("bar", (it, describe) => {
    it("foo", () => 6);
    describe("bar", it => {
      it("foo", () => 7);
    });
  });
});

export const stdout = `
  foo
    -  foo
    ✓  bar (ELAPSED ms)
    baz
      ✓  foo (ELAPSED ms)
  -  bar
  baz
    -  foo
    bar
      ✓  foo (ELAPSED ms)
      bar
        ✓  foo (ELAPSED ms)

  4 passing (ELAPSED ms)
  3 pending
`;
