const Task = require("../models/Task");
const Course = require("../models/Course");
const { Op } = require("sequelize");

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { user_id: req.user.id },
      include: { model: Course },
      order: [["due_date", "ASC"]], 
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createTask = async (req, res) => {
  const { title, due_date, priority = "Medium", course_id } = req.body;
  try {
    const task = await Task.create({
      title,
      due_date,
      priority,
      course_id,
      user_id: req.user.id,
      completed: false, 
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, due_date, priority, course_id } = req.body;
  try {
    const task = await Task.findOne({ where: { id, user_id: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = title ?? task.title;
    task.due_date = due_date ?? task.due_date;
    task.priority = priority ?? task.priority;
    task.course_id = course_id ?? task.course_id;

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findOne({ where: { id, user_id: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.destroy();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const toggleTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findOne({ where: { id, user_id: req.user.id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();
    const overdueTasks = await Task.findAll({
      where: {
        user_id: req.user.id,
        completed: false,
        due_date: { [Op.lt]: now },
      },
      include: { model: Course },
      order: [["due_date", "ASC"]],
    });
    res.json(overdueTasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  getOverdueTasks,
};
