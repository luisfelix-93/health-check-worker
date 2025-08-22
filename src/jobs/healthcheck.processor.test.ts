import { Job } from 'bullmq';
import { healthCheckProcessor } from './healthcheck.processor';
import { executeHealthCheck } from '../services/checkExecutor.service';
import { healthCheckResultsQueue } from './queue';

// Mock das dependências
jest.mock('../services/checkExecutor.service');
jest.mock('./queue', () => ({
  healthCheckResultsQueue: {
    add: jest.fn(),
  },
}));

// Tipagem para os mocks
const mockedExecuteHealthCheck = executeHealthCheck as jest.Mock;
const mockedHealthCheckResultsQueue = healthCheckResultsQueue as jest.Mocked<typeof healthCheckResultsQueue>;

describe('healthCheckProcessor', () => {
  const mockJob = {
    id: 'job-123',
    data: {
      url: 'https://google.com',
      endpointId: 'endpoint-456',
    },
  } as Job<{ url: string; endpointId: string; }>;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve chamar executeHealthCheck com a URL do job', async () => {
    mockedExecuteHealthCheck.mockResolvedValue({
      status: 'Online',
      statusCode: 200,
    });

    await healthCheckProcessor(mockJob);

    expect(mockedExecuteHealthCheck).toHaveBeenCalledWith(mockJob.data.url);
  });

  it('deve adicionar o resultado com o endpointId na fila de resultados', async () => {
    const checkResult = {
      status: 'Online',
      statusCode: 200,
      url: mockJob.data.url,
      responseTimeInMs: 150,
    };
    mockedExecuteHealthCheck.mockResolvedValue(checkResult);

    await healthCheckProcessor(mockJob);

    const expectedResultWithId = {
      ...checkResult,
      endpointId: mockJob.data.endpointId,
    };

    expect(mockedHealthCheckResultsQueue.add).toHaveBeenCalledWith('result', expectedResultWithId);
  });

  it('deve lidar com erros do executeHealthCheck e não adicionar na fila', async () => {
    const error = new Error('Network Error');
    mockedExecuteHealthCheck.mockRejectedValue(error);

    // O processador de job não deve propagar o erro, mas sim logar e finalizar.
    // Se a função for projetada para lançar o erro, o teste mudaria.
    // Assumindo que ele captura o erro e encerra.
    await expect(healthCheckProcessor(mockJob)).rejects.toThrow('Network Error');

    // Garante que, em caso de erro, nada é adicionado à fila de resultados
    expect(mockedHealthCheckResultsQueue.add).not.toHaveBeenCalled();
  });
});