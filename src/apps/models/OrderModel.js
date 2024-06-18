const mongoose = require("../../common/dbConnection")();

const orderSchema = new mongoose.Schema({
    user_id:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    totalPrice:{
        type: Number,
        default: 0,
    },
    items:[
        {
            product_id:{
                type: String,
                required: true,
            },
            name:{
                type: String,
                required: true,
            },
            qty:{
                type: Number,
                default: 0,
            },
            price:{
                type: Number,
                default: 0,
            }
        }
    ],
    status:{
        type: String,
        enum: ['In Progress', 'Delivered', 'Cancelled'],
        default: 'In Progress'
    }
}, {timestamps: true});

const OrderModel = mongoose.model("Orders", orderSchema, "orders");
module.exports = OrderModel;
