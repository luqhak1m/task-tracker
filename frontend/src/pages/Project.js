import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:4000/api';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const token = localStorage.getItem('token');

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);

      // fetch tasks for each project
      const tasksRes = await Promise.all(
        res.data.map(async (p) => {
          const r = await axios.get(`${API_BASE}/projects/${p._id}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return { projectId: p._id, tasks: r.data.tasks };
        })
      );

      const tasksMap = {};
      tasksRes.forEach(t => tasksMap[t.projectId] = t.tasks);
      setTasks(tasksMap);

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
      setTasks({ ...tasks, [res.data._id]: [] }); // init empty tasks
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API_BASE}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p._id !== projectId));
      const newTasks = { ...tasks };
      delete newTasks[projectId];
      setTasks(newTasks);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <h2>Projects</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={createProject}>Create Project</button>
      </div>

      <ul>
        {projects.map(project => (
          <li key={project._id} style={{ marginBottom: '1rem' }}>
            <strong>{project.title}</strong> — {project.description} <br />
            Owner: {project.owner.name} <br />
            Members: {project.members.map(m => m.user.name).join(', ')} <br />
            <button onClick={() => deleteProject(project._id)}>Delete</button>

            <ul style={{ marginTop: 4, marginLeft: 20 }}>
              {(tasks[project._id] || []).map(task => (
                <li key={task._id}>
                  {task.title} — {task.status} {task.assignedTo && `(Assigned to: ${task.assignedTo.name})`}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Projects;
