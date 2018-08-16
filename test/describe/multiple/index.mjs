import { describe } from "eastern";
import delay from "delay";

describe("foo");
describe("bar");
describe("baz", it => {
  it("baz-foo");
  it.skip("baz-foo");
  it("baz-baz", async () => {
    await delay(5);
  });

  it("baz-bar", () => {});
  it("baz-bar", () => {});
  it("baz-bar", () => {});
});
