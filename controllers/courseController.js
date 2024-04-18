const { v4: uuidv4 } = require("uuid");
const { getClient } = require("../config/db");
const pagination = require("pagination");

// Get All Courses
const getAllCourseController = async (req, res) => {
  try {
    const client = await getClient();

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10; // Number of items per page

    const offset = (page - 1) * pageSize;

    // Query to get total count of courses
    const totalCountQuery = "SELECT COUNT(*) FROM courses";
    const totalCountResult = await client.query(totalCountQuery);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    // Query to fetch paginated courses
    const query = {
      text: "SELECT * FROM courses ORDER BY id LIMIT $1 OFFSET $2",
      values: [pageSize, offset],
    };

    const { rows } = await client.query(query);

    
    const paginator = new pagination.SearchPaginator({
      prelink: "/getAllCourses?page=",
      current: page,
      rowsPerPage: pageSize,
      totalResult: totalCount,
    });

    const paginationInfo = paginator.getPaginationData();

    res.json({
      courses: rows,
      pagination: paginationInfo,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Get All Course API.",
      error,
    });
  }
};

// Get Course By Id
const getCourseByIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await getClient();
    const { rows } = await client.query("SELECT * FROM courses WHERE id = $1", [
      id,
    ]);

    if (rows.length === 0) {
      return res.json({
        message: "Course Not Found",
      });
    }
    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Get Course By Id API.",
      error,
    });
  }
};

// Add New Course
const createCourseController = async (req, res) => {
  const { name, description, banner, url, rating, level, category_id } =
    req.body;

  try {
    const client = await getClient();
    // console.log(req.user.user_id);
    await client.query(
      "INSERT INTO courses (id, name, description, banner, url, rating, level, category_id, author) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [uuidv4(), name, description, banner, url, rating, level, category_id, req.user.user_id]
    );
    res.json({
      message: "Course Created Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Create Course Controller API.",
      error,
    });
  }
};

// Update Course By Id
const updateCourseByIdController = async (req, res) => {
  try {
    const client = await getClient();

    const { id } = req.params;
    let { name, description, banner, url, level, category_id } = req.body;

    const { rows } = await client.query("SELECT * FROM courses WHERE id = $1", [
      id,
    ]);

    if (rows.length === 0) {
      return res.json({
        message: "Course Not Found",
      });
    }

    if(!name) {
      name = rows[0].name;
    }
    if(!description) {
      description = rows[0].description;
    }
    if(!banner) {
      banner = rows[0].banner;
    }
    if(!url) {
      url = rows[0].url;
    }
    const rating = rows[0].rating;
    if(!level) {
      level = rows[0].level;
    }
    if(!category_id) {
      category_id = rows[0].category_id;
    }
    const author = rows[0].author;

    // Update course information
    const updateCourseQuery = {
      text: `
        UPDATE courses
        SET name = $1, description = $2, banner = $3, url = $4, rating = $5, level = $6, category_id = $7, author = $8
        WHERE id = $9
        RETURNING *
      `,
      values: [name, description, banner, url, rating, level, category_id, author, id],
    };

    const updatedCourseResult = await client.query(updateCourseQuery);

    const updatedCourse = updatedCourseResult.rows[0];

    res.json({
      message: "Course updated successfully.",
      data: updatedCourse
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Update Course By Id Controller.",
      error,
    });
  }
};

// Delete Course By Id
const deleteCouseByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getClient();
    const result = await client.query("DELETE FROM courses WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.json({
        message: "Course not found.",
      });
    }

    res.json({
      message: "Course Deleted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Delete Course By Id Controller.",
      error,
    });
  }
};



const filterController = async (req, res) => {
  try {
    const client = await getClient();

    // Extract filter parameters from the request
    const { category, level } = req.query;

    // Initialize variables to store category ID and additional query parameters
    let categoryId;
    const queryParams = [];

    // Fetch category ID based on category name if provided
    if (category) {
      const categoryQuery = {
        text: "SELECT id FROM category WHERE name = $1",
        values: [category],
      };
      const categoryResult = await client.query(categoryQuery);
      if (categoryResult.rows.length === 0) {
        return res.json({
          message: "Category not found.",
        });
      }
      categoryId = categoryResult.rows[0].id;
    }

    // Building the WHERE clause for filtering
    const filterParams = [];
    
    // Filter by category ID if available
    if (categoryId) {
      filterParams.push("c.category_id = $1");
      queryParams.push(categoryId);
    }

    // Filter by level if available
    if (level) {
      filterParams.push("c.level = $2");
      queryParams.push(level);
    }

    // Constructing the WHERE clause
    let whereClause = "";
    if (filterParams.length > 0) {
      whereClause = "WHERE " + filterParams.join(" AND ");
    }

    // Query to fetch filtered courses with category names
    const query = {
      text: `
        SELECT c.id, c.name, c.description, c.banner, c.url, c.rating, c.level, c.author, cat.name AS category
        FROM courses c
        LEFT JOIN category cat ON c.category_id = cat.id
        ${whereClause}
        ORDER BY c.category_id
      `,
      values: queryParams,
    };

    const { rows } = await client.query(query);

    res.json({
      courses: rows,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Filter Controller.",
      error,
    });
  }
};

module.exports = {
  getAllCourseController,
  getCourseByIdController,
  createCourseController,
  updateCourseByIdController,
  deleteCouseByIdController,
  filterController
};
