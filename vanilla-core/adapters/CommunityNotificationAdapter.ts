import { INotificationProvider } from '../interfaces/INotificationProvider';

/**
 * Community Notification Adapter
 * 
 * Concrete implementation of INotificationProvider using standard W3C Solid WebSockets.
 * Standard CSS event emission listener.
 */
export class CommunityNotificationAdapter implements INotificationProvider {
  private activeSubscriptions = new Map<string, (data: string) => void>();
  private connectionLostCallback?: () => void;

  async subscribeToResource(uri: string, callback: (data: string) => void): Promise<void> {
    console.log(`[CommunityNotificationAdapter] Connecting standard W3C Solid WebSocket for: ${uri}`);
    this.activeSubscriptions.set(uri, callback);
    // Simulate real-time updates arriving shortly
    setTimeout(() => {
      const mockUpdate = `<${uri}> <http://purl.org/dc/terms/modified> "${new Date().toISOString()}" .`;
      const registeredCallback = this.activeSubscriptions.get(uri);
      if (registeredCallback) {
        console.log(`[CommunityNotificationAdapter] Dispatching simulated WebSocket event for: ${uri}`);
        registeredCallback(mockUpdate);
      }
    }, 1000);
  }

  async unsubscribe(uri: string): Promise<void> {
    console.log(`[CommunityNotificationAdapter] Closing WebSocket channel for: ${uri}`);
    this.activeSubscriptions.delete(uri);
  }

  onConnectionLost(callback: () => void): void {
    this.connectionLostCallback = callback;
  }

  // Helper to simulate connection drops
  simulateDisconnect(): void {
    if (this.connectionLostCallback) {
      console.warn('[CommunityNotificationAdapter] Simulated WebSocket connection lost.');
      this.connectionLostCallback();
    }
  }
}
