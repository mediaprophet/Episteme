import { SQLiteWrapper } from './webizen-edge/sqlite-wrapper';
import { Reconciler } from './p2p-sync/reconciler';

/**
 * Network State & Interop Broker
 * Sits between UI/App Data layer and storage. Handles online/offline routing and sync triggers.
 */
export class NetworkBroker {
  private isOnline: boolean = true;
  private podUrl: string;

  constructor(podUrl: string) {
    this.podUrl = podUrl;
    this.setupListeners();
  }

  /**
   * Sets up network event listeners if running in a browser environment.
   */
  private setupListeners(): void {
    if (typeof window !== 'undefined' && window.addEventListener) {
      this.isOnline = window.navigator.onLine;

      window.addEventListener('online', async () => {
        this.isOnline = true;
        console.log('[NetworkBroker] Browser reported ONLINE.');
        await this.triggerReconciliation();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('[NetworkBroker] Browser reported OFFLINE.');
      });
    } else {
      console.log('[NetworkBroker] Non-browser environment. Network state must be toggled manually.');
    }
  }

  /**
   * Manually sets the online/offline state (useful for testing or headless environments).
   */
  async setOnlineState(online: boolean): Promise<void> {
    const transitioned = !this.isOnline && online;
    this.isOnline = online;
    console.log(`[NetworkBroker] Network state set to: ${online ? 'ONLINE' : 'OFFLINE'}`);
    
    if (transitioned) {
      await this.triggerReconciliation();
    }
  }

  /**
   * Triggers the P2P reconciliation loop.
   */
  private async triggerReconciliation(): Promise<void> {
    console.log('[NetworkBroker] Triggering state reconciliation...');
    await Reconciler.reconcile(this.podUrl);
  }

  /**
   * Reads a resource. If offline, loads from SQLite cache. If online, loads from Pod (and caches in SQLite).
   */
  async readResource(uri: string): Promise<string | null> {
    if (!this.isOnline) {
      console.log(`[NetworkBroker] OFFLINE: Routing read request to local SQLite database for: ${uri}`);
      const local = await SQLiteWrapper.read(uri);
      return local ? local.data : null;
    }

    console.log(`[NetworkBroker] ONLINE: Fetching resource from remote Solid Pod: GET ${uri}`);
    const remoteData = await this.simulateRemoteFetch(uri);
    
    if (remoteData) {
      // Cache locally without queueing a sync write
      const q = SQLiteWrapper.getQueue();
      SQLiteWrapper.clearQueue();
      await SQLiteWrapper.write(uri, 'SolidDataset', remoteData);
      SQLiteWrapper.clearQueue();
      for (const entry of q) {
        await SQLiteWrapper.write(entry.uri, 'SolidDataset', entry.data);
      }
    }
    
    return remoteData;
  }

  /**
   * Writes a resource. If offline, queues write in SQLite. If online, writes directly to Pod.
   */
  async writeResource(uri: string, type: string, data: string): Promise<void> {
    if (!this.isOnline) {
      console.log(`[NetworkBroker] OFFLINE: Queueing write operation to local SQLite wrapper: ${uri}`);
      await SQLiteWrapper.write(uri, type, data);
      return;
    }

    console.log(`[NetworkBroker] ONLINE: Executing direct write to remote Solid Pod: PUT ${uri}`);
    await this.simulateRemoteWrite(uri, data);
    
    // Mirror locally in cache without queueing a sync write
    const q = SQLiteWrapper.getQueue();
    SQLiteWrapper.clearQueue();
    await SQLiteWrapper.write(uri, type, data);
    SQLiteWrapper.clearQueue();
    for (const entry of q) {
      if (entry.uri !== uri) {
        await SQLiteWrapper.write(entry.uri, 'SolidDataset', entry.data);
      }
    }
  }

  /**
   * Simulates remote LDP resource fetching.
   */
  private async simulateRemoteFetch(uri: string): Promise<string> {
    return `<${uri}> a <http://www.w3.org/ns/ldp#Resource> ; <http://purl.org/dc/terms/title> "Simulated Remote Pod Resource" .`;
  }

  /**
   * Simulates remote HTTP PUT write.
   */
  private async simulateRemoteWrite(uri: string, data: string): Promise<void> {
    console.log(`[NetworkBroker] Remote Solid Pod write succeeded: PUT ${uri}`);
  }
}
