const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private (Admin only)
 */
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    // Verify project exists if provided
    if (project) {
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      project: project || undefined,
      assignedTo: assignedTo || undefined,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'title');

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task.',
    });
  }
};

/**
 * @desc    Get all tasks (with filters)
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const { status, project, assignedTo, priority } = req.query;

    const filter = {};

    // Filter by status
    if (status) filter.status = status;

    // Filter by project
    if (project) filter.project = project;

    // Filter by priority
    if (priority) filter.priority = priority;

    // If member, only show assigned tasks
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'title color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks.',
    });
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'title');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task.',
    });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Members can only update status
    if (req.user.role === 'member') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update tasks assigned to you.',
        });
      }
      // Members can only change status
      if (req.body.status) {
        task.status = req.body.status;
      }
    } else {
      // Admin can update everything
      const { title, description, status, priority, dueDate, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'title color');

    res.json({
      success: true,
      message: 'Task updated successfully!',
      data: task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task.',
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin only)
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    await Task.findByIdAndDelete(task._id);

    res.json({
      success: true,
      message: 'Task deleted successfully!',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task.',
    });
  }
};

/**
 * @desc    Get dashboard stats for the logged-in user
 * @route   GET /api/tasks/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const filter = {};

    // Members only see their tasks
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    // Status counts
    const statusCounts = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
    statusCounts.forEach((sc) => {
      counts[sc._id] = sc.count;
      counts.total += sc.count;
    });

    // Overdue tasks
    const overdueTasks = await Task.find({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    })
      .populate('assignedTo', 'name email')
      .populate('project', 'title color')
      .sort({ dueDate: 1 })
      .limit(10);

    // Recent tasks
    const recentTasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'title color')
      .sort({ createdAt: -1 })
      .limit(5);

    // Priority counts
    const priorityCounts = await Task.aggregate([
      { $match: { ...filter, status: { $ne: 'done' } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorities = { low: 0, medium: 0, high: 0 };
    priorityCounts.forEach((pc) => {
      priorities[pc._id] = pc.count;
    });

    res.json({
      success: true,
      data: {
        statusCounts: counts,
        priorityCounts: priorities,
        overdueTasks,
        recentTasks,
        overdueCount: overdueTasks.length,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats.',
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getDashboardStats,
};
