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
    case "POST": {
      const { amount = 1 } = req.body;

      const currentCard = await BoardController.getCard(id);
      if (!currentCard) {
        res.status(400).send("Bad Request");
        return;
      }

      await BoardController.updateCard(id, { vote: currentCard.vote + amount });
      res.status(204).end();
      break;
    }
    default:
      res.status(400).send("Bad Request");
  }
}
