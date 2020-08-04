import knex from "knex";
import { isProduction } from "@tkesgar/reno";

export default knex({
  client: "mysql2",
  connection: {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_NAME,
  },
  asyncStackTraces: !isProduction(),
});
