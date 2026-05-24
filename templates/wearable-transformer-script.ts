import * as fs from 'fs';
import csv from 'csv-parser';
import { Session } from '@inrupt/solid-client-authn-node';
import { buildThing, createThing, setThing, saveSolidDatasetAt, createSolidDataset } from '@inrupt/solid-client';

/**
 * Data Liberation Template: Wearable CSV to Solid
 * 
 * Demonstrates extracting siloed health data (e.g., heart rate logs) 
 * and mapping them to the SOSA (Sensor) ontology.
 */

import { SOSA } from './vocab/SOSA';

const HEART_RATE = "http://purl.obolibrary.org/obo/NCIT_C16468"; // NCI Thesaurus for Heart Rate

export async function liberateHealthData(targetContainer: string, session: Session) {
  let dataset = createSolidDataset();
  let count = 0;

  // 1. Extract: Stream the CSV
  fs.createReadStream('./samsung_health_heart_rate.csv')
    .pipe(csv())
    .on('data', (row: Record<string, string>) => {
      // 2. Transform: Map the flat row to SOSA Ontology
      const observation = buildThing(createThing({ name: `hr_${Date.now()}_${count}` }))
        .addUrl('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', SOSA.Observation)
        .addUrl(SOSA.observedProperty, HEART_RATE)
        .addStringNoLocale(SOSA.hasSimpleResult, row['heart_rate_bpm'])
        .addDatetime(SOSA.resultTime, new Date(row['update_time']))
        .build();

      dataset = setThing(dataset, observation);
      count++;
    })
    .on('end', async () => {
      // 3. Load: Push the transformed graph to the Pod
      try {
        await saveSolidDatasetAt(targetContainer, dataset, { fetch: session.fetch });
        console.log(`Liberated ${count} observations to ${targetContainer}`);
      } catch (error) {
        console.error("Failed to save to Pod", error);
      }
    });
}
