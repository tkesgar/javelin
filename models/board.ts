import axios from "axios";
import useSWR from "swr";
import api from "../services/api";

interface ApiBoardData {
  slug: string;
  title: string;
}

interface ApiSectionData {
  slug: string;
  title: string;
}

interface ApiCardData {
  slug: string;
  content: string;
  vote: number;
}

interface ApiBoardStateData extends ApiBoardData {
  sections: (ApiSectionData & {
    cards: ApiCardData[];
  })[];
}

export interface BoardData {
  id: string;
  slug: string;
  title: string;
  sections: {
    id: string;
    title: string;
  }[];
}

export interface CardData {
  id: string;
  sectionId: string;
  content: string;
  vote: number;
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

  const boardData = await api<ApiBoardData>("/board", {
    method: "post",
    data: {
      title,
      sectionTitles,
    },
  });

  return boardData.slug;
}

export async function removeBoard(slug: string): Promise<void> {
  await axios.delete(`/api/board/${slug}`);
}

interface CreateCardOpts {
  content?: string;
}

export async function createCard(
  sectionId: string,
  opts: CreateCardOpts = {}
): Promise<CardData> {
  const { content = "" } = opts;

  const response = await api<ApiCardData>("/card", {
    method: "post",
    data: {
      section: sectionId,
      content,
    },
  });

  return {
    sectionId: sectionId,
    id: response.slug,
    content: response.content,
    vote: response.vote,
  };
}

interface UpdateCardOpts {
  sectionId?: string;
  content?: string;
}

export async function updateCard(
  cardId: string,
  opts: UpdateCardOpts = {}
): Promise<CardData> {
  const { sectionId, content } = opts;

  const response = await api<ApiCardData>(`/card/${cardId}/content`, {
    method: "put",
    data: { content },
  });

  return {
    sectionId: sectionId,
    id: response.slug,
    content: response.content,
    vote: response.vote,
  };
}

export async function updateCardSection(
  cardId: string,
  sectionId: string
): Promise<CardData> {
  const response = await api<ApiCardData>(`/card/${cardId}/section`, {
    method: "put",
    data: { section: sectionId },
  });

  return {
    sectionId: sectionId,
    id: response.slug,
    content: response.content,
    vote: response.vote,
  };
}

export async function deleteCard(cardId: string): Promise<void> {
  await api(`card/${cardId}`, { method: "delete" });
}

export async function incrementVoteCard(
  cardId: string,
  value = 1
): Promise<void> {
  await api(`/card/${cardId}/vote`, {
    method: "patch",
    data: {
      amount: value,
    },
  });
}

export function useBoard(boardSlug: string): BoardData {
  const { data: boardData } = useSWR<ApiBoardStateData>(
    `/board/${boardSlug}`,
    api
  );

  if (!boardData) {
    return null;
  }

  console.log(boardData);

  return {
    id: boardData.slug,
    slug: boardData.slug,
    title: boardData.title,
    sections: boardData.sections.map((section) => {
      return {
        id: section.slug,
        title: section.title,
      };
    }),
  };
}

export function useBoardCards(boardSlug: string): CardData[] {
  const { data: boardData } = useSWR<ApiBoardStateData>(
    `/board/${boardSlug}`,
    api
  );

  if (!boardData) {
    return [];
  }

  const cards = [];

  for (const section of boardData.sections) {
    for (const card of section.cards) {
      cards.push({
        id: card.slug,
        sectionId: section.slug,
        content: card.content,
        vote: card.vote,
      });
    }
  }

  return cards;
}
