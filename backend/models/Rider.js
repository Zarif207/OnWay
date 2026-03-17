const { ObjectId } = require("mongodb");

class Rider {
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

    async updateStatus(id, status) {
        if (!ObjectId.isValid(id)) return null;
        return await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: status,
                    updatedAt: new Date()
                }
            }
        );
    }

    async updateSimulatedLocation(id, lat, lng) {
        if (!ObjectId.isValid(id)) return null;
        return await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    simulatedLocation: { lat, lng },
                    updatedAt: new Date()
                }
            }
        );
    }

    async getServiceAreas(id) {
        if (!ObjectId.isValid(id)) return null;
        const rider = await this.findById(id);
        return rider?.serviceAreas || [];
    }
}

module.exports = Rider;
