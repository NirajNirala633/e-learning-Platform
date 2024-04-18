const express = require("express")
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const isAuthenticated = require("../middlewares/isAuthenticated");
const { createCategoryController, deleteCategoryController } = require("../controllers/categoryController");

router.use(verifyToken);

router.post("/createCategory", isAuthenticated, createCategoryController);
router.delete("/deleteCategory/:id", isAuthenticated, deleteCategoryController);

module.exports = router;
