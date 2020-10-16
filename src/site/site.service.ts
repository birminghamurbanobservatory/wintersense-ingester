import Site from './site.model';
import {SiteOnRecord} from './site-on-record.interface';
import {GetSiteFail} from './errors/GetSiteFail';
import {SiteNotFound} from './errors/SiteNotFound';
import {cloneDeep} from 'lodash';
import * as check from 'check-types';
import {UpsertSiteFail} from './errors/UpsertSiteFail';


export async function getSite(id: string): Promise<SiteOnRecord> {

  let site;
  try {
    site = await Site.findById(id).exec();
  } catch (err) {
    throw new GetSiteFail(undefined, err.message);
  }

  if (!site) {
    throw new SiteNotFound(`A site with id '${id}' could not be found`);
  }

  return siteDbToApp(site);

}



export async function upsertSite(site: SiteOnRecord): Promise<SiteOnRecord> {

  const siteDb = siteAppToDb(site);

  check.assert.nonEmptyString(siteDb._id);

  let upserted;
  try {
    upserted = await Site.findByIdAndUpdate(
      siteDb._id, 
      siteDb,
      {
        new: true, 
        upsert:true, 
        runValidators: true, 
        setDefaultsOnInsert: true // need this for the defaults for fields such as getDailyAverageData to be added.
      }
    ).exec();
  } catch (err) {
    throw new UpsertSiteFail(undefined, err.message);
  }

  return siteDbToApp(upserted);

}



function siteAppToDb(siteApp: SiteOnRecord): any {
  const siteDb: any = cloneDeep(siteApp);
  siteDb._id = siteDb.id;
  delete siteDb.id;
  return siteDb;
}


function siteDbToApp(siteDB: any): SiteOnRecord {
  const siteApp = siteDB.toObject();
  siteApp.id = siteApp._id;
  delete siteApp._id;
  delete siteApp.__v;
  return siteApp;
}