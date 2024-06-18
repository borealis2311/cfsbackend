const CategoryModel = require("../../models/CategoryModel");

exports.index = async (req, res)=>{
    const query = {}
    const categories = await CategoryModel.find(query)
        .sort({_id: -1})

    res
        .status(200)
        .json({
            data: {
                docs: categories,
            }
        });
}
