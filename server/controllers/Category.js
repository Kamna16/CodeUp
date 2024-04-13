const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const CategorysDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategorysDetails);
    return res.status(200).json({
      success: true,
      message: "Categorys Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      data: allCategorys,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//categoryPageDetails

exports.categoryPageDetails = async (req, res) => {
  try {
    //get categoryId
    const { categoryId } = req.body;

    //get courses for specified categoryId
    const selectedCategory = await Category.findById(categoryId)
    .populate({
      path: "courses",
      match: { status: "Published" },
      populate: "ratingAndReviews",
    })
    .exec();
    //validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category Not Found",
      });
    }
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }
    //get courses for different categories
    const CategoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
      
    let differentCategory = await Category.findOne(
      CategoriesExceptSelected[getRandomInt(CategoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()

      // Get top-selling courses across all categories
    const allCategories = await Category.find()
    .populate({
      path: "courses",
      match: { status: "Published" },
    })
    .exec()
  const allCourses = allCategories.flatMap((category) => category.courses)
  const mostSellingCourses = allCourses
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 10)

    //return response
    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
