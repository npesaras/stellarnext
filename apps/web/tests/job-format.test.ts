import assert from "node:assert/strict";
import test from "node:test";

import {
  formatEmploymentType,
  formatSalary,
  formatWorkModel,
  jobLocationLabel,
} from "../src/components/jobs/job-format.ts";

test("salary formatting covers missing and one-sided ranges", () => {
  assert.equal(formatSalary(null, null), "Salary not listed");
  assert.equal(formatSalary(30_000, null), "From ₱30,000");
  assert.equal(formatSalary(null, 50_000), "Up to ₱50,000");
  assert.equal(formatSalary(30_000, 50_000), "₱30,000 – ₱50,000");
});

test("nullable job details render safe labels", () => {
  assert.equal(jobLocationLabel(null), "Location not listed");
  assert.equal(jobLocationLabel(" Manila "), "Manila");
  assert.equal(formatWorkModel(null), "Work model not listed");
  assert.equal(formatWorkModel("onsite"), "On-site");
  assert.equal(formatEmploymentType(null), "Type not listed");
  assert.equal(formatEmploymentType("full_time"), "full time");
});
