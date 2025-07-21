import express from 'express'
import { config } from './config';

export function startHealthCheckServer() {
    const app = express();
    const port = config.healthCheckPort;
    app.get('/health', (req, res) => {
        res.status(200).json({
            status:'UP',
            timeStamp: new Date().toISOString
        });
    });

    app.listen(port, () => {
        console.log(`🩺 Servidor de Health Check rodando na porta ${port}`);
    })
}