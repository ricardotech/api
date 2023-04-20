import "dotenv/config";
const schedule = require("node-schedule");
import moment from "moment-timezone";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { Expo, ExpoPushMessage } from "expo-server-sdk";

const limitReqPerHour = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 250,
  message: "Too many requests, please try again later.",
});

import authRoutes from "./routes/Auth";
import courseRoutes from "./routes/Course";
import moduleRoutes from "./routes/Module";
import lessonRoutes from "./routes/Lesson";
import withdrawRoutes from "./routes/Withdraw";
import coproductionRoutes from "./routes/Coproduction";
import userRoutes from "./routes/User";
import balanceRoutes from "./routes/Balance";
import subscriptionRoutes from "./routes/Subscription";
import billRoutes from "./routes/Bill";
import workspaceRoutes from "./routes/Workspace";
import { checkAuthMiddleware } from "./middlewares";
import { getCourseAvailableBalance } from "./services/Financial";
import Withdraw from "./models/Withdraw";

var corsOption = {
  origin: [
    "*",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://checkout.membros.me",
    "https://checkout-dot-membros-375000.rj.r.appspot.com",
    "https://app.membros.me",
    "https://admin.membros.me",
    "*.membros.me",
  ],
};

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;
const server = `mongodb+srv://${user}:${password}@cluster0.y5c9p1q.mongodb.net/${database}?retryWrites=true&w=majority`;

mongoose.connect(server).then(() => {
  console.log("Database connection successfully!");
});

const port = 8080;

app.use(`/auth`, authRoutes);

app.use("/course", courseRoutes);

app.use("/module", checkAuthMiddleware, moduleRoutes);

app.use("/lesson", checkAuthMiddleware, lessonRoutes);

app.use("/coproduction", checkAuthMiddleware, coproductionRoutes);

app.use("/user", userRoutes);

app.use("/subscription", subscriptionRoutes);

app.use("/bill", billRoutes);

app.use("/withdraw", checkAuthMiddleware, withdrawRoutes);

app.use("/balance", checkAuthMiddleware, balanceRoutes);

app.use("/workspace", checkAuthMiddleware, workspaceRoutes);

app.post("/getToken", (req: any, res: any) => {
  const { token } = req.body;

  console.log(token);

  return res.json(token);
});

app.post("/notification", (req: any, res: any) => {
  const { token, title, subtitle } = req.body;

  if (!token) {
    return res.json("kd o token");
  }

  let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

  type message = {
    to: string;
    sound: string;
    body: string;
    data: {
      withSome: string;
    };
  };

  let messages: ExpoPushMessage[] = [];

  for (let pushToken of [token]) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: "default",
      title,
      body: subtitle,
      data: { withSome: subtitle },
    });
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(messages);
  let tickets: any[] = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        return res.json(ticketChunk);

        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
  })();

  let receiptIds = [];
  for (let ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let { status, details } = receipts[receiptId];
          if (status === "ok") {
            return res.json(details, status);
          } else if (status === "error") {
            console.error(
              `There was an error sending a notification: ${details}`
            );
            if (details) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details}`);
              return res.json(`The error code is ${details}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
        return res.json("error");
      }
    }
  })();
});

app.listen(port, async () => {
  await getCourseAvailableBalance();
  console.log("Servidor rodando na porta", port);
});
