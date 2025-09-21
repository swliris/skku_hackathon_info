
import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient'; // Import the supabase client
import './Admin.css';

function Admin() {
  const [schedules, setSchedules] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [name, setName] = useState('');
  const [name_english, setNameEnglish] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingStartTime, setEditingStartTime] = useState('');
  const [editingName, setEditingName] = useState('');
  const [editingNameEnglish, setEditingNameEnglish] = useState('');
  const [editingIsImportant, setEditingIsImportant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('admin-page-active');
    fetchSchedules();
    return () => {
      document.body.classList.remove('admin-page-active');
    };
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
      .insert([{ start_time: startTime.slice(0, 5), name, name_english, is_important: isImportant }])
      .select();

    if (error) {
      console.error('Error adding schedule:', error);
    } else if (data) {
      setSchedules([...schedules, data[0]].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      setStartTime('');
      setName('');
      setNameEnglish('');
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
    setEditingNameEnglish(schedule.name_english || '');
    setEditingIsImportant(schedule.is_important);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingStartTime('');
    setEditingName('');
    setEditingNameEnglish('');
    setEditingIsImportant(false);
  };

  const handleUpdateSchedule = async (id) => {
    const { data, error } = await supabase
      .from('timetable')
      .update({ start_time: editingStartTime.slice(0, 5), name: editingName, name_english: editingNameEnglish, is_important: editingIsImportant })
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
      <header className="admin-header">
        <h1>해커톤 일정 관리</h1>
      </header>
      <div className="admin-grid">
        <div className="card form-card">
          <h2>새 일정 추가</h2>
          <form onSubmit={handleAddSchedule} className="schedule-form">
            <div className="form-group">
              <label htmlFor="startTime">시간</label>
              <input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="name">이벤트명</label>
              <input id="name" type="text" placeholder="예: 오프닝 세레모니" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="name_english">이벤트명 (영문)</label>
              <input id="name_english" type="text" placeholder="예: Opening Ceremony" value={name_english} onChange={(e) => setNameEnglish(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="isImportant" className="important-checkbox">
                <input id="isImportant" type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                <span>중요 이벤트로 표시 (카운트다운에 사용)</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary">일정 추가</button>
          </form>
        </div>

        <div className="card list-card">
          <h2>현재 일정</h2>
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>시간</th>
                  <th>이벤트</th>
                  <th>이벤트 (영문)</th>
                  <th>중요</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length > 0 ? (
                  schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      {editingId === schedule.id ? (
                        <>
                          <td><input type="time" value={editingStartTime} onChange={(e) => setEditingStartTime(e.target.value)} className="edit-form-input" /></td>
                          <td><input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="edit-form-input" /></td>
                          <td><input type="text" value={editingNameEnglish} onChange={(e) => setEditingNameEnglish(e.target.value)} className="edit-form-input" /></td>
                          <td><input type="checkbox" checked={editingIsImportant} onChange={(e) => setEditingIsImportant(e.target.checked)} /></td>
                          <td className="actions">
                            <button onClick={() => handleUpdateSchedule(schedule.id)} className="btn btn-sm btn-success">저장</button>
                            <button onClick={handleCancelEdit} className="btn btn-sm btn-secondary">취소</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{schedule.start_time.slice(0, 5)}</td>
                          <td>{schedule.name}</td>
                          <td>{schedule.name_english}</td>
                          <td>{schedule.is_important ? <span className="important-icon">✔</span> : ''}</td>
                          <td className="actions">
                            <button onClick={() => handleEdit(schedule)} className="btn btn-sm btn-warning">수정</button>
                            <button onClick={() => handleDeleteSchedule(schedule.id)} className="btn btn-sm btn-danger">삭제</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-schedule">등록된 일정이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
