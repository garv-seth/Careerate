import { Response } from 'express';
import { EventEmitter } from 'events';

interface SSEClient {
  id: string;
  response: Response;
  channels: Set<string>;
  lastPing: number;
}

export class SSEService extends EventEmitter {
  private clients: Map<string, SSEClient> = new Map();
  private pingInterval: NodeJS.Timeout;

  constructor() {
    super();
    // Ping clients every 30 seconds to keep connections alive
    this.pingInterval = setInterval(() => this.pingAllClients(), 30000);
  }

  /**
   * Register a new SSE client
   */
  registerClient(clientId: string, res: Response, channels: string[] = []): void {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Store client
    this.clients.set(clientId, {
      id: clientId,
      response: res,
      channels: new Set(channels),
      lastPing: Date.now()
    });

    // Send initial connection message
    this.sendToClient(clientId, {
      type: 'connected',
      message: 'SSE connection established',
      clientId,
      timestamp: new Date().toISOString()
    });

    // Handle client disconnect
    res.on('close', () => {
      this.clients.delete(clientId);
      console.log(`SSE client disconnected: ${clientId}`);
    });

    console.log(`SSE client connected: ${clientId}, channels: ${channels.join(', ')}`);
  }

  /**
   * Subscribe client to additional channels
   */
  subscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.channels.add(channel);
      this.sendToClient(clientId, {
        type: 'subscribed',
        channel,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Unsubscribe client from channels
   */
  unsubscribe(clientId: string, channel: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.channels.delete(channel);
      this.sendToClient(clientId, {
        type: 'unsubscribed',
        channel,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Send event to specific client
   */
  sendToClient(clientId: string, data: any): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    try {
      const eventData = typeof data === 'string' ? data : JSON.stringify(data);
      client.response.write(`data: ${eventData}\n\n`);
      return true;
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
      this.clients.delete(clientId);
      return false;
    }
  }

  /**
   * Broadcast event to all clients on a channel
   */
  broadcast(channel: string, data: any): number {
    let sentCount = 0;
    for (const [clientId, client] of this.clients.entries()) {
      if (client.channels.has(channel) || client.channels.has('*')) {
        if (this.sendToClient(clientId, { ...data, channel })) {
          sentCount++;
        }
      }
    }
    return sentCount;
  }

  /**
   * Broadcast to specific deployment
   */
  broadcastDeployment(deploymentId: string, data: any): number {
    return this.broadcast(`deployment:${deploymentId}`, data);
  }

  /**
   * Broadcast to specific agent task
   */
  broadcastAgentTask(taskId: string, data: any): number {
    return this.broadcast(`agent-task:${taskId}`, data);
  }

  /**
   * Broadcast to specific project
   */
  broadcastProject(projectId: string, data: any): number {
    return this.broadcast(`project:${projectId}`, data);
  }

  /**
   * Ping all clients to keep connections alive
   */
  private pingAllClients(): void {
    const now = Date.now();
    for (const [clientId, client] of this.clients.entries()) {
      if (now - client.lastPing > 60000) {
        // Client hasn't been pinged in 60s, disconnect
        this.clients.delete(clientId);
        try {
          client.response.end();
        } catch (e) {
          // Ignore errors on close
        }
      } else {
        this.sendToClient(clientId, { type: 'ping', timestamp: new Date().toISOString() });
        client.lastPing = now;
      }
    }
  }

  /**
   * Get connection stats
   */
  getStats() {
    const channelCounts = new Map<string, number>();
    for (const client of this.clients.values()) {
      for (const channel of client.channels) {
        channelCounts.set(channel, (channelCounts.get(channel) || 0) + 1);
      }
    }

    return {
      totalClients: this.clients.size,
      channels: Array.from(channelCounts.entries()).map(([channel, count]) => ({
        channel,
        clients: count
      }))
    };
  }

  /**
   * Cleanup on shutdown
   */
  cleanup(): void {
    clearInterval(this.pingInterval);
    for (const client of this.clients.values()) {
      try {
        client.response.end();
      } catch (e) {
        // Ignore errors
      }
    }
    this.clients.clear();
  }
}

// Global SSE service instance
export const sseService = new SSEService();
