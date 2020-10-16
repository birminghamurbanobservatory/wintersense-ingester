export interface SiteOnRecord {
  id: string;
  timeOfLatestPacket?: Date;
  name: string;
  location?: Location;
}


interface Location {
  id: string;
  firstSeen: Date;
  lat: number;
  lon: number;
}