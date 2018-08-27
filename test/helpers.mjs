import mkdirp from "mkdirp";
import { symlinkSync } from "fs";
import { spawn } from "child_process";
import globby from "globby";
import { dirname, basename } from "path";
import { resolve } from "url";
import EventEmitter from "events";
import stripAnsi from "strip-ansi";

export function getFixtures(...globs) {
  return globby
    .sync([...globs, "!./test/*.mjs", "!./**/cli.mjs"])
    .map(fixture => {
      const title = fixture
        .replace(/^.+test\//, "")
        .replace(/\//g, " ")
        .slice(0, -4);

      return { title, fixture };
    });
}

export function runAsync(...args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "node",
      ["--experimental-modules", "--no-warnings", ...args],
      { stdio: "inherit" }
    );
    child.on("exit", code => {
      code ? reject(code) : resolve(code);
    });
  });
}

export class Reporter extends EventEmitter {
  constructor() {
    super();

    this.failCount = 0;
    this.failures = [];
    this.on("failed", (test, error) => {
      this.failCount++;
      this.failures.push(error.message);
    });
  }
}

export class Process {
  constructor() {
    this.data = {
      stdout: "",
      stderr: ""
    };
    this.stdout = {
      write: chunk => {
        this.data.stdout += stripAnsi(String(chunk));
      }
    };
    this.stderr = {
      write: chunk => {
        this.data.stderr += stripAnsi(String(chunk));
      }
    };
  }
}
