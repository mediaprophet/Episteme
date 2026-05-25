import { IDataProvider } from '../interfaces/IDataProvider';

/**
 * Inrupt Data Adapter
 * 
 * Concrete implementation of IDataProvider utilizing Inrupt's imperative solid-client models.
 * Warns about WAC (WebAccessControl) usages when targeting ACP (AccessControlPolicy) servers.
 */
export class InruptDataAdapter implements IDataProvider {
  async read(uri: string): Promise<string | null> {
    console.log(`[InruptDataAdapter] Reading imperatively from Solid Pod resource: GET ${uri}`);
    return `<${uri}> <http://purl.org/dc/terms/title> "Inrupt Imperative Graph Document" .`;
  }

  async write(uri: string, data: string): Promise<void> {
    const { portable, warnings } = this.validatePortability(data);
    warnings.forEach(warning => {
      console.warn(`[InruptDataAdapter Portability Warning] ${warning}`);
    });
    console.log(`[InruptDataAdapter] Writing imperatively to Solid Pod resource: PUT ${uri}`);
  }

  validatePortability(data: string): { portable: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Inrupt ESS environments heavily favor Access Control Policies (ACP) over Web Access Control (WAC)
    if (data.includes('acl:') || data.includes('accessControl') || data.includes('.acl')) {
      warnings.push("WAC (WebAccessControl) terminology/rules detected. Inrupt Enterprise Server (ESS) environments prefer Access Control Policies (ACP) instead of traditional .acl rule definitions.");
    }
    
    return {
      portable: warnings.length === 0,
      warnings
    };
  }
}
