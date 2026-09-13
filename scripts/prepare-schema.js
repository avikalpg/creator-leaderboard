const fs = require("fs");
const path = require("path");
require("dotenv").config();

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
if (!fs.existsSync(schemaPath)) {
  console.error("Prisma schema not found at", schemaPath);
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL || "";
let targetProvider = "sqlite";

if (process.env.DB_PROVIDER) {
  targetProvider = process.env.DB_PROVIDER.toLowerCase() === "postgresql" || process.env.DB_PROVIDER.toLowerCase() === "postgres" ? "postgresql" : "sqlite";
} else if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
  targetProvider = "postgresql";
}

let schema = fs.readFileSync(schemaPath, "utf-8");
const currentProviderMatch = schema.match(/provider\s*=\s*"(sqlite|postgresql)"/);
const currentProvider = currentProviderMatch ? currentProviderMatch[1] : null;

if (currentProvider !== targetProvider) {
  schema = schema.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${targetProvider}"`
  );
  fs.writeFileSync(schemaPath, schema, "utf-8");
  console.log(`[Database Config] Updated prisma/schema.prisma provider to "${targetProvider}"`);
} else {
  console.log(`[Database Config] prisma/schema.prisma already configured for "${targetProvider}"`);
}
