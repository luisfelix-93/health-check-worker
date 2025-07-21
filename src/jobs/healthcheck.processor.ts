import { Job } from "bullmq";
import { executeHealthCheck } from "../services/checkExecutor.service";
import { healthCheckResultsQueue } from "./queue";

interface HealthCheckJobData {
    url: string;
    endpointId: string
}

export async function healthCheckProcessor(job: Job<HealthCheckJobData>) {
    const { url, endpointId } = job.data;
    console.log(`✅ Processando job #${job.id} para o endpointId: ${endpointId} (URL: ${url})`);

    const result = await executeHealthCheck(url);

    const resultWithId = {
        ...result,
        endpointId: endpointId,
    };

    await healthCheckResultsQueue.add('result', resultWithId);


    console.log(`➡️  Resultado para endpointId ${endpointId} enviado para a fila de resultados.`);
}