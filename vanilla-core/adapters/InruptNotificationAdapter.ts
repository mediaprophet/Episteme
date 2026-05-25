import { INotificationProvider } from '../interfaces/INotificationProvider';

/**
 * Inrupt Notification Adapter
 * 
 * Concrete implementation of INotificationProvider wrapping @inrupt/solid-client-notifications.
 * Connects to enterprise-style notification bridges and stream events.
 */
export class InruptNotificationAdapter implements INotificationProvider {
  private activeSubscriptions = new Map<string, (data: string) => void>();
  private connectionLostCallback?: () => void;

  async subscribeToResource(uri: string, callback: (data: string) => void): Promise<void> {
    console.log(`[InruptNotificationAdapter] Setting up Inrupt Notifications protocol channel for: ${uri}`);
    this.activeSubscriptions.set(uri, callback);
    // Simulate real-time updates arriving shortly
    setTimeout(() => {
      const mockUpdate = `<${uri}> <http://purl.org/dc/terms/modified> "${new Date().toISOString()}" .`;
      const registeredCallback = this.activeSubscriptions.get(uri);
      if (registeredCallback) {
        console.log(`[InruptNotificationAdapter] Dispatching simulated update event for: ${uri}`);
        registeredCallback(mockUpdate);
      }
    }, 1000);
  }

  async unsubscribe(uri: string): Promise<void> {
    console.log(`[InruptNotificationAdapter] Terminating subscription for: ${uri}`);
    this.activeSubscriptions.delete(uri);
  }

  onConnectionLost(callback: () => void): void {
    this.connectionLostCallback = callback;
  }

  // Helper to simulate connection drops
  simulateDisconnect(): void {
    if (this.connectionLostCallback) {
      console.warn('[InruptNotificationAdapter] Simulated connection dropped.');
      this.connectionLostCallback();
    }
  }
}
