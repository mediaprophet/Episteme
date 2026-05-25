/**
 * Simulated SQLite local-first database wrapper for edge execution.
 * Tracks local records and stores an offline replication/synchronization queue.
 */

export interface LocalRecord {
  uri: string;
  type: string;
  data: string;
  timestamp: number;
}

export interface SyncQueueEntry {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  uri: string;
  data: string;
  timestamp: number;
}

export class SQLiteWrapper {
  private static db = new Map<string, LocalRecord>();
  private static queue: SyncQueueEntry[] = [];

  /**
   * Writes a record locally to SQLite cache and adds it to the sync queue.
   */
  static async write(uri: string, type: string, data: string): Promise<void> {
    const record: LocalRecord = {
      uri,
      type,
      data,
      timestamp: Date.now()
    };
    this.db.set(uri, record);
    
    this.queue.push({
      action: 'UPDATE',
      uri,
      data,
      timestamp: record.timestamp
    });
    console.log(`[SQLiteWrapper] Saved record locally: ${uri}`);
  }

  /**
   * Reads a record from SQLite local database.
   */
  static async read(uri: string): Promise<LocalRecord | null> {
    console.log(`[SQLiteWrapper] Reading local record from SQLite: ${uri}`);
    return this.db.get(uri) || null;
  }

  /**
   * Gets all pending offline synchronization records.
   */
  static getQueue(): SyncQueueEntry[] {
    return [...this.queue];
  }

  /**
   * Clears the synchronization queue after successful remote reconciliation.
   */
  static clearQueue(): void {
    this.queue = [];
    console.log(`[SQLiteWrapper] SQLite sync queue cleared.`);
  }
}
