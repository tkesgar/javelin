import { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";
import * as BoardController from "../../../backend/controllers/board";

export default async function apiBoard(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(400).send("Bad Request");
    return;
  }

  try {
    await yup
      .object({
        title: yup.string().min(1).max(40),
        sectionTitles: yup.array(yup.string().min(1).max(40)).min(1).max(4),
      })
      .validate(req.body, { strict: true });
  } catch {
    res.status(400).send("Bad Request");
    return;
  }

  const { title, sectionTitles } = req.body;

  res.json(await BoardController.createBoard(title, sectionTitles));
}
