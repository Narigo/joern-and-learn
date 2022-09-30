import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import articles from "../database/articles.json" assert { type: "json" };

const dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(dirname, "../build");

const createIndexPage = (posts) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cheap hosting</title>
</head>
<body>
    <h1>Hello to Jörn and Learn!</h1>
    <ul>
    ${posts
      .filter((post) => post.status === "done")
      .map((post) => {
        return `<li><a href="${post.id}/">${post.title}</a></li>`;
      })
      .join("")}
    </ul>
</body>
</html>
`;

const createPostPage = (post) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title}</title>
</head>
<body>
    <h1>${post.title}</h1>
    ${post.body}
    <footer><a href="..">Back to index</a></footer>
</body>
</html>
`;

run()
  .then(() => console.log("done"))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

async function run() {
  await mkdir(buildDir, { recursive: true });
  await writeFile(`${buildDir}/index.html`, createIndexPage(articles));

  const posts = articles
    .filter((post) => post.status === "done")
    .map((post) => {
      const postDir = `${buildDir}/${post.id}`;
      return {
        path: postDir,
        content: createPostPage(post),
      };
    });

  for await (const post of posts) {
    await mkdir(post.path, { recursive: true });
    await writeFile(`${post.path}/index.html`, post.content);
  }
}
