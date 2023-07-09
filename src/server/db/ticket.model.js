module.exports = (mongoose) => {
  const Ticket = mongoose.model(
    "Ticket",
    mongoose.Schema(
      {
        raffle: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Raffle",
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
      { timestamps: true }
    )
  );

  return Ticket;
};
