import Describe from "./describe";

const root = new Describe(null);

[
  "setOptions",
  "before",
  "beforeEach",
  "afterEach",
  "after",
  "describe",
  "it"
].forEach(key => {
  global[key] = root[key];
});

export default root;
