const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  dialect: "mysql",
  schema: "./db/schema.js",
  out: "./drizzle/generated",
  dbCredentials: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "finstart",
  },
  verbose: true,
  strict: true,
});
