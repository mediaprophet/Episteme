/**
 * Universal Data Provider Interface
 * 
 * Abstracting RDF read/write operations and compatibility checking
 * across multiple data stacks (e.g. Inrupt solid-client vs LDO community tools).
 */
export interface IDataProvider {
  /**
   * Reads an RDF resource from a given URI and returns standard Turtle graph notation.
   */
  read(uri: string): Promise<string | null>;

  /**
   * Writes/updates an RDF resource at the given URI with the provided data payload.
   */
  write(uri: string, data: string): Promise<void>;

  /**
   * Evaluates if the data payloads or permissions models (such as ACP vs WAC/ACL rules)
   * are fully portable between Enterprise and Community Solid servers.
   */
  validatePortability(data: string): { portable: boolean; warnings: string[] };
}
