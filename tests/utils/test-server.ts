import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

interface TestServer {
  server: any;
  app: any;
  port: number;
  url: string;
}

let serverCounter = 3001;
const activeServers = new Map<number, TestServer>();

export async function createTestServer(): Promise<TestServer> {
  const port = serverCounter++;
  
  // Check if a server is already running on this port
  if (activeServers.has(port)) {
    await closeTestServer(activeServers.get(port)!);
  }
  
  const dev = process.env.NODE_ENV !== 'production';
  
  console.log(`Creating test server on port ${port}`);
  
  const app = next({ 
    dev, 
    quiet: true,
    customServer: true,
    hostname: 'localhost',
    port: port,
  });
  
  const handle = app.getRequestHandler();
  
  try {
    await app.prepare();
  } catch (error) {
    console.error('Failed to prepare Next.js app:', error);
    throw error;
  }

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Server failed to start on port ${port} within 10 seconds`));
    }, 10000);

    server.listen(port, '127.0.0.1', () => {
      clearTimeout(timeout);
      console.log(`Test server running on port ${port}`);
      resolve();
    });

    server.on('error', (err: any) => {
      clearTimeout(timeout);
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is busy, trying next port...`);
        serverCounter++;
        createTestServer().then((newServer) => resolve()).catch(reject);
        return;
      }
      reject(err);
    });
  });

  const testServer = {
    server,
    app,
    port,
    url: `http://localhost:${port}`,
  };
  
  activeServers.set(port, testServer);
  return testServer;
}

export async function closeTestServer(testServer: TestServer): Promise<void> {
  console.log(`Closing test server on port ${testServer.port}`);
  
  // Remove from active servers
  activeServers.delete(testServer.port);
  
  if (testServer.server) {
    await new Promise<void>((resolve) => {
      testServer.server.close(() => {
        console.log(`Test server on port ${testServer.port} closed`);
        resolve();
      });
    });
  }
  
  if (testServer.app) {
    try {
      await testServer.app.close();
      console.log(`Next.js app on port ${testServer.port} closed`);
    } catch (error) {
      console.warn(`Error closing Next.js app on port ${testServer.port}:`, error);
    }
  }
}

// Cleanup function for all active servers
export async function closeAllTestServers(): Promise<void> {
  const servers = Array.from(activeServers.values());
  await Promise.all(servers.map(server => closeTestServer(server)));
}
