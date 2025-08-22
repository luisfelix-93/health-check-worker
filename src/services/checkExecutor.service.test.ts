import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { executeHealthCheck } from './checkExecutor.service';

// Mock performance.now() to control responseTimeInMs deterministically
// We can't use jest.spyOn directly on performance.now because it's a read-only property.
// Instead, we can mock the implementation.
const mockPerformanceNow = jest.fn();
global.performance.now = mockPerformanceNow;

describe('executeHealthCheck', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        // Create a new mock adapter for each test
        mock = new MockAdapter(axios);
        // Clear the mock before each test
        mockPerformanceNow.mockClear();
    });

    afterEach(() => {
        // Restore the original implementation
        mock.restore();
    });

    it('should return Online status for a successful request', async () => {
        const url = 'https://example.com';
        mock.onGet(url).reply(200, { message: 'OK' });

        // Simulate time passing
        mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1050); // startTime = 1000, endTime = 1050

        const result = await executeHealthCheck(url);

        expect(result.status).toBe('Online');
        expect(result.statusCode).toBe(200);
        expect(result.url).toBe(url);
        expect(result.responseTimeInMs).toBe(50);
        expect(result.error).toBeUndefined();
    });

    it('should return Offline status for a failed request (e.g., 404)', async () => {
        const url = 'https://example.com/notfound';
        mock.onGet(url).reply(404);

        // Simulate time passing
        mockPerformanceNow.mockReturnValueOnce(2000).mockReturnValueOnce(2075); // startTime = 2000, endTime = 2075

        const result = await executeHealthCheck(url);

        expect(result.status).toBe('Offline');
        expect(result.statusCode).toBe(404);
        expect(result.url).toBe(url);
        expect(result.responseTimeInMs).toBe(75);
        expect(result.error).toBe('Request failed with status code 404');
    });

    it('should return Offline status for a network error', async () => {
        const url = 'https://example.com/network-error';
        mock.onGet(url).networkError();

        // Simulate time passing
        mockPerformanceNow.mockReturnValueOnce(3000).mockReturnValueOnce(3100);

        const result = await executeHealthCheck(url);

        expect(result.status).toBe('Offline');
        expect(result.statusCode).toBeNull();
        expect(result.url).toBe(url);
        expect(result.responseTimeInMs).toBe(100);
        expect(result.error).toBe('Network Error');
    });

    it('should return Offline status for a timeout', async () => {
        const url = 'https://example.com/timeout';
        mock.onGet(url).timeout();

        // Simulate time passing
        mockPerformanceNow.mockReturnValueOnce(4000).mockReturnValueOnce(4120);

        const result = await executeHealthCheck(url);

        expect(result.status).toBe('Offline');
        expect(result.statusCode).toBeNull();
        expect(result.url).toBe(url);
        expect(result.responseTimeInMs).toBe(120);
        expect(result.error).toBe('timeout of 10000ms exceeded');
    });
});