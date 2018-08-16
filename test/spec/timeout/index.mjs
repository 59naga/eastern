import spec from "eastern";

spec(
  "foo",
  () =>
    new Promise(resolve => {
      setTimeout(resolve, 100);
    }),
  { timeout: 1 }
);
