require("dotenv").config();
const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
const envPath = path.join(__dirname, "../.env");

if (!fs.existsSync(schemaPath)) {
  console.error("Prisma schema not found at", schemaPath);
  process.exit(1);
}

// 1. Determine DB_TYPE ("sqlite" or "postgres")
const dbTypeRaw = (process.env.DB_TYPE || "").toLowerCase().trim();
let targetProvider = "sqlite";
let activeUrl = "";

if (dbTypeRaw === "postgres" || dbTypeRaw === "postgresql") {
  targetProvider = "postgresql";
  activeUrl = process.env.POSTGRES_DATABASE_URL || process.env.DATABASE_URL || "";
} else if (dbTypeRaw === "sqlite") {
  targetProvider = "sqlite";
  activeUrl = process.env.SQLITE_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db";
} else {
  // Auto-detection fallback
  if (process.env.POSTGRES_DATABASE_URL && !process.env.SQLITE_DATABASE_URL) {
    targetProvider = "postgresql";
    activeUrl = process.env.POSTGRES_DATABASE_URL;
  } else if (process.env.DATABASE_URL?.startsWith("postgres")) {
    targetProvider = "postgresql";
    activeUrl = process.env.DATABASE_URL;
  } else {
    targetProvider = "sqlite";
    activeUrl = process.env.SQLITE_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db";
  }
}

// 2. Update schema.prisma provider
let schema = fs.readFileSync(schemaPath, "utf-8");
const currentProviderMatch = schema.match(/provider\s*=\s*"(sqlite|postgresql)"/);
const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;

if (currentProvider !== targetProvider) {
  schema = schema.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${targetProvider}"`
  );
  fs.writeFileSync(schemaPath, schema, "utf-8");
  console.log(`[Database Config] Synced schema.prisma datasource provider: "${targetProvider}"`);
} else {
  console.log(`[Database Config] schema.prisma datasource provider is "${targetProvider}"`);
}

// 3. Sync active DATABASE_URL in .env if both specific URLs exist
if (fs.existsSync(envPath) && activeUrl) {
  let envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split(/\r?\n/);
  let updated = false;

  const newLines = lines.map((line) => {
    if (line.trim().startsWith("DATABASE_URL=")) {
      updated = true;
      return `DATABASE_URL="${activeUrl}"`;
    }
    return line;
  });

  if (!updated) {
    newLines.push(`DATABASE_URL="${activeUrl}"`);
  }

  const finalEnv = newLines.join("\n");
  if (finalEnv !== envContent) {
    fs.writeFileSync(envPath, finalEnv, "utf-8");
    console.log(`[Database Config] Synced DATABASE_URL in .env for ${targetProvider}`);
  }
}

console.log(`[Database Config] Active Mode: ${targetProvider.toUpperCase()}`);
