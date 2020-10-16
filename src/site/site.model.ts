import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    immutable: true
  },
  name: {
    type: String
  },
  timeOfLatestPacket: {
    type: Date
  },
  location: {
    id: String,
    firstSeen: Date,
    lat: Number,
    lon: Number
  }
});



//-------------------------------------------------
// Create Model (and expose it to our app)
//-------------------------------------------------
export default mongoose.model('Site', schema);