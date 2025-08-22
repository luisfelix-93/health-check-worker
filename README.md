# Health Check Worker

Este worker é responsável por processar jobs de health check de uma fila, executar os testes de saúde (como resolução de DNS, requisições HTTP, etc.) e enviar os resultados para outra fila.

## Como Iniciar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o worker em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

## Rodando os Testes

O projeto utiliza [Jest](https://jestjs.io/) para os testes unitários e de integração.

Para rodar a suíte de testes, execute o seguinte comando:

```bash
npm test
```

## Estrutura do Projeto

- `src/`
  - `config/`: Configurações (ex: conexão com Redis).
  - `jobs/`: Definição das filas (BullMQ) e processadores de jobs.
  - `services/`: Lógica de negócio, como a execução dos health checks.
  - `index.ts`: Ponto de entrada da aplicação.
- `dockerfile`: Definição do container Docker para o worker.
- `jest.config.js`: Configuração do Jest.
- `tsconfig.json`: Configuração do TypeScript.


Este projeto contém um worker responsável por processar jobs de uma fila para realizar checagens de saúde (health checks) em URLs especificadas.

## Sobre o Projeto

O Health Check Worker utiliza [BullMQ](https://bullmq.io/) para gerenciar uma fila de jobs processados em background. Ele se conecta a uma instância do Redis, consome jobs da fila `health-check-jobs` e, para cada job, executa uma verificação de status na URL fornecida.

Este é um componente ideal para sistemas distribuídos que precisam monitorar a disponibilidade de múltiplos serviços ou websites de forma assíncrona.

## Tecnologias Utilizadas

*   Node.js
*   TypeScript
*   Redis
*   BullMQ - Sistema de filas para Node.js baseado em Redis.

## Começando

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

*   **Node.js** (versão 18 ou superior recomendada)
*   **npm** ou **yarn**
*   Uma instância do **Redis** em execução. Por padrão, a aplicação tentará se conectar a `127.0.0.1:6379`.

### Instalação

1.  Clone o repositório:
    ```sh
    git clone https://github.com/luisfelix-93/health-check-worker
    ```
2.  Navegue até o diretório do projeto:
    ```sh
    cd health-check-worker
    ```
3.  Instale as dependências:
    ```sh
    npm install
    ```
4.  Compile o código TypeScript (se aplicável):
    ```sh
    npm run build
    ```

## Uso

### Executando o Worker

Para iniciar o worker e começar a processar jobs da fila, execute o seguinte comando:

```sh
npm start
```
*(**Nota:** Este comando assume que você tem um script `start` no seu `package.json` que executa o arquivo principal do worker, como `node dist/index.js`)*

### Adicionando Jobs na Fila

Os jobs devem ser adicionados à fila `health-check-jobs` com o nome `health-check-job`. O payload do job deve ser um objeto contendo a propriedade `url`.

**Exemplo de payload do job:**
```json
{
  "url": "https://meusite.com"
}
```

Para facilitar os testes, um script para adicionar jobs de exemplo (`test-sender.js`) está incluído no projeto. Para executá-lo:

```sh
node dist/test-sender.js
```

O script `test-sender.js` adicionará dois jobs de exemplo à fila: um para `https://google.com` e outro para uma URL inválida, permitindo testar ambos os cenários de sucesso e falha.

## Executando com Docker

Para facilitar a implantação e garantir um ambiente consistente, o projeto está configurado para ser executado em um container Docker.

### Pré-requisitos

*   **Docker** instalado e em execução.

### Build da Imagem

Na raiz do diretório `health-check-worker`, execute o comando abaixo para construir a imagem:

```sh
docker build -t health-check-worker .
```

### Executando o Container

Para executar o worker, você precisa garantir que ele consiga se conectar a uma instância do Redis.

**Exemplo (conectando a um Redis na rede do host):**

Se você tem um Redis rodando localmente (`127.0.0.1:6379`), pode usar a rede do host para permitir que o container o acesse.

```sh
docker run --rm --name my-worker --network="host" health-check-worker
```

**Exemplo (usando variáveis de ambiente para um Redis customizado):**

```sh
docker run --rm --name my-worker \
  -e REDIS_HOST=seu-host-redis \
  -e REDIS_PORT=sua-porta-redis \
  health-check-worker
```
> **Nota:** Para um ambiente de desenvolvimento ou produção mais robusto, é altamente recomendado o uso do `docker-compose` para orquestrar o serviço do worker e do Redis juntos.

## Configuração

A configuração da conexão com o Redis pode ser feita através de variáveis de ambiente. O worker irá procurar pelas seguintes variáveis:



## Configuração

A configuração da conexão com o Redis pode ser feita através de variáveis de ambiente. O worker irá procurar pelas seguintes variáveis:

*   `REDIS_HOST`: O host do seu servidor Redis (padrão: `127.0.0.1`)
*   `REDIS_PORT`: A porta do seu servidor Redis (padrão: `6379`)
*   `REDIS_PASSWORD`: A senha do seu servidor Redis (se aplicável)

Você pode criar um arquivo `.env` na raiz do projeto para definir essas variáveis, se necessário.

