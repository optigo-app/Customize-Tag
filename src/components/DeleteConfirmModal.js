import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ tag, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.15s ease'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px 28px',
        maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.2s ease',
        textAlign: 'center',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: '#fff0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', border: '2px solid #fee2e2',
        }}>
          <AlertTriangle size={28} color="#e63946" />
        </div>
        <h3 style={{ margin: '0 0 8px', fontFamily: 'Georgia, serif', fontSize: 20, color: '#1a1a2e' }}>Delete Tag?</h3>
        <p style={{ margin: '0 0 24px', color: '#666', fontSize: 14, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: '#1a1a2e' }}>"{tag?.name}"</strong>?<br />
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 20px', borderRadius: 10,
            border: '2px solid #e5e7eb', background: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#555',
            transition: 'all 0.2s', fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.target.style.background = '#f9fafb'; }}
            onMouseLeave={e => { e.target.style.background = '#fff'; }}
          >
            <X size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px 20px', borderRadius: 10,
            border: 'none', background: 'linear-gradient(135deg, #e63946, #c1121f)',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#fff',
            transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(230,57,70,0.4)',
          }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
          >
            <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Delete
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}