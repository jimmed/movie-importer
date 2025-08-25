#!/usr/bin/env bun

import { run } from "./lib/tasks";

const query = Bun.argv.slice(Bun.argv.indexOf(import.meta.path) + 1).join(" ");
run(query)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Something went wrong!", error);
    process.exit(1);
  });
