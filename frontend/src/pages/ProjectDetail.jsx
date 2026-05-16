import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, tasksAPI, authAPI } from '../services/api';

import Modal from '../components/Modal';

import {
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiOutlinePencil
} from 'react-icons/hi';

import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'Working',
  done: 'Completed'
};

const STATUS_ICONS = {
  todo: '📌',
  'in-progress': '⚡',
  done: '🎯'
};

const ProjectDetail = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const { isAdmin, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);

  const [editTask, setEditTask] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchUsers();
  }, [id]);

  const fetchProject = async () => {
    try {

      const res = await projectsAPI.getOne(id);

      setProject(res.data.data);
      setTasks(res.data.data.tasks || []);

    } catch {

      toast.error('Failed to load project');
      navigate('/projects');

    } finally {

      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {

      const res = await authAPI.getUsers();
      setUsers(res.data.data);

    } catch {}
  };

  const openCreateTask = () => {

    setEditTask(null);

    setTaskForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      assignedTo: ''
    });

    setShowTaskModal(true);
  };

  const openEditTask = (task) => {

    setEditTask(task);

    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? task.dueDate.split('T')[0]
        : '',
      assignedTo: task.assignedTo?._id || ''
    });

    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {

    e.preventDefault();

    setSaving(true);

    try {

      if (editTask) {

        await tasksAPI.update(editTask._id, taskForm);

        toast.success('Task updated successfully');

      } else {

        await tasksAPI.create({
          ...taskForm,
          project: id
        });

        toast.success('Task created successfully');
      }

      setShowTaskModal(false);

      fetchProject();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        'Failed to save task'
      );

    } finally {

      setSaving(false);
    }
  };

  const handleStatusChange = async (
    taskId,
    newStatus
  ) => {

    try {

      await tasksAPI.update(taskId, {
        status: newStatus
      });

      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? { ...t, status: newStatus }
            : t
        )
      );

      toast.success('Task updated');

    } catch {

      toast.error('Update failed');
    }
  };

  const handleDeleteTask = async (taskId) => {

    if (!confirm('Delete this task?')) return;

    try {

      await tasksAPI.delete(taskId);

      toast.success('Task removed');

      fetchProject();

    } catch {

      toast.error('Delete failed');
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric'
          }
        )
      : '';

  const isOverdue = (d) =>
    d && new Date(d) < new Date();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!project) return null;

  const grouped = {
    todo: tasks.filter(
      (t) => t.status === 'todo'
    ),

    'in-progress': tasks.filter(
      (t) => t.status === 'in-progress'
    ),

    done: tasks.filter(
      (t) => t.status === 'done'
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >

      {/* HEADER */}

      <div className="page-header">

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/projects')}
            style={{
              borderRadius: '12px'
            }}
          >
            <HiOutlineArrowLeft />
          </button>

          <div>

            <h1
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
                fontSize: '2rem',
                fontWeight: '800'
              }}
            >

              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 5,
                  background:
                    'linear-gradient(135deg,#06b6d4,#8b5cf6)',
                  display: 'inline-block'
                }}
              />

              {project.title}

            </h1>

            <p
              style={{
                color: 'var(--text-secondary)',
                marginTop: '6px'
              }}
            >
              {project.description ||
                'Manage all project tasks here'}
            </p>

          </div>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={openCreateTask}
            style={{
              borderRadius: '14px'
            }}
          >
            <HiOutlinePlus />
            Add New Task
          </button>
        )}
      </div>

      {/* PROJECT OVERVIEW CARD */}

      <div
        style={{
          background:
            'linear-gradient(135deg,#0f172a,#1e293b)',
          borderRadius: '24px',
          padding: '1.8rem',
          marginBottom: '2rem',
          color: '#fff',
          boxShadow:
            '0 12px 40px rgba(0,0,0,0.25)'
        }}
      >

        <h2
          style={{
            fontSize: '1.5rem',
            marginBottom: '0.6rem'
          }}
        >
          🚀 Project Workspace
        </h2>

        <p
          style={{
            opacity: 0.85
          }}
        >
          Collaborate with your team,
          track progress, and manage tasks
          efficiently.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.4rem',
            flexWrap: 'wrap'
          }}
        >

          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '0.9rem 1.2rem',
              borderRadius: '16px'
            }}
          >
            <strong>{tasks.length}</strong>
            <div style={{ fontSize: '0.8rem' }}>
              Total Tasks
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '0.9rem 1.2rem',
              borderRadius: '16px'
            }}
          >
            <strong>{users.length}</strong>
            <div style={{ fontSize: '0.8rem' }}>
              Team Members
            </div>
          </div>

        </div>
      </div>

      {/* KANBAN */}

      <div className="kanban-board">

        {['todo', 'in-progress', 'done'].map(
          (status) => (

            <div
              key={status}
              className="kanban-column"
              style={{
                borderRadius: '22px',
                overflow: 'hidden',
                background:
                  'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)'
              }}
            >

              <div
                className="kanban-header"
                style={{
                  background:
                    'rgba(255,255,255,0.06)'
                }}
              >

                <h3
                  style={{
                    fontWeight: '700'
                  }}
                >
                  {STATUS_ICONS[status]}{' '}
                  {STATUS_LABELS[status]}
                </h3>

                <span className="kanban-count">
                  {grouped[status].length}
                </span>

              </div>

              <div className="kanban-tasks">

                {grouped[status].map((task) => (

                  <motion.div
                    whileHover={{
                      y: -4
                    }}
                    key={task._id}
                    className="kanban-task"
                    style={{
                      borderRadius: '18px',
                      background:
                        'linear-gradient(135deg,#111827,#1f2937)',
                      border:
                        '1px solid rgba(255,255,255,0.08)',
                      color: '#fff'
                    }}
                  >

                    {/* TOP */}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.8rem'
                      }}
                    >

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.55rem'
                        }}
                      >

                        <div
                          className={`task-priority-dot ${task.priority}`}
                          style={{ marginTop: 0 }}
                        />

                        <strong
                          style={{
                            fontSize: '0.95rem'
                          }}
                        >
                          {task.title}
                        </strong>

                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.3rem'
                        }}
                      >

                        {(isAdmin ||
                          task.assignedTo?._id ===
                            user?.id) && (

                          <button
                            className="btn btn-ghost btn-sm"
                            style={{
                              padding: '0.35rem'
                            }}
                            onClick={() =>
                              openEditTask(task)
                            }
                          >
                            <HiOutlinePencil size={15} />
                          </button>
                        )}

                        {isAdmin && (

                          <button
                            className="btn btn-ghost btn-sm"
                            style={{
                              padding: '0.35rem',
                              color: '#ef4444'
                            }}
                            onClick={() =>
                              handleDeleteTask(
                                task._id
                              )
                            }
                          >
                            <HiOutlineTrash size={15} />
                          </button>
                        )}

                      </div>
                    </div>

                    {/* DESC */}

                    {task.description && (

                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: '#cbd5e1',
                          marginBottom: '0.8rem',
                          lineHeight: 1.5
                        }}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* FOOTER */}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}
                    >

                      {task.dueDate && (

                        <span
                          className={`task-date ${
                            isOverdue(
                              task.dueDate
                            ) &&
                            task.status !== 'done'
                              ? 'overdue'
                              : ''
                          }`}
                        >
                          📅 {formatDate(task.dueDate)}
                        </span>
                      )}

                      {task.assignedTo && (

                        <span
                          style={{
                            fontSize: '0.76rem',
                            color: '#94a3b8'
                          }}
                        >
                          👤{' '}
                          {
                            task.assignedTo.name
                          }
                        </span>
                      )}

                    </div>

                    {/* ACTIONS */}

                    {(task.assignedTo?._id ===
                      user?.id ||
                      isAdmin) &&
                      task.status !== 'done' && (

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginTop: '1rem'
                        }}
                      >

                        {task.status === 'todo' && (

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.72rem'
                            }}
                            onClick={() =>
                              handleStatusChange(
                                task._id,
                                'in-progress'
                              )
                            }
                          >
                            Start Task →
                          </button>
                        )}

                        {task.status ===
                          'in-progress' && (

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.72rem',
                              borderColor:
                                '#22c55e',
                              color: '#22c55e'
                            }}
                            onClick={() =>
                              handleStatusChange(
                                task._id,
                                'done'
                              )
                            }
                          >
                            Mark Complete ✓
                          </button>
                        )}

                      </div>
                    )}

                  </motion.div>
                ))}

                {grouped[status].length ===
                  0 && (

                  <p
                    style={{
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                      padding: '2rem 0'
                    }}
                  >
                    No tasks available
                  </p>
                )}

              </div>
            </div>
          )
        )}
      </div>

      {/* MODAL */}

      <Modal
        isOpen={showTaskModal}
        onClose={() =>
          setShowTaskModal(false)
        }
        title={
          editTask
            ? 'Edit Task'
            : 'Create Task'
        }
      >

        <form onSubmit={handleSaveTask}>

          <div className="form-group">

            <label>Task Title *</label>

            <input
              type="text"
              placeholder="Enter task title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  title: e.target.value
                })
              }
              required
            />

          </div>

          <div className="form-group">

            <label>Description</label>

            <textarea
              rows={3}
              placeholder="Task details..."
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  description: e.target.value
                })
              }
            />

          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '1rem'
            }}
          >

            <div className="form-group">

              <label>Status</label>

              <select
                value={taskForm.status}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    status: e.target.value
                  })
                }
              >

                <option value="todo">
                  To Do
                </option>

                <option value="in-progress">
                  In Progress
                </option>

                <option value="done">
                  Done
                </option>

              </select>
            </div>

            <div className="form-group">

              <label>Priority</label>

              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    priority: e.target.value
                  })
                }
              >

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

              </select>
            </div>

          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '1rem'
            }}
          >

            <div className="form-group">

              <label>Due Date</label>

              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    dueDate: e.target.value
                  })
                }
              />

            </div>

            <div className="form-group">

              <label>Assign User</label>

              <select
                value={taskForm.assignedTo}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    assignedTo:
                      e.target.value
                  })
                }
              >

                <option value="">
                  Unassigned
                </option>

                {users.map((u) => (

                  <option
                    key={u._id}
                    value={u._id}
                  >
                    {u.name}
                  </option>
                ))}

              </select>
            </div>

          </div>

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setShowTaskModal(false)
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editTask
                ? 'Update Task'
                : 'Create Task'}
            </button>

          </div>

        </form>

      </Modal>

    </motion.div>
  );
};

export default ProjectDetail;
