import delay from "delay";

setOptions({ timeout: 1 });
it("foo", () => delay(10));

export const stdout = `
  1)  foo (ELAPSED ms)

  0 passing (ELAPSED ms)
  1 failing
`;

export const stderr = `
  1)  foo
  Error: execution timed out (1 ms)
`;
