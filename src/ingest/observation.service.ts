import {Observation} from './observation.interface';
import * as check from 'check-types';
import {Packet} from '../wintersense/packet.interface';


export function packetToObservations(packet: Packet): Observation[] {

  const observations: Observation[] = [];

  const resultTime = packet.obsTime.toISOString();
  const sensorId = buildSensorId(packet);

  if (check.assigned(packet.obs.rst)) {
    const obs: Observation = {
      resultTime,
      hasResult: {
        value: packet.obs.rst.value,
        unit: 'degree-celsius',
      },
      madeBySensor: sensorId,
      observedProperty: 'road-surface-temperature',
      aggregation: 'average',
      usedProcedures: ['wintersense-road-temp-sampling']
    };
    if (packet.obs.rst.flags) {
      obs.hasResult.flags = packet.obs.rst.flags;
    }
    observations.push(obs);
  }

  if (check.assigned(packet.obs.at)) {
    const obs: Observation = {
      resultTime,
      hasResult: {
        value: packet.obs.at.value,
        unit: 'degree-celsius',
      },
      madeBySensor: sensorId,
      observedProperty: 'air-temperature',
      aggregation: 'instant',
    };
    if (packet.obs.at.flags) {
      obs.hasResult.flags = packet.obs.at.flags;
    }
    observations.push(obs);
  }

  if (check.assigned(packet.obs.rh)) {
    const obs: Observation = {
      resultTime,
      hasResult: {
        value: packet.obs.rh.value,
        unit: 'percent'
      },
      madeBySensor: sensorId,
      observedProperty: 'relative-humidity',
      aggregation: 'instant'
    };
    if (packet.obs.rh.flags) {
      obs.hasResult.flags = packet.obs.rh.flags;
    }
    observations.push(obs);
  }


  if (check.assigned(packet.obs.dew)) {
    const obs: Observation = {
      resultTime,
      hasResult: {
        value: packet.obs.dew.value,
        unit: 'degree-celsius'
      },
      madeBySensor: sensorId,
      observedProperty: 'dew-point-air-temperature',
      aggregation: 'instant',
      usedProcedures: ['wintersense-dew-temp-derivation']
    };
    if (packet.obs.dew.flags) {
      obs.hasResult.flags = packet.obs.dew.flags;
    }
    observations.push(obs);
  }


  if (check.assigned(packet.obs.battery)) {
    const obs: Observation = {
      resultTime,
      hasResult: {
        value: packet.obs.battery.value,
        unit: 'volt'
      },
      madeBySensor: sensorId,
      observedProperty: 'battery-voltage',
      aggregation: 'instant',
    };
    if (packet.obs.battery.flags) {
      obs.hasResult.flags = packet.obs.battery.flags;
    }
    if (packet.obs.battery.flags) {
      obs.hasResult.flags = packet.obs.battery.flags;
    }
    observations.push(obs);
  }

  return observations;

}



function buildSensorId({sensor, sensorType}) {

  const comms: string = sensorType.split('-')[0];
  const commsLowercase = comms.toLowerCase();
  if (!['sigfox'].includes(commsLowercase)) {
    throw new Error(`Unexpected sensor comms identifier: '${commsLowercase}`);
  }
  const prefix = 'ws';
  const sensorId = `${prefix}-${commsLowercase}-${sensor.toLowerCase()}`;
  return sensorId;

}