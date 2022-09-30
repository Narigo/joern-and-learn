import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY;
const apiBase = process.env.AIRTABLE_API_BASE;
const dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDirectory = path.resolve(dirname, "../../database");

Airtable.configure({ apiKey });

run()
  .then(() => console.log("done"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

async function run() {
  await mkdir(dbDirectory, { recursive: true });
  const base = Airtable.base(apiBase);
  const [articles, authors] = await Promise.all([
    getArticles({ base }),
    getAuthors({ base }),
  ]);
  await Promise.all([
    writeFile(`${dbDirectory}/articles.json`, JSON.stringify(articles)),
    writeFile(`${dbDirectory}/authors.json`, JSON.stringify(authors)),
  ]);
}

async function getArticles({ base }) {
  let data = [];
  return new Promise((resolve, reject) => {
    base("articles")
      .select({
        view: "database",
        fields: ["title", "author_name", "body", "status"],
      })
      .eachPage(
        (records, fetchNextPage) => {
          data = [
            ...data,
            ...records.flatMap((record) => ({
              id: record.getId(),
              title: record.get("title") ?? "",
              author_name: record.get("author_name") ?? "",
              body: record.get("body") ?? "",
              status: record.get("status") ?? "",
            })),
          ];
          fetchNextPage();
        },
        (err) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        }
      );
  });
}

async function getAuthors({ base }) {
  let data = [];
  return new Promise((resolve, reject) => {
    base("authors")
      .select({
        view: "database",
        fields: ["name", "bio"],
      })
      .eachPage(
        (records, fetchNextPage) => {
          data = [
            ...data,
            ...records.flatMap((record) => ({
              id: record.getId(),
              name: record.get("name") ?? "",
              bio: record.get("bio") ?? "",
            })),
          ];
          fetchNextPage();
        },
        (err) => {
          if (err) {
            return reject(err);
          }
          return resolve(data);
        }
      );
  });
}
