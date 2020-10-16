import axios from 'axios';
import * as check from 'check-types';
import {cloneDeep, sortBy} from 'lodash';
import {config} from '../config';
import {Network} from './network.interface';
import {SiteFromApi} from './site-from-api.interface';
import {Packet} from './packet.interface';


const axiosInstance = axios.create({
  baseURL: 'https://api.wintersense.com/v1',
  headers: {
    Authorization: `apiKey ${config.wintersense.apiKey}`
  }
});


export async function getNetworks(): Promise<Network[]> {

  let response;

  try {
 
    response = await axiosInstance.get(
      `/networks`
    );

  } catch (err) {
    throw new Error(`Failed to get Network list from Wintersense API. Reason: ${err.message}`);
  }

  return response.data;

}



export async function getNetworkSites(networkId: string): Promise<SiteFromApi[]> {

  let response;

  try {
 
    response = await axiosInstance.get(
      `/networks/${networkId}/sites`
    );

  } catch (err) {
    throw new Error(`Failed to get Site list from Wintersense API. Reason: ${err.message}`);
  }

  return response.data;

}



export async function getSitePackets(site: SiteFromApi, options: {startDate?: Date, endDate?: Date, removeFlagged?: boolean} = {}): Promise<Packet[]> {

  let response;

  const params: any = cloneDeep(options);
  if (params.startDate) {
    params.startDate = params.startDate.toISOString();
  }
  if (params.endDate) {
    params.endDate = params.endDate.toISOString();
  }

  try {
 
    response = await axiosInstance.get(
      `/networks/${site.network}/sites/${site.id}/packets.json`,
      {
        params
      }
    );

  } catch (err) {
    throw new Error(`Failed to get site Packets. Reason: ${err.message}`);
  }

  if (check.not.array(response.data.packets)) {
    throw new Error('Wintersense API response is missing a packets array.');
  }
  if (check.not.nonEmptyObject(response.data.metadata)) {
    throw new Error('Wintersense API response is missing a metadata object.');
  }
  if (check.not.nonEmptyObject(response.data.metadata.site)) {
    throw new Error('Response metadata is missing a site object.');
  }

  const formatted = response.data.packets.map(formatPacket);
  const ordered = sortBy(formatted, 'obsTime');

  return ordered;

}




function formatPacket(packets: any): Packet {

  const formatted = cloneDeep(packets);
  formatted.obsTime = new Date(formatted.obsTime);
  formatted.arrivalTime = new Date(formatted.obsTime);

  return formatted;

}







