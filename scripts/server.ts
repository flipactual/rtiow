import { serveDir } from "https://deno.land/std@0.194.0/http/file_server.ts";

Deno.serve({ port: 3000 }, (req: Request) => {
  return serveDir(req, {
    fsRoot: "dist",
  });
});
