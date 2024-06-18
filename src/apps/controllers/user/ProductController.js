const ProductModel = require('../../models/ProductModel');
exports.index = async (req, res)=>{
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
    if (req.query.search) {
        query.name = { $regex: new RegExp(req.query.search, 'i') };
    }
    if (req.query.category) {
        query.category_id = req.query.category;
    }    

    const products = await ProductModel.find(query)
        .sort({_id: -1});

    res
        .json({
            data: {
                docs: products,
            }
        });
}

exports.details = async (req, res)=>{
    const {id} = req.params;
    const product = await ProductModel.findById(id);
    res
    .status(200)
    .json({
        data: {
            docs: product,
        }
    });

}