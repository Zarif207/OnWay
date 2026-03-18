const { ObjectId } = require("mongodb");

/**
 * A minimal simulator to move riders randomly
 */
class RiderSimulator {
    constructor(db, io) {
        this.db = db;
        this.io = io;
        this.ridersCollection = db.collection("riders");
        this.interval = null;
    }

    start() {
        console.log("🚀 Starting Rider Simulation (every 3 seconds)...");
        this.interval = setInterval(() => this.moveRiders(), 3000);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }

    async moveRiders() {
        try {
            // Find 10 riders to move
            const riders = await this.ridersCollection.find({
                status: "online"
            }).limit(10).toArray();

            if (riders.length === 0) return;

            const updates = riders.map(rider => {
                // Slight random change (+/- 0.0005)
                const latDelta = (Math.random() - 0.5) * 0.001;
                const lngDelta = (Math.random() - 0.5) * 0.001;

                const newLat = (rider.location?.lat || 23.8103) + latDelta;
                const newLng = (rider.location?.lng || 90.4125) + lngDelta;

                return {
                    updateOne: {
                        filter: { _id: rider._id },
                        update: {
                            $set: {
                                "location.lat": newLat,
                                "location.lng": newLng
                            }
                        }
                    }
                };
            });

            await this.ridersCollection.bulkWrite(updates);

            // Broadcast updates
            const updatedRiders = riders.map((r, i) => ({
                id: r._id,
                name: r.name,
                lat: (r.location?.lat || 23.8103) + (updates[i].updateOne.update.$set["location.lat"] - (r.location?.lat || 23.8103)),
                lng: (r.location?.lng || 90.4125) + (updates[i].updateOne.update.$set["location.lng"] - (r.location?.lng || 90.4125)),
                vehicle: r.vehicleDetails
            }));

            this.io.emit("riders:update", updatedRiders);

        } catch (error) {
            console.error("Simulation Error:", error.message);
        }
    }
}

module.exports = RiderSimulator;
