module.exports = (mongoose) => {
  const { Schema, model } = mongoose;

  const TraitSchema = new Schema({
    trait_type: { type: String, required: true },
    value: { type: String, required: true },
  });

  const LinksSchema = new Schema({
    opensea: { type: String },
    etherscan: { type: String },
    twitter: { type: String },
    discord: { type: String },
  });

  const RaffleItemSchema = new Schema(
    {
      contractAddress: { type: String, required: true },
      tokenId: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String },
      image: { type: String, required: true },
      traits: { type: [TraitSchema] },
      links: { type: LinksSchema },
    },
    { timestamps: true }
  );

  const Raffle = model(
    "Raffle",
    Schema(
      {
        item: {
          type: RaffleItemSchema,
          required: true,
        },
        maxTickets: { type: Number, default: 5 },
        ticketsSold: { type: Number, default: 0 },
        price: { type: Number, required: true },
        expiry: { type: Date, required: true },
        winner: { type: Schema.Types.ObjectId, ref: "User" },
      },
      { timestamps: true }
    )
  );

  return Raffle;
};
