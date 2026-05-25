import { IDataProvider } from '../interfaces/IDataProvider';

/**
 * LDO Data Adapter
 * 
 * Concrete implementation of IDataProvider utilizing LDO-like JSON-LD graph bindings.
 * Warns about ACP (AccessControlPolicy) usages when targeting WAC (ACL) servers.
 */
export class LDODataAdapter implements IDataProvider {
  async read(uri: string): Promise<string | null> {
    console.log(`[LDODataAdapter] Reading LDO graph object from Solid Pod resource: GET ${uri}`);
    return `<${uri}> <http://purl.org/dc/terms/title> "LDO Community Graph Document" .`;
  }

  async write(uri: string, data: string): Promise<void> {
    const { portable, warnings } = this.validatePortability(data);
    warnings.forEach(warning => {
      console.warn(`[LDODataAdapter Portability Warning] ${warning}`);
    });
    console.log(`[LDODataAdapter] Writing LDO graph object to Solid Pod resource: PUT ${uri}`);
  }

  validatePortability(data: string): { portable: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Community servers (e.g. CSS) primarily support WAC (ACL) rules rather than Inrupt-specific ACP rules
    if (data.includes('acp:') || data.includes('solid/acp') || data.includes('AccessControlPolicy')) {
      warnings.push("ACP (AccessControlPolicy) terminology/rules detected. Community Solid Server (CSS) and other community targets primarily enforce Web Access Control (WAC/ACL) policies rather than ACP.");
    }
    
    return {
      portable: warnings.length === 0,
      warnings
    };
  }
}
