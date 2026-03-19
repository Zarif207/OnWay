const { ObjectId } = require("mongodb");

class Passenger {
    constructor(collection) {
        this.collection = collection;
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async findByEmail(email) {
        return await this.collection.findOne({ email });
    }
}

module.exports = Passenger;
