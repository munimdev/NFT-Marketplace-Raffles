module.exports = (mongoose) => {
  const { Schema } = mongoose;

  const TraitSchema = new Schema({
    trait_type: { type: String, required: true },
    value: { type: String, required: true },
  });

  const RaffleItemSchema = new Schema(
    {
      contractAddress: { type: String, required: true },
      tokenId: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      image: { type: String, required: true },
      traits: { type: [TraitSchema], required: true },
      price: { type: Number, required: true },
    },
    { timestamps: true }
  );

  const RaffleItem = mongoose.model("RaffleItem", RaffleItemSchema);

  return RaffleItem;
};
