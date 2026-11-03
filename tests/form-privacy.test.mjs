import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { publicFormPlaceholder, writePublicFormPlaceholders } from "../scraper/import-forms.mjs";

test("public form output contains no submitted fields or records", () => {
  assert.deepEqual(Object.keys(publicFormPlaceholder()).sort(), ["candidates", "intake", "note"]);
  assert.deepEqual(publicFormPlaceholder().candidates, []);
  assert.equal(publicFormPlaceholder().intake, "private");
  const first = publicFormPlaceholder();
  first.candidates.push({ contact: "test@example.invalid" });
  assert.deepEqual(publicFormPlaceholder().candidates, []);
});

test("form export makes no network requests and ignores legacy CSV settings", async () => {
  const dir = await mkdtemp(join(tmpdir(), "form-privacy-"));
  const fetch = globalThis.fetch;
  const oldEvent = process.env.EVENT_FORM_CSV_URL;
  const oldJoin = process.env.JOIN_FORM_CSV_URL;
  globalThis.fetch = () => { throw new Error("Raw form data must not be fetched"); };
  process.env.EVENT_FORM_CSV_URL = "https://example.invalid/private-events";
  process.env.JOIN_FORM_CSV_URL = "https://example.invalid/private-join";
  try {
    await writePublicFormPlaceholders(pathToFileURL(dir + sep));
    for (const file of ["form-candidates.json", "join-candidates.json"]) {
      assert.deepEqual(JSON.parse(await readFile(join(dir, file), "utf8")), publicFormPlaceholder());
    }
  } finally {
    globalThis.fetch = fetch;
    if (oldEvent === undefined) delete process.env.EVENT_FORM_CSV_URL;
    else process.env.EVENT_FORM_CSV_URL = oldEvent;
    if (oldJoin === undefined) delete process.env.JOIN_FORM_CSV_URL;
    else process.env.JOIN_FORM_CSV_URL = oldJoin;
    await rm(dir, { recursive: true, force: true });
  }
});

test("tracked form JSON files are safe public placeholders", async () => {
  for (const file of ["form-candidates.json", "join-candidates.json"]) {
    const data = JSON.parse(await readFile(new URL(`../data/${file}`, import.meta.url), "utf8"));
    assert.deepEqual(data, publicFormPlaceholder());
  }
});

test("public workflow no longer passes private intake URLs", async () => {
  const workflow = await readFile(new URL("../.github/workflows/scrape.yml", import.meta.url), "utf8");
  assert.doesNotMatch(workflow, /(?:EVENT|JOIN)_FORM_CSV_URL/);
});
