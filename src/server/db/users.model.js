module.exports = (mongoose) => {
  const User = mongoose.model(
    "User",
    mongoose.Schema(
      {
        address: { type: String, required: true, unique: true },
        points: { type: Number, default: 0 },
        tickets: [
          {
            raffle: { type: mongoose.Schema.Types.ObjectId, ref: "Raffle" },
            purchasedAt: { type: Date, default: Date.now },
          },
        ],
        isAdmin: { type: Boolean, default: false },
        banned: { type: Boolean, default: false },
        // minted: [{
        //     id: Number,
        //     name: String,
        //     dataURL: String,
        //     description: String,
        //     price: { type: Number, default: 0 },
        // }],
        // follows: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User"
        // }]
      },
      { timestamps: true }
    )
  );

  return User;
};
