require("dotenv").config();
import { startServer, app } from "./config";
import rateLimit from "express-rate-limit";
const { NODE_ENV } = process.env;


//?adding Production Needs
if (NODE_ENV === "production") {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 100 requests per windowMs
      message:
        "Too many Requests created from this IP, please try again after an hour",
    })
  );
}




//? instantiate all app Peases in one Place
startServer(app);
