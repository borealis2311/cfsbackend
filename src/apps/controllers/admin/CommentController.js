const CommentModel = require("../../models/CommentModel");
const pagination = require("../../../libs/ejs");

exports.getData = async (req, res)=>{
    const currentPage = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const skip = currentPage * limit - limit;
    const comments = await CommentModel.find()
            .populate({ path: "user_id product_id" }) 
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);    
    const totalComments = await CommentModel.find().countDocuments();
    res.render("admin/comments/comment", {
        comments,
        specifiedPages: pagination(totalComments, limit, currentPage),
        currentPage,
        limit,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        });    
}

exports.del = async (req, res)=>{
    const {id} = req.params;
    await CommentModel.deleteOne({_id: id});
    res.redirect("/admin/comments"); 
}
 