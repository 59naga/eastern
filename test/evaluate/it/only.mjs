it("foo", () => 1);
it.only("bar", () => 2);
it.only("baz", () => 3);

export const expects = [2, 3];
