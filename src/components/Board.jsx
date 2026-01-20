import { useState, useEffect } from 'react';

const columns = [
  { id: 'todo', title: 'Te Doen' },
  { id: 'in-progress', title: 'Bezig' },
  { id: 'done', title: 'Klaar' }
];


const getItem = (key) => {
  return Promise.resolve(localStorage.getItem(key));
};


const setItem = (key, value) => {
  return Promise.resolve(localStorage.setItem(key, value));
};

function Board() {
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);

  // Laad taken vanuit opslag 
  const loadTasks = async () => {
    try { 
       const storedTasks = await getItem("saving");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Fout bij laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (save) => {
    try {
      await setItem("saving", JSON.stringify(save));
    } catch (error) {
      console.error('Fout bij opslaan:', error);
    }
  };

  
  // Laad taken bij component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Voegt nieuwe taak toe
  const addTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        title: newTask.title,
        description: newTask.description,
        status: 'todo',
        createdAt: new Date().toISOString()
      };
      
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      
      setNewTask({ title: '', description: '' });
      setShowAddForm(false);
    }
  };

  // verwijderen van een task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // verplaatsen van task
  const moveTask = (taskId, newStatus) => {
    const updatedTasks = tasks.map(t =>
     t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <h1>Kanban Board</h1>
            <p>Organiseer je taken📚</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add">
            Nieuwe Taak
          </button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="add-form">
            <h2>Taak Toevoegen!</h2>
            <input
              type="text"
              placeholder="Taak titel *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="form-input"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <textarea
              placeholder="Beschrijving..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="form-textarea"
            />
            <div className="form-actions">
              <button
                onClick={addTask}
                disabled={!newTask.title.trim()}
                className="btn-submit"
              >
                Toevoegen
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTask({ title: '', description: '' });
                }}
                className="btn-cancel"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}

        {/* Columns Grid */}
        <div className="columns-grid">
        {columns.map(column => (
          <div key={column.id} className="column">
            <h2>{column.title}</h2>
            <div className="tasks">
              {tasks.filter(task => task.status === column.id)
                .map(task => (
                  <div key={task.id} className="task">
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <button onClick={() => deleteTask(task.id)} className='buttonDelete'>Verwijderen❌</button>
                    {column.id !== 'done' && (
                      <div>
                        <button onClick={() => moveTask(task.id, 'done')} className='buttonDone'>Voltooien✅</button>
                        <button onClick={() => moveTask(task.id, 'in-progress')} className='buttonProgress'>Bezig⏳</button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
        </div>

        {/* Footer */}
        <div className="footer">
          Totaal aantal taken: {tasks.length}
        </div>
      </div>
    </div>
  );
}

export default Board

