module.exports = (mongoose) => {
    const Numbers = mongoose.model(
        "Number",
        mongoose.Schema({
            name: String,
            value: { type: Number, required: true }
        })
    );

    // Create a new number object called "minted" with value 0
    // Numbers.find({ name: "price" })
    //     .then(async (docs) => {
    //         if (docs.length === 0) {
    //             // create new item
    //             const item = new Numbers({ name: "minted", value: 250 });
    //             await item.save();
    //             console.log("create new number, name=", "minted");
    //         }
    //     })
    //     .catch((err) => {
    //         console.log("error creating number, name=", "minted", "err=", err);
    //     });

    return Numbers;
};
