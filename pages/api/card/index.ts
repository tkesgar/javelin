import { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";
import * as BoardController from "../../../backend/controllers/board";

export default async function apiCard(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  switch (req.method) {
    case "POST": {
      try {
        await yup
          .object({
            sectionId: yup.number().positive(),
            content: yup.string().optional().min(1).max(1000),
          })
          .validate(req.body, { strict: true });
      } catch {
        res.status(400).send("Bad Request");
        return;
      }

      const { sectionId, content } = req.body;

      res.json(await BoardController.createCard(sectionId, content));
      break;
    }
    default:
      res.status(400).send("Bad Request");
  }
}
