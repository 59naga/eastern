import delay from "delay";

setOptions({ timeout: 1 });
describe("foo", it => {
  it("foo", () => delay(5));
});
describe("bar", it => {
  it("foo", () => delay(10));
});

export const fails = [
  "execution timed out (1 ms)",
  "execution timed out (1 ms)"
];
