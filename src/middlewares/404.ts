import { Router } from "express";
const router = Router();

export const notFound = router.get("*", (_, res) => {
  res.status(404);
  res.json({
    //@ts-ignore
    message: `🚑 I think you are lost 🤦‍♀️🤦‍♀️ `,
  });
});
