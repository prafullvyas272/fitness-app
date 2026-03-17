import "dotenv/config";
import Pusher from "pusher";

console.log("Initializing Pusher with App ID:", process.env.PUSHER_APP_ID, "and Cluster:", process.env.PUSHER_CLUSTER);

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});