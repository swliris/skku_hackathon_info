import React, { useState, useEffect } from 'react';
import './Main.css';
import supabase from '../supabaseClient';

function Main() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchSchedules();

    const channel = supabase
      .channel('timetable')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, (payload) => {
        console.log('Change received!', payload);
        fetchSchedules();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching schedules:', error);
    } else {
      setSchedules(data);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (schedules.length === 0) return;

    const now = currentTime;
    const nowTime = now.toTimeString().slice(0, 5);

    const upcomingSchedules = schedules.filter(s => s.start_time > nowTime && s.is_important);

    if (upcomingSchedules.length > 0) {
      const next = upcomingSchedules[0];
      setNextSchedule(next);

      const [hours, minutes] = next.start_time.split(':');
      const nextEventTime = new Date();
      nextEventTime.setHours(hours, minutes, 0, 0);

      let diff = nextEventTime.getTime() - now.getTime();
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    } else {
      setNextSchedule(null);
      setCountdown('');
    }
  }, [currentTime, schedules]);

  const formatTime = (date) => {
    return date.toTimeString().slice(0, 8);
  };

  const getCurrentScheduleIndex = () => {
    if (schedules.length === 0) return -1;
    const nowTime = currentTime.toTimeString().slice(0, 5);
    let activeIndex = -1;
    for (let i = schedules.length - 1; i >= 0; i--) {
        if (schedules[i].start_time <= nowTime) {
            activeIndex = i;
            break;
        }
    }
    return activeIndex;
  };

  const currentScheduleIndex = getCurrentScheduleIndex();

  return (
    <>
      <div className="aurora-background"></div>
      <div className="main-grid">
        <header className="header">
          <h1 className="main-title">Casual HACKATHON</h1>
        </header>

        <div className="left-panel content-panel">
          <div className="clock">
            <span>{formatTime(currentTime).slice(0, 2)}</span>
            <span className="clock-colon">:</span>
            <span>{formatTime(currentTime).slice(3, 5)}</span>
            <span className="clock-colon">:</span>
            <span>{formatTime(currentTime).slice(6)}</span>
          </div>
          {nextSchedule && (
            <div className="countdown-wrapper">
              <div className="countdown-label">Next: {nextSchedule.name}</div>
              <div className="countdown-timer">-{countdown}</div>
            </div>
          )}
        </div>

        <div className="schedule-panel content-panel">
          {schedules.length > 0 ? (
            <ul className="timeline">
              {schedules.map((schedule, index) => (
                <li key={schedule.id} className={`timeline-item ${index === currentScheduleIndex ? 'active' : ''}`}>
                  <span className="timeline-time">{schedule.start_time.slice(0, 5)}</span>
                  <span className="timeline-event">{schedule.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-schedule">Loading schedule...</p>
          )}
        </div>
      </div>
    <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </>
  );
}

export default Main;