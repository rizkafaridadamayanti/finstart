import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const srcDir = path.join(root, "src");
const errors = [];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const sourceFiles = await collectFiles(srcDir);
const reactExtensions = sourceFiles.filter((file) => /\.(jsx|tsx)$/i.test(file));
for (const file of reactExtensions) {
  errors.push(`File React/JSX tidak diperbolehkan: ${path.relative(root, file)}`);
}

const forbiddenPatterns = [
  ["useState", /\buseState\b/],
  ["useEffect", /\buseEffect\b/],
  ["useMemo", /\buseMemo\b/],
  ["useCallback", /\buseCallback\b/],
  ["ReactDOM", /\bReactDOM\b/],
  ["createRoot", /\bcreateRoot\b/],
  ["className", /\bclassName\s*=/],
  ["onClick", /\bonClick\s*=/],
  ["onChange", /\bonChange\s*=/],
];

for (const file of sourceFiles.filter((item) => /\.(vue|js|ts)$/i.test(item))) {
  const source = await readFile(file, "utf8");
  for (const [label, pattern] of forbiddenPatterns) {
    if (pattern.test(source)) {
      errors.push(`${label} ditemukan pada ${path.relative(root, file)}`);
    }
  }

  if (file.endsWith(".vue")) {
    const templateMatch = source.match(/<template(?:\s[^>]*)?>([\s\S]*?)<\/template>/i);
    if (!templateMatch) {
      errors.push(`SFC tanpa <template>: ${path.relative(root, file)}`);
      continue;
    }
    const template = templateMatch[1];
    if (template.includes("=>")) {
      errors.push(
        `Arrow function masih berada di template Vue: ${path.relative(root, file)}`,
      );
    }
    if (/@[\w:-]+\s*=\s*["'][^"']*=>/s.test(template)) {
      errors.push(
        `Inline arrow event handler ditemukan: ${path.relative(root, file)}`,
      );
    }
  }
}

const packageJson = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
for (const section of ["dependencies", "devDependencies"]) {
  const dependencies = packageJson[section] || {};
  for (const dependency of ["react", "react-dom", "@vitejs/plugin-react"]) {
    if (dependency in dependencies) {
      errors.push(`${dependency} masih terdaftar pada ${section}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Audit Vue native gagal:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const vueFileCount = sourceFiles.filter((file) => file.endsWith(".vue")).length;
console.log(
  `Audit Vue native lulus: ${vueFileCount} SFC, tanpa React/JSX dan tanpa arrow function di template.`,
);
