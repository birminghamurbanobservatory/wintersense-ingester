import {packetToObservations} from './observation.service';


describe('Testing of packetToObservations function', () => {

  test('Converts standard packet as expected', () => {

    const packet = {
      id: '59d656bed46dc21c28b847ab',
      sensor: '3A489E',
      sensorType: 'SIGFOX-GEN1-SURFACE',
      obsTime: new Date('2017-12-24T16:03:50.020Z'),
      arrivalTime: new Date('2017-12-24T16:03:50.865Z'),
      network: '59a68id13fd7ri8e9ea4432c',
      site: '59a58d744fd79e0d9ba4233f',
      obs: {
        rst: {
          value: -1.41,
          corr: -0.1
        },
        at: {
          value: -0.2
        },
        rh: {
          value: 99,
        },
        dew: {
          value: -0.15
        },
        battery: {
          value: 54,
          flags: ['upperbound']
        }
      },
    };


    const observations = packetToObservations(packet);

    const expected = [
      {
        resultTime: '2017-12-24T16:03:50.020Z',
        hasResult: {
          value: -1.41,
          unit: 'degree-celsius'
        },
        madeBySensor: 'ws-sigfox-3a489e',
        observedProperty: 'road-surface-temperature',
        aggregation: 'average',
        usedProcedures: ['wintersense-road-temp-sampling']
      },
      {
        resultTime: '2017-12-24T16:03:50.020Z',
        hasResult: {
          value: -0.2,
          unit: 'degree-celsius'
        },
        madeBySensor: 'ws-sigfox-3a489e',
        observedProperty: 'air-temperature',
        aggregation: 'instant'
      },
      {
        resultTime: '2017-12-24T16:03:50.020Z',
        hasResult: {
          value: 99,
          unit: 'percent'
        },
        madeBySensor: 'ws-sigfox-3a489e',
        observedProperty: 'relative-humidity',
        aggregation: 'instant'
      },
      {
        resultTime: '2017-12-24T16:03:50.020Z',
        hasResult: {
          value: -0.15,
          unit: 'degree-celsius'
        },
        madeBySensor: 'ws-sigfox-3a489e',
        observedProperty: 'dew-point-air-temperature',
        aggregation: 'instant',
        usedProcedures: ['wintersense-dew-temp-derivation']
      },
      {
        resultTime: '2017-12-24T16:03:50.020Z',
        hasResult: {
          value: 54,
          unit: 'volt',
          flags: ['upperbound']
        },
        madeBySensor: 'ws-sigfox-3a489e',
        observedProperty: 'battery-voltage',
        aggregation: 'instant'
      }
    ];

    expect(observations).toEqual(expected);

  });



});