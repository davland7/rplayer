#!/usr/bin/env node

/**
 * Simple script to build only the RPlayer library (TypeScript version)
 * Focuses on generating the required files only
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== Simplified build of RPlayer library v3.0.0 ===\n");

try {
	// Ensure lib directory exists
	const libDir = path.resolve(__dirname, "lib");
	if (!fs.existsSync(libDir)) {
		fs.mkdirSync(libDir, { recursive: true });
		console.log("Created lib directory\n");
	}

	// Use npm run to execute Vite build scripts
	// Build UMD version
	console.log("Building UMD module for CDN...");
	execSync("npm run build:lib:umd", { stdio: "inherit" });
	console.log("UMD module built successfully\n");

	// Build ES version
	console.log("Building ES module...");
	execSync("npm run build:lib:es", { stdio: "inherit" });
	console.log("ES module built successfully\n");

	// Check generated files
	console.log("Checking generated files:");
	const libFiles = fs.readdirSync(libDir);

	if (libFiles.length > 0) {
		console.log("Files in lib/:");
		libFiles.forEach((file) => console.log(`- ${file}`));
	} else {
		console.error("No files found in lib/ directory");
		process.exit(1);
	}

	console.log("\nLibrary built successfully!");
} catch (error) {
	console.error("Build error:", error instanceof Error ? error.message : String(error));
	process.exit(1);
}
