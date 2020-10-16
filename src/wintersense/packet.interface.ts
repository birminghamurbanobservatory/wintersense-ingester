export interface Packet {
  id: string;
  sensor: string;
  sensorType: string;
  obsTime: Date;
  arrivalTime: Date;
  network: string;
  site: string;
  obs: {
    rst?: {
      value: number;
      flags?: string[];
    },
    at?: {
      value: number;
      flags?: string[];
    },
    rh?: {
      value: number;
      flags?: string[];
    },
    dew?: {
      value: number;
      flags?: string[];
    },
    battery?: {
      value: number;
      flags?: string[];
    },
    angle?: {
      value: number;
      flags?: string[];
    }
  },
  location?: Location
}

interface Location {
  lat: number;
  lon: number;
}