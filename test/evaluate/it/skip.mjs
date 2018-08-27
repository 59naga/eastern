it("foo", () => 1);
it.skip("bar", () => 2);
it("baz");
it("beep", () => 4);

export const expects = [1, 4];
