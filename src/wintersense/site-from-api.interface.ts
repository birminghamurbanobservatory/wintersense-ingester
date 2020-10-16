export interface SiteFromApi {
  id: string;
  name: string;
  description: string;
  type: string;
  network: string;
  location: Location;
}


interface Location {
  lat: number;
  lon: number;
}