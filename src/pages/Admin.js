
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
  const [editingId, setEditingId] = useState(null);
  const [editingTime, setEditingTime] = useState('');
  const [editingEvent, setEditingEvent] = useState('');

  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!time || !event) return;

    const newSchedule = { id: Date.now(), time, event };
    const updatedSchedules = [...schedules, newSchedule].sort((a, b) => a.time.localeCompare(b.time));
    setSchedules(updatedSchedules);
    setTime('');
    setEvent('');
  };

  const handleDeleteSchedule = (id) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditingTime(schedule.time);
    setEditingEvent(schedule.event);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTime('');
    setEditingEvent('');
  };

  const handleUpdateSchedule = (id) => {
    const updatedSchedules = schedules.map(s => 
      s.id === id ? { ...s, time: editingTime, event: editingEvent } : s
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
        <button type="submit">Add Schedule</button>
      </form>
      <ul className="schedule-list">
        {schedules.map((schedule) => (
          <li key={schedule.id} className="schedule-item">
            {editingId === schedule.id ? (
              <div className="edit-form">
                <input type="time" value={editingTime} onChange={(e) => setEditingTime(e.target.value)} />
                <input type="text" value={editingEvent} onChange={(e) => setEditingEvent(e.target.value)} />
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
