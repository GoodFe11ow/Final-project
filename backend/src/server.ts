import app from "./app.js";
import { env } from "./config/env.js";
import { startPushScheduler } from "./lib/push-scheduler.js";

startPushScheduler();

app.listen(env.PORT, () => {
    console.log(`Server is runnong on port ${env.PORT}`)
})