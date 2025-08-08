
import React, { useState, useEffect, useRef } from 'react';
import './Main.css';
import logo from '../assets/images/logo_full_white.svg'

function Main() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
        if (event.key === 'schedules') {
            const updatedSchedules = event.newValue ? JSON.parse(event.newValue) : [];
            setSchedules(updatedSchedules);
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Initial load
    const savedSchedules = localStorage.getItem('schedules');
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (schedules.length === 0) return;

    const now = currentTime;
    const nowTime = now.toTimeString().slice(0, 5);

    const upcomingSchedules = schedules.filter(s => s.time > nowTime && s.event.includes('Important'));

    if (upcomingSchedules.length > 0) {
      const next = upcomingSchedules[0];
      setNextSchedule(next);

      const [hours, minutes] = next.time.split(':');
      const nextEventTime = new Date();
      nextEventTime.setHours(hours, minutes, 0, 0);

      let diff = nextEventTime.getTime() - now.getTime();
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000; // Add 24 hours if next event is on the next day
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
        if (schedules[i].time <= nowTime) {
            activeIndex = i;
            break;
        }
    }
    return activeIndex;
  };

  const currentScheduleIndex = getCurrentScheduleIndex();

  const renderContent = () => {
    let containerClass = "main-container";
    let content = null;

    switch (activeTab) {
      case 'title':
        containerClass = "title-only-container";
        content = <h1 className="main-title">10 TO 10 HACKATHON</h1>;
        break;
      case 'clock':
        containerClass = "clock-only-container";
        content = <div className="clock">{formatTime(currentTime)}</div>;
        break;
      case 'dashboard':
      default:
        containerClass = "main-container layout-split";
        content = (
          <>
            <div className="clock-wrapper">
                <div className="clock">{formatTime(currentTime)}</div>
                {nextSchedule && (
                    <div className="countdown-container">
                    <div className="countdown-label">Next: {nextSchedule.event.replace('Important: ', '')}</div>
                    <div className="countdown-timer">{countdown} left</div>
                    </div>
                )}
            </div>
            <div className="schedule-board">
              {schedules.length > 0 ? (
                  <ul className="timeline">
                  {schedules.map((schedule, index) => (
                      <li key={schedule.id} className={`timeline-item ${index === currentScheduleIndex ? 'active' : ''}`}>
                      <span className="timeline-time">{schedule.time}</span>
                      <span className="timeline-event">{schedule.event.replace('Important: ', '')}</span>
                      </li>
                  ))}
                  </ul>
              ) : (
                  <p className="no-schedule">No schedule. Go to /admin to add.</p>
              )}
            </div>
          </>
        );
        break;
    }
    return <div className={containerClass}>{content}</div>;
  };

  return (
    <>
      <div className="stars-container">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      <div className="top-nav">
        <button className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className="menu-icon-bar"></div>
          <div className="menu-icon-bar"></div>
          <div className="menu-icon-bar"></div>
        </button>
        {isMenuOpen && (
          <div className="menu-items">
            <button onClick={() => handleNavClick('title')} className={`nav-btn ${activeTab === 'title' ? 'active' : ''}`}>Title</button>
            <button onClick={() => handleNavClick('clock')} className={`nav-btn ${activeTab === 'clock' ? 'active' : ''}`}>Clock</button>
            <button onClick={() => handleNavClick('dashboard')} className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>Dashboard</button>
          </div>
        )}
      </div>
      {renderContent()}
      <div className="bottom-logo-container">
        {/* 로고 이미지를 여기에 추가하세요 */}
        <img className='logo-image' src={logo} alt="Logo" />
      </div>
    </>
  );
}

export default Main;
