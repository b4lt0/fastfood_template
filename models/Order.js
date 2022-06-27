
/* As it is stated by MongoBD:
* (https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-objectid)
* 'sorting on an _id field that stores ObjectId values is ---roughly--- equivalent to sorting by creation time.'
* For our use case we prefer simplicity and velocity over reliability of the orders queue.
* If this creates jealousy in customers that will eventually get surpassed by others ordering after them,
* we promise to switch to a strong ordered - orders queue.
*/

const mongoose = require('mongoose');
const {commonEmitter} = require("../controllers/commonEventEmitter");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    chefId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum : ['waiting','cooking', 'ready'],
        default: 'waiting'
    },
    number: Number
}, {timestamps: true})

// Post hook after update order status that emits corresponding event
orderSchema.post('updateOne', function(doc, next) {
    if(doc.status === 'cooking') {
        commonEmitter.emit('cooking', 'We\'re working on your order');
    }
    else if (doc.status === 'ready') {
        commonEmitter.emit('ready', 'Your order is READY!');
    }
});

module.exports = mongoose.model('order', orderSchema);