describe.only("foo", (it, describe) => {
  it("foo", () => 1);
  it.only("bar", () => 2);
});

export const expects = [2];
