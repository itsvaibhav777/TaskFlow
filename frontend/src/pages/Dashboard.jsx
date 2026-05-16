import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineLightningBolt,
  HiOutlinePlus
} from 'react-icons/hi';

import Modal from '../components/Modal';
import { projectsAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    project: '',
    assignedTo: ''
  });

  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();

    if (isAdmin) {
      fetchProjectsAndUsers();
    }
  }, [isAdmin]);

  const fetchProjectsAndUsers = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        projectsAPI.getAll(),
        authAPI.getUsers()
      ]);

      setProjectsList(projRes.data.data);
      setUsersList(userRes.data.data);

    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await tasksAPI.getDashboardStats();
      setStats(res.data.data);

    } catch (err) {
      toast.error('Failed to load dashboard');

    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      await tasksAPI.create(taskForm);

      toast.success('Task created successfully!');

      setShowTaskModal(false);

      setTaskForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        project: '',
        assignedTo: ''
      });

      fetchStats();

    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to create task'
      );

    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';

    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (d) =>
    d && new Date(d) < new Date();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  const sc = stats?.statusCounts || {
    todo: 0,
    'in-progress': 0,
    done: 0,
    total: 0
  };

  const pc = stats?.priorityCounts || {
    low: 0,
    medium: 0,
    high: 0
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >

      {/* HEADER */}

      <div className="page-header fade-in">

        <div>
          <h1
            style={{
              fontSize: '2.3rem',
              fontWeight: '800',
              background:
                'linear-gradient(135deg,#38bdf8,#8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Welcome Back, {user?.name?.split(' ')[0]} 👋
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              marginTop: '8px'
            }}
          >
            {isAdmin
              ? 'Track team productivity and manage ongoing work'
              : 'Stay updated with your assigned tasks'}
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowTaskModal(true)}
            style={{
              width: 'auto',
              padding: '14px 22px',
              borderRadius: '16px'
            }}
          >
            <HiOutlinePlus />
            Create Task
          </button>
        )}
      </div>

      {/* HERO CARD */}

      <div
        style={{
          marginBottom: '2rem',
          padding: '1.8rem',
          borderRadius: '24px',
          background:
            'linear-gradient(135deg,#0ea5e9,#8b5cf6)',
          color: '#fff',
          boxShadow:
            '0 15px 40px rgba(14,165,233,0.25)'
        }}
      >
        <h2
          style={{
            fontSize: '1.6rem',
            marginBottom: '0.5rem'
          }}
        >
          Team Productivity Overview 🚀
        </h2>

        <p style={{ opacity: 0.9 }}>
          Monitor project progress, overdue tasks,
          and team efficiency in one place.
        </p>
      </div>

      {/* STATS */}

      <div className="stats-grid">

        <div className="stat-card fade-in">
          <div className="stat-icon">
            <HiOutlineClipboardList
              style={{
                color: '#38bdf8',
                fontSize: '1.8rem'
              }}
            />
          </div>

          <div className="stat-value">
            {sc.total}
          </div>

          <div className="stat-label">
            Total Tasks
          </div>
        </div>

        <div className="stat-card fade-in">
          <div className="stat-icon">
            <HiOutlineLightningBolt
              style={{
                color: '#f59e0b',
                fontSize: '1.8rem'
              }}
            />
          </div>

          <div className="stat-value">
            {sc.todo}
          </div>

          <div className="stat-label">
            To Do
          </div>
        </div>

        <div className="stat-card fade-in">
          <div className="stat-icon">
            <HiOutlineClock
              style={{
                color: '#8b5cf6',
                fontSize: '1.8rem'
              }}
            />
          </div>

          <div className="stat-value">
            {sc['in-progress']}
          </div>

          <div className="stat-label">
            In Progress
          </div>
        </div>

        <div className="stat-card fade-in">
          <div className="stat-icon">
            <HiOutlineCheckCircle
              style={{
                color: '#22c55e',
                fontSize: '1.8rem'
              }}
            />
          </div>

          <div className="stat-value">
            {sc.done}
          </div>

          <div className="stat-label">
            Completed
          </div>
        </div>

        <div className="stat-card fade-in">
          <div className="stat-icon">
            <HiOutlineExclamation
              style={{
                color: '#ef4444',
                fontSize: '1.8rem'
              }}
            />
          </div>

          <div className="stat-value">
            {stats?.overdueCount || 0}
          </div>

          <div className="stat-label">
            Overdue
          </div>
        </div>

      </div>

      {/* RECENT TASKS */}

      <div style={{ marginTop: '2rem' }}>

        <div className="section-header">
          <h2>📋 Recent Tasks</h2>
        </div>

        {stats?.recentTasks?.length > 0 ? (

          <div className="tasks-container">

            {stats.recentTasks.map(task => (

              <div
                key={task._id}
                className="task-card fade-in"
                style={{
                  background:
                    'rgba(255,255,255,0.05)',

                  border:
                    '1px solid rgba(255,255,255,0.08)',

                  backdropFilter: 'blur(14px)'
                }}
              >

                <div
                  className={`task-priority-dot ${task.priority}`}
                />

                <div className="task-content">

                  <h3>{task.title}</h3>

                  {task.description && (
                    <p>{task.description}</p>
                  )}

                  <div className="task-meta">

                    <span
                      className={`task-badge badge-${task.status}`}
                    >
                      {task.status === 'todo'
                        ? 'TO DO'
                        : task.status === 'in-progress'
                        ? 'IN PROGRESS'
                        : 'DONE'}
                    </span>

                    {task.dueDate && (
                      <span
                        className={`task-date ${
                          isOverdue(task.dueDate) &&
                          task.status !== 'done'
                            ? 'overdue'
                            : ''
                        }`}
                      >
                        📅 {formatDate(task.dueDate)}
                      </span>
                    )}

                    {task.project && (
                      <span className="task-assignee">
                        📁 {task.project.title}
                      </span>
                    )}

                  </div>
                </div>
              </div>
            ))}

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon">
              📋
            </div>

            <h3 style={{ color: '#fff' }}>
              No Active Tasks
            </h3>

            <p>
              Your assigned work will appear here
              once tasks are created.
            </p>

          </div>

        )}
      </div>

      {/* MODAL */}

      {isAdmin && (

        <Modal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          title="Create New Task"
        >

          <form onSubmit={handleCreateTask}>

            <div className="form-group">
              <label>Title *</label>

              <input
                type="text"
                placeholder="Task title"
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
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}
            >

              <div className="form-group">
                <label>Project</label>

                <select
                  value={taskForm.project}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      project: e.target.value
                    })
                  }
                >

                  <option value="">
                    Select Project
                  </option>

                  {projectsList.map((p) => (
                    <option
                      key={p._id}
                      value={p._id}
                    >
                      {p.title}
                    </option>
                  ))}

                </select>
              </div>

              <div className="form-group">
                <label>Assign To</label>

                <select
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      assignedTo: e.target.value
                    })
                  }
                >

                  <option value="">
                    Unassigned
                  </option>

                  {usersList.map((u) => (
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
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
                  ? 'Creating...'
                  : 'Create Task'}
              </button>

            </div>

          </form>

        </Modal>
      )}

    </motion.div>
  );
};

export default Dashboard;
