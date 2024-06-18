const OrderModel = require("../../models/OrderModel");
const pagination = require("../../../libs/ejs");
const moment = require("moment");
const transporter = require("../../../libs/transporter");
const ejs = require("ejs");
const path = require("path");

exports.getData = async (req, res)=>{
    const selectedStatus = req.query.status || 'In Progress';
    const currentPage = Number(req.query.page) || 1;
    let query = {};
    if (selectedStatus) {
        query.status = selectedStatus;
    }
    const limit = Number(req.query.limit) || 3;
    const skip = currentPage * limit - limit;
    const orders = await OrderModel.find(query)  
        .sort({_id: -1}) 
        .skip(skip)
        .limit(limit);
    const statusEnumValues = OrderModel.schema.path('status').enumValues;
        
    const totalOrders = await OrderModel.find(query).countDocuments();
    res.render("admin/cart/cart",{
        orders,
        totalOrders,
        specifiedPages: pagination(totalOrders, limit, currentPage),
        currentPage,
        limit,
        moment: moment,
        statusEnumValues,
        selectedStatus,
        numOfStatus: statusEnumValues.length,
        totalPages: Math.ceil(totalOrders / limit),        
    });
}

exports.edit = async (req, res)=>{
    const {id} = req.params;
    const order = await OrderModel.findById(id);
    const statusEnumValues = OrderModel.schema.path('status').enumValues;
    res.render("admin/cart/cartDetails", {order, statusEnumValues});
}
exports.update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const order = await OrderModel.findById(id);

    await OrderModel.updateOne({ _id: id }, { $set: { status: body.status } });

    if (body.status === "Delivered" || body.status === "Cancelled") {
        const templatePath = path.join(req.app.get("views"), "user", body.status === "Delivered" ? "success.ejs" : "fail.ejs");
        const emailSubject = body.status === "Delivered" ? "Successfully delivered product" : "Failed to deliver product";
        
        const emailTemplate = await ejs.renderFile(templatePath, { order });
        
        await transporter.sendMail({
            to: `${order.email}`,
            subject: emailSubject,
            html: emailTemplate
        });
    }
    
    res.redirect("/admin/cart");
}
