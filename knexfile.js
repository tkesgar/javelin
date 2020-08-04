const { loadEnv } = require("@tkesgar/reno");

loadEnv();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_NAME,
    },
    migrations: {
      tableName: "_knex_migrations",
    },
  },
  production: {
    client: "mysql2",
    connection: {
      host: process.env.MYSQL_MIGRATION_HOST,
      port: process.env.MYSQL_MIGRATION_PORT,
      user: process.env.MYSQL_MIGRATION_USER,
      password: process.env.MYSQL_MIGRATION_PASS,
      database: process.env.MYSQL_MIGRATION_NAME,
    },
    migrations: {
      tableName: "_knex_migrations",
    },
  },
};
