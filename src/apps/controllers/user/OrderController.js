const OrderModel = require("../../models/OrderModel");
const UserModel = require("../../models/UserModel");
const ProductModel = require("../../models/ProductModel");
const jwt = require("jsonwebtoken");
const config = require("config");
const ejs = require("ejs");
const path = require("path");
const _ = require("lodash");
const transporter = require("../../../libs/transporter");

exports.order = async (req, res)=>{
    const body = req.body;
    const totalPrice = body.items.reduce((total, item)=>total+ item.qty*item.price, 0);
    const user = await UserModel.findOne({ email: body.email });
    if(!user){
        return res.status(404).json({ message: "User not found"});
    }
    await new OrderModel({
        user_id: user._id,
        email: body.email,
        totalPrice,
        items: body.items,
    }).save();

    const productId = body.items.map(item=>item.product_id);
    const products = await ProductModel.find({_id: {$in: productId}}).lean();
    const newItems = [];
    
    for(let product of products){
        const item = _.find(body.items, {product_id: product._id.toString(),});
        if(item){
            item.name = product.name;
            newItems.push(item);
        }
    }

    const html = await ejs.renderFile(path.join(req.app.get("views"), "user/mail.ejs"),{
        newItems
    }); 

    await transporter.sendMail({
        to: `${body.email}`,
        subject: "Verify product", 
        html,
      });

    res
    .status(201)
    .json({
        status: "success",
        message: "Create comment successfully"
    });
}

exports.history = async (req, res)=>{
    const {token} = req.headers;
    const accessToken = token.split(" ")[1];
    const decoded = jwt.verify(accessToken, config.get("jwt.jwtAccessKey"));
    const email = decoded.email;
    const orders = await OrderModel.find({email: email})
    .sort({_id: -1});

    return res
        .status(200)
        .json({
            status: "success",
            data: {
                docs: orders,
            }
        });
}

exports.detailsCart = async (req, res)=>{
    const {id} = req.params;
    const cart = await OrderModel.findById(id);

    return res
        .status(200)
        .json({
            status: "success",
            data: {
                docs: cart,
            }
        });
}
