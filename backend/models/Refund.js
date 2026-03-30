const { ObjectId } = require("mongodb");

class Refund {
  constructor(collection) {
    this.collection = collection;
  }

  async create(data) {
    const result = await this.collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { _id: result.insertedId, ...data };
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async find(query = {}) {
    return await this.collection.find(query).sort({ createdAt: -1 }).toArray();
  }

  async updateStatus(id, status, agentNote = "") {
    if (!ObjectId.isValid(id)) return null;
    return await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, agentNote, updatedAt: new Date() } }
    );
  }
}

module.exports = Refund;
