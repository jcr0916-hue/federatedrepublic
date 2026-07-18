// Derived at build time from the authoritative constitution_data.json.
// This is the SINGLE SOURCE for provision/article counts shown on the site.
// Never hardcode these numbers in a page again — reference {{ constitution.provisions }}
// and {{ constitution.articles }} so an amendment updates every mention at once.
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("./constitution_data.json", "utf8"));
const provisions = data.reduce((n, article) => n + article.provisions.length, 0);
const articles = data.length;

export default { provisions, articles };
