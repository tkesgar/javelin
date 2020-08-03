import * as React from "react";
import axios from "axios";
import useSWR from "swr";

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
  voteCount: number;
}

interface CreateBoardOpts {
  title: string;
  sections: {
    title: string;
  }[];
}

export async function createBoard(opts: CreateBoardOpts): Promise<string> {
  const { title, sections } = opts;

  const sectionTitles = sections.map((section) => section.title);

  const response = await axios.post("/api/board", {
    title,
    sectionTitles,
  });

  return response.data.slug;
}

export async function removeBoard(slug: string): Promise<void> {
  await axios.delete(`/api/board/${slug}`);
}

interface CreateCardOpts {
  content?: string;
}

export async function createCard(
  boardId: string,
  sectionIndex: number,
  opts: CreateCardOpts = {}
): Promise<string> {
  throw new Error("Not implemented yet");
}

interface UpdateCardOpts {
  sectionIndex?: number;
  content?: string;
}

export async function updateCard(
  boardId: string,
  cardId: string,
  opts: UpdateCardOpts = {}
): Promise<void> {
  throw new Error("Not implemented yet");
}

export async function deleteCard(
  boardId: string,
  cardId: string
): Promise<void> {
  throw new Error("Not implemented yet");
}

export async function incrementVoteCard(
  boardId: string,
  cardId: string,
  value = 1
): Promise<void> {
  throw new Error("Not implemented yet");
}

export function useBoard(boardSlug: string): BoardData {
  const { data: response } = useSWR(`/api/board/${boardSlug}`, axios);

  if (!response) {
    return null;
  }

  const boardData = {
    id: response.data.id,
    slug: response.data.slug,
    title: response.data.title,
    sections: response.data.sections,
  };

  return boardData;
}

export function useBoardCards(boardSlug: string): CardData[] {
  const { data: response } = useSWR(`/api/board/${boardSlug}/card`, axios);

  if (!response) {
    return [];
  }

  return response.data.map((data) => {
    return {
      id: data.id,
      sectionId: data.sectionId,
      content: data.content,
      voteCount: data.vote,
    };
  });
}
