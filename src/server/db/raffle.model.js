module.exports = (mongoose) => {
  const Raffle = mongoose.model(
    "Raffle",
    mongoose.Schema(
      {
        nft: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NFT",
          required: true,
        },
        ticketLimit: { type: Number, default: 5 },
        ticketsSold: { type: Number, default: 0 },
        expiryDate: { type: Date, required: true },
        winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
      { timestamps: true }
    )
  );

  return Raffle;
};
