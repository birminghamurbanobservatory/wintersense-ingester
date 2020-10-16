import {NotFound} from '../../errors/NotFound';

export class SiteNotFound extends NotFound {

  public constructor(message = 'Site could not be found') {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain   
  }

}