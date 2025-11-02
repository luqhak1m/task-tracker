// src/pages/Tasks.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import '../styles/Projects.css';
import '../styles/Tasks.css';

const API_BASE = 'http://127.0.0.1:4000/api';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editData, setEditData] = useState({ status: '', description: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
  });
  const [activities, setActivities] = useState([]);
  const [showActivity, setShowActivity] = useState(false);

  const token = localStorage.getItem('token');
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchTasks = async (page = 1) => {
    if (!projectId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', 5);
      if (statusFilter) params.set('status', statusFilter);
      if (assignedFilter) params.set('assignedTo', assignedFilter);
      if (sort) params.set('sort', sort);

      const res = await axios.get(`${API_BASE}/projects/${projectId}/tasks?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data.tasks);
      setMeta(res.data.meta);

      const projRes = await axios.get(`${API_BASE}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectTitle(projRes.data.title);
      setMembers(projRes.data.members.map((m) => m.user));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!projectId) return;
    try {
        const res = await axios.get(`${API_BASE}/projects/${projectId}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(res.data);
    } catch (err) {
        console.error('Failed to fetch activity logs', err);
    }
    };

  useEffect(() => {
    fetchProfile();
    fetchTasks();
    if (showActivity) fetchActivities();
  }, [statusFilter, assignedFilter, sort, showActivity]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > meta.totalPages) return;
    fetchTasks(newPage);
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    setEditData({ status: task.status, description: task.description || '' });
  };

  const handleSave = async (taskId) => {
    try {
      let dataToSend = editData;
      if (currentUser?.role === 'member') {
        dataToSend = { status: editData.status };
      }
      await axios.put(
        `${API_BASE}/projects/${projectId}/tasks/${taskId}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTaskId(null);
      await fetchTasks(meta.page);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTasks(meta.page);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return alert('Task title required');
    try {
      await axios.post(`${API_BASE}/projects/${projectId}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium' });
      await fetchTasks(meta.page);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Create failed');
    }
  };

  return (
    <div className="tasks-container">
       <h2 className="tasks-title">Tasks for {projectTitle}</h2>

      {/* --- Create Task (owners only) --- */}
      {currentUser?.role === 'owner' && (
        <div className="create-task-form">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <select
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={handleCreateTask}>Add Task</button>
        </div>
      )}

      {/* --- Filters --- */}
      <div className="filter-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}>
          <option value="">All Members</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="priority:asc">Priority (Low to High)</option>
          <option value="priority:desc">Priority (High to Low)</option>
          <option value="status:asc">Status (Low to High)</option>
          <option value="status:desc">Status (High to Low)</option>
        </select>
      </div>

      {/* --- Task Cards --- */}
      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <div key={task._id} className="task-card" data-status={task.status}>
              {editingTaskId === task._id ? (
                <div className="edit-task">
                  {currentUser?.role === 'owner' && (
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      placeholder="Description"
                    />
                  )}
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <div className="edit-actions">
                    <button onClick={() => handleSave(task._id)}>Save</button>
                    <button onClick={() => setEditingTaskId(null)} className="cancel">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                    <h3>{task.title}</h3>

                    <div className="task-meta">
                        <span className={`badge status-${task.status}`}>{task.status}</span>
                        <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                    </div>

                    <p className="description">{task.description || '(no description)'}</p>

                    <p className="task-assigned">
                        <strong>Assigned:</strong>{' '}
                        {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </p>
                  <div className="task-actions">
                    <button onClick={() => handleEditClick(task)}>Edit</button>
                    {currentUser?.role === 'owner' && (
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- Pagination --- */}
        <div className="pagination">
            <button disabled={meta.page <= 1} onClick={() => handlePageChange(meta.page - 1)}>
            Prev
            </button>
            <span>
            Page {meta.page} of {meta.totalPages}
            </span>
            <button
            disabled={meta.page >= meta.totalPages}
            onClick={() => handlePageChange(meta.page + 1)}
            >
            Next
            </button>
        </div>

    {/* --- Activity Logs --- */}
    <div className="activity-section">
    <button onClick={() => setShowActivity(!showActivity)}>
        {showActivity ? 'Hide Activity' : 'Show Activity'}
    </button>

    {showActivity && (
        <div className="activity-list">
        {activities.length === 0 ? (
            <p>No recent activity.</p>
        ) : (
            activities.map((a) => (
            <div key={a._id} className="activity-item">
                <p>
                <strong>{a.user?.name || 'Unknown User'}</strong> {a.action}
                </p>
                <p className="details">{a.details}</p>
                <span className="timestamp">
                {new Date(a.createdAt).toLocaleString()}
                </span>
            </div>
            ))
        )}
        </div>
    )}
    </div>

    </div>
  );
}

export default Tasks;
