// Derived at build time from the authoritative constitution_data.json.
// This is the SINGLE SOURCE for provision/article counts shown on the site.
// Never hardcode these numbers in a page again — reference {{ constitution.provisions }}
// and {{ constitution.articles }} so an amendment updates every mention at once.
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("./constitution_data.json", "utf8"));
// The Preamble is a top-level entry in constitution_data.json but is not an
// Article, so it must be excluded from the article count. (It carries no
// provisions, so the provision count was never affected.)
const realArticles = data.filter((entry) => !entry.preamble);
const provisions = realArticles.reduce((n, article) => n + article.provisions.length, 0);
const articles = realArticles.length;

export default { provisions, articles };
