const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* NOME
* PREZZO
* CATEGORIA
* CALORIE
* DESCRIZIONE
* INGREDIENTI (FOTO)
* IMMAGINE
* RELATED PRODUCTS
* */

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Schema.Types.Decimal128,
        required: true
    },
    picture: {
        type: String
        //, required:true
    },
    category: {
        type: String,
        required: true
        /*
        menu:1,
        burgers:2,
        salads:3,
        fries:4,
        snacks:5,
        beverages:6,
        dessert:7
         */
    },
    calories: {
        type: Number
        //, required:true
    },
    description: {
        type: String
        //, required:true
    },
    ingredients: [{
        name: {
            type: String
            //, required:true
        },
        image: {
            //Schema.Types.Path
            type: String
            //, required:true
        }
    }],
    related_products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
});

//source: https://stackoverflow.com/questions/24964914/can-a-mongo-model-self-reference
productSchema.virtual('related',
    {
        ref: 'Product',
        localField: '_id',
        foreignField: 'related_products',
        justOne: false,
    },
    {
        toJSON: {virtuals: true}
    });

/* toJSON option is set because virtual fields are not included in toJSON output by default.
* So, if you don't set this option, and call User.find().populate('refereals'),
* you won't get anything in refereals
*/


productSchema.index({'$**': 'text'});

module.exports = mongoose.model('Product', productSchema);