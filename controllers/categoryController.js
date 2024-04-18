const { v4: uuidv4 } = require("uuid");
const { getClient } = require("../config/db");

const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const client = await getClient();
    // If id or name is missing
    if (!name) {
      return res.json({
        message: "Please provide an unique name for the category.",
      });
    }

    // Check if the category already exists
    const existingCategory = await client.query(
      "SELECT * FROM category WHERE name = $1",
      [name]
    );

    if (existingCategory.rows.length > 0) {
      return res.json({
        message: "Category with this name already exists.",
      });
    }

    // Create new Category
    const newCategory = await client.query(
      "INSERT INTO category (id, name) VALUES ($1, $2) RETURNING *",
      [uuidv4(), name]
    );

    res.json({
      message: "Category created successfully.",
      category: newCategory.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Create Category API.",
      error,
    });
  }
};

const deleteCategoryController = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const client = await getClient();

    // If category id is missing
    if (!categoryId) {
      return res.json({
        message: "Please provide the category id.",
      });
    }

    // Check if category id exists
    const existingCategory = await client.query(
      "SELECT * FROM category WHERE id = $1",
      [categoryId]
    );

    if (existingCategory.rows.length === 0) {
      return res.json({
        message: "Category not found.",
      });
    }

    // Delete the Category
    await client.query("DELETE FROM category WHERE id = $1", [categoryId]);

    res.json({
      message: "Category Deleted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Delete Category API.",
      error,
    });
  }
};

module.exports = { createCategoryController, deleteCategoryController };
