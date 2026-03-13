const { ObjectId } = require("mongodb");

class Booking {
    constructor(collection) {
        this.collection = collection;
    }

    async create(data) {
        const bookingData = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await this.collection.insertOne(bookingData);
        return {
            _id: result.insertedId,
            ...bookingData
        };
    }

    async findById(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    async find(query = {}) {
        return await this.collection.find(query).sort({ createdAt: -1 }).toArray();
    }

    async updateStatus(id, status) {
        if (!ObjectId.isValid(id)) return null;
        return await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    bookingStatus: status,
                    updatedAt: new Date()
                }
            }
        );
    }

    async verifyOTP(id, otp) {
        if (!ObjectId.isValid(id)) return false;
        const booking = await this.findById(id);
        if (booking && booking.otp === otp) {
            await this.updateStatus(id, "ongoing");
            return true;
        }
        return false;
    }
}

module.exports = Booking;
