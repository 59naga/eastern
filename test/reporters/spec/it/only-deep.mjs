setOptions({ concurrency: 1 });
describe("1", (it, describe) => {
  it("1", () => 1);
  describe("2", it => {
    it.only("2", () => 2);
  });
  describe("3", (it, describe) => {
    it("3", () => 3);
    describe("4", it => {
      it("4", () => 4);
    });
    describe("5", it => {
      it.only("5", () => 5);
    });
  });
});

export const stdout = `
  1
    -  1
    2
      ✓  2 (ELAPSED ms)
    3
      -  3
      4
        -  4
      5
        ✓  5 (ELAPSED ms)

  2 passing (ELAPSED ms)
  3 pending
`;
