import { Queue } from "bullmq";

const q = new Queue('health-check-jobs', {
    connection: { host: '127.0.0.1', port: 6379 }
});

async function addTestJob() {
    await q.add('health-check-job', { url: 'https://google.com' });
    await q.add('health-check-job', { url: 'https://uma-url-que-nao-existe.com' });
    console.log('Jobs de teste adicionados!');
    process.exit();
}


addTestJob();