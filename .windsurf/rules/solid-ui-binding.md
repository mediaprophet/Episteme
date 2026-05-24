---
description: Rules for managing asynchronous state, UI components, and data fetching lifecycles in W3C Solid apps.
globs: ["**/components/**/*", "**/hooks/**/*", "**/ui/**/*", "**/views/**/*", "*.tsx", "*.jsx", "*.vue"]
---
# Solid UI and State Management Rules

Solid applications interact with decentralized Pods, which means high network latency and incomplete data graphs are the default state.

## Core Directives
1. **The Open World Assumption:** Never assume a property exists in the RDF graph. Linked Data is sparse by nature. Always handle `null` or `undefined` gracefully when extracting strings or URLs from a `Thing`. UI components must never crash due to missing profile or dataset properties.
2. **Async-First Components:** All Pod data fetching is asynchronous. Components must implement explicit `loading` and `error` states. 
3. **Avoid Monolithic State:** Do not attempt to serialize entire `SolidDataset` or `Thing` objects into global state managers (like Redux). Store the minimal extracted primitives (strings, booleans) in state, or manage the `SolidDataset` at the component/hook level.
4. **Optimistic UI Updates:** Because saving a dataset back to a Pod requires a network request, update the local component state immediately with the new value, then perform the `@inrupt/solid-client` save operation in the background. Roll back the state if the save fails.

## Example Pattern: Safe Async Fetching (React)
```javascript
import { useState, useEffect } from 'react';
import { getSolidDataset, getThing, getStringNoLocale } from '@inrupt/solid-client';
import { FOAF } from '@inrupt/vocab-common-rdf';

export function UserProfile({ webId, session }) {
  const [name, setName] = useState('Loading...');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        // 1. Fetch the dataset asynchronously
        const dataset = await getSolidDataset(webId, { fetch: session.fetch });
        
        // 2. Extract the specific Thing
        const profileThing = getThing(dataset, webId);
        
        // 3. Graceful degradation: Handle missing data safely
        const fetchedName = profileThing 
          ? getStringNoLocale(profileThing, FOAF.name) 
          : null;

        if (isMounted) {
          setName(fetchedName || 'Anonymous User');
        }
      } catch (err) {
        if (isMounted) setError('Failed to load profile data.');
      }
    }

    if (session.info.isLoggedIn) {
      fetchProfile();
    }

    return () => { isMounted = false; };
  }, [webId, session]);

  if (error) return <div>Error: {error}</div>;

  return <div>Welcome, {name}</div>;
}

```
