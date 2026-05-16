const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   POST /api/projects
router.post(
  '/',
  authorize('admin'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Project title is required')
      .isLength({ max: 100 })
      .withMessage('Title must be less than 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
  ],
  createProject
);

// @route   GET /api/projects
router.get('/', getProjects);

// @route   GET /api/projects/:id
router.get('/:id', getProject);

// @route   PUT /api/projects/:id
router.put('/:id', authorize('admin'), updateProject);

// @route   DELETE /api/projects/:id
router.delete('/:id', authorize('admin'), deleteProject);

module.exports = router;
