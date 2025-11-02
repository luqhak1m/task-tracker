import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Projects.css';

const API_BASE = 'http://127.0.0.1:4000/api';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createProject = async () => {
    if (!title) return alert('Title required');
    try {
      const res = await axios.post(
        `${API_BASE}/projects`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects([...projects, res.data]);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error creating project');
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API_BASE}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error deleting project');
    }
  };

  const startEditing = async (project) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDescription(project.description || '');
    try {
      const res = await axios.get(`${API_BASE}/projects/${project._id}/available-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableUsers(res.data);
    } catch (err) {
      console.error('Failed to load available users', err);
    }
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditTitle('');
    setEditDescription('');
  };

  const addMember = async () => {
    if (!selectedUser) return alert('Select a user');
    try {
      const res = await axios.post(
        `${API_BASE}/projects/${editingProject._id}/members`,
        { userId: selectedUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(projects.map(p => p._id === editingProject._id ? res.data : p));
      setEditingProject(res.data);
      setSelectedUser('');
      const refresh = await axios.get(`${API_BASE}/projects/${editingProject._id}/available-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableUsers(refresh.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error adding member');
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await axios.delete(
        `${API_BASE}/projects/${editingProject._id}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(projects.map((p) => (p._id === editingProject._id ? res.data : p)));
      setEditingProject(res.data);
      const refresh = await axios.get(`${API_BASE}/projects/${editingProject._id}/available-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableUsers(refresh.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error removing member');
    }
  };


  const saveEdit = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/projects/${editingProject._id}`,
        { title: editTitle, description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(
        projects.map((p) => (p._id === editingProject._id ? res.data : p))
      );
      cancelEditing();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error updating project');
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchProjects();
  }, []);

  return (
    <div className="projects-container">
      <h2 className="projects-title">Projects</h2>

      {currentUser?.role === 'owner' && (
        <div className="create-project-form">
          <input
            type="text"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button onClick={createProject}>Create Project</button>
        </div>
      )}

      <div className="project-grid">
        {projects.map((project) => (
          <div
            key={project._id}
            className="project-card"
            onClick={() => navigate(`/tasks?projectId=${project._id}`)}
          >
            <h3 className="project-name">{project.title}</h3>
            <p className="project-owner">Owner: {project.owner?.name}</p>
            <p className="project-members">
              Total Members: {project.members ? project.members.length : 0}
            </p>

            {currentUser?.role === 'owner' && (
              <div className="project-actions">
                <button
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(project);
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project._id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingProject && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h3>Edit Project</h3>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Project title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
            />
                        <hr />
            <h4>Add Member</h4>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">-- Select User --</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <button onClick={addMember}>Add Member</button>

            <h4>Current Members</h4>
            <ul>
              {editingProject.members?.map((m) => (
                <li key={m.user._id || m.user} className="member-item">
                  {m.user?.name || 'Unknown'} ({m.user?.email || ''})
                  <button
                    className="remove-member-btn"
                    onClick={() => removeMember(m.user._id || m.user)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="modal-buttons">
              <button onClick={saveEdit}>Save</button>
              <button onClick={cancelEditing} className="cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
