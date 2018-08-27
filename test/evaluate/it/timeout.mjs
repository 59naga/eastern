import delay from "delay";

setOptions({ timeout: 1 });
it("foo", () => delay(10));

export const fails = ["execution timed out (1 ms)"];
