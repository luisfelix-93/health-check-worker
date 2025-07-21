import axios from "axios";
import { AxiosError } from "axios";

interface HealthCheckResult {
    url: string;
    status: 'Online' | 'Offline';
    statusCode: number | null;
    responseTimeInMs: number;
    error?: string;
}

export async function executeHealthCheck(url:string): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
        const response = await axios.get(url, { timeout: 10000 });
        const endTime = performance.now();
        return {
            url,
            status: 'Online',
            statusCode: response.status,
            responseTimeInMs: Math.round(endTime - startTime),
        };
    } catch (error) {
        const endTime = performance.now();
        const result: HealthCheckResult = {
            url,
            status: 'Offline',
            statusCode: null,
            responseTimeInMs: Math.round(endTime - startTime),
        };

        if (error instanceof AxiosError) {
            result.statusCode = error.response?.status || null;
            result.error = error.message;
        } else if (error instanceof Error) {
            result.error = error.message
        }

        return result;
    }
}