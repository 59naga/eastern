import Promise from "bluebird";
import mkdirp from "mkdirp";
import { symlinkSync } from "fs";
import { spawn } from "child_process";
import globby from "globby";
import { dirname, basename } from "path";
import { resolve } from "url";

export function easternRegister() {
  mkdirp.sync("./node_modules/eastern");
  try {
    symlinkSync("../../src/index.mjs", "./node_modules/eastern/index.mjs");
  } catch (e) {}
}

export function getLabelsAndFixtures(globs) {
  return globby.sync(globs).reduce((labels, fixture) => {
    const label = basename(dirname(dirname(fixture)));
    const title = basename(dirname(fixture));
    const expected = fixture.replace("index.mjs", "expected.mjs");
    const expectedUrl = resolve(resolve(import.meta.url, ".."), expected);

    if (labels[label] === undefined) {
      labels[label] = [];
    }
    labels[label].push({ title, fixture, expected: expectedUrl });

    return labels;
  }, {});
}

export function runAsync(filename) {
  return new Promise(resolve => {
    const child = spawn("node", [
      "--experimental-modules",
      "--no-warnings",
      filename
    ]);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", data => (stdout += data.toString()));
    child.stderr.on("data", data => (stderr += data.toString()));
    child.on("exit", code => {
      resolve({ code, stdout, stderr });
    });
  });
}
