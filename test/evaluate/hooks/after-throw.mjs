after(() => {
  throw new Error("foo");
});
it("foo", () => 2);
it("bar", () => 3);
describe();

export const expects = [2, 3];
export const fails = ["foo"];
