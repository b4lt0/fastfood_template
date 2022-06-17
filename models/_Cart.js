const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        productItems: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity: Number
            }
        ],
        active: {
            type: Boolean,
            default: true
        },
        modifiedOn: {
            type: Date,
            default: Date.now
        }
    },
    {timestamps: true}
);

cartSchema.virtual('items',
    {
        ref: 'Product',
        localField: '_id',
        foreignField: 'productItems.item',
        justOne: false,
    },
    {
        toJSON: {virtuals: true}
    });

cartSchema.virtual('total').get(function () {
        let total = 0;
        this.productItems.forEach(function (e) {
            total += e.item.price;
        });
        return total;
    },
    {
        toJSON: {virtuals: true}
    });

module.exports = mongoose.model("Cart", cartSchema);