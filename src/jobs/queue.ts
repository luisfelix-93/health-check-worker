import { Queue } from "bullmq";
import { config } from "../config";

const connection = {
    host: config.redis.host,
    port: config.redis.port,
}

export const healthCheckResultsQueue = new Queue(config.queues.healthCheckResults, {
    connection,
});