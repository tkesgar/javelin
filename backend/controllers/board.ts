import crypto from "crypto";
import db from "../database";
import { Card } from "react-bootstrap";

export interface BoardData {
  id: number;
  slug: string;
  title: string;
  sections: {
    id: number;
    title: string;
  }[];
}

export interface CardData {
  id: number;
  sectionId: number;
  content: string;
  vote: number;
}

export async function createBoard(
  title: string,
  sectionTitles: string[]
): Promise<BoardData> {
  const slug = crypto.randomBytes(8).toString("hex");

  const [boardId] = await db("board").insert({
    title,
    slug,
  });

  await db("section").insert(
    sectionTitles.map((sectionTitle) => ({
      board_id: boardId,
      title: sectionTitle,
    }))
  );

  const [boardRow] = await db("board").where("id", boardId);
  const sectionRows = await db("section").where("board_id", boardId);

  return {
    id: boardRow.id,
    slug: boardRow.slug,
    title: boardRow.title,
    sections: sectionRows.map((row) => ({
      id: row.id,
      title: row.title,
    })),
  };
}

export async function getBoard(slug: string): Promise<BoardData> {
  const [boardRow] = await db("board").where("slug", slug);
  const sectionRows = await db("section").where("board_id", boardRow.id);

  return {
    id: boardRow.id,
    slug: boardRow.slug,
    title: boardRow.title,
    sections: sectionRows.map((row) => ({
      id: row.id,
      title: row.title,
    })),
  };
}

export async function removeBoard(slug: string): Promise<void> {
  await db("board").where("slug", slug).delete();
}

export async function createCard(
  sectionId: number,
  content = ""
): Promise<CardData> {
  const [cardId] = await db("card").insert({
    section_id: sectionId,
    content,
  });

  const [cardRow] = await db("card").where("id", cardId);

  return {
    id: cardRow.id,
    sectionId: cardRow.section_id,
    content: cardRow.content,
    vote: cardRow.vote,
  };
}

export async function getCard(cardId: number): Promise<CardData> {
  const [cardRow] = await db("card").where("id", cardId);

  return {
    id: cardRow.id,
    sectionId: cardRow.section_id,
    content: cardRow.content,
    vote: cardRow.vote,
  };
}

export async function getCardsByBoardSlug(
  boardSlug: string
): Promise<CardData[]> {
  const cardRows = await db("card").whereIn("section_id", function () {
    this.select("id")
      .from("section")
      .whereIn("board_id", function () {
        this.select("id").from("board").where("slug", boardSlug);
      });
  });

  return cardRows.map((row) => ({
    id: row.id,
    sectionId: row.section_id,
    content: row.content,
    vote: row.vote,
  }));
}

interface UpdateCardOpts {
  sectionId?: number;
  content?: string;
  vote?: number;
}

export async function updateCard(
  cardId: number,
  opts: UpdateCardOpts = {}
): Promise<CardData> {
  const updateData: Record<string, unknown> = {};
  if (opts.sectionId) {
    updateData.section_id = opts.sectionId;
  }
  if (opts.content) {
    updateData.content = opts.content;
  }
  if (opts.vote) {
    updateData.vote = opts.vote;
  }
  await db("card").where("id", cardId).update(updateData);

  const [cardRow] = await db("card").where("id", cardId);

  return {
    id: cardRow.id,
    sectionId: cardRow.section_id,
    content: cardRow.content,
    vote: cardRow.vote,
  };
}

export async function removeCard(cardId: number): Promise<void> {
  await db("card").where("id", cardId).delete();
}
