import { bundle } from "https://deno.land/x/emit@0.31.2/mod.ts";

try {
  const { code: mainCode, map: mainMap } = await bundle("./src/main.ts", {
    compilerOptions: { sourceMap: true },
    importMap: "deno.json",
  });

  await Deno.writeTextFile("./dist/main.js", mainCode);
  await Deno.writeTextFile("./dist/main.map.js", mainMap!);

  const { code: workerCode, map: workerMap } = await bundle("./src/worker.ts", {
    compilerOptions: { sourceMap: true },
    importMap: "deno.json",
  });

  await Deno.writeTextFile("./dist/worker.js", workerCode);
  await Deno.writeTextFile("./dist/worker.map.js", workerMap!);
} catch (error) {
  console.error("Error bundling:", error);
}
