import { describe } from "eastern";
import delay from "delay";

describe("foo");
describe.skip("bar", it => {
  it("bar-foo");
  it.skip("bar-foo");
  it("bar-baz", async () => {
    await delay(15);
  });

  it("bar-bar", () => {});
  it("bar-bar", () => {});
  it("bar-bar", () => {});
});
describe.skip("baz", it => {
  it("baz-foo");
  it.skip("baz-foo");
  it("baz-baz", async () => {
    await delay(5);
  });

  it("baz-bar", () => {});
  it("baz-bar", () => {});
  it("baz-bar", () => {});
});
