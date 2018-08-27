beforeEach(() => {
  throw new Error("foo");
});
it("foo", () => 2);
it("bar", () => 3);
describe();

export const expects = [];
export const fails = ["foo", "foo"];
