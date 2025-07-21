import { Worker } from "bullmq";
import { config } from "./config";
import { healthCheckProcessor } from "./jobs/healthcheck.processor";
import { startHealthCheckServer } from "./server";

async function main() {

    const connection = {
        host: config.redis.host,
        port: config.redis.port,
    };

    console.log('🚀 Iniciando Worker...');
    startHealthCheckServer();

    const worker = new Worker(config.queues.healthCheckJobs, healthCheckProcessor, {
        connection,
        concurrency: 5
    });

    worker.on('completed', (job) => {
        console.log(`🎉 Job #${job.id} concluído com sucesso!`);
    });

    worker.on('failed', (job, err) => {
        if (job) console.error(`❌ Job #${job.id} falhou com o erro: ${err.message}`);
    });

    console.log('Worker está online, aguardando por jobs...')
}

main().catch((error) => {
    console.error('Um erro fatal impediu a inicialização do Worker: ', error);
    process.exit(1)
})