import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Tag, X } from 'lucide-react';
import { useTags } from '../context/TagContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import TagPreview from '../components/TagPreview';

const DESIGN_COLORS = {
  tag1: '#1a1a2e', tag2: '#c8922a', tag3: '#2d6a4f', tag4: '#e63946',
};

export default function TagListPage({ onNavigate }) {
  const { tags, deleteTag } = useTags();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fe', fontFamily: '"DM Sans", sans-serif' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #6400b8 0%, #6400b8 100%)',
        // background: 'linear-gradient(to right, #6400b8, #8d0096)',
        padding: '0 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>TagCraft</h1>
              {/* <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>Customize your tags</p> */}
            </div>
          </div>
          <button
            onClick={() => onNavigate('customize', null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255, 255, 255, 0.25)',
              border: 'none', borderRadius: 12, padding: '10px 20px',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              
              transition: 'transform 0.2s, box-shadow 0.2s',
              fontFamily: '"DM Sans", sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)';  }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';  }}
          >
            <Plus size={18} />
            Add Tag
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 8px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags by name..."
            style={{
              width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12,
              border: '2px solid #e5e7eb', fontSize: 14, outline: 'none',
              background: '#fff', boxSizing: 'border-box', color: '#1a1a2e',
              transition: 'border 0.2s', fontFamily: '"DM Sans", sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            onFocus={e => { e.target.style.border = '2px solid #6400b8'; }}
            onBlur={e => { e.target.style.border = '2px solid #e5e7eb'; }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          )}
        </div>
        <p style={{ margin: '10px 0 0', color: '#94a3b8', fontSize: 13 }}>
          {filtered.length} tag{filtered.length !== 1 ? 's' : ''} {search ? `found for "${search}"` : 'total'}
        </p>
      </div>

      {/* TAG LIST */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 24px 40px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f1f5f9', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={36} color="#cbd5e1" />
            </div>
            <h3 style={{ color: '#94a3b8', margin: '0 0 8px', fontWeight: 600 }}>No tags found</h3>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: 14 }}>
              {search ? 'Try a different search term' : 'Click "Add Tag" to create your first tag'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filtered.map((tag) => (
              <TagCard
                key={tag.id}
                tag={tag}
                onEdit={() => onNavigate('customize', tag)}
                onDelete={() => setDeleteTarget(tag)}
                designColor={  '#6400b8'}
              />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          tag={deleteTarget}
          onConfirm={() => { deleteTag(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function TagCard({ tag, onEdit, onDelete, designColor }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: '#fff', borderRadius: 16, padding: 20,
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.12)' : '0 2px 10px rgba(0,0,0,0.06)',
        border: `2px solid ${hovered ? designColor : '#f1f5f9'}`,
        transition: 'all 0.25s ease', cursor: 'default',
        flexWrap: 'wrap',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Preview */}
      <div style={{ flexShrink: 0 }}>
        <TagPreview tag={tag} maxWidth={140} maxHeight={80} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{tag.name}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <Chip label={`${tag.width} × ${tag.height} ${tag.unit}`} color={designColor} />
          <Chip label={tag.design?.toUpperCase()} color={designColor} />
          <Chip label={tag.codeType?.toUpperCase()} color={designColor} />
          <Chip label={`${tag.variables?.length || 0} Variables`} color={designColor} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <ActionBtn icon={<Pencil size={16} />} label="Edit" color="#3b82f6" onClick={onEdit} />
        <ActionBtn icon={<Trash2 size={16} />} label="Delete" color="#e63946" onClick={onDelete} />
      </div>
    </div>
  );
}

function Chip({ label, color }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: color + '15', color: color, border: `1px solid ${color}30`,
    }}>
      {label}
    </span>
  );
}

function ActionBtn({ icon, label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 10, border: `2px solid ${color}30`,
        background: hov ? color : color + '10', color: hov ? '#fff' : color,
        fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: '"DM Sans", sans-serif',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {icon} {label}
    </button>
  );
}