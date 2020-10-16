import * as logger from 'node-logger';
import * as Promise from 'bluebird';
import {SiteOnRecord} from '../site/site-on-record.interface';
import * as event from 'event-stream';
import {sub} from 'date-fns';
import {last, cloneDeep, round, pick, concat} from 'lodash';
import {getNetworks, getNetworkSites, getSitePackets} from '../wintersense/wintersense.service';
import {Network} from '../wintersense/network.interface';
import {getSite, upsertSite} from '../site/site.service';
import {SiteFromApi} from '../wintersense/site-from-api.interface';
import {v4 as uuid} from 'uuid';
import {packetToObservations} from './observation.service';
import {Observation} from './observation.interface';


export async function ingest(): Promise<void> {

  // Begin by getting an up-to-date list of our networks.
  const networks = await getNetworks();
  logger.debug(`About to process ${networks.length} network(s).`);

  // Process each of these networks
  await Promise.mapSeries(networks, async (network) => {
    await processNetwork(network);
    return;
  });

  logger.info(`${networks.length} network(s) have been successfully processed.`);

  return;

}


async function processNetwork(network: Network): Promise<void> {

  logger.debug(`Processing network ${network.name} (id: ${network.id})`);

  const sites = await getNetworkSites(network.id);

  await Promise.mapSeries(sites, async (site) => {
    await processSite(site);
    await Promise.delay(300); // add a small delay to avoid overloading the wintersense API.
    return;
  });

  logger.debug(`${sites.length} sites from network ${network.name} (id: ${network.id}) has been successfully processed.`);

}



async function processSite(site: SiteFromApi): Promise<void> {

  logger.debug(`Processing site ${site.name} (id: ${site.id})`);

  // Do we have this site on record.
  let siteOnRecord: SiteOnRecord;
  try {
    siteOnRecord = await getSite(site.id);
  } catch (err) {
    if (err.name === 'SiteNotFound') {
      // Allow to continue
    } else {
      throw err;
    }
  }

  const siteToUpsert: SiteOnRecord = pick(site, ['id', 'name']);

  let canReuseLocationOnRecord;
  if (siteOnRecord && siteOnRecord.location && site.location) {
    canReuseLocationOnRecord = areLocationsTheSame(siteOnRecord.location, site.location);
  }

  if (canReuseLocationOnRecord) {
    siteToUpsert.location = cloneDeep(siteOnRecord.location);
  } else if (site.location) {
    siteToUpsert.location = {
      id: uuid(),
      firstSeen: new Date(),
      lat: site.location.lat,
      lon: site.location.lon
    };

  }

  // Limit just how far back in time we get observations from
  let getReadingsFrom = sub(new Date, {hours: 12}); // set a default, for when we haven't seen this site before.
  if (siteOnRecord && siteOnRecord.timeOfLatestPacket) {
    const threshold = sub(new Date, {days: 3});
    if (siteOnRecord.timeOfLatestPacket > threshold) {
      getReadingsFrom = siteOnRecord.timeOfLatestPacket;
    } else {
      getReadingsFrom = threshold;
    }
  }

  const options = {
    startDate: getReadingsFrom,
    endDate: new Date(),
    removeFlagged: true
  };

  const packets = await getSitePackets(site, options);

  const observations = [];
  packets.forEach((packet) => {
    const packetObs = packetToObservations(packet);
    packetObs.forEach((packetObs) => observations.push(packetObs));
  });

  // Add the site location to each of these observations
  if (siteToUpsert.location) {
    observations.forEach((observation: Observation) => {
      observation.location = {
        id: siteToUpsert.location.id,
        validAt: siteToUpsert.location.firstSeen.toISOString(),
        geometry: {
          type: 'Point',
          coordinates: [
            siteToUpsert.location.lon,
            siteToUpsert.location.lat
          ]
        }
      };
    });
  }

  logger.debug(`Got ${packets.length} packets from site '${site.name}' (id: ${site.id}). Converted to ${observations.length} observations.`);

  if (observations.length) {
    const lastObs: any = last(observations);
    siteToUpsert.timeOfLatestPacket = new Date(lastObs.resultTime);
  }

  await publishObservations(observations);

  const upsertedSite = await upsertSite(siteToUpsert);

  logger.debug('Site upserted', upsertedSite);

}





async function publishObservations(observations: any[]): Promise<void> {

  await Promise.mapSeries(observations, async (observation): Promise<void> => {
    await event.publish('observation.incoming', observation);
  });

  return;
}



function areLocationsTheSame(loc1, loc2) {

  const precision = 5;
  return (round(loc1.lat, precision) === round(loc2.lat, precision)) && 
         (round(loc1.lon, precision) === round(loc2.lon, precision));

}