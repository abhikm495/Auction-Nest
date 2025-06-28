import Category from "../models/Category.js";

export const categories = async (req, res) => {
    try {
        // Get all categories from MongoDB
        const allCategories = await Category.find({isActive:true}).select("_id name image");
        
        // Or if you want only active categories using the static method you defined:
        // const activeCategories = await Category.getActiveCategories();

        res.status(200).json({
            success: true,
            count: allCategories.length,
            data: allCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};
