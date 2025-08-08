
import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient'; // Import the supabase client
import './Admin.css';

function Admin() {
  const [schedules, setSchedules] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [name, setName] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingStartTime, setEditingStartTime] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingIsImportant, setEditingIsImportant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching schedules:', error);
    } else {
      setSchedules(data);
    }
    setLoading(false);
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!startTime || !name) return;

    const { data, error } = await supabase
      .from('timetable')
      .insert([{ start_time: startTime.slice(0, 5), name, is_important: isImportant }])
      .select();

    if (error) {
      console.error('Error adding schedule:', error);
    } else if (data) {
      setSchedules([...schedules, data[0]].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      setStartTime('');
      setName('');
      setIsImportant(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting schedule:', error);
    } else {
      setSchedules(schedules.filter((schedule) => schedule.id !== id));
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditingStartTime(schedule.start_time);
    setEditingName(schedule.name);
    setEditingIsImportant(schedule.is_important);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingStartTime('');
    setEditingName('');
    setEditingIsImportant(false);
  };

  const handleUpdateSchedule = async (id) => {
    const { data, error } = await supabase
      .from('timetable')
      .update({ start_time: editingStartTime.slice(0, 5), name: editingName, is_important: editingIsImportant })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating schedule:', error);
    } else if (data) {
      const updatedSchedules = schedules.map(s => (s.id === id ? data[0] : s)).sort((a, b) => a.start_time.localeCompare(b.start_time));
      setSchedules(updatedSchedules);
      handleCancelEdit();
    }
  };

  return (
    <div className="admin-container">
      <h1>Hackathon Schedule Admin</h1>
      <form onSubmit={handleAddSchedule} className="schedule-form">
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        <input type="text" placeholder="Event Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="important-checkbox">
          <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
          Important
        </label>
        <button type="submit">Add Schedule</button>
      </form>
      {loading ? (
        <div className="loader-container"><div className="loader"></div></div>
      ) : (
        <ul className="schedule-list">
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <li key={schedule.id} className={`schedule-item ${schedule.is_important ? 'important' : ''}`}>
                {editingId === schedule.id ? (
                  <div className="edit-form">
                    <input type="time" value={editingStartTime} onChange={(e) => setEditingStartTime(e.target.value)} />
                    <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
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
                    <span>{schedule.start_time.slice(0, 5)} - {schedule.name}</span>
                    <div className="actions">
                      <button onClick={() => handleEdit(schedule)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteSchedule(schedule.id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))
          ) : (
            <p className="no-schedule">No schedules found. Add one above.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default Admin;
