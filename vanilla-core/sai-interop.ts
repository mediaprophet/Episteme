/**
 * Solid Application Interoperability (SAI) Spec Implementation
 * 
 * Provides client-side and server-side models for managing Application Registries,
 * Access Grants, and Data Grants as specified by the W3C Solid SAI editor draft.
 */

export interface DataGrant {
  id: string;
  dataOwner: string;      // WebID of the resource owner
  grantee: string;        // WebID of the application being authorized
  registeredShapeTree: string; // The Shape Tree URI defining the structural model
  accessMode: ('Read' | 'Write' | 'Append' | 'Control')[];
  scopeOfGrant: 'AllInstances' | 'Inherited' | 'SelectedInstances';
  dataRegistration: string; // The URI of the container where these data instances live
}

export interface AccessGrant {
  id: string;
  grantee: string;        // Application WebID
  grantedBy: string;      // User WebID
  grantedAt: Date;
  dataGrants: DataGrant[];
}

export interface ApplicationRegistration {
  id: string;
  registeredApplication: string; // Application WebID
  registeredBy: string;          // User WebID
  registeredAt: Date;
  hasAccessGrant?: string;       // URI of active Access Grant
}

export class SaiInteropBroker {
  private applicationRegistry = new Map<string, ApplicationRegistration>();
  private accessGrants = new Map<string, AccessGrant>();

  /**
   * Registers an application in the user's Application Registry.
   */
  async registerApplication(
    appWebId: string,
    userWebId: string
  ): Promise<ApplicationRegistration> {
    const registrationId = `https://pod.example/settings/app-registry/${Buffer.from(appWebId).toString('base64')}`;
    const registration: ApplicationRegistration = {
      id: registrationId,
      registeredApplication: appWebId,
      registeredBy: userWebId,
      registeredAt: new Date()
    };
    
    this.applicationRegistry.set(appWebId, registration);
    console.log(`[SAI Broker] Registered application "${appWebId}" for user "${userWebId}".`);
    return registration;
  }

  /**
   * Records an Access Grant issued by the user to an application.
   */
  async grantAccess(
    appWebId: string,
    userWebId: string,
    dataGrants: Omit<DataGrant, 'id' | 'dataOwner' | 'grantee'>[]
  ): Promise<AccessGrant> {
    const appReg = this.applicationRegistry.get(appWebId);
    if (!appReg) {
      throw new Error(`Cannot issue Access Grant: Application ${appWebId} is not registered.`);
    }

    const grantId = `https://pod.example/settings/access-grants/${Math.random().toString(36).substring(7)}`;
    const fullDataGrants = dataGrants.map((dg, idx) => ({
      ...dg,
      id: `${grantId}/data-grant-${idx}`,
      dataOwner: userWebId,
      grantee: appWebId
    }));

    const accessGrant: AccessGrant = {
      id: grantId,
      grantee: appWebId,
      grantedBy: userWebId,
      grantedAt: new Date(),
      dataGrants: fullDataGrants
    };

    this.accessGrants.set(grantId, accessGrant);
    appReg.hasAccessGrant = grantId;
    
    console.log(`[SAI Broker] Issued Access Grant ${grantId} with ${dataGrants.length} Data Grants to App ${appWebId}.`);
    return accessGrant;
  }

  /**
   * Gets active Data Grants for an application to verify permissions at runtime.
   */
  async getActiveDataGrants(appWebId: string): Promise<DataGrant[]> {
    const appReg = this.applicationRegistry.get(appWebId);
    if (!appReg || !appReg.hasAccessGrant) {
      console.warn(`[SAI Broker] No Access Grant found for application ${appWebId}.`);
      return [];
    }

    const grant = this.accessGrants.get(appReg.hasAccessGrant);
    return grant ? grant.dataGrants : [];
  }

  /**
   * Verifies if an application is authorized to perform a specific action on a Shape Tree dataset.
   */
  async authorize(
    appWebId: string,
    shapeTreeUri: string,
    requiredMode: 'Read' | 'Write' | 'Append' | 'Control'
  ): Promise<boolean> {
    const grants = await this.getActiveDataGrants(appWebId);
    const matchingGrant = grants.find(g => g.registeredShapeTree === shapeTreeUri);
    
    if (!matchingGrant) {
      console.warn(`[SAI Authorize] Access Denied: App ${appWebId} has no grant for shape tree ${shapeTreeUri}`);
      return false;
    }

    const hasMode = matchingGrant.accessMode.includes(requiredMode);
    if (!hasMode) {
      console.warn(`[SAI Authorize] Access Denied: App ${appWebId} matches shape tree but lacks "${requiredMode}" capability.`);
      return false;
    }

    return true;
  }
}
