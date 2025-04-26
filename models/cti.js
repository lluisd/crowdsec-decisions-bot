import mongoose from 'mongoose'
const Schema = mongoose.Schema

/* CTI Schema */
const CtiScheme = new Schema({
    ip: {
        type: String,
        required: true
    },
    info: {
        type: Schema.Types.Mixed,
        required: true
    },
    expiryDate: {
        type: Date,
        required: false
    }
})

const Cti = mongoose.model('cti', CtiScheme, 'cti')
export default Cti
