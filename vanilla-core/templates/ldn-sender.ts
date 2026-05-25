import { getSolidDataset, getThing, getUrl, buildThing, createThing, createSolidDataset, setThing } from '@inrupt/solid-client';
import { Session } from '@inrupt/solid-client-authn-browser';

/**
 * LDN Sender Template
 * 
 * Demonstrates discovering a user's inbox via their WebID, constructing an 
 * ActivityStreams payload, and POSTing it to their inbox.
 */

import { AS } from './vocab/ActivityStreams';

const LDP_INBOX = "http://www.w3.org/ns/ldp#inbox";

export async function sendLdnMessage(senderWebId: string, recipientWebId: string, messageText: string, session: Session) {
  // 1. Discover the recipient's Inbox URL
  const profileDataset = await getSolidDataset(recipientWebId, { fetch: session.fetch });
  const profileThing = getThing(profileDataset, recipientWebId);
  const inboxUrl = profileThing ? getUrl(profileThing, LDP_INBOX) : null;

  if (!inboxUrl) {
    throw new Error("Could not discover ldp:inbox for the recipient.");
  }

  // 2. Construct the Message Payload (ActivityStreams in RDF)
  let messageDataset = createSolidDataset();
  
  // Create an ActivityStreams Note
  const noteThing = buildThing(createThing({ name: "note" }))
    .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', AS.Note)
    .addStringNoLocale(AS.content, messageText)
    .addUrl(AS.attributedTo, senderWebId)
    .build();

  // Create the ActivityStreams Create action wrapping the Note
  const activityThing = buildThing(createThing({ name: "activity" }))
    .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', AS.Create)
    .addUrl(AS.actor, senderWebId)
    .addUrl(AS.object, noteThing.url)
    .build();

  messageDataset = setThing(messageDataset, noteThing);
  messageDataset = setThing(messageDataset, activityThing);

  // 3. Dispatch the message (POST to Inbox)
  // We use saveSolidDatasetAt directly to the inbox URL, which acts as a POST/Append
  // Note: Depending on the server, you might need to use raw fetch for a pure POST,
  // but saveSolidDatasetInContainer is generally preferred for LDP.
  
  const response = await fetch(inboxUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/turtle',
      'Link': '<http://www.w3.org/ns/ldp#Resource>; rel="type"'
    },
    // We would serialize the messageDataset to turtle here. 
    // For simplicity, we assume a serialize function exists or we use Inrupt's container helpers.
    body: `
      @prefix as: <https://www.w3.org/ns/activitystreams#> .
      <> a as:Create ;
         as:actor <${senderWebId}> ;
         as:object [
           a as:Note ;
           as:content "${messageText}" ;
           as:attributedTo <${senderWebId}>
         ] .
    `
  });

  if (!response.ok) {
    throw new Error(`Failed to send LDN: ${response.statusText}`);
  }

  return response.headers.get("Location"); // Returns the URI of the newly created message
}
