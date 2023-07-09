module.exports = (mongoose) => {
  const Settings = mongoose.model(
    "Settings",
    mongoose.Schema(
      {
        ticketLimit: { type: Number, default: 5 },
      },
      { timestamps: true }
    )
  );

  return Settings;
};
