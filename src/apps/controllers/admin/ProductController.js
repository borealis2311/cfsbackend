const ProductModel = require("../../models/ProductModel");
const pagination = require("../../../libs/ejs");
const CategoryModel = require("../../models/CategoryModel");
const fs = require("fs");
const path = require("path");
exports.getData = async (req, res)=>{
    let query = {};
    if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) {
            query.price.$gte = req.query.minPrice;
        }
        if (req.query.maxPrice) {
            query.price.$lte = req.query.maxPrice;
        }        
    }
    if (req.query.name) {
        query.name = { $regex: new RegExp(req.query.name, 'i') };
    }
    if (req.query.featured) {
        query.featured = req.query.featured === "true";
    }
    if (req.query.is_stock) {
        query.is_stock = req.query.is_stock === "true";
    }
    if (req.query.category) {
        query.category_id = req.query.category;
    }
    const currentPage = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;
    const skip = currentPage * limit - limit;
    const products = await ProductModel.find(query).populate({path: "category_id"})    
    .sort({_id: -1}) 
    .skip(skip)
    .limit(limit);
    const totalProducts = await ProductModel.find(query).countDocuments();
    const totalCategories = await CategoryModel.find().countDocuments();
    const categories = await CategoryModel.find();
    res.render("admin/products/product",{
        categories,
        products,
        totalProducts,
        totalCategories,
        specifiedPages: pagination(totalProducts, limit, currentPage),
        currentPage,
        searchParams: req.query,
        limit,
        totalPages: Math.ceil(totalProducts / limit),       
    });
}
exports.create = async (req, res)=>{
    const categories = await CategoryModel.find();
    res.render("admin/products/add",{categories});
}
exports.store = async (req, res)=>{
    const {body, file} = req;
    const product = {
        name: body.name,
        price: body.price,
        category_id: body.category_id,
        is_stock: body.is_stock==="yes",
        featured: body.featured==="yes",
        description: body.description,
    };
 
    if(file){
        const image = `images/${file.originalname}`;
        fs.renameSync(file.path, path.resolve("src/public/upload/products", image));
        product["image"] = image;
        await ProductModel(product).save();
        res.redirect("/admin/products");
    }
}
exports.edit = async (req, res)=>{
    const {id} = req.params;
    const categories = await CategoryModel.find();
    const products = await ProductModel.findById(id);
    res.render("admin/products/edit",{categories, products});
}
exports.update = async (req, res)=>{
    const {id} = req.params;
    const {body, file} = req;
    const product = {
        name: body.name,
        price: body.price,
        category_id: body.category_id,
        is_stock: body.is_stock==="yes",
        featured: body.featured==="yes",
        description: body.description,
    }

    if(file){
        const image = `images/${file.originalname}`;
        fs.renameSync(file.path, path.resolve("src/public/upload/products", image));
        product["image"] = image;
    }
    await ProductModel.updateOne({_id:id}, {$set: product});
    res.redirect("/admin/products");
}

exports.del = async (req, res) => {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    await product.deleteOne();
    res.redirect("/admin/products");
};