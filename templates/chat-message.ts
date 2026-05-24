import { 
  getSolidDataset, 
  saveSolidDatasetAt, 
  buildThing, 
  createThing, 
  setThing 
} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";

/**
 * Appends a new chat message to a specific container dataset.
 * 
 * @param chatContainerUrl The URL of the Chat container/dataset
 * @param messageText The string content of the message
 * @param authorWebId The WebID of the author
 */
export async function appendChatMessage(
  chatContainerUrl: string, 
  messageText: string, 
  authorWebId: string
): Promise<void> {
  try {
    // 1. Fetch the existing dataset
    let chatDataset = await getSolidDataset(chatContainerUrl, { fetch });

    // 2. Build a new Thing for the message
    // We use a generated local name for the new Thing
    const newMessageThing = buildThing(createThing({ name: `msg-${Date.now()}` }))
      .addUrl("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", SCHEMA_INRUPT.Message)
      .addStringNoLocale(SCHEMA_INRUPT.text, messageText)
      .addUrl(SCHEMA_INRUPT.sender, authorWebId)
      .addDatetime(SCHEMA_INRUPT.dateSent, new Date())
      .build();

    // 3. Add the new Thing to the dataset (immutability: creates a new dataset reference)
    chatDataset = setThing(chatDataset, newMessageThing);

    // 4. Save the dataset back to the Pod
    await saveSolidDatasetAt(chatContainerUrl, chatDataset, { fetch });
    
    console.log("Message appended successfully!");
  } catch (error) {
    console.error("Failed to append chat message:", error);
    throw error;
  }
}
