import "./setup-env-vars.ts";
import { expect } from "vitest";
import { installGlobals } from "@remix-run/node";
import { matchers } from "./matchers.cjs";
import "dotenv/config";

expect.extend(matchers);

installGlobals();
