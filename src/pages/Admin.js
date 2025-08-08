
import React, { useState, useEffect } from 'react';
import './Admin.css';

const getInitialSchedules = () => {
  try {
    const savedSchedules = localStorage.getItem('schedules');
    return savedSchedules ? JSON.parse(savedSchedules) : [];
  } catch (error) {
    console.error("Failed to parse schedules from localStorage", error);
    return [];
  }
};

function Admin() {
  const [schedules, setSchedules] = useState(getInitialSchedules);
  const [time, setTime] = useState('');
  const [event, setEvent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTime, setEditingTime] = useState('');
  const [editingEvent, setEditingEvent] = useState('');
  const [editingIsImportant, setEditingIsImportant] = useState(false);

  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!time || !event) return;

    const newSchedule = { id: Date.now(), time, event: isImportant ? `Important: ${event}` : event, isImportant };
    const updatedSchedules = [...schedules, newSchedule].sort((a, b) => a.time.localeCompare(b.time));
    setSchedules(updatedSchedules);
    setTime('');
    setEvent('');
    setIsImportant(false);
  };

  const handleDeleteSchedule = (id) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditingTime(schedule.time);
    setEditingEvent(schedule.event.replace('Important: ', ''));
    setEditingIsImportant(schedule.event.includes('Important: '));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTime('');
    setEditingEvent('');
    setEditingIsImportant(false);
  };

  const handleUpdateSchedule = (id) => {
    const updatedSchedules = schedules.map(s =>
      s.id === id ? { ...s, time: editingTime, event: editingIsImportant ? `Important: ${editingEvent}` : editingEvent, isImportant: editingIsImportant } : s
    ).sort((a, b) => a.time.localeCompare(b.time));
    setSchedules(updatedSchedules);
    handleCancelEdit();
  };

  return (
    <div className="admin-container">
      <h1>Hackathon Schedule Admin</h1>
      <form onSubmit={handleAddSchedule} className="schedule-form">
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        <input type="text" placeholder="Event Description" value={event} onChange={(e) => setEvent(e.target.value)} required />
        <label className="important-checkbox">
          <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
          Important
        </label>
        <button type="submit">Add Schedule</button>
      </form>
      <ul className="schedule-list">
        {schedules.map((schedule) => (
          <li key={schedule.id} className={`schedule-item ${schedule.isImportant ? 'important' : ''}`}>
            {editingId === schedule.id ? (
              <div className="edit-form">
                <input type="time" value={editingTime} onChange={(e) => setEditingTime(e.target.value)} />
                <input type="text" value={editingEvent} onChange={(e) => setEditingEvent(e.target.value)} />
                <label className="important-checkbox">
                  <input type="checkbox" checked={editingIsImportant} onChange={(e) => setEditingIsImportant(e.target.checked)} />
                  Important
                </label>
                <div className="actions">
                  <button onClick={() => handleUpdateSchedule(schedule.id)} className="save-btn">Save</button>
                  <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <span>{schedule.time} - {schedule.event}</span>
                <div className="actions">
                  <button onClick={() => handleEdit(schedule)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDeleteSchedule(schedule.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;
