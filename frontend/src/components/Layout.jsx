import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineViewGrid, HiOutlineFolder, HiOutlineClipboardList, HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="app-layout">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>⚡ TaskFlow</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <HiOutlineViewGrid /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <HiOutlineFolder /> Projects
          </NavLink>
          <NavLink to="/tasks" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <HiOutlineClipboardList /> All Tasks
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role}{isAdmin ? ' ✦' : ''}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-full btn-sm" onClick={handleLogout} style={{marginTop:'0.5rem'}}>
            <HiOutlineLogout /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      {sidebarOpen && <div style={{position:'fixed',inset:0,zIndex:50}} onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default Layout;
