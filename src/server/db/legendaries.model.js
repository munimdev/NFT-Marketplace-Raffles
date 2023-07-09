module.exports = (mongoose) => {
    const Legendary = mongoose.model(
        "Legendary",
        mongoose.Schema({
            name: String,
            dataURL: String,
            description: String,
            tokenId: Number,
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            price: { type: Number, default: 0 },
            lastPrice: { type: Number, default: 0 },
            auctionPeriod: { type: Number, default: 0 },
            auctionStarted: { type: Number, default: 0 },
            isSold: { type: Number, default: 0 }, // 0: not, 1: sold
            isMinted: { type: Number, default: 0 }, // 0: not, 1: true
            isVisible: {type: Number, default: 0 }, // 0: false, 1; true
            winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
            winnerName: String,
            bids: [
                {
                    user_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User"
                    },
                    username: String,
                    address: String,
                    price: Number,
                    Time: String
                }
            ],
            likes: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ]
        }, { timestamps: true }
        )
    );

    // Legendary.updateMany({}, { $set: { isSold: 0, isMinted: 0, bids: [], auctionPeriod: 0, auctionStarted: 0, price: 0, lastPrice: 0 } }, (err, res) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(`${res.nModified} documents updated`);
    //     }
    // });

    return Legendary;
}