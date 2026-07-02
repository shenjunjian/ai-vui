#!/usr/bin/env node

import { runTemplateCLI, type Template } from "bingo";

import template from "./template.ts";

process.exitCode = await runTemplateCLI(template as unknown as Template);
