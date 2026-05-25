/**
 * Universal Notification Provider Interface
 * 
 * Abstracting WebSocket and push notifications across various Solid server protocols
 * (such as standard W3C Solid WebSockets vs enterprise-specific event streams).
 */
export interface INotificationProvider {
  /**
   * Subscribes to real-time change notifications for a specific resource URI.
   * Calls the callback with the updated data representation when received.
   */
  subscribeToResource(uri: string, callback: (data: string) => void): Promise<void>;

  /**
   * Unsubscribes from resource updates.
   */
  unsubscribe(uri: string): Promise<void>;

  /**
   * Registers a handler to trigger if the connection drops.
   */
  onConnectionLost(callback: () => void): void;
}
