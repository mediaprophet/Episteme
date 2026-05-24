/**
 * MCP (Model Context Protocol) ↔ Solid Bridge
 * 
 * Demonstrates an MCP server tool that allows an external AI 
 * to query a user's Solid Pod, while strictly enforcing 
 * the underlying WAC/ACP permissions.
 */

import { getSolidDataset, getThingAll } from '@inrupt/solid-client';

// NOTE: In production, inject the user's authenticated DPoP fetch from their active Session.
// Here we fall back to global fetch for type-checking purposes.
const solidFetch: typeof globalThis.fetch = globalThis.fetch;

// A mock MCP Tool definition
export const SolidMcpTools = {
  readPodResource: {
    description: "Reads a specific RDF resource from the user's Solid Pod.",
    parameters: {
      url: { type: "string", description: "The URI of the Pod resource" }
    },
    
    // The MCP execution handler
    execute: async (params: { url: string }, _context: unknown) => {
      try {
        // CRITICAL: The MCP server MUST use the user's authenticated DPoP 
        // session. It relies entirely on the Solid Server to enforce WAC/ACP.
        // If the user hasn't explicitly granted access to this resource, 
        // the Solid server will return 401/403, and the AI is rejected.
        
        const dataset = await getSolidDataset(params.url, { 
          fetch: solidFetch // Injected authenticated fetch
        });

        // Serialize or process the graph for the LLM
        return {
          status: "success",
          data: getThingAll(dataset)
        };

      } catch (error: any) {
        if (error.statusCode === 403 || error.statusCode === 401) {
          return {
            status: "error",
            message: "Access Denied by Solid WAC/ACP policies. The user has not granted you permission to read this."
          };
        }
        return { status: "error", message: error.message };
      }
    }
  }
};
