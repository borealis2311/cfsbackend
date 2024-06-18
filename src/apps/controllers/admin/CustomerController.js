const UserModel = require("../../models/UserModel");
const pagination = require("../../../libs/ejs");

exports.getData = async (req, res)=>{
    const currentPage = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const skip = currentPage * limit - limit;
    const users = await UserModel.find({ Role: { $ne: 'Admin' } })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);    
    const totalUsers = await UserModel.find({ Role: { $ne: 'Admin' } }).countDocuments();
    res.render("admin/users/user", {
        users,
        specifiedPages: pagination(totalUsers, limit, currentPage),
        currentPage,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        });    
}

exports.del = async (req, res)=>{
    const { id } = req.params;
    const user = await UserModel.findById(id);
    await user.deleteOne();
    res.redirect("/admin/users");
}
 