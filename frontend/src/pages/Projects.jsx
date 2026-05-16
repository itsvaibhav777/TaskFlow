import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import {
  projectsAPI,
  authAPI
} from '../services/api';

import Modal from '../components/Modal';

import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineSparkles
} from 'react-icons/hi';

import toast from 'react-hot-toast';

const COLORS = [
  '#7c3aed',
  '#2563eb',
  '#0ea5e9',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899'
];

const Projects = () => {

  const { isAdmin } = useAuth();

  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    members: [],
    color: '#7c3aed'
  });

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchProjects();
    fetchUsers();

  }, []);

  const fetchProjects = async () => {

    try {

      const res =
        await projectsAPI.getAll();

      setProjects(res.data.data);

    } catch {

      toast.error(
        'Unable to load projects'
      );

    } finally {

      setLoading(false);
    }
  };

  const fetchUsers = async () => {

    try {

      const res =
        await authAPI.getUsers();

      setUsers(res.data.data);

    } catch {}
  };

  const handleCreate = async (e) => {

    e.preventDefault();

    setSaving(true);

    try {

      await projectsAPI.create(form);

      toast.success(
        'Project created successfully'
      );

      setShowModal(false);

      setForm({
        title: '',
        description: '',
        members: [],
        color: '#7c3aed'
      });

      fetchProjects();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        'Project creation failed'
      );

    } finally {

      setSaving(false);
    }
  };

  const handleDelete = async (
    e,
    id
  ) => {

    e.stopPropagation();

    if (
      !confirm(
        'Delete this project and all related tasks?'
      )
    ) return;

    try {

      await projectsAPI.delete(id);

      toast.success(
        'Project deleted'
      );

      fetchProjects();

    } catch {

      toast.error(
        'Delete failed'
      );
    }
  };

  const toggleMember = (userId) => {

    setForm((prev) => ({
      ...prev,
      members:
        prev.members.includes(userId)
          ? prev.members.filter(
              (id) => id !== userId
            )
          : [
              ...prev.members,
              userId
            ]
    }));
  };

  if (loading) {

    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '800'
            }}
          >
            Team Projects 🚀
          </h1>

          <p>
            Organize, manage and
            collaborate with your team
          </p>

        </div>

        {isAdmin && (

          <button
            className="btn btn-primary"
            onClick={() =>
              setShowModal(true)
            }
            style={{
              borderRadius: '14px'
            }}
          >
            <HiOutlinePlus />
            Create Project
          </button>
        )}

      </div>

      {/* HERO CARD */}

      <div
        style={{
          background:
            'linear-gradient(135deg,#0f172a,#1e293b)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          color: '#fff',
          boxShadow:
            '0 15px 40px rgba(0,0,0,0.25)'
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >

          <div>

            <h2
              style={{
                fontSize: '1.7rem',
                marginBottom: '0.6rem'
              }}
            >
              Project Workspace
            </h2>

            <p
              style={{
                color: '#cbd5e1'
              }}
            >
              Track all active projects,
              manage members and monitor
              progress in one place.
            </p>

          </div>

          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '22px',
              background:
                'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}
          >
            <HiOutlineSparkles />
          </div>

        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap'
          }}
        >

          <div
            style={{
              background:
                'rgba(255,255,255,0.08)',
              padding:
                '1rem 1.4rem',
              borderRadius: '16px'
            }}
          >
            <strong
              style={{
                fontSize: '1.2rem'
              }}
            >
              {projects.length}
            </strong>

            <div
              style={{
                fontSize: '0.8rem'
              }}
            >
              Total Projects
            </div>

          </div>

          <div
            style={{
              background:
                'rgba(255,255,255,0.08)',
              padding:
                '1rem 1.4rem',
              borderRadius: '16px'
            }}
          >
            <strong
              style={{
                fontSize: '1.2rem'
              }}
            >
              {users.length}
            </strong>

            <div
              style={{
                fontSize: '0.8rem'
              }}
            >
              Team Members
            </div>

          </div>

        </div>

      </div>

      {/* PROJECT GRID */}

      {projects.length > 0 ? (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill,minmax(320px,1fr))',
            gap: '1.4rem'
          }}
        >

          {projects.map((p) => (

            <div
              key={p._id}
              onClick={() =>
                navigate(
                  `/projects/${p._id}`
                )
              }
              style={{
                background:
                  'linear-gradient(135deg,#111827,#1f2937)',
                borderRadius: '24px',
                padding: '1.6rem',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border:
                  '1px solid rgba(255,255,255,0.08)',
                transition: '0.3s ease',
                boxShadow:
                  '0 12px 30px rgba(0,0,0,0.18)'
              }}
            >

              {/* COLOR STRIP */}

              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '6px',
                  background:
                    p.color ||
                    '#7c3aed'
                }}
              />

              {/* DELETE */}

              {isAdmin && (

                <button
                  onClick={(e) =>
                    handleDelete(
                      e,
                      p._id
                    )
                  }
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    border: 'none',
                    background:
                      'rgba(239,68,68,0.12)',
                    color: '#ef4444',
                    padding: '0.45rem',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <HiOutlineTrash />
                </button>
              )}

              {/* TITLE */}

              <div
                style={{
                  marginBottom: '1rem'
                }}
              >

                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '0.5rem'
                  }}
                >
                  {p.title}
                </h2>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#cbd5e1',
                    lineHeight: 1.6
                  }}
                >
                  {p.description ||
                    'No project description available'}
                </p>

              </div>

              {/* STATS */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginTop: '1.4rem'
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#94a3b8',
                    fontSize: '0.82rem'
                  }}
                >
                  <HiOutlineUsers />

                  {p.members?.length || 0}
                  {' '}Members
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#94a3b8',
                    fontSize: '0.82rem'
                  }}
                >
                  <HiOutlineClipboardList />

                  {p.taskCounts?.total || 0}
                  {' '}Tasks
                </div>

              </div>

              {/* FOOTER */}

              <div
                style={{
                  marginTop: '1.2rem',
                  paddingTop: '1rem',
                  borderTop:
                    '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center'
                }}
              >

                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b'
                  }}
                >
                  Open Workspace
                </span>

                <span
                  style={{
                    color:
                      p.color ||
                      '#7c3aed',
                    fontWeight: '700'
                  }}
                >
                  →
                </span>

              </div>

            </div>
          ))}

        </div>

      ) : (

        <div className="empty-state">

          <div className="empty-icon">
            📂
          </div>

          <h3>
            No Projects Available
          </h3>

          <p>
            {isAdmin
              ? 'Create your first project and start managing tasks.'
              : 'You are not assigned to any projects yet.'}
          </p>

          {isAdmin && (

            <button
              className="btn btn-primary"
              onClick={() =>
                setShowModal(true)
              }
            >
              <HiOutlinePlus />
              Create Project
            </button>
          )}

        </div>
      )}

      {/* MODAL */}

      <Modal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
        title="Create New Project"
      >

        <form onSubmit={handleCreate}>

          <div className="form-group">

            <label>
              Project Title *
            </label>

            <input
              type="text"
              placeholder="Enter project title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value
                })
              }
              required
            />

          </div>

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              rows={3}
              placeholder="Write project description..."
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value
                })
              }
            />

          </div>

          {/* COLORS */}

          <div className="form-group">

            <label>
              Theme Color
            </label>

            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                flexWrap: 'wrap'
              }}
            >

              {COLORS.map((c) => (

                <div
                  key={c}
                  onClick={() =>
                    setForm({
                      ...form,
                      color: c
                    })
                  }
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: c,
                    cursor: 'pointer',
                    border:
                      form.color === c
                        ? '3px solid #fff'
                        : '3px solid transparent',
                    boxShadow:
                      form.color === c
                        ? `0 0 0 2px ${c}`
                        : 'none',
                    transition:
                      '0.2s ease'
                  }}
                />
              ))}

            </div>

          </div>

          {/* MEMBERS */}

          <div className="form-group">

            <label>
              Add Members
            </label>

            <div
              style={{
                maxHeight: 180,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}
            >

              {users
                .filter(
                  (u) =>
                    u.role === 'member'
                )
                .map((u) => (

                  <label
                    key={u._id}
                    style={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: '0.8rem',
                      padding: '0.75rem',
                      borderRadius:
                        '14px',
                      background:
                        form.members.includes(
                          u._id
                        )
                          ? 'rgba(124,58,237,0.12)'
                          : '#0f172a',
                      border:
                        form.members.includes(
                          u._id
                        )
                          ? '1px solid #7c3aed'
                          : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer'
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={form.members.includes(
                        u._id
                      )}
                      onChange={() =>
                        toggleMember(
                          u._id
                        )
                      }
                    />

                    <div>

                      <div
                        style={{
                          color: '#fff',
                          fontSize:
                            '0.88rem'
                        }}
                      >
                        {u.name}
                      </div>

                      <div
                        style={{
                          color: '#94a3b8',
                          fontSize:
                            '0.72rem'
                        }}
                      >
                        {u.email}
                      </div>

                    </div>

                  </label>
                ))}

            </div>

          </div>

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setShowModal(false)
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
                : 'Create Project'}
            </button>

          </div>

        </form>

      </Modal>

    </div>
  );
};

export default Projects;
