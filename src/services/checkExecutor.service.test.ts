import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { executeHealthCheck } from './checkExecutor.service';

// Mock performance.now() para controlar o responseTimeInMs de forma determinística
const mockPerformanceNow = jest.spyOn(performance, 'now');

describe('executeHealthCheck', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        // Cria um novo mock adapter para cada teste
        mock = new MockAdapter(axios);
        // Limpa os mocks antes de cada teste
        mockPerformanceNow.mockClear();
    });

    afterEach(() => {
        // Restaura a implementação original
        mock.restore();
    });

    it('deve retornar um status Online para uma requisição bem-sucedida', async () => {
        const url = 'https://example.com';
        mock.onGet(url).reply(200, { message: 'OK' });

        // Simula a passagem do tempo
        let time = 1000;
        mockPerformanceNow.mockImplementation(() => time += 50); // startTime = 1000, endTime = 1050

        const result = await executeHealthCheck(url);

        expect(result.status).toBe('Online');
        expect(result.statusCode).toBe(200);
        expect(result.url).toBe(url);
        expect(result.responseTimeInMs).toBe(50);
        expect(result.error).toBeUndefined();
    });

    it('deve retornar um status Offline para uma requisição que falhou (ex: 404)', async () => {
        const url = 'https://example.com/notfound';
        mock.onGet(url).reply(404);

        // Simula a passagem do tempo
        let time = 2000;
        mockPerformanceNow.mockImplementation(() => time += 75); // startTime = 2000, endTime = 2075

        const result = await executeHealthCheck(url);

        expect(result.status).toBe('Offline');
        expect(result.statusCode).toBe(404);
        expect(result.url).toBe(url);
        expect(result.responseTimeInMs).toBe(75);
        expect(result.error).toBe('Request failed with status code 404');
    });

    it('deve retornar um status Offline para um erro de rede', async () => {
        const url = 'https://example.com/network-error';
        mock.onGet(url).networkError();

        // Simula a passagem do tempo
        let time = 3000;
        mockPerformanceNow.mockImplementation(() => time += 100);

        const result = await executeHealthCheck(url);

        expect(result.status).toBe('Offline');
        expect(result.statusCode).toBeNull();
        expect(result.url).toBe(url);
        expect(result.responseTimeInMs).toBe(100);
        expect(result.error).toBe('Network Error');
    });

    it('deve retornar um status Offline para um timeout', async () => {
        const url = 'https://example.com/timeout';
        mock.onGet(url).timeout();

        // Simula a passagem do tempo
        let time = 4000;
        mockPerformanceNow.mockImplementation(() => time += 120);

        const result = await executeHealthCheck(url);

        expect(result.status).toBe('Offline');
        expect(result.statusCode).toBeNull();
        expect(result.url).toBe(url);
        expect(result.responseTimeInMs).toBe(120);
        expect(result.error).toBe('timeout of 10000ms exceeded');
    });
});

