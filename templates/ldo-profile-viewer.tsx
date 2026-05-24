import { useResource, useSubject } from '@ldo/solid-react';
import { SolidProfileShapeType } from '../.shapes/SolidProfileShape';

/**
 * LDO Profile Viewer Template
 * 
 * Notice how LDO abstracts away the raw RDF `getThing` and `getStringNoLocale`
 * methods used in the Inrupt stack. We just interact with standard object properties.
 */
export const LdoProfileViewer = ({ webId }: { webId: string }) => {
  // 1. Fetch the underlying Solid resource
  const profileResource = useResource(webId);
  
  // 2. Bind the resource to a ShEx-generated TypeScript shape
  const profile = useSubject(SolidProfileShapeType, webId);

  // Handle network states
  if (profileResource.isReading()) return <div>Loading Profile...</div>;
  if (profileResource.isError) return <div>Error: {profileResource.error.message}</div>;

  // Handle Open World Assumption (data might be missing)
  const name = profile.name || 'Anonymous User';

  return (
    <div>
      <h2>{name}</h2>
      {/* 
        Writing data in LDO is as simple as mutating the object.
        The underlying proxy tracks changes to generate the RDF diff.
      */}
      <button onClick={() => {
        profile.name = "New Name";
        // Commit changes back to the Solid Pod
        // Note: Requires an authenticated session context wrapper higher in the tree
      }}>
        Update Name
      </button>
    </div>
  );
};
