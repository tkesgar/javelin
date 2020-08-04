exports.up = async (knex) => {
  await knex.schema.createTable("board", (table) => {
    table.bigIncrements("id");

    table.timestamp("time_created").notNullable().defaultTo(knex.fn.now());

    table
      .timestamp("time_updated")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    table.string("slug", 16).notNullable();

    table.string("title", 40).notNullable();

    table.unique("slug");
  });

  await knex.schema.createTable("section", (table) => {
    table.bigIncrements("id");

    table.timestamp("time_created").notNullable().defaultTo(knex.fn.now());

    table
      .timestamp("time_updated")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    table.bigInteger("board_id").unsigned().notNullable();

    table.string("title", 40).notNullable();

    table.integer("order").notNullable().defaultTo(0);

    table
      .foreign("board_id")
      .references("board.id")
      .onUpdate("restrict")
      .onDelete("cascade");
  });

  await knex.schema.createTable("card", (table) => {
    table.bigIncrements("id");

    table.timestamp("time_created").notNullable().defaultTo(knex.fn.now());

    table
      .timestamp("time_updated")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    table.bigInteger("section_id").unsigned().notNullable();

    table.string("content", 1000).notNullable();

    table.integer("vote").notNullable().defaultTo(0);

    table
      .foreign("section_id")
      .references("section.id")
      .onUpdate("restrict")
      .onDelete("cascade");
  });
};

exports.down = async (knex) => {
  await knex.schema.table("section", (table) => {
    table.dropForeign("board_id");
  });

  await knex.schema.table("card", (table) => {
    table.dropForeign("section_id");
  });

  await knex.schema.dropTable("board");
  await knex.schema.dropTable("section");
  await knex.schema.dropTable("card");
};
