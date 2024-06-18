const CategoryModel = require("../../models/CategoryModel");
const ProductModel = require("../../models/ProductModel");
const CommentModel = require("../../models/CommentModel");
const pagination = require("../../../libs/ejs");

exports.getData = async (req, res)=>{
    const currentPage = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const skip = currentPage * limit - limit;
    const categories = await CategoryModel.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "category_id",
                as: "products"
            }
        },
        {
            $addFields: {
                productCount: { $size: "$products" }
            }
        }
    ]) 
    .sort({_id: -1}) 
    .skip(skip)
    .limit(limit);
    


    const totalCategories = await CategoryModel.find().countDocuments();
    res.render("admin/categories/category", {
        categories,
        specifiedPages: pagination(totalCategories, limit, currentPage),
        currentPage,
        limit,
        totalPages: Math.ceil(totalCategories / limit),
        totalCategories,
    });
}
exports.create = async (req, res)=>{
    res.render("admin/categories/add", {data:{}});
}
exports.store = async (req, res)=>{
    let error;
    const {body} = req;
    const category = {
        title: body.title,
    }
    const existingCategory = await CategoryModel.findOne({ title: body.title });
    if (!existingCategory) {
        await CategoryModel(category).save();
        res.redirect("/admin/categories");
    }
    error = "Exist Category"
    res.render("admin/categories/add", {data: {error}});
}
exports.edit = async (req, res)=>{
    const {id} = req.params;
    const categories = await CategoryModel.findById(id);
    res.render("admin/categories/edit", {categories, data:{}});
}
exports.update = async (req, res)=>{
    const {id} = req.params;
    const {body} = req;

    const existingCategory = await CategoryModel.findOne({ title: body.title, _id: { $ne: id } });

    if (!existingCategory) {
        await CategoryModel.updateOne({_id: id}, { $set: { title: body.title } });
        res.redirect("/admin/categories");
    } else {
        const error = "Existing Category";
        const categories = await CategoryModel.findById(id);
        res.render("admin/categories/edit", { categories, data: { error }});
    }
}

exports.del = async (req, res) => {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    await category.deleteOne();
    res.redirect("/admin/categories");
};