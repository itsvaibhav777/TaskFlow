import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import {
  tasksAPI,
  projectsAPI,
  authAPI
} from '../services/api';

import {
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineClock
} from 'react-icons/hi';

import Modal from '../components/Modal';

import toast from 'react-hot-toast';

const Tasks = () => {

  const { isAdmin } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState({
    status: '',
    priority: ''
  });

  const [showTaskModal, setShowTaskModal] =
    useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    project: '',
    assignedTo: ''
  });

  const [projectsList, setProjectsList] =
    useState([]);

  const [usersList, setUsersList] =
    useState([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {

    fetchTasks();

    if (isAdmin) {
      fetchProjectsAndUsers();
    }

  }, [filter, isAdmin]);

  const fetchProjectsAndUsers = async () => {

    try {

      const [projRes, userRes] =
        await Promise.all([
          projectsAPI.getAll(),
          authAPI.getUsers()
        ]);

      setProjectsList(projRes.data.data);

      setUsersList(userRes.data.data);

    } catch (err) {

      console.error(err);
    }
  };

  const fetchTasks = async () => {

    try {

      const params = {};

      if (filter.status)
        params.status = filter.status;

      if (filter.priority)
        params.priority = filter.priority;

      const res =
        await tasksAPI.getAll(params);

      setTasks(res.data.data);

    } catch {

      toast.error('Unable to load tasks');

    } finally {

      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {

    e.preventDefault();

    setSaving(true);

    try {

      await tasksAPI.create(taskForm);

      toast.success('Task created');

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

      fetchTasks();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        'Task creation failed'
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

      toast.success('Task updated');

      fetchTasks();

    } catch {

      toast.error('Update failed');
    }
  };

  const handleDeleteTask = async (
    taskId
  ) => {

    if (
      !window.confirm(
        'Delete this task permanently?'
      )
    ) return;

    try {

      await tasksAPI.delete(taskId);

      toast.success('Task removed');

      fetchTasks();

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
            day: 'numeric',
            year: 'numeric'
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

  return (
    <div>

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '800'
            }}
          >
            Task Workspace 🚀
          </h1>

          <p>
            Manage and track all team tasks
          </p>

        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >

          {isAdmin && (

            <button
              className="btn btn-primary"
              onClick={() =>
                setShowTaskModal(true)
              }
              style={{
                borderRadius: '14px'
              }}
            >
              <HiOutlinePlus />
              New Task
            </button>
          )}

        </div>

      </div>

      {/* FILTER BAR */}

      <div
        style={{
          background:
            'linear-gradient(135deg,#111827,#1f2937)',
          padding: '1rem',
          borderRadius: '18px',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >

        <HiOutlineFilter
          size={20}
          style={{
            color: '#fff'
          }}
        />

        <select
          value={filter.status}
          onChange={(e) =>
            setFilter({
              ...filter,
              status: e.target.value
            })
          }
          style={{
            padding: '0.7rem 1rem',
            borderRadius: '12px',
            border: 'none',
            background: '#0f172a',
            color: '#fff',
            outline: 'none'
          }}
        >

          <option value="">
            All Status
          </option>

          <option value="todo">
            To Do
          </option>

          <option value="in-progress">
            In Progress
          </option>

          <option value="done">
            Completed
          </option>

        </select>

        <select
          value={filter.priority}
          onChange={(e) =>
            setFilter({
              ...filter,
              priority: e.target.value
            })
          }
          style={{
            padding: '0.7rem 1rem',
            borderRadius: '12px',
            border: 'none',
            background: '#0f172a',
            color: '#fff',
            outline: 'none'
          }}
        >

          <option value="">
            All Priority
          </option>

          <option value="high">
            High
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="low">
            Low
          </option>

        </select>

      </div>

      {/* TASK LIST */}

      {tasks.length > 0 ? (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill,minmax(340px,1fr))',
            gap: '1.2rem'
          }}
        >

          {tasks.map((task) => (

            <div
              key={task._id}
              style={{
                background:
                  'linear-gradient(135deg,#0f172a,#1e293b)',
                borderRadius: '22px',
                padding: '1.4rem',
                color: '#fff',
                border:
                  '1px solid rgba(255,255,255,0.08)',
                transition: '0.3s ease',
                boxShadow:
                  '0 10px 25px rgba(0,0,0,0.25)'
              }}
            >

              {/* TOP */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >

                  <div
                    className={`task-priority-dot ${task.priority}`}
                  />

                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: '700'
                    }}
                  >
                    {task.title}
                  </h3>

                </div>

                {isAdmin && (

                  <button
                    onClick={() =>
                      handleDeleteTask(
                        task._id
                      )
                    }
                    style={{
                      background:
                        'rgba(239,68,68,0.15)',
                      border: 'none',
                      color: '#ef4444',
                      padding: '0.45rem',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <HiOutlineTrash />
                  </button>
                )}

              </div>

              {/* DESC */}

              {task.description && (

                <p
                  style={{
                    color: '#cbd5e1',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    lineHeight: 1.6
                  }}
                >
                  {task.description}
                </p>
              )}

              {/* BADGES */}

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '1rem'
                }}
              >

                <span
                  className={`task-badge badge-${task.status}`}
                >
                  {task.status === 'todo'
                    ? 'TO DO'
                    : task.status ===
                      'in-progress'
                    ? 'WORKING'
                    : 'DONE'}
                </span>

                {task.priority && (

                  <span
                    style={{
                      padding:
                        '0.35rem 0.7rem',
                      borderRadius: '30px',
                      background:
                        task.priority ===
                        'high'
                          ? 'rgba(239,68,68,0.15)'
                          : task.priority ===
                            'medium'
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(34,197,94,0.15)',
                      color:
                        task.priority ===
                        'high'
                          ? '#ef4444'
                          : task.priority ===
                            'medium'
                          ? '#f59e0b'
                          : '#22c55e',
                      fontSize: '0.72rem',
                      fontWeight: '700'
                    }}
                  >
                    {task.priority.toUpperCase()}
                  </span>
                )}

              </div>

              {/* INFO */}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  marginBottom: '1rem'
                }}
              >

                {task.project && (

                  <span
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.8rem'
                    }}
                  >
                    📁 {task.project.title}
                  </span>
                )}

                {task.assignedTo && (

                  <span
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.8rem'
                    }}
                  >
                    👤 {task.assignedTo.name}
                  </span>
                )}

                {task.dueDate && (

                  <span
                    style={{
                      color:
                        isOverdue(
                          task.dueDate
                        ) &&
                        task.status !==
                          'done'
                          ? '#ef4444'
                          : '#94a3b8',
                      fontSize: '0.8rem'
                    }}
                  >
                    📅 {formatDate(task.dueDate)}
                  </span>
                )}

              </div>

              {/* ACTIONS */}

              <div
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  marginTop: '1rem'
                }}
              >

                {task.status === 'todo' && (

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      handleStatusChange(
                        task._id,
                        'in-progress'
                      )
                    }
                  >
                    <HiOutlineClock />
                    Start
                  </button>
                )}

                {task.status ===
                  'in-progress' && (

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{
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
                    <HiOutlineCheckCircle />
                    Complete
                  </button>
                )}

              </div>

            </div>
          ))}

        </div>

      ) : (

        <div className="empty-state">

          <div className="empty-icon">
            📋
          </div>

          <h3>No Tasks Found</h3>

          <p>
            Create new tasks or update filters
          </p>

        </div>
      )}

      {/* CREATE TASK MODAL */}

      {isAdmin && (

        <Modal
          isOpen={showTaskModal}
          onClose={() =>
            setShowTaskModal(false)
          }
          title="Create New Task"
        >

          <form onSubmit={handleCreateTask}>

            <div className="form-group">

              <label>Task Title *</label>

              <input
                type="text"
                placeholder="Enter title"
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
                    description:
                      e.target.value
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

                <label>Project</label>

                <select
                  value={taskForm.project}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      project:
                        e.target.value
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

                <label>Assign User</label>

                <select
                  value={
                    taskForm.assignedTo
                  }
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
                gridTemplateColumns:
                  '1fr 1fr 1fr',
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
                      status:
                        e.target.value
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
                      priority:
                        e.target.value
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
                      dueDate:
                        e.target.value
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

    </div>
  );
};

export default Tasks;
