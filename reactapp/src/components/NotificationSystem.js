import React, { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const { type, message, duration = 4000 } = event.detail;
      const id = Date.now();
      
      const notification = {
        id,
        type,
        message,
        duration
      };
      
      setNotifications(prev => [...prev, notification]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'quiz': return '📝';
      case 'question': return '❓';
      case 'email': return '📧';
      case 'rank': return '🏆';
      default: return 'ℹ️';
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'success': return { bg: '#10b981', border: '#059669' };
      case 'error': return { bg: '#ef4444', border: '#dc2626' };
      case 'info': return { bg: '#3b82f6', border: '#2563eb' };
      case 'warning': return { bg: '#f59e0b', border: '#d97706' };
      case 'quiz': return { bg: '#8b5cf6', border: '#7c3aed' };
      case 'question': return { bg: '#06b6d4', border: '#0891b2' };
      case 'email': return { bg: '#10b981', border: '#059669' };
      case 'rank': return { bg: '#f59e0b', border: '#d97706' };
      default: return { bg: '#6b7280', border: '#4b5563' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    }}>
      {notifications.map(notification => {
        const colors = getColor(notification.type);
        return (
          <div
            key={notification.id}
            style={{
              backgroundColor: colors.bg,
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: `2px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: '500',
              animation: 'slideIn 0.3s ease-out',
              minWidth: '300px'
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {getIcon(notification.type)}
            </span>
            <span style={{ flex: 1 }}>
              {notification.message}
            </span>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Helper function to show notifications
export const showNotification = (type, message, duration = 4000) => {
  window.dispatchEvent(new CustomEvent('showNotification', {
    detail: { type, message, duration }
  }));
};

export default NotificationSystem;