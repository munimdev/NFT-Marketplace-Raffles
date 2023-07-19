module.exports = (mongoose) => {
  const { Schema, model } = mongoose;

  const TraitSchema = new Schema({
    trait_type: { type: String, required: true },
    value: { type: String, required: true },
    trait_count: { type: Number, required: true },
  });

  const LinksSchema = new Schema({
    opensea: { type: String, default: null },
    website: { type: String, default: null },
    etherscan: { type: String, default: null },
    twitter: { type: String, default: null },
    discord: { type: String, default: null },
  });

  const RaffleItemSchema = new Schema(
    {
      contractAddress: { type: String, required: true },
      tokenId: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, default: null },
      image: { type: String, required: true },
      traits: { type: [TraitSchema], default: [] },
      links: { type: LinksSchema, default: {} },
    },
    { timestamps: true }
  );

  const RaffleSchema = new Schema(
    {
      item: {
        type: RaffleItemSchema,
        required: true,
      },
      maxTickets: { type: Number, default: 5 },
      ticketsSold: { type: Number, default: 0 },
      price: { type: Number, required: true },
      expiry: { type: Date, required: true },
      winner: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
  );

  return model("Raffle", RaffleSchema);
};
