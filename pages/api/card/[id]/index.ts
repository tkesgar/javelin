import { NextApiRequest, NextApiResponse } from "next";
import * as BoardController from "../../../../backend/controllers/board";

export default async function apiBoardSlug(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const id = Number(req.query.id);
  if (!id) {
    res.status(400).send("Bad Request");
    return;
  }

  switch (req.method) {
    case "PATCH": {
      const updateData: Record<string, unknown> = {};
      if (req.body.sectionId) {
        updateData.sectionId = req.body.sectionId;
      }
      if (req.body.content) {
        updateData.content = req.body.content;
      }

      await BoardController.updateCard(id, updateData);
      res.json(await BoardController.getCard(id));
      break;
    }
    case "DELETE": {
      await BoardController.removeCard(id);
      res.status(204).end();
      break;
    }
    default:
      res.status(400).send("Bad Request");
  }
}
