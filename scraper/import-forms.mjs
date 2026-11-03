// Raw form responses must never be fetched or written by a public-repository job.
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function publicFormPlaceholder() {
  return {
    candidates: [],
    intake: "private",
    note: "フォーム回答は非公開の回答シートで確認します。公開データへは取り込みません。",
  };
}

export async function writePublicFormPlaceholders(directory = new URL("../data/", import.meta.url)) {
  const json = `${JSON.stringify(publicFormPlaceholder(), null, 2)}\n`;
  for (const filename of ["form-candidates.json", "join-candidates.json"]) {
    await writeFile(new URL(filename, directory), json, "utf8");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writePublicFormPlaceholders().then(() => {
    console.log("フォーム回答の公開取り込みは停止中です。非公開の回答シートで確認してください。");
  }).catch(() => {
    console.error("公開用フォーム案内ファイルの更新に失敗しました。");
    process.exitCode = 1;
  });
}
