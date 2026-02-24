import React, { useState, useCallback, useEffect } from 'react';
import './CustomizeTagPage.scss'


// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeft = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>;
const Plus = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const Trash2 = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>;
const Save = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
const TagIcon = ({ size = 16, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>;
const Eye = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const Settings2 = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></svg>;
const MoveIcon = ({ size = 16, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" /><polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" /></svg>;
const RotateCcw = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>;
const X = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const Edit2 = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>;
const ChevronDown = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;
const Type = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>;

// ─── Constants ────────────────────────────────────────────────────────────────
const MM_TO_PX = 3.7795275591;
const INCH_TO_PX = 96;
function toPx(v, u) {
  if (!v || v === '') return 0;
  return u === 'inch' ? v * INCH_TO_PX : v * MM_TO_PX;
}

const ACCENT = { tag1: '#1a1a2e', tag2: '#c8922a', tag3: '#2d6a4f', tag4: '#e63946' };

// ─── STATIC SP / VARIABLE JSON ────────────────────────────────────────────────
const SP_DATA = [
  {
    id: 'sp1', name: 'SP 1 — Weight Info',
    variables: [
      { id: 'sp1_v1', label: 'Gross Weight', key: 'GrossWt', unit: 'GM' },
      { id: 'sp1_v2', label: 'Net Weight', key: 'NetWt', unit: 'GM' },
      { id: 'sp1_v3', label: 'Stone Weight', key: 'StoneWt', unit: 'GM' },
      { id: 'sp1_v4', label: 'Metal Weight', key: 'MetalWt', unit: 'GM' },
      { id: 'sp1_v5', label: 'Polish Weight', key: 'PolishWt', unit: 'GM' },
      { id: 'sp1_v6', label: 'Tola Weight', key: 'TolaWt', unit: 'Tola' },
      { id: 'sp1_v7', label: 'Carat Weight', key: 'CaratWt', unit: 'ct' },
      { id: 'sp1_v8', label: 'Wax Weight', key: 'WaxWt', unit: 'GM' },
      { id: 'sp1_v9', label: 'Dust Weight', key: 'DustWt', unit: 'GM' },
      { id: 'sp1_v10', label: 'Final Weight', key: 'FinalWt', unit: 'GM' },
    ]
  },
  {
    id: 'sp2', name: 'SP 2 — Pricing',
    variables: [
      { id: 'sp2_v1', label: 'Rate', key: 'Rate', unit: '₹/GM' },
      { id: 'sp2_v2', label: 'Making Charge', key: 'MakingChg', unit: '₹' },
      { id: 'sp2_v3', label: 'Stone Price', key: 'StonePrice', unit: '₹' },
      { id: 'sp2_v4', label: 'Total Amount', key: 'TotalAmt', unit: '₹' },
      { id: 'sp2_v5', label: 'GST', key: 'GST', unit: '%' },
      { id: 'sp2_v6', label: 'Discount', key: 'Discount', unit: '%' },
      { id: 'sp2_v7', label: 'Net Amount', key: 'NetAmt', unit: '₹' },
      { id: 'sp2_v8', label: 'Gold Rate', key: 'GoldRate', unit: '₹' },
      { id: 'sp2_v9', label: 'Silver Rate', key: 'SilverRate', unit: '₹' },
      { id: 'sp2_v10', label: 'Market Price', key: 'MktPrice', unit: '₹' },
    ]
  },
  {
    id: 'sp3', name: 'SP 3 — Product Info',
    variables: [
      { id: 'sp3_v1', label: 'Item Code', key: 'ItemCode', unit: '' },
      { id: 'sp3_v2', label: 'Item Name', key: 'ItemName', unit: '' },
      { id: 'sp3_v3', label: 'Category', key: 'Category', unit: '' },
      { id: 'sp3_v4', label: 'Sub Category', key: 'SubCat', unit: '' },
      { id: 'sp3_v5', label: 'Purity', key: 'Purity', unit: 'K' },
      { id: 'sp3_v6', label: 'Karat', key: 'Karat', unit: 'K' },
      { id: 'sp3_v7', label: 'Color', key: 'Color', unit: '' },
      { id: 'sp3_v8', label: 'Size', key: 'Size', unit: '' },
      { id: 'sp3_v9', label: 'Design No', key: 'DesignNo', unit: '' },
      { id: 'sp3_v10', label: 'Collection', key: 'Collection', unit: '' },
    ]
  },
  {
    id: 'sp4', name: 'SP 4 — Stone Details',
    variables: [
      { id: 'sp4_v1', label: 'Stone Name', key: 'StoneName', unit: '' },
      { id: 'sp4_v2', label: 'Stone Pcs', key: 'StonePcs', unit: 'pcs' },
      { id: 'sp4_v3', label: 'Stone Carat', key: 'StoneCt', unit: 'ct' },
      { id: 'sp4_v4', label: 'Diamond Pcs', key: 'DiamondPcs', unit: 'pcs' },
      { id: 'sp4_v5', label: 'Diamond Ct', key: 'DiamondCt', unit: 'ct' },
      { id: 'sp4_v6', label: 'Ruby Pcs', key: 'RubyPcs', unit: 'pcs' },
      { id: 'sp4_v7', label: 'Emerald Pcs', key: 'EmeraldPcs', unit: 'pcs' },
      { id: 'sp4_v8', label: 'Stone Clarity', key: 'StoneClr', unit: '' },
      { id: 'sp4_v9', label: 'Stone Color', key: 'StoneColor', unit: '' },
      { id: 'sp4_v10', label: 'Stone Quality', key: 'StoneQual', unit: '' },
    ]
  },
  {
    id: 'sp5', name: 'SP 5 — Business Info',
    variables: [
      { id: 'sp5_v1', label: 'Shop Name', key: 'ShopName', unit: '' },
      { id: 'sp5_v2', label: 'Invoice No', key: 'InvoiceNo', unit: '' },
      { id: 'sp5_v3', label: 'Date', key: 'Date', unit: '' },
      { id: 'sp5_v4', label: 'Customer Name', key: 'CustName', unit: '' },
      { id: 'sp5_v5', label: 'Salesman', key: 'Salesman', unit: '' },
      { id: 'sp5_v6', label: 'Branch', key: 'Branch', unit: '' },
      { id: 'sp5_v7', label: 'Counter No', key: 'CounterNo', unit: '' },
      { id: 'sp5_v8', label: 'Lot No', key: 'LotNo', unit: '' },
      { id: 'sp5_v9', label: 'Serial No', key: 'SerialNo', unit: '' },
      { id: 'sp5_v10', label: 'Batch No', key: 'BatchNo', unit: '' },
    ]
  },
];

const EMPTY_TAG = {
  name: '',
  design: 'tag1',
  width: '',
  height: '',
  unit: 'mm',
  fontSize: 10,
  borderWidth: 1,
  showBarcode: true,
  codeWidth: 40,
  codeHeight: 12,
  showQR: false,
  qrSize: 12,
  placedVariables: [],
  placedLabels: [],
  layout: { title: { x: 5, y: 3 }, barcode: { x: 5, y: 76 }, qr: { x: 55, y: 76 } },
};

function makeVarStyle() { return { fontSize: 10, fontWeight: '700', unit: '', color: '#1a1a2e' }; }
function makeLabelStyle() { return { fontSize: 11, fontWeight: '800', color: '#1a1a2e', bg: 'transparent', italic: false }; }

function VarCustomizePopover({ instance, spId, varDef, onUpdate, onClose }) {
  const [s, setS] = useState({ ...makeVarStyle(), ...(instance.style || {}) });
  const upd = (k, v) => setS(p => ({ ...p, [k]: v }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: 350, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e' }}>Customize Variable</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{varDef.label} · {`{{${varDef.key}}}`}</div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Unit Suffix</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input value={s.unit || ''} onChange={e => upd('unit', e.target.value)} placeholder="Custom unit..." style={{ flex: 1, minWidth: 80, padding: '7px 10px', borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              {['GM', 'g', 'kg', 'ct', 'oz', '%', '₹', 'K'].map(u => (
                <button key={u} onClick={() => upd('unit', s.unit === u ? '' : u)} style={{ padding: '6px 9px', borderRadius: 8, border: `2px solid ${s.unit === u ? '#c8922a' : '#e5e7eb'}`, background: s.unit === u ? '#fef3dc' : '#f8f9fe', color: s.unit === u ? '#c8922a' : '#64748b', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>{u}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Font Size: <span style={{ color: '#c8922a' }}>{s.fontSize}pt</span></div>
            <input type="range" min="6" max="32" value={s.fontSize} onChange={e => upd('fontSize', Number(e.target.value))} style={{ width: '100%', accentColor: '#c8922a' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Weight</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
              {[['Normal', '400'], ['Med', '500'], ['Bold', '700'], ['Black', '900']].map(([lbl, wt]) => (
                <button key={wt} onClick={() => upd('fontWeight', wt)} style={{ padding: '7px 4px', borderRadius: 8, border: `2px solid ${s.fontWeight === wt ? '#c8922a' : '#e5e7eb'}`, background: s.fontWeight === wt ? '#fef3dc' : '#f8f9fe', color: s.fontWeight === wt ? '#c8922a' : '#64748b', fontWeight: wt, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{lbl}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Color</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              {['#1a1a2e', '#c8922a', '#2d6a4f', '#e63946', '#0284c7', '#7c3aed', '#374151', '#000'].map(c => (
                <button key={c} onClick={() => upd('color', c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: `3px solid ${s.color === c ? '#fff' : 'transparent'}`, boxShadow: s.color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer' }} />
              ))}
              <input type="color" value={s.color || '#1a1a2e'} onChange={e => upd('color', e.target.value)} style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 1 }} />
            </div>
          </div>
          <div style={{ background: '#f8f9fe', borderRadius: 10, padding: '10px 14px', border: '1px solid #e8eaf0' }}>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Preview</div>
            <div style={{ fontSize: s.fontSize, fontWeight: s.fontWeight, color: s.color, fontFamily: 'Georgia,serif' }}>
              <span style={{ color: '#666' }}>{varDef.label}: </span><span>{`{{${varDef.key}}}`}{s.unit ? ' ' + s.unit : ''}</span>
            </div>
          </div>
          <button onClick={() => { onUpdate(s); onClose(); }} style={{ background: 'linear-gradient(135deg,#c8922a,#e8b84b)', border: 'none', borderRadius: 11, padding: '11px', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            ✓ Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function LabelCustomizePopover({ label, onUpdate, onClose }) {
  const [s, setS] = useState({ ...makeLabelStyle(), ...(label.style || {}), text: label.text });
  const upd = (k, v) => setS(p => ({ ...p, [k]: v }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: 350, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e' }}>Customize Label</div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Label Text</div>
            <input value={s.text} onChange={e => upd('text', e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', fontWeight: 700 }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Font Size: <span style={{ color: '#7c3aed' }}>{s.fontSize}pt</span></div>
            <input type="range" min="6" max="48" value={s.fontSize} onChange={e => upd('fontSize', Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Weight</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
              {[['Normal', '400'], ['Med', '500'], ['Bold', '700'], ['Black', '900']].map(([lbl, wt]) => (
                <button key={wt} onClick={() => upd('fontWeight', wt)} style={{ padding: '7px 4px', borderRadius: 8, border: `2px solid ${s.fontWeight === wt ? '#7c3aed' : '#e5e7eb'}`, background: s.fontWeight === wt ? '#f3e8ff' : '#f8f9fe', color: s.fontWeight === wt ? '#7c3aed' : '#64748b', fontWeight: wt, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{lbl}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Italic</div>
            <button onClick={() => upd('italic', !s.italic)} style={{ padding: '5px 14px', borderRadius: 8, border: `2px solid ${s.italic ? '#7c3aed' : '#e5e7eb'}`, background: s.italic ? '#f3e8ff' : '#f8f9fe', color: s.italic ? '#7c3aed' : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontStyle: 'italic' }}>I</button>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Text Color</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              {['#1a1a2e', '#c8922a', '#2d6a4f', '#e63946', '#0284c7', '#7c3aed', '#374151', '#fff'].map(c => (
                <button key={c} onClick={() => upd('color', c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: `3px solid ${s.color === c ? '#7c3aed' : '#e5e7eb'}`, boxShadow: s.color === c ? `0 0 0 2px ${c === '#fff' ? '#ccc' : c}` : 'none', cursor: 'pointer' }} />
              ))}
              <input type="color" value={s.color || '#1a1a2e'} onChange={e => upd('color', e.target.value)} style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 1 }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Background</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              {['transparent', '#1a1a2e', '#fef3dc', '#f0fdf4', '#fff0f0', '#eff6ff', '#f3e8ff'].map(c => (
                <button key={c} onClick={() => upd('bg', c)} style={{ width: 28, height: 28, borderRadius: 8, background: c === 'transparent' ? 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 0/10px 10px' : c, border: `3px solid ${s.bg === c ? '#7c3aed' : '#e5e7eb'}`, cursor: 'pointer' }} />
              ))}
              <input type="color" value={s.bg === 'transparent' ? '#ffffff' : (s.bg || '#ffffff')} onChange={e => upd('bg', e.target.value)} style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 1 }} />
            </div>
          </div>
          <div style={{ background: '#f8f9fe', borderRadius: 10, padding: '10px 14px', border: '1px solid #e8eaf0' }}>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Preview</div>
            <span style={{ fontSize: s.fontSize, fontWeight: s.fontWeight, color: s.color, background: s.bg, fontStyle: s.italic ? 'italic' : 'normal', padding: s.bg !== 'transparent' ? '2px 8px' : 0, borderRadius: 4 }}>{s.text || 'Label Text'}</span>
          </div>
          <button onClick={() => { onUpdate({ ...label, text: s.text, style: { fontSize: s.fontSize, fontWeight: s.fontWeight, color: s.color, bg: s.bg, italic: s.italic } }); onClose(); }} style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: 11, padding: '11px', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            ✓ Apply Label Style
          </button>
        </div>
      </div>
    </div>
  );
}

function DraggableCanvas({ tag, layout, onLayoutChange, placedVariables, placedLabels, onRemovePlaced, onEditInstance, onRemoveLabel, onEditLabel }) {
  const CANVAS_W = 1000, CANVAS_H = 1000;
  const rawW = toPx(tag.width || 60, tag.unit || 'mm');
  const rawH = toPx(tag.height || 30, tag.unit || 'mm');
  const scale = Math.min(CANVAS_W / rawW, CANVAS_H / rawH, 2.6);
  const dispW = rawW * scale, dispH = rawH * scale;
  const acc = ACCENT[tag.design] || '#1a1a2e';
  const f = n => tag.fontSize * scale * n;

  const [dragging, setDragging] = useState(null);
  const [hoveredEl, setHoveredEl] = useState(null);

  const clamp = v => Math.min(Math.max(v, 0), 94);

  const getPos = useCallback((key) => {
    if (key === 'title') return layout.title || { x: 5, y: 3 };
    if (key === 'barcode') return layout.barcode || { x: 5, y: 76 };
    if (key === 'qr') return layout.qr || { x: 55, y: 76 };
    const pv = placedVariables.find(p => p.instanceId === key);
    if (pv) return { x: pv.x, y: pv.y };
    const pl = placedLabels.find(l => l.id === key);
    if (pl) return { x: pl.x, y: pl.y };
    return { x: 5, y: 20 };
  }, [layout, placedVariables, placedLabels]);

  const startDrag = useCallback((e, key) => {
    e.preventDefault(); e.stopPropagation();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const p = getPos(key);
    setDragging({ key, startCX: cx, startCY: cy, startPX: p.x, startPY: p.y });
  }, [getPos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = e => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const nx = clamp(dragging.startPX + ((cx - dragging.startCX) / dispW) * 100);
      const ny = clamp(dragging.startPY + ((cy - dragging.startCY) / dispH) * 100);
      if (dragging.key === 'title') onLayoutChange({ ...layout, title: { x: nx, y: ny } });
      else if (dragging.key === 'barcode') onLayoutChange({ ...layout, barcode: { x: nx, y: ny } });
      else if (dragging.key === 'qr') onLayoutChange({ ...layout, qr: { x: nx, y: ny } });
      else onLayoutChange({ ...layout, _update: { id: dragging.key, x: nx, y: ny } });
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
  }, [dragging, dispW, dispH, layout, onLayoutChange]);

  // ─── FIX: DEl now wraps buttons INSIDE the hover zone ──────────────────────
  // Key changes:
  // 1. paddingTop on the wrapper so buttons are physically inside the element bounds
  // 2. Buttons rendered BELOW the dashed border in a separate div that's part of the same wrapper
  // 3. onMouseLeave uses relatedTarget check to prevent hiding when moving to action buttons
  function DEl({ elKey, color, children, onDelete, onEdit }) {
    const p = getPos(elKey);
    const active = dragging?.key === elKey;
    const isHovered = hoveredEl === elKey;
    const BUTTON_H = 24; // height reserved for action buttons above content

    return (
      <div
        style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          // ↑ transform shifts the whole group UP so the visible content stays at the same logical position
          transform: 'translateY(-' + BUTTON_H + 'px)',
          zIndex: active ? 100 : 10,
          userSelect: 'none',
        }}
        onMouseEnter={() => setHoveredEl(elKey)}
        onMouseLeave={(e) => {
          // Only hide if we're truly leaving the whole element group
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setHoveredEl(null);
          }
        }}
      >
        {/* Action buttons — rendered first (top of stack), always present in DOM */}
        <div style={{
          height: BUTTON_H,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          paddingLeft: 2,
          paddingBottom: 3,
          opacity: isHovered || active ? 1 : 0,
          // CRITICAL: always pointer-events auto so mouse can enter/exit cleanly
          pointerEvents: isHovered || active ? 'auto' : 'none',
          transition: 'opacity 0.15s',
        }}>
          {onEdit && (
            <div
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); e.preventDefault(); onEdit(); }}
              style={{
                background: '#0284c7',
                color: '#fff',
                borderRadius: 20,
                padding: '3px 9px',
                fontSize: 9,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                lineHeight: 1,
              }}
            >
              ✏ Edit
            </div>
          )}
          {onDelete && (
            <div
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
              style={{
                background: '#e63946',
                color: '#fff',
                borderRadius: 20,
                padding: '3px 9px',
                fontSize: 9,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                lineHeight: 1,
              }}
            >
              ✕ Del
            </div>
          )}
        </div>

        {/* Draggable content area */}
        <div
          onMouseDown={e => startDrag(e, elKey)}
          onTouchStart={e => startDrag(e, elKey)}
          style={{ position: 'relative', cursor: active ? 'grabbing' : 'grab' }}
        >
          {/* Dashed border highlight */}
          <div style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 5,
            border: `1.5px dashed ${color}`,
            pointerEvents: 'none',
            opacity: isHovered || active ? 1 : 0.2,
            transition: 'opacity 0.15s',
          }} />
          {children}
        </div>
      </div>
    );
  }

  const BG = {
    tag1: { background: '#fff', border: `${tag.borderWidth}px solid #1a1a2e`, borderRadius: 4 },
    tag2: { background: 'linear-gradient(135deg,#fffdf5,#fef3dc)', border: `${tag.borderWidth}px solid #c8922a`, borderRadius: 8 },
    tag3: { background: '#fff', border: `${tag.borderWidth}px solid #2d6a4f` },
    tag4: { background: 'linear-gradient(160deg,#fff0f0,#fff)', border: `${tag.borderWidth}px solid #e63946`, borderRadius: 10 },
  };

  const BarcodeEl = () => {
    const bw = Math.max(f(9), 60), bh = Math.max(f(2.2), 14);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <div style={{ width: bw, height: bh, display: 'flex', gap: 0.4, overflow: 'hidden' }}>
          {Array.from({ length: 36 }).map((_, i) => <div key={i} style={{ flex: i % 3 === 0 ? 2 : 1, background: i % 5 === 0 ? '#999' : '#1a1a2e' }} />)}
        </div>
        <span style={{ fontSize: f(0.45), color: '#888', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>BARCODE</span>
      </div>
    );
  };

  const QREl = () => {
    const sz = Math.max(toPx(tag.qrSize || 12, tag.unit) * scale, 26);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <div style={{ width: sz, height: sz, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
          <span style={{ color: '#fff', fontSize: sz * 0.38, lineHeight: 1 }}>▣</span>
        </div>
        <span style={{ fontSize: f(0.45), color: '#888', fontFamily: 'monospace' }}>QR</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: CANVAS_W, height: CANVAS_H, position: 'relative' }}>
      <div style={{ width: dispW, height: dispH, position: 'relative', overflow: 'visible', boxShadow: '0 14px 52px rgba(0,0,0,0.22)', ...(BG[tag.design] || BG.tag1) }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.06 }}>
          <defs><pattern id="dg2" x="0" y="0" width={scale * 5} height={scale * 5} patternUnits="userSpaceOnUse"><circle cx={scale * 2.5} cy={scale * 2.5} r="0.8" fill={acc} /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dg2)" />
        </svg>

        {placedVariables.map(pv => {
          const sp = SP_DATA.find(s => s.id === pv.spId);
          const varDef = sp?.variables.find(v => v.id === pv.varId);
          if (!varDef) return null;
          const st = pv.style || makeVarStyle();
          const scaledFs = st.fontSize * (scale / 3.5);
          return (
            <DEl key={pv.instanceId} elKey={pv.instanceId} color="#0284c7"
              onDelete={() => onRemovePlaced(pv.instanceId)}
              onEdit={() => onEditInstance(pv.instanceId)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 3, padding: `${Math.max(1, scale * 0.8)}px ${Math.max(2, scale * 2)}px`, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: scaledFs, fontWeight: st.fontWeight, color: st.color, fontFamily: 'Georgia,serif' }}>{`{{${varDef.key}}}`}{st.unit ? ' ' + st.unit : ''}</span>
              </div>
            </DEl>
          );
        })}

        {placedLabels.map(pl => {
          const st = pl.style || makeLabelStyle();
          const scaledFs = st.fontSize * (scale / 3.5);
          return (
            <DEl key={pl.id} elKey={pl.id} color="#7c3aed"
              onDelete={() => onRemoveLabel(pl.id)}
              onEdit={() => onEditLabel(pl.id)}>
              <span style={{ fontSize: scaledFs, fontWeight: st.fontWeight, color: st.color, fontStyle: st.italic ? 'italic' : 'normal', background: st.bg, padding: st.bg !== 'transparent' ? `${scale * 0.5}px ${scale * 2}px` : 0, borderRadius: 3, whiteSpace: 'nowrap', display: 'block' }}>
                {pl.text}
              </span>
            </DEl>
          );
        })}

        {tag.showBarcode && (
          <DEl elKey="barcode" color="#7c3aed">
            <BarcodeEl />
          </DEl>
        )}
        {tag.showQR && (
          <DEl elKey="qr" color="#059669">
            <QREl />
          </DEl>
        )}
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.95)', padding: '4px 12px', borderRadius: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', fontSize: 10, color: '#555', fontWeight: 600 }}>
        {[['Variable', '#0284c7'], ['Label', '#7c3aed'], ...(tag.showBarcode ? [['Barcode', '#7c3aed']] : []), ...(tag.showQR ? [['QR', '#059669']] : [])].map(([lbl, col]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: 2, background: col }} />{lbl}</div>
        ))}
        <span style={{ color: '#94a3b8', marginLeft: 4 }}>· Hover → Edit / Delete</span>
      </div>
    </div>
  );
}

function SLabel({ children }) { return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{children}</label>; }
function SInput({ value, onChange, placeholder }) {
  const [foc, setFoc] = useState(false);
  return <input value={value} onChange={onChange} placeholder={placeholder} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `2px solid ${foc ? '#c8922a' : '#e5e7eb'}`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', transition: 'border-color 0.2s' }} />;
}

function SNum({ value, onChange, placeholder = '' }) {
  const [foc, setFoc] = useState(false);
  return (
    <input
      type="number"
      value={value === '' || value === null || value === undefined ? '' : value}
      placeholder={placeholder}
      onChange={e => {
        const raw = e.target.value;
        if (raw === '' || raw === '-') { onChange(''); } else { const v = parseFloat(raw); if (!isNaN(v)) onChange(v); }
      }}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
      style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `2px solid ${foc ? '#c8922a' : '#e5e7eb'}`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', transition: 'border-color 0.2s' }}
    />
  );
}

function SegCtrl({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(o => <button key={o.value} onClick={() => onChange(o.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: value === o.value ? '#fff' : 'transparent', color: value === o.value ? '#1a1a2e' : '#94a3b8', fontWeight: value === o.value ? 800 : 500, fontSize: 12, transition: 'all 0.18s', boxShadow: value === o.value ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', fontFamily: 'inherit' }}>{o.label}</button>)}
    </div>
  );
}
function Toggle({ checked, onChange, label, color = '#c8922a' }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? color : '#d1d5db', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: checked ? '#1a1a2e' : '#94a3b8' }}>{label}</span>
    </label>
  );
}
function PanelCard({ title, icon, iconBg = '#fef3dc', iconColor = '#c8922a', children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f8f9fe' }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: iconColor }}>{icon}</span></div>
        <h3 style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#1a1a2e' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Panel1Variables({ placedVariables, onPlace, onRemovePlaced, onEditInstance }) {
  const [selectedSp, setSelectedSp] = useState(SP_DATA[0]);
  const [dropOpen, setDropOpen] = useState(false);
  const [hovVar, setHovVar] = useState(null);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '2px solid #f0f2f8' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Select SP</div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, border: `2px solid ${dropOpen ? '#c8922a' : '#e5e7eb'}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                {SP_DATA.findIndex(s => s.id === selectedSp.id) + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{selectedSp.name}</span>
            </div>
            <div style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}><ChevronDown size={15} /></div>
          </button>
          {dropOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: '#fff', borderRadius: 11, border: '2px solid #e5e7eb', boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 500, overflow: 'hidden' }}>
              {SP_DATA.map((sp, idx) => (
                <div key={sp.id} onClick={() => { setSelectedSp(sp); setDropOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', cursor: 'pointer', background: sp.id === selectedSp.id ? '#fef3dc' : '#fff', borderBottom: idx < SP_DATA.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.12s' }}
                  onMouseEnter={e => { if (sp.id !== selectedSp.id) e.currentTarget.style.background = '#f8f9fe'; }}
                  onMouseLeave={e => { if (sp.id !== selectedSp.id) e.currentTarget.style.background = '#fff'; }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: sp.id === selectedSp.id ? '#c8922a' : '#e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: sp.id === selectedSp.id ? '#fff' : '#64748b', flexShrink: 0 }}>{idx + 1}</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: sp.id === selectedSp.id ? '#c8922a' : '#1a1a2e' }}>{sp.name}</span>
                  {sp.id === selectedSp.id && <span style={{ marginLeft: 'auto', color: '#c8922a', fontSize: 12 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Variables ({selectedSp.variables.length})
        </div>
        <div className='Panel1_overflow' style={{ display: 'flex', flexDirection: 'column', gap: 4, height: "50vh", overflowY: 'auto' }}>
          {selectedSp.variables.map((v, idx) => {
            const placed = placedVariables.filter(p => p.varId === v.id && p.spId === selectedSp.id);
            const isHov = hovVar === v.id;
            return (
              <div
                key={v.id}
                onMouseEnter={() => setHovVar(v.id)}
                onMouseLeave={() => setHovVar(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: 10, border: `2px solid ${isHov ? '#0284c7' : placed.length > 0 ? '#bae6fd' : '#f1f5f9'}`, background: isHov ? '#eff6ff' : placed.length > 0 ? '#f0f9ff' : '#f8f9fe', transition: 'all 0.15s', cursor: 'pointer' }}
                onClick={() => onPlace(selectedSp.id, v.id)}
              >
                <div style={{ width: 20, height: 20, borderRadius: 6, background: placed.length > 0 ? '#0284c7' : '#e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: placed.length > 0 ? '#fff' : '#94a3b8', flexShrink: 0 }}>{idx + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.label}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{`{{${v.key}}}`}{v.unit ? ` · ${v.unit}` : ''}</div>
                </div>
                {placed.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0284c7', background: '#dbeafe', padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>×{placed.length}</span>
                )}
                {isHov && <div style={{ fontSize: 10, fontWeight: 700, color: '#0284c7', flexShrink: 0 }}>+ Add</div>}
              </div>
            );
          })}
        </div>
      </div>

      {placedVariables.length > 0 && (
        <div style={{ padding: '10px 12px', borderTop: '2px solid #f0f2f8' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>On Canvas ({placedVariables.length})</div>
          <div className='Panel1_overflow' style={{ display: 'flex', flexWrap: 'wrap', gap: 5, height: "20vh", overflowY: 'auto' }}>
            {placedVariables.map((pv, idx) => {
              const sp = SP_DATA.find(s => s.id === pv.spId);
              const vd = sp?.variables.find(v => v.id === pv.varId);
              if (!vd) return null;
              return (
                <div key={pv.instanceId} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e0f2fe', borderRadius: 20, padding: '3px 8px 3px 5px', fontSize: 10, fontWeight: 600, color: '#0284c7', border: '1px solid #bae6fd' }}>
                  <span style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900 }}>{idx + 1}</span>
                  {vd.label}
                  <button onClick={() => onEditInstance(pv.instanceId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', display: 'flex', padding: 1 }}><Edit2 size={9} /></button>
                  <button onClick={() => onRemovePlaced(pv.instanceId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e63946', display: 'flex', padding: 1 }}><X size={9} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Panel2Settings({ tag, set, placedLabels, onAddLabel, onRemoveLabel, onEditLabel }) {
  const [newLabelText, setNewLabelText] = useState('');

  const handleAddLabel = () => {
    if (!newLabelText.trim()) return;
    onAddLabel(newLabelText.trim());
    setNewLabelText('');
  };

  return (
    <div className='panel2-settings' style={{ height: '100%', overflowY: 'auto', padding: '14px' }}>
      <PanelCard title="Tag Settings" icon={<Settings2 size={13} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <SLabel>Tag Name *</SLabel>
            <SInput value={tag.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Gold Jewellery Tag" />
          </div>
          <div>
            <SLabel>Unit</SLabel>
            <SegCtrl value={tag.unit} options={[{ value: 'mm', label: 'MM' }, { value: 'inch', label: 'Inch' }]} onChange={v => set('unit', v)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <SLabel>Width ({tag.unit})</SLabel>
              <SNum value={tag.width} onChange={v => set('width', v)} placeholder={`e.g. ${tag.unit === 'mm' ? '60' : '2.5'}`} />
            </div>
            <div>
              <SLabel>Height ({tag.unit})</SLabel>
              <SNum value={tag.height} onChange={v => set('height', v)} placeholder={`e.g. ${tag.unit === 'mm' ? '30' : '1.2'}`} />
            </div>
            <div>
              <SLabel>Font (pt)</SLabel>
              <SNum value={tag.fontSize} onChange={v => set('fontSize', v)} placeholder="10" />
            </div>
            <div>
              <SLabel>Border (px)</SLabel>
              <SNum value={tag.borderWidth} onChange={v => set('borderWidth', v)} placeholder="1" />
            </div>
          </div>
          {tag.width !== '' && tag.height !== '' && (
            <div style={{ background: '#f0f9ff', borderRadius: 9, padding: '8px 12px', fontSize: 11, color: '#0284c7', fontWeight: 600, border: '1px solid #bae6fd' }}>
              Canvas size: {tag.width} × {tag.height} {tag.unit}
              {' '}= {Math.round(toPx(tag.width, tag.unit))} × {Math.round(toPx(tag.height, tag.unit))} px
            </div>
          )}
        </div>
      </PanelCard>

      <PanelCard title="Barcode & QR Code" icon={<Eye size={13} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ borderRadius: 10, padding: '11px 12px', border: `2px solid ${tag.showBarcode ? '#c4b5fd' : '#e5e7eb'}`, background: tag.showBarcode ? '#faf5ff' : '#f8f9fe', transition: 'all 0.2s' }}>
            <Toggle checked={tag.showBarcode} onChange={() => set('showBarcode', !tag.showBarcode)} label="Barcode" color="#7c3aed" />
            {tag.showBarcode && (
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><SLabel>W ({tag.unit})</SLabel><SNum value={tag.codeWidth} onChange={v => set('codeWidth', v)} min={5} max={200} /></div>
                <div><SLabel>H ({tag.unit})</SLabel><SNum value={tag.codeHeight} onChange={v => set('codeHeight', v)} min={3} max={100} /></div>
              </div>
            )}
          </div>
          <div style={{ borderRadius: 10, padding: '11px 12px', border: `2px solid ${tag.showQR ? '#bbf7d0' : '#e5e7eb'}`, background: tag.showQR ? '#f0fdf4' : '#f8f9fe', transition: 'all 0.2s' }}>
            <Toggle checked={tag.showQR} onChange={() => set('showQR', !tag.showQR)} label="QR Code" color="#059669" />
            {tag.showQR && <div style={{ marginTop: 10 }}><SLabel>QR Size ({tag.unit})</SLabel><SNum value={tag.qrSize} onChange={v => set('qrSize', v)} min={5} max={100} /></div>}
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Label Settings" icon={<Type size={13} />} iconBg="#f3e8ff" iconColor="#7c3aed">
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12, lineHeight: 1.6 }}>
          Add static text labels to your tag. Click to add, hover on canvas to customize each label individually.
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            value={newLabelText}
            onChange={e => setNewLabelText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddLabel()}
            placeholder="Type label text..."
            style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            onClick={handleAddLabel}
            disabled={!newLabelText.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', borderRadius: 10, border: 'none', background: newLabelText.trim() ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : '#d1d5db', color: '#fff', fontWeight: 700, fontSize: 12, cursor: newLabelText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', flexShrink: 0 }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Quick Labels</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {['Shop Name', 'MRP', 'Hallmark', 'BIS', '916', '22K', 'Pure Gold', 'HUID', 'Certified'].map(l => (
              <button key={l} onClick={() => onAddLabel(l)} style={{ padding: '4px 10px', borderRadius: 20, border: '1.5px solid #e8eaf0', background: '#f8f9fe', color: '#64748b', fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.background = '#f3e8ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eaf0'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f8f9fe'; }}>
                + {l}
              </button>
            ))}
          </div>
        </div>
        {placedLabels.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>On Canvas ({placedLabels.length})</div>
            {placedLabels.map((pl, idx) => {
              const st = pl.style || makeLabelStyle();
              return (
                <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 10, background: '#f8f9fe', border: '1px solid #e8eaf0' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{idx + 1}</div>
                  <span style={{ flex: 1, fontSize: st.fontSize ? Math.min(st.fontSize, 13) : 13, fontWeight: st.fontWeight || 800, color: st.color || '#1a1a2e', fontStyle: st.italic ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.text}</span>
                  <button onClick={() => onEditLabel(pl.id)} style={{ background: '#ede9fe', border: 'none', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#7c3aed', display: 'flex' }} title="Customize"><Edit2 size={11} /></button>
                  <button onClick={() => onRemoveLabel(pl.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#e63946', display: 'flex' }} title="Remove"><Trash2 size={11} /></button>
                </div>
              );
            })}
          </div>
        )}
        {placedLabels.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: 12, background: '#f8f9fe', borderRadius: 10, border: '1px dashed #e5e7eb' }}>
            No labels added yet
          </div>
        )}
      </PanelCard>
    </div>
  );
}

export default function CustomizeTagPage({ onNavigate, editTag }) {
  const [tag, setTag] = useState(() => editTag
    ? { ...EMPTY_TAG, ...editTag, placedVariables: editTag.placedVariables || [], placedLabels: editTag.placedLabels || [] }
    : { ...EMPTY_TAG }
  );
  const [saved, setSaved] = useState(false);
  const [editingVarInstanceId, setEditingVarInstanceId] = useState(null);
  const [editingLabelId, setEditingLabelId] = useState(null);

  const isEdit = !!editTag;
  const set = (k, v) => setTag(p => ({ ...p, [k]: v }));

  const setLayout = useCallback(l => {
    if (l._update) {
      const { id, x, y } = l._update;
      const { _update, ...clean } = l;
      setTag(p => ({
        ...p, layout: clean,
        placedVariables: p.placedVariables.map(pv => pv.instanceId === id ? { ...pv, x, y } : pv),
        placedLabels: p.placedLabels.map(pl => pl.id === id ? { ...pl, x, y } : pl),
      }));
    } else {
      setTag(p => ({ ...p, layout: l }));
    }
  }, []);

  const resetLayout = () => setTag(p => ({ ...p, layout: EMPTY_TAG.layout, placedVariables: [], placedLabels: [] }));

  const placeVariable = (spId, varId) => {
    const count = tag.placedVariables.filter(p => p.varId === varId && p.spId === spId).length;
    setTag(p => {
      const total = p.placedVariables.length;
      // Spread items in a grid pattern within 5–88% range, wrapping every 6 items
      const col = total % 6;
      const row = Math.floor(total / 6);
      const x = Math.min(5 + col * 14 + count * 2, 80);
      const y = Math.min(10 + row * 18, 80);
      return {
        ...p,
        placedVariables: [...p.placedVariables, {
          instanceId: `${spId}_${varId}_${Date.now()}`,
          spId, varId,
          x, y,
          style: makeVarStyle(),
        }],
      };
    });
  };
  const removePlaced = instanceId => setTag(p => ({ ...p, placedVariables: p.placedVariables.filter(pv => pv.instanceId !== instanceId) }));
  const updateVarStyle = (instanceId, style) => setTag(p => ({ ...p, placedVariables: p.placedVariables.map(pv => pv.instanceId === instanceId ? { ...pv, style } : pv) }));

  const addLabel = text => {
    setTag(p => {
      const total = p.placedLabels.length;
      const col = total % 6;
      const row = Math.floor(total / 6);
      const x = Math.min(5 + col * 14, 80);
      const y = Math.min(10 + row * 18, 80);
      return {
        ...p,
        placedLabels: [...p.placedLabels, {
          id: 'lbl_' + Date.now(),
          text,
          x, y,
          style: makeLabelStyle(),
        }],
      };
    });
  };
  const removeLabel = id => setTag(p => ({ ...p, placedLabels: p.placedLabels.filter(pl => pl.id !== id) }));
  const updateLabel = updated => setTag(p => ({ ...p, placedLabels: p.placedLabels.map(pl => pl.id === updated.id ? updated : pl) }));

  const handleSave = () => {
    if (!tag.name.trim()) { alert('Please enter a tag name.'); return; }
    setSaved(true);
    setTimeout(() => onNavigate?.('list'), 900);
  };

  const editingVarInstance = editingVarInstanceId ? tag.placedVariables.find(pv => pv.instanceId === editingVarInstanceId) : null;
  const editingVarDef = editingVarInstance ? SP_DATA.find(s => s.id === editingVarInstance.spId)?.variables.find(v => v.id === editingVarInstance.varId) : null;
  const editingLabel = editingLabelId ? tag.placedLabels.find(pl => pl.id === editingLabelId) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: '"DM Sans", system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {editingVarInstance && editingVarDef && (
        <VarCustomizePopover
          instance={editingVarInstance}
          spId={editingVarInstance.spId}
          varDef={editingVarDef}
          onUpdate={style => updateVarStyle(editingVarInstance.instanceId, style)}
          onClose={() => setEditingVarInstanceId(null)}
        />
      )}
      {editingLabel && (
        <LabelCustomizePopover
          label={editingLabel}
          onUpdate={updateLabel}
          onClose={() => setEditingLabelId(null)}
        />
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #6400b8 0%, #6400b8 100%)', padding: '0 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.22)', position: 'sticky', top: 0, zIndex: 200, flexShrink: 0 }}>
        <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate?.('list')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '7px 13px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 12, fontWeight: 600 }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#c8922a,#e8b84b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TagIcon size={17} color="#fff" /></div>
            <div>
              <h1 style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 800 }}>{isEdit ? 'Edit Tag' : 'Create New Tag'}</h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 10 }}>SP → Click Variable → Add to Canvas · Add Labels → Hover to Customize</p>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={resetLayout} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#cbd5e1', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              <RotateCcw size={13} /> Reset
            </button>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 7, background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#c8922a,#e8b84b)', border: 'none', borderRadius: 11, padding: '9px 20px', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,146,42,0.4)', transition: 'all 0.3s', fontFamily: 'inherit' }}>
              <Save size={14} />{saved ? 'Saved! ✓' : isEdit ? 'Update Tag' : 'Save Tag'}
            </button>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 310px 1fr', minHeight: 0, height: 'calc(100vh - 62px)' }}>

        {/* Panel 1 */}
        <div style={{ background: '#fff', borderRight: '2px solid #f0f2f8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f0f2f8', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: '#fef3dc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TagIcon size={12} color="#c8922a" /></div>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1a1a2e' }}>Variable List</h2>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 10 }}>{tag.placedVariables.length} placed</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Panel1Variables
              placedVariables={tag.placedVariables}
              onPlace={placeVariable}
              onRemovePlaced={removePlaced}
              onEditInstance={setEditingVarInstanceId}
            />
          </div>
        </div>

        {/* Panel 2 */}
        <div style={{ background: '#f8f9fe', borderRight: '2px solid #f0f2f8', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #e8eaf0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#fff' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: '#fef3dc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings2 size={12} color="#c8922a" /></div>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1a1a2e' }}>Settings</h2>
          </div>
          <div style={{ height: '85vh' }}>
            <Panel2Settings
              tag={tag}
              set={set}
              placedLabels={tag.placedLabels}
              onAddLabel={addLabel}
              onRemoveLabel={removeLabel}
              onEditLabel={setEditingLabelId}
            />
          </div>
        </div>

        {/* Panel 3: Canvas */}
        <div style={{ background: '#f0f2f8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #e0e3ec', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#fff' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: '#fef3dc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MoveIcon size={12} color="#c8922a" /></div>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1a1a2e' }}>Live Preview Canvas</h2>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#64748b', background: '#f0f2f8', padding: '2px 9px', borderRadius: 20, fontWeight: 600 }}>{tag.width}×{tag.height} {tag.unit}</span>
              {tag.showBarcode && <span style={{ fontSize: 10, color: '#7c3aed', background: '#f3e8ff', padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>Barcode</span>}
              {tag.showQR && <span style={{ fontSize: 10, color: '#059669', background: '#dcfce7', padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>QR</span>}
              {tag.placedLabels.length > 0 && <span style={{ fontSize: 10, color: '#7c3aed', background: '#f3e8ff', padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>{tag.placedLabels.length} lbl</span>}
              {tag.placedVariables.length > 0 && <span style={{ fontSize: 10, color: '#0284c7', background: '#e0f2fe', padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>{tag.placedVariables.length} var</span>}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'repeating-conic-gradient(#dde3ec 0% 25%,#eef0f6 0% 50%) 0 0 / 18px 18px', overflow: 'hidden' }}>
            <DraggableCanvas
              tag={tag}
              layout={tag.layout || EMPTY_TAG.layout}
              onLayoutChange={setLayout}
              placedVariables={tag.placedVariables}
              placedLabels={tag.placedLabels}
              onRemovePlaced={removePlaced}
              onEditInstance={setEditingVarInstanceId}
              onRemoveLabel={removeLabel}
              onEditLabel={setEditingLabelId}
            />
          </div>

          {/* Stats bar */}
          <div style={{ background: '#fff', borderTop: '2px solid #f0f2f8', padding: '10px 20px', display: 'flex', gap: 10 }}>
            {[{ l: 'Width', v: `${tag.width}${tag.unit}` }, { l: 'Height', v: `${tag.height}${tag.unit}` }, { l: 'Font', v: `${tag.fontSize}pt` }, { l: 'Variables', v: tag.placedVariables.length }, { l: 'Labels', v: tag.placedLabels.length }].map(item => (
              <div key={item.l} style={{ flex: 1, background: '#f8f9fe', borderRadius: 8, padding: '6px', textAlign: 'center', border: '1px solid #e8eaf0' }}>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{item.l}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1a1a2e', marginTop: 1 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}