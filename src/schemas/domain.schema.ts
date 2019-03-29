import * as mongoose from 'mongoose';

export const DomainSchema = new mongoose.Schema({
    link: String,
    rank: String,
    info: {
        company: String,
        createdDate: String,
        updatedDate: String,
        expireDate: String,
    },
});
