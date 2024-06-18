const CommentModel = require("../../models/CommentModel");
const UserModel = require("../../models/UserModel");
const jwt = require("jsonwebtoken");
const config = require("config");

exports.postComment = async (req, res)=>{
    const { id } = req.params;
    const { body } = req;
    const user = await UserModel.findOne({ email: body.email });
    if(!user){
        return res.status(404).json({ message: "User not found"});
    }
    const newComment = { 
        user_id: user._id,
        content: body.content,
        product_id: id,
        rating: body.rating
    }
    await new CommentModel(newComment).save();
    res
    .status(201)
    .json({
        status: "success",
        message: "Create comment successfully"
    });
}

exports.historyComment = async (req, res)=>{
    const {token} = req.headers;
    const accessToken = token.split(" ")[1];
    const decoded = jwt.verify(accessToken, config.get("jwt.jwtAccessKey"));
    const userId = decoded.user_id;
    const comments = await CommentModel.find({ user_id: userId })
    .populate('product_id') 
    .sort({ _id: -1 });

    return res
        .status(200)
        .json({
            status: "success",
            data: {
                docs: comments,
            }
        });
}

exports.infoByProductID = async (req, res)=>{
    const { id } = req.params;
    const query = {};

    const comments = await CommentModel.find({ product_id: id })
        .populate('user_id')
        .sort({_id: -1})

    const rating = await CommentModel.find({ product_id: id }).countDocuments();
    const totalRating = comments.reduce((total, doc) => total + doc.rating, 0);
    if(rating == 0){
        averageRating = 0;
    }else{
        averageRating = totalRating / rating;
    }
    
    res.json({
        status: 'success', 
        data: { 
            docs: {
                comments: comments,
                averageRating: averageRating
            },
        } 
    });
}