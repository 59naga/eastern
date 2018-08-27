it("foo", () => 1);
it("bar", () => 2);
after(() => 3);

export const expects = [1, 2, 3];
