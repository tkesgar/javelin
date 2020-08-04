import { NextApiRequest, NextApiResponse } from "next";
import * as BoardController from "../../../../backend/controllers/board";

export default async function apiBoardSlug(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const slug = req.query.slug;
  if (typeof slug !== "string") {
    res.status(400).send("Bad Request");
    return;
  }

  switch (req.method) {
    case "GET": {
      res.json(await BoardController.getBoard(slug));
      break;
    }
    case "DELETE": {
      await BoardController.removeBoard(slug);
      res.status(204).end();
      break;
    }
    default:
      res.status(400).send("Bad Request");
  }
}
