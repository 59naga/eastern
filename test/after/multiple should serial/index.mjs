import spec from "eastern";
import delay from "delay";

spec.after(() => {
  console.log("bar");
});

spec.after(async () => {
  await delay(15);
  console.log("baz");
});

spec.after(() => {
  console.log("beep");
});

spec("foo", () => {});
spec("foo", () => {});
spec("foo", () => {});
