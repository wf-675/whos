import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";

export async function serveStatic(app: Express, _server: Server) {
  // In production, the built files are in dist/public
  // import.meta.dirname points to dist/ when running from dist/index.js
  const distPath = path.resolve(import.meta.dirname, "public");

  // If not found, try relative to project root
  let staticPath = distPath;
  if (!fs.existsSync(staticPath)) {
    // Try from project root
    staticPath = path.resolve(process.cwd(), "dist", "public");
  }

  if (!fs.existsSync(staticPath)) {
    throw new Error(
      `Could not find the build directory: ${staticPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(staticPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(staticPath, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();
