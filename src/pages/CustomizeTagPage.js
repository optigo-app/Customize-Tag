import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTags } from "../context/TagContext";
import './CustomizeTagPage.scss'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import BarcodeGenerator from '../components/BarcodeGenerator'
import generateBarcodeSVG from '../components/generateBarcodeSVG'
import QRCodeGenerator from '../components/QRCodeGenerator'
import generateQRCodeSVG from '../components/generateQRCodeSVG'
import Tooltip from '@mui/material/Tooltip';
import { Snackbar, Alert } from "@mui/material";
import { CommonAPI } from "../api/api";
import SaveApi from "../api/SaveApi";


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
// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="down" ref={ref} {...props} />;
// });
const ACCENT = { tag1: '#1a1a2e', tag2: '#c8922a', tag3: '#2d6a4f', tag4: '#e63946' };

// ─── STATIC SP / VARIABLE JSON ────────────────────────────────────────────────

export const fetchDashboardData = async () => {
  try {
    let apiurl = 'http://newnextjs.web/api/report';

    // const newbody = {
    //   con: JSON.stringify({
    //     mode: mode,
    //     DBNAME: "Orail25",
    //   }),
    //   p: JSON.stringify({
    //     WhereClause:
    //       "where Stock_design.StockBarcode_WOUS in ('1/5566')",
    //     tagvalue: "",
    //     StockBarcodeList: "1/5566",
    //   }),
    //   f: "test jenis (getspData)",
    // };
    
    const newbody={
      "con": "{\"id\":\"\",\"mode\":\"getspcols\",\"y\":\"\",\"appuserid\":\"soha@eg.com\",\"IPAddress\":\"192.168.1.98\"}",
      "p": "{}",
      "f": "TagPrintConfiguration"
      }
    const response = await CommonAPI(newbody, 168);
 


    if (response?.Status === '200') {
      return  response?.Data;
    } else {
      return []; // Empty array if no data or status is not 200
    }
  } catch (error) {
    console.log('API Error:', error);
    return []; // Return empty array on error
  }
};





const STATIC_SP_DATA = [
  {
    id: 'sp5', name: 'SP 5 — Business Info',
    variables: [
      { id: 'sp5_v1', label: 'Shop Name', key: 'ShopName', unit: '' },
      // ...rest of sp5 variables
    ]
  },
];

const EMPTY_TAG = {
  name: '',
  tagFontFamilly: "",
  design: 'tag1',
  width: '120',
  headWidth: "",
  height: '35',
  unit: 'mm',
  fontSize: 10,
  borderWidth: 1,
  showBarcode: true,
  codeWidth: 30,
  codeHeight: 10,
  showQR: false,
  qrSize: 12,
  placedVariables: [],
  placedLabels: [],
  layout: { title: { x: 5, y: 3 }, barcode: { x: 5, y: 76 }, qr: { x: 55, y: 76 } },
  selectedSp: '',
  barcodeval: '',
  qrcodeval: '',
  html: '',
};


// maths functions
export const roundUp = (value) => {
  const num = Number(value);
  if (isNaN(num)) return value;
  return Math.floor(num);
};

function formatDecimalINR(value, decimal = 2) {
  if (value === null || value === undefined || value === '') return '';

  const num = Number(value);
  if (isNaN(num)) return value;

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal
  }).format(num);
}

function trimNumberByDigits(value, trimCount) {
  if (value === null || value === undefined) return 0;

  // Convert to string
  let str = String(value);

  // Remove decimal point for processing
  const isNegative = str.startsWith('-');
  if (isNegative) str = str.slice(1);

  const numericStr = str.replace('.', '');

  // If trim >= total digits → return 0
  if (trimCount >= numericStr.length) return 0;

  // Remove digits from right
  const trimmed = numericStr.slice(0, numericStr.length - trimCount);

  // Rebuild decimal position
  const decimalIndex = str.indexOf('.');
  let result;

  if (decimalIndex !== -1) {
    const integerLength = decimalIndex;
    const newInteger = trimmed.slice(0, integerLength);
    const newDecimal = trimmed.slice(integerLength);

    result = newDecimal
      ? `${newInteger}.${newDecimal}`
      : newInteger;
  } else {
    result = trimmed;
  }

  return Number(result) || 0;
}

function processValue(value, style = {}) {
  if (value === null || value === undefined) return 0;

  // Ensure numeric and non-negative
  let num = Math.max(0, Number(value));
  if (isNaN(num)) return value;

  const str = String(num);

  // Trim digits from right if specified
  if (style.trim > 0) {
    const numericStr = str.replace('.', '');
    if (style.trim >= numericStr.length) {
      num = 0;
    } else {
      const trimmed = numericStr.slice(0, numericStr.length - style.trim);
      const decimalIndex = str.indexOf('.');

      if (decimalIndex !== -1) {
        const intLen = decimalIndex;
        const newInt = trimmed.slice(0, intLen);
        const newDec = trimmed.slice(intLen);
        num = Number(newDec ? `${newInt}.${newDec}` : newInt);
      } else {
        num = Number(trimmed);
      }
    }
  }

  // Round if requested
  if (style.roundOff) {
    num = Math.round(num);
  }

  // If decimal is set, just return numeric value
  if (style.decimal !== undefined) {
    return Number(num.toFixed(style.decimal));
  }


  return num
}
function makeVarStyle() { return { fontSize: 10, fontWeight: '700', unit: '', color: '#1a1a2e' }; }
function makeLabelStyle() { return { fontSize: 11, fontWeight: '800', color: '#1a1a2e', bg: 'transparent', italic: false }; }

function VarCustomizePopover({ instance, spId, varDef, onUpdate, onClose }) {
  const [s, setS] = useState({ ...makeVarStyle(), ...(instance.style || {}) });
  const [dropOpen, setDropOpen] = useState(false);
  const [decimal, setDecimal] = useState(0);
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
              <input value={s.unit || ''} onChange={e => upd('unit', e.target.value)} onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} placeholder="Custom unit..." style={{ flex: 1, minWidth: 80, padding: '7px 10px', borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              {['GM', 'g', 'kg', 'ct', 'oz', '%', '₹', 'K'].map(u => (
                <button key={u} onClick={() => upd('unit', s.unit === u ? '' : u)} style={{ padding: '6px 9px', borderRadius: 8, border: `2px solid ${s.unit === u ? '#6400b8' : '#e5e7eb'}`, background: s.unit === u ? 'rgb(235, 230, 255)' : '#f8f9fe', color: s.unit === u ? '#6400b8' : '#64748b', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>{u}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Font Size: <span style={{ color: '#6400b8' }}>{s.fontSize}pt</span></div>
            <input type="range" min="6" max="32" value={s.fontSize} onChange={e => upd('fontSize', Number(e.target.value))} style={{ width: '100%', accentColor: '#6400b8' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Weight</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
              {[['Normal', '400'], ['Med', '500'], ['Bold', '700'], ['Black', '900']].map(([lbl, wt]) => (
                <button key={wt} onClick={() => upd('fontWeight', wt)} style={{ padding: '7px 4px', borderRadius: 8, border: `2px solid ${s.fontWeight === wt ? '#6400b8' : '#e5e7eb'}`, background: s.fontWeight === wt ? 'rgb(235, 230, 255)' : '#f8f9fe', color: s.fontWeight === wt ? '#6400b8' : '#64748b', fontWeight: wt, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Color</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              {['#1a1a2e', '#c8922a', '#2d6a4f', '#e63946', '#0284c7', '#7c3aed', '#374151', '#000'].map(c => (
                <button key={c} onClick={() => upd('color', c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: `3px solid ${s.color === c ? '#fff' : 'transparent'}`, boxShadow: s.color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer' }} />
              ))}
              <input type="color" value={s.color || '#1a1a2e'} onChange={e => upd('color', e.target.value)} style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 1 }} />
            </div> */}



          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: "50%", position: "relative" }}>

              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                marginBottom: 6,
                textTransform: 'uppercase'
              }}>
                Decimal Places
              </div>
              {/* <select
                value={s.decimal}
                onChange={e => upd('decimal', Number(e.target.value))}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '2px solid #e5e7eb',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: '#f8f9fe',
                  cursor: 'pointer'
                }}
              >
                {[0, 1, 2, 3].map(d => (
                  <option key={d} value={d}>
                    {d} Decimal{d !== 1 ? 's' : ''}
                  </option>
                ))}
              </select> */}
              <button
                onClick={() => setDropOpen(o => !o)}
                // onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, border: `2px solid ${dropOpen ? '#7c3aed' : '#e5e7eb'}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{decimal}</span>
                </div>
                <div style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}><ChevronDown size={15} /></div>
              </button>
              {dropOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 5px)',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  borderRadius: 11,
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
                  zIndex: 500,
                  overflow: 'hidden'
                }}>
                  {[0, 1, 2, 3, 4, 5].map((sp, idx) => (
                    <div
                      key={sp}

                      onClick={() => {
                        setDecimal(sp);
                        setDropOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 13px',
                        cursor: 'pointer',
                        background: decimal === sp ? 'rgb(196, 181, 253)' : '#fff',
                        borderBottom: idx < 3 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.12s'
                      }}
                      onMouseEnter={e => { if (decimal !== sp) e.currentTarget.style.background = '#f8f9fe'; }}
                      onMouseLeave={e => { if (decimal !== sp) e.currentTarget.style.background = '#fff'; }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: decimal === sp ? 'black' : '#1a1a2e' }}>{sp}</span>

                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: "50%" }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                marginBottom: 6,
                textTransform: 'uppercase'
              }}>
                Trim
              </div>

              <input
                type="number"
                value={s.trim ?? 0}
                min={0}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                onChange={e => upd('trim', e.target.value)}
                placeholder="Enter numeric value..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '2px solid #e5e7eb',
                  fontSize: 12,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: "5px" }}>


            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: '#1a1a2e'
              }}
            >
              <input
                type="checkbox"
                checked={s.roundOff || false}
                onChange={(e) => upd('roundOff', e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: '#6400b8',
                  cursor: 'pointer'
                }}
              />
              Round Off Value
            </label>
          </div>



          <div style={{ background: '#f8f9fe', borderRadius: 10, padding: '10px 14px', border: '1px solid #e8eaf0' }}>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Preview</div>
            <div style={{ fontSize: s.fontSize, fontWeight: s.fontWeight, color: s.color, fontFamily: 'Georgia,serif' }}>
              <span style={{ color: '#666' }}>{varDef.label}: </span><span>{`{{${processValue(varDef.key, s)}}}`}{s.unit ? ' ' + s.unit : ''}</span>
            </div>
          </div>
          <button onClick={() => { onUpdate(s); onClose(); }} style={{ background: 'linear-gradient(135deg, rgb(124, 58, 237), rgb(168, 85, 247))', border: 'none', borderRadius: 11, padding: '11px', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
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
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Customize Label</div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Label Text</div>
            <input value={s.text} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} onChange={e => upd('text', e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', fontWeight: 700 }} />
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
          {/* <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Text Color</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              {['#1a1a2e', '#c8922a', '#2d6a4f', '#e63946', '#0284c7', '#7c3aed', '#374151', '#fff'].map(c => (
                <button key={c} onClick={() => upd('color', c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: `3px solid ${s.color === c ? '#7c3aed' : '#e5e7eb'}`, boxShadow: s.color === c ? `0 0 0 2px ${c === '#fff' ? '#ccc' : c}` : 'none', cursor: 'pointer' }} />
              ))}
              <input type="color" value={s.color || '#1a1a2e'} onChange={e => upd('color', e.target.value)} style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 1 }} />
            </div>
          </div> */}
          {/* <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Background</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              {['transparent', '#1a1a2e', '#fef3dc', '#f0fdf4', '#fff0f0', '#eff6ff', '#f3e8ff'].map(c => (
                <button key={c} onClick={() => upd('bg', c)} style={{ width: 28, height: 28, borderRadius: 8, background: c === 'transparent' ? 'repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 0/10px 10px' : c, border: `3px solid ${s.bg === c ? '#7c3aed' : '#e5e7eb'}`, cursor: 'pointer' }} />
              ))}
              <input type="color" value={s.bg === 'transparent' ? '#ffffff' : (s.bg || '#ffffff')} onChange={e => upd('bg', e.target.value)} style={{ width: 28, height: 28, borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 1 }} />
            </div>
          </div> */}
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
function generateExactTagHTML(tag, layout, placedVariables, placedLabels) {

  const bodyWidth = tag.headWidth || tag.width;
  const tailWidth = Number(tag.width) - Number(bodyWidth);
  const BG = {
    tag1: `
      background:#fff;
      border:${tag.borderWidth}px solid #1a1a2e;
      border-radius:4px;
    `,
    tag2: `
      background:linear-gradient(135deg,#fffdf5,#fef3dc);
      border:${tag.borderWidth}px solid #c8922a;
      border-radius:8px;
    `,
    tag3: `
      background:#fff;
      border:${tag.borderWidth}px solid #2d6a4f;
    `,
    tag4: `
      background:linear-gradient(160deg,#fff0f0,#fff);
      border:${tag.borderWidth}px solid #e63946;
      border-radius:10px;
    `
  };

  return `
  <html>
  <div style='
    width:${tag.width}${tag.unit};
    height:${tag.height}${tag.unit};
    position:relative;
    overflow:hidden;
    font-family:${tag.tagFontFamilly};
    box-sizing:border-box;
    ${BG[tag.design] || BG.tag1}
  '>

    <!-- BODY -->
    <div style='
      width:${bodyWidth}${tag.unit};
      height:100%;
      position:absolute;
      left:0;
      
      display:flex;
    '>

      <div style='width:50%;height:100%; '>
        <div style='height:50%;'></div>
        <div style='height:50%;'></div>
      </div>

      <div style='width:50%;height:100%;'>
        <div style='height:50%;'></div>
        <div style='height:50%;'></div>
      </div>
    </div>

    <!-- TAIL -->
    ${tailWidth > 0 ? `
      <div style='
        position:absolute;
        right:0;
        width:${tailWidth}${tag.unit};
        height:100%;
      '></div>
    ` : ''}

    <!-- VARIABLES -->
    ${placedVariables.map(v => `
      
      <div style='
        position:absolute;
        left:${v.x}%;
        top:${v.y}%;
        font-size:${v.style?.fontSize || 12}px;
        font-weight:${v.style?.fontWeight || 400};
        color:${v.style?.color || '#000'};
        white-space:nowrap;
     
        padding:2px 6px;
        border-radius:3px;
        
      '>
        ${v.varLabel}${v.style?.unit ? ' ' + v.style.unit : ''}
      </div>
    `).join('')}

    <!-- LABELS -->
    ${placedLabels.map(l => `
      <div style='
        position:absolute;
        left:${l.x}%;
        top:${l.y}%;
        font-size:${l.style?.fontSize || 12}px;
        font-weight:${l.style?.fontWeight || 400};
        font-style:${l.style?.italic ? 'italic' : 'normal'};
        color:${l.style?.color || '#000'};
        background:${l.style?.bg || 'transparent'};
        padding:${l.style?.bg !== 'transparent' ? '2px 6px' : '0'};
        border-radius:3px;
        white-space:nowrap;
      '>
        ${l.text}
      </div>
    `).join('')}

    <!-- BARCODE -->
    ${tag.showBarcode ? `
      <div style='
        position:absolute;
        left:${layout.barcode?.x || 5}%;
        top:${layout.barcode?.y || 76}%;
      '>
        ${generateBarcodeSVG(
    tag?.barcodeval?.key || 'dummy',
    tag.codeWidth,
    tag.codeHeight
  )}
      </div>
    ` : ''}

    <!-- QR -->
    ${tag.showQR ? `
      <div style='
        position:absolute;
        left:${layout.qr?.x || 55}%;
        top:${layout.qr?.y || 76}%;
        width:${tag.qrSize || 12}mm;
        height:${tag.qrSize || 12}mm;
      '>
       ${generateQRCodeSVG(
    tag?.qrcodeval?.id || 'dummy',
    tag.qrSize || 12
  )}
      </div>
    ` : ''}

  </div>
   </html>
  `;
}


function DraggableCanvas({ tag, layout, onLayoutChange, placedVariables, placedLabels, onRemovePlaced, onEditInstance, onRemoveLabel, onEditLabel, spData }) {


  const CANVAS_W = 1000, CANVAS_H = 1000;
  const rawW = toPx(tag.width || 60, tag.unit || 'mm');
  const rawH = toPx(tag.height || 30, tag.unit || 'mm');
  const scale = Math.min(CANVAS_W / rawW, CANVAS_H / rawH, 2.6);
  const dispW = rawW * scale, dispH = rawH * scale;
  const acc = ACCENT[tag.design] || '#1a1a2e';
  const f = n => tag.fontSize * scale * n;
  const headWidthPx = toPx(tag.headWidth || (tag.width), tag.unit || 'mm');
  const [dragging, setDragging] = useState(null);
  const [hoveredEl, setHoveredEl] = useState(null);
  const clamp = v => Math.min(Math.max(v, 0), 94);


  //tag zooming effects
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3)); // max 300%
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5)); // min 50%

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
      // const nx = clamp(dragging.startPX + ((cx - dragging.startCX) / dispW) * 250);
      // const ny = clamp(dragging.startPY + ((cy - dragging.startCY) / dispH) * 250);
      const deltaX = (cx - dragging.startCX) / zoom;
      const deltaY = (cy - dragging.startCY) / zoom;

      const nx = clamp(
        dragging.startPX + (deltaX / dispW) * 250
      );
      const ny = clamp(
        dragging.startPY + (deltaY / dispH) * 250
      );
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


  function DEl({ elKey, color, children, onDelete, onEdit }) {
    const p = getPos(elKey);
    const active = dragging?.key === elKey;
    const isHovered = hoveredEl === elKey;
    const BUTTON_H = 10; // height reserved for action buttons above content
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

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
                padding: '1px 3px',
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
              ✏
            </div>
          )}
          {onDelete && (
            <div
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); e.preventDefault(); handleClickOpen(); }}

              style={{
                background: '#e63946',
                color: '#fff',
                borderRadius: 20,
                padding: '1px 3px',
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
              ✕
            </div>
          )}
        </div>
        <Dialog
          open={open}
          // slots={{
          //   transition: Transition,
          // }}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{"Use Google's location service?"}</DialogTitle>

          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            <div
              style={{
                width: "380px",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  padding: "22px 24px"
                }}
              >
                <h2
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#333"
                  }}
                >
                  Confirm
                </h2>

                <p
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    color: "#555"
                  }}
                >
                  Are you sure you want to remove
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  borderTop: "1px solid #e0e0e0"
                }}
              >
                <button


                  onClick={() => { handleClose(); onDelete(); }}
                  style={{
                    flex: 1,
                    padding: "16px 0",
                    fontSize: "17px",
                    fontWeight: 600,
                    background: "#f8f8f8",
                    border: "none",
                    borderRight: "1px solid #e0e0e0",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>

                <button
                  onClick={() => { handleClose() }}

                  style={{
                    flex: 1,
                    padding: "16px 0",
                    fontSize: "17px",
                    fontWeight: 600,
                    background: "#f8f8f8",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Dialog>

        {/* Draggable content area */}
        <div
          onMouseDown={e => startDrag(e, elKey)}
          onTouchStart={e => startDrag(e, elKey)}
          style={{ position: 'relative', cursor: active ? 'grabbing' : 'grab' }}
        >
          {/* Dashed border highlight */}
          <div style={{
            position: 'absolute',
            inset: -1,
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
        {/* <div style={{ width: tag.codeWidth, height: tag.codeHeight, display: 'flex', gap: 0.4, overflow: 'hidden' }}>
          {Array.from({ length: 36 }).map((_, i) => <div key={i} style={{ flex: i % 3 === 0 ? 2 : 1, background: i % 5 === 0 ? '#999' : '#1a1a2e' }} />)}
        </div> */}

        <BarcodeGenerator
          value={tag?.barcodeval?.key}
          width={tag.codeWidth}
          height={tag.codeHeight}
        />
        {/* <span style={{ fontSize: f(0.45), color: '#888', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>BARCODE</span> */}
      </div>
    );
  };


  const QREl = () => {
    const qrMM = tag.qrSize || 12;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <div
          style={{
            width: `${qrMM}mm`,
            height: `${qrMM}mm`,
            background: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2
          }}
        >
          <QRCodeGenerator
            value={tag?.qrcodeval?.id}
            size={qrMM} // PASS MM ONLY
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ position: 'absolute', bottom: 10, bottom: "10%", right: "289px", display: 'flex', alignItems: 'center', gap: 8, zIndex: 99 }} className='zoom-control'>
        <span style={{ fontSize: 12 }}>Zoom:</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))}
          style={{ width: 120, accentColor: '#7c3aed', cursor: "pointer" }}
        />
        <span style={{ fontSize: 12 }}>{Math.round(zoom * 100)}%</span>
        <button className='btn-export' onClick={
          () => {
            const html = generateExactTagHTML(
              tag,
              layout,
              placedVariables,
              placedLabels
            );

           

            const win = window.open();
            win.document.write(html);
            win.document.close();
          }
        }>Preview</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: CANVAS_W, height: CANVAS_H, position: 'relative' }}>

        <div className='tag-container'
          style={{
            width: tag.unit === "mm" ? `${tag.width}mm` : `${tag.width}in`, height: tag.unit === "mm" ? `${tag.height}mm` : `${tag.height}in`, position: 'relative', overflow: 'visible', boxShadow: '0 14px 52px rgba(0,0,0,0.22)', ...(BG[tag.design] || BG.tag1), display: "flex",
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}>

          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.06 }}>
            <defs><pattern id="dg2" x="0" y="0" width={scale * 5} height={scale * 5} patternUnits="userSpaceOnUse"><circle cx={scale * 2.5} cy={scale * 2.5} r="0.8" fill={acc} /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dg2)" />
          </svg>

          {placedVariables.map(pv => {
            const sp = spData.find(s => s.id === pv.spId);
            const varDef = sp?.variables.find(v => v.id === pv.varId);
            if (!varDef) return null;
            const st = pv.style || makeVarStyle();
            const scaledFs = st.fontSize * (scale / 3.5);
            return (
              <DEl key={pv.instanceId} elKey={pv.instanceId} color="#0284c7"
                onDelete={() => onRemovePlaced(pv.instanceId)}
                onEdit={() => onEditInstance(pv.instanceId)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.95)', borderRadius: 3, padding: `1px`, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: scaledFs, fontWeight: st.fontWeight, color: st.color, fontFamily: `'${tag.tagFontFamilly}'` }}>{`${processValue(varDef.label, st)}`}{st.unit ? ' ' + st.unit : ''}</span>
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
                <span style={{ fontSize: scaledFs, fontWeight: st.fontWeight, color: st.color, fontStyle: st.italic ? 'italic' : 'normal', background: st.bg, padding: "1px", borderRadius: 3, whiteSpace: 'nowrap', display: 'block', fontFamily: `${tag.tagFontFamilly}` }}>
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

          <div className='tagbody' style={{ width: headWidthPx, borderRight: "1px dashed #e5e0e0", height: "100%", display: 'flex', position: "relative" }}>
            <div className="bodytitle" style={{ position: "absolute", right: "2px", top: "-10px", fontSize: "7px", color: "gray" }}>
              body
            </div>
            <div className='tagbody-left' style={{ width: '50%', borderRight: "1px dashed #e5e0e0", height: "100%" }}>
              <div className="tagbody-left-top" style={{ width: "100%", height: "50%", borderBottom: "1px dashed #e5e0e0" }} >

              </div>
              <div className="tagbody-left-bottom" style={{ width: "100%", height: "50%" }} >

              </div>
            </div>
            <div className='tagbody-right' style={{ width: '50%', height: "100%" }}>
              <div className="tagbody-right-top" style={{ width: "100%", height: "50%", borderBottom: "1px dashed #e5e0e0" }} >
              </div>
              <div className="tagbody-right-bottom" style={{ width: "100%", height: "50%" }} >

              </div>
            </div>
          </div>



          <div className="tagtail" style={{ width: (Number(tag.width) - Number(tag.headWidth || tag.width)) + 'mm', position: "relative" }}>
            <div className="tailtitle" style={{ position: "absolute", left: "2px", top: "-10px", fontSize: "7px", color: "gray" }}>
              {(Number(tag.width) - Number(tag.headWidth || tag.width)) ? "tail" : ""}
            </div>
          </div>




        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.95)', padding: '4px 12px', borderRadius: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', fontSize: 10, color: '#555', fontWeight: 600 }}>
          {[['Variable', '#0284c7'], ['Label', '#7c3aed'], ...(tag.showBarcode ? [['Barcode', '#7c3aed']] : []), ...(tag.showQR ? [['QR', '#059669']] : [])].map(([lbl, col]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: 2, background: col }} />{lbl}</div>
          ))}
          <span style={{ color: '#94a3b8', marginLeft: 4 }}>· Hover → Edit / Delete</span>
        </div>
      </div>
    </>
  );
}

function SLabel({ children }) { return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{children}</label>; }
function SInput({ value, onChange, placeholder, notwork }) {
  const [foc, setFoc] = useState(false);
  return <input value={value} onChange={onChange} disabled={notwork === "1" ? true : false} placeholder={placeholder} onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `2px solid ${foc ? '#c8922a' : '#e5e7eb'}`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', transition: 'border-color 0.2s' }} />;
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
      onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
function PanelCard({ title, icon, iconBg = 'rgb(243, 232, 255)', iconColor = '#6400b8', children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f8f9fe' }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: iconColor }}>{icon}</span></div>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Panel1Variables({ tag, placedVariables, onPlace, onRemovePlaced, onEditInstance, spData }) {
  const [selectedSp, setSelectedSp] = useState(spData[0]);
  const [dropOpen, setDropOpen] = useState(false);
  const [hovVar, setHovVar] = useState(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState(null);

  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (!selectedSp && spData.length > 0) {
      setSelectedSp(spData[0]);
    }
  }, [spData]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleDeleteClick = (id) => {
    setSelectedInstanceId(id);
    setOpen(true);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '2px solid #f0f2f8' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Select SP</div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            // onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, border: `2px solid ${dropOpen ? '#7c3aed' : '#e5e7eb'}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                {spData.findIndex(s => s.id === selectedSp?.id) + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{selectedSp?.name}</span>
            </div>
            <div style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}><ChevronDown size={15} /></div>
          </button>
          {dropOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: '#fff', borderRadius: 11, border: '2px solid #e5e7eb', boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 500, overflow: 'hidden' }}>
              {spData.map((sp, idx) => (
                <div key={sp.id}
                  onClick={() => {
                    setSelectedSp(sp);
                    tag.selectedSp = sp;
                    setDropOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', cursor: 'pointer', background: sp.id === selectedSp?.id ? 'rgb(196, 181, 253)' : '#fff', borderBottom: idx < spData.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.12s' }}
                  onMouseEnter={e => { if (sp.id !== selectedSp?.id) e.currentTarget.style.background = '#f8f9fe'; }}
                  onMouseLeave={e => { if (sp.id !== selectedSp?.id) e.currentTarget.style.background = '#fff'; }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: sp.id === selectedSp?.id ? '#7c3aed' : '#e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: sp.id === selectedSp?.id ? '#fff' : '#64748b', flexShrink: 0 }}>{idx + 1}</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: sp.id === selectedSp?.id ? '#6400b8' : '#1a1a2e' }}>{sp.name}</span>
                  {sp.id === selectedSp?.id && <span style={{ marginLeft: 'auto', color: '#c8922a', fontSize: 12 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Variables ({selectedSp?.variables.length})
        </div>
        <div className='Panel1_overflow' style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 10, overflowY: 'auto', boxSizing: 'content-box', paddingRight: "5px" }}>
          {selectedSp?.variables.map((v, idx) => {


            const placed = placedVariables.filter(p => p.varId === v.id && p.spId === selectedSp?.id);
            const isHov = hovVar === v.id;
            return (


              <Tooltip
                title={v.key}
                placement="left"
                PopperProps={{
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -10] // distance reduce
                      }
                    }
                  ]
                }}
              >
                <div
                  key={v.id}
                  onMouseEnter={() => setHovVar(v.id)}
                  onMouseLeave={() => setHovVar(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px', borderRadius: 10, border: `2px solid ${isHov ? '#7c3aed' : placed.length > 0 ? '#6400b8' : '#f1f5f9'}`, background: isHov ? 'rgb(235 230 255)' : placed.length > 0 ? 'rgb(235 230 255)' : '#f8f9fe', transition: 'all 0.15s', cursor: 'pointer' }}
                  onClick={() => onPlace(selectedSp?.id, v.id, v.key, v.label)}
                  tooltip="dsds"
                >
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: placed.length > 0 ? '#6400b8' : '#e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: placed.length > 0 ? '#fff' : '#94a3b8', flexShrink: 0, border: isHov ? '1px solid #7c3aed' : '1px solid #e8eaf0' }}>{idx + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.label}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{`{{${v.key}}}`}{v.unit ? ` · ${v.unit}` : ''}</div>
                  </div>
                  {placed.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#6400b8', background: '', padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>×{placed.length}</span>
                  )}
                  {isHov && <div style={{ fontSize: 10, fontWeight: 700, color: '#6400b8', flexShrink: 0 }}>+ Add</div>}
                </div>
              </Tooltip>

            );
          })}
        </div>
      </div>

      {placedVariables.length > 0 && (
        <div style={{ padding: '10px 12px', borderTop: '2px solid #f0f2f8' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>On Canvas ({placedVariables.length})</div>
          <div className='Panel1_overflow' style={{ display: 'flex', flexWrap: 'wrap', gap: 5, height: "100%", overflowY: 'auto' }}>
            {placedVariables.map((pv, idx) => {


              const sp = spData.find(s => s.id === pv.spId);
              const vd = sp?.variables.find(v => v.id === pv.varId);
              if (!vd) return null;

              return (
                <div
                  key={pv.instanceId}
                  style={{
                    display: 'flex',
                    width: "100%",
                    alignItems: 'center',
                    justifyContent: "space-between",
                    gap: 8,
                    padding: '5px 11px',
                    borderRadius: 10,
                    background: '#f8f9fe',
                    border: '1px solid #e8eaf0'
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 900,
                        color: '#fff'
                      }}
                    >
                      {idx + 1}
                    </span>

                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e' }}>
                      {vd.label}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
                    <button
                      onClick={() => onEditInstance(pv.instanceId)}
                      style={{
                        background: '#ede9fe',
                        border: 'none',
                        borderRadius: 7,
                        padding: '5px 7px',
                        cursor: 'pointer',
                        color: '#7c3aed',
                        display: 'flex'
                      }}
                    >
                      <Edit2 size={11} />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(pv.instanceId)}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: 7,
                        padding: '5px 7px',
                        cursor: 'pointer',
                        color: '#e63946',
                        display: 'flex'
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}

            <Dialog open={open} keepMounted onClose={handleClose}>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999
                }}
              >
                <div
                  style={{
                    width: "380px",
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ padding: "22px 24px" }}>
                    <h2
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#333"
                      }}
                    >
                      Confirm
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        color: "#555"
                      }}
                    >
                      Are you sure you want to remove variable
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      borderTop: "1px solid #e0e0e0"
                    }}
                  >
                    <button
                      onClick={() => {
                        onRemovePlaced(selectedInstanceId);
                        handleClose();
                      }}
                      style={{
                        flex: 1,
                        padding: "16px 0",
                        fontSize: "17px",
                        fontWeight: 600,
                        background: "#f8f8f8",
                        border: "none",
                        borderRight: "1px solid #e0e0e0",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>

                    <button
                      onClick={handleClose}
                      style={{
                        flex: 1,
                        padding: "16px 0",
                        fontSize: "17px",
                        fontWeight: 600,
                        background: "#f8f8f8",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel2Settings({ tag, set, placedLabels, onAddLabel, onRemoveLabel, onEditLabel }) {
  const [newLabelText, setNewLabelText] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [dropOpen2, setDropOpen2] = useState(false);
  const [dropOpen3, setDropOpen3] = useState(false);
  const [hovVar, setHovVar] = useState(null);
  const fonts = ["Calibri", "Verdana", "Arial", "Helvetica", "Roboto"];



  const fontRef = useRef(null);
  const varQrRef = useRef(null);
  const varBarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropOpen && fontRef.current && !fontRef.current.contains(event.target)) {
        setDropOpen(false);
      }
      if (dropOpen2 && varQrRef.current && !varQrRef.current.contains(event.target)) {
        setDropOpen2(false);
      }
      if (dropOpen3 && varBarRef.current && !varBarRef.current.contains(event.target)) {
        setDropOpen3(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [dropOpen, dropOpen2, dropOpen3]);


  const [fontfamilly, setFontfamilly] = useState(fonts[0]);
  const [selecetVarQr, setSelectVarQr] = useState(null);
  const [selecetVarBar, setSelectVarBar] = useState(null);

  const [open, setOpen] = React.useState(false);
  const [selectedLabelId, setSelectedLabelId] = useState(null);

  const handleClickOpen = (id) => {
    setSelectedLabelId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <SLabel>body Width (MM) </SLabel>
              {/* <SNum value={tag.headWidth} max={72} onChange={v => set('headWidth', v)} placeholder={`e.g. 70mm`} /> */}
              <SNum value={tag.headWidth || tag.width} onChange={v => {
                const newValue = Math.min(v, tag.width);
                set('headWidth', newValue);
              }} placeholder={`e.g. 70mm`} />

            </div>
            <div>
              <SLabel>Tail Width (MM) </SLabel>
              {/* <SInput value={tag.width - (tag.headWidth || tag.width)} notwork={1} /> */}
              <div
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '2px solid rgb(229, 231, 235)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  background: 'rgb(255, 255, 255)',
                  transition: 'border-color 0.2s',
                  cursor: "not-allowed"
                }}
              >
                {tag.width - (tag.headWidth || tag.width)}
              </div>

            </div>

          </div>

          <div  >
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Font Familly</div>
            <div style={{ position: 'relative' }} ref={fontRef}>
              <button
                onClick={() => setDropOpen(o => !o)}
                // onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, border: `2px solid ${dropOpen ? '#7c3aed' : '#e5e7eb'}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{fontfamilly}</span>
                </div>
                <div style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}><ChevronDown size={15} /></div>
              </button>
              {dropOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 5px)',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  borderRadius: 11,
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
                  zIndex: 500,
                  overflow: 'hidden'
                }}>
                  {fonts.map((sp, idx) => (
                    <div
                      key={sp}

                      onClick={() => {
                        setFontfamilly(sp);
                        set('tagFontFamilly', sp);
                        setDropOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 13px',
                        cursor: 'pointer',
                        background: fontfamilly === sp ? 'rgb(196, 181, 253)' : '#fff',
                        borderBottom: idx < fonts.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.12s'
                      }}
                      onMouseEnter={e => { if (fontfamilly !== sp) e.currentTarget.style.background = '#f8f9fe'; }}
                      onMouseLeave={e => { if (fontfamilly !== sp) e.currentTarget.style.background = '#fff'; }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: fontfamilly === sp ? 'black' : '#1a1a2e' }}>{sp}</span>
                      {fontfamilly === sp && <span style={{ marginLeft: 'auto', color: '#c8922a', fontSize: 12 }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {tag.width !== '' && tag.height !== '' && (
            <div style={{ background: 'rgb(243, 232, 255)', borderRadius: 9, padding: '8px 12px', fontSize: 11, color: '#6400b8', fontWeight: 600, border: '1px solid #6400b8' }}>
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
                {console.log("tag", tag)}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>select data</div>
                  <div style={{ position: 'relative' }} ref={varQrRef}>
                    <button
                      onClick={() => setDropOpen2(o => !o)}
                      // onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, border: `2px solid ${dropOpen2 ? '#7c3aed' : '#e5e7eb'}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{selecetVarBar?.label || 'Select variable'}</span>
                      </div>
                      <div style={{ transform: dropOpen2 ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}><ChevronDown size={15} /></div>
                    </button>
                    {dropOpen2 && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 5px)',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        borderRadius: 11,
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
                        zIndex: 500,
                        overflow: 'hidden'
                      }}>


                        {tag.selectedSp.variables?.map((sp, idx) => (
                          <div
                            key={sp}
                            onClick={() => { setSelectVarBar(sp); setDropOpen2(false); set('barcodeval', sp); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '10px 13px',
                              cursor: 'pointer',
                              background: selecetVarBar === sp ? 'rgb(196, 181, 253)' : '#fff',
                              borderBottom: idx < fonts.length - 1 ? '1px solid #f1f5f9' : 'none',
                              transition: 'background 0.12s'
                            }}
                            onMouseEnter={e => { if (selecetVarBar !== sp) e.currentTarget.style.background = '#f8f9fe'; }}
                            onMouseLeave={e => { if (selecetVarBar !== sp) e.currentTarget.style.background = '#fff'; }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 700, color: selecetVarBar === sp ? 'black' : '#1a1a2e' }}>{sp.label}</span>
                            {selecetVarBar === sp && <span style={{ marginLeft: 'auto', color: '#c8922a', fontSize: 12 }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
          <div style={{ borderRadius: 10, padding: '11px 12px', border: `2px solid ${tag.showQR ? '#c4b5fd' : '#e5e7eb'}`, background: tag.showQR ? '#faf5ff' : '#f8f9fe', transition: 'all 0.2s' }}>
            <Toggle checked={tag.showQR} onChange={() => set('showQR', !tag.showQR)} label="QR Code" color="#7c3aed" />
            {tag.showQR &&
              <>
                <div style={{ marginTop: 10 }}><SLabel>QR Size ({tag.unit})</SLabel><SNum value={tag.qrSize} onChange={v => set('qrSize', v)} min={5} max={100} />
                </div>
                <div style={{ marginTop: "5px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>select data</div>
                  <div style={{ position: 'relative' }} ref={varBarRef}>
                    <button
                      onClick={() => setDropOpen3(o => !o)}
                      // onFocus={e => e.target.style.borderColor = '#7c3aed'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, border: `2px solid ${dropOpen3 ? '#7c3aed' : '#e5e7eb'}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{selecetVarQr?.label || 'Select variable'}</span>
                      </div>
                      <div style={{ transform: dropOpen3 ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}><ChevronDown size={15} /></div>
                    </button>
                    {dropOpen3 && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 5px)',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        borderRadius: 11,
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
                        zIndex: 500,
                        overflow: 'hidden'
                      }}>


                        {tag.selectedSp.variables?.map((sp, idx) => (
                          <div
                            key={sp}
                            onClick={() => { setSelectVarQr(sp); setDropOpen3(false); set('qrcodeval', sp); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '10px 13px',
                              cursor: 'pointer',
                              background: selecetVarQr === sp ? 'rgb(196, 181, 253)' : '#fff',
                              borderBottom: idx < fonts.length - 1 ? '1px solid #f1f5f9' : 'none',
                              transition: 'background 0.12s'
                            }}
                            onMouseEnter={e => { if (selecetVarQr !== sp) e.currentTarget.style.background = '#f8f9fe'; }}
                            onMouseLeave={e => { if (selecetVarQr !== sp) e.currentTarget.style.background = '#fff'; }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 700, color: selecetVarQr === sp ? 'black' : '#1a1a2e' }}>{sp.label}</span>
                            {selecetVarQr === sp && <span style={{ marginLeft: 'auto', color: '#c8922a', fontSize: 12 }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </>


            }





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
            style={{ width: "70%", flex: 1, padding: '9px 12px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
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
                <div
                  key={pl.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 11px',
                    borderRadius: 10,
                    background: '#f8f9fe',
                    border: '1px solid #e8eaf0'
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 900,
                      color: '#fff',
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </div>

                  <span
                    style={{
                      flex: 1,
                      fontSize: st.fontSize ? Math.min(st.fontSize, 13) : 13,
                      fontWeight: st.fontWeight || 800,
                      color: st.color || '#1a1a2e',
                      fontStyle: st.italic ? 'italic' : 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {pl.text}
                  </span>

                  <button
                    onClick={() => onEditLabel(pl.id)}
                    style={{
                      background: '#ede9fe',
                      border: 'none',
                      borderRadius: 7,
                      padding: '5px 7px',
                      cursor: 'pointer',
                      color: '#7c3aed',
                      display: 'flex'
                    }}
                    title="Customize"
                  >
                    <Edit2 size={11} />
                  </button>

                  <button
                    onClick={() => handleClickOpen(pl.id)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: 7,
                      padding: '5px 7px',
                      cursor: 'pointer',
                      color: '#e63946',
                      display: 'flex'
                    }}
                    title="Remove"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}

            <Dialog open={open} keepMounted onClose={handleClose}>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.20)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                <div
                  style={{
                    width: "380px",
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      padding: "22px 24px"
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#333"
                      }}
                    >
                      Confirm
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        color: "#555"
                      }}
                    >
                      Are you sure you want to remove label
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      borderTop: "1px solid #e0e0e0"
                    }}
                  >
                    <button
                      onClick={() => {
                        onRemoveLabel(selectedLabelId);
                        handleClose();
                      }}
                      style={{
                        flex: 1,
                        padding: "16px 0",
                        fontSize: "17px",
                        fontWeight: 600,
                        background: "#f8f8f8",
                        border: "none",
                        borderRight: "1px solid #e0e0e0",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>

                    <button
                      onClick={handleClose}
                      style={{
                        flex: 1,
                        padding: "16px 0",
                        fontSize: "17px",
                        fontWeight: 600,
                        background: "#f8f8f8",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
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
  const [showConfirm, setShowConfirm] = useState(false);
  const { tags, addTag, updateTag } = useTags();
  const [openAlert, setOpenAlert] = useState(false);

  const [open, setOpen] = React.useState(false);
  const [spData, setSpData] = useState([]);

  // useEffect(() => {


  //   const loadSPData = async (mode) => {
      
      
  //     const data = await fetchDashboardData();
      
  //     console.log("TCL: loadSPData -> ", data)
  //     if (!data?.length) return;

    
  //   console.log("TCL: loadSPData -data> ", data)
  //      const spdetail=data.rd[0];
  //     const firstRow = data.rd1[0];
      
      
  //     const dynamicVariables = Object.entries(firstRow).map(([key, value], index) => ({
  //       id: `${spdetail?.TagSpMasterId}_v${index + 1}`,
  //       label: key,
  //       key: value,
  //       unit: "",
  //     }));

 
  //     setSpData(prev => {
  //       const alreadyExists = prev.some(item => item.id === spdetail?.TagSpMasterId);
  //       if (alreadyExists) return prev;
  //       return [...prev, { id: spdetail?.TagSpMasterId, name: spdetail?.SpName, variables: dynamicVariables }];
  //     });
  //   };

 




  //   loadSPData( );
 

  // }, []);

  useEffect(() => {

    const loadSPData = async () => {
  
      const data = await fetchDashboardData();
  
      console.log("TCL: loadSPData -> ", data);
  
      if (!data?.rd?.length || !data?.rd1?.length) return;
  
      const spdetail = data.rd[0];
  
      // Store all column details
      const dynamicVariables = data.rd1.map((item) => ({
        id: `${spdetail?.TagSpMasterId}_v${item.ColumnId}`,
        columnId: item.ColumnId,
        label: item.DisplayName,
        key: item.ColumnName,
        unit: "",
      }));
  
      // Final SP object
      const spObject = {
        id: spdetail?.TagSpMasterId,
        name: spdetail?.SpName,
        variables: dynamicVariables,
        spDetails: spdetail, // full sp detail
        columns: data.rd1,   // full column list
      };
  
      setSpData((prev) => {
  
        const alreadyExists = prev.some(
          (item) => item.id === spdetail?.TagSpMasterId
        );
  
        if (alreadyExists) return prev;
  
        return [...prev, spObject];
      });
    };
  
    loadSPData();
  
  }, []);


  
  useEffect(() => {
    const html = generateExactTagHTML(
      tag,
      tag.layout || EMPTY_TAG.layout,
      tag.placedVariables,
      tag.placedLabels
    );
    
   
 
    setTag(prev => {
      // Avoid infinite loop: only update if html actually changed
      if (prev.html === html) return prev;
      return { ...prev, html };
    });
  }, [
    tag.width,
    tag.height,
    tag.unit,
    tag.design,
    tag.borderWidth,
    tag.tagFontFamilly,
    tag.showBarcode,
    tag.showQR,
    tag.codeWidth,
    tag.codeHeight,
    tag.qrSize,
    tag.barcodeval,
    tag.qrcodeval,
    tag.layout,
    tag.placedVariables,
    tag.placedLabels,
  ]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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



  const resetLayout = () => {

    setTag(prev => ({
      ...prev,
      layout: EMPTY_TAG.layout,
      placedVariables: [],
      placedLabels: []
    }));
  };



  const placeVariable = (spId, varId, varval, varLabel) => {
    setTag(prev => {
      const START_X = 5;      // first column start
      const START_Y = 5;      // first row start
      const GAP_Y = 14;       // vertical spacing
      const GAP_X = 18;       // column spacing

      const MAX_Y = 90;       // bottom limit

      const total = prev.placedVariables.length;

      // How many items fit in one column
      const itemsPerColumn = Math.floor((MAX_Y - START_Y) / GAP_Y) + 1;

      const columnIndex = Math.floor(total / itemsPerColumn);
      const rowIndex = total % itemsPerColumn;

      const x = START_X + columnIndex * GAP_X;
      const y = START_Y + rowIndex * GAP_Y;

      return {
        ...prev,
        placedVariables: [
          ...prev.placedVariables,
          {
            instanceId: `${spId}_${varId}_${Date.now()}`,
            spId,
            varId,
            varval: varval !== undefined && varval !== null ? String(varval) : "",  // ← convert to string, handles 0
            varLabel: varLabel || "",   // ← store label too for easy access
            x,
            y,
            style: makeVarStyle(),
          }
        ],
      };
    });
  };
  // const removePlaced = instanceId => setTag(p => ({ ...p, placedVariables: p.placedVariables.filter(pv => pv.instanceId !== instanceId) }));
  const removePlaced = (instanceId) => {
    // const confirmDelete = window.confirm('Are you sure you want to remove this item?');
    // if (!confirmDelete) return;

    setTag(prev => ({
      ...prev,
      placedVariables: prev.placedVariables.filter(
        pv => pv.instanceId !== instanceId
      )
    }));
  };
  const updateVarStyle = (instanceId, style) => setTag(p => ({ ...p, placedVariables: p.placedVariables.map(pv => pv.instanceId === instanceId ? { ...pv, style } : pv) }));

  // const addLabel = text => {
  //   setTag(p => {
  //     const total = p.placedLabels.length;
  //     const col = total % 6;
  //     const row = Math.floor(total / 6);
  //     const x = Math.min(5 + col * 14, 80);
  //     const y = Math.min(10 + row * 18, 80);
  //     return {
  //       ...p,
  //       placedLabels: [...p.placedLabels, {
  //         id: 'lbl_' + Date.now(),
  //         text,
  //         x, y,
  //         style: makeLabelStyle(),
  //       }],
  //     };
  //   });
  // };

  const addLabel = (text) => {
    setTag(prev => {
      const START_X = 5;      // first column start
      const START_Y = 10;
      const GAP_Y = 12;
      const COLUMN_WIDTH = 22;  // 👈 horizontal spacing between columns
      const MAX_Y = 90;

      const total = prev.placedLabels.length;

      const itemsPerColumn =
        Math.floor((MAX_Y - START_Y) / GAP_Y) + 1;

      const columnIndex = Math.floor(total / itemsPerColumn);
      const rowIndex = total % itemsPerColumn;

      const x = START_X + columnIndex * COLUMN_WIDTH;
      const y = START_Y + rowIndex * GAP_Y;

      return {
        ...prev,
        placedLabels: [
          ...prev.placedLabels,
          {
            id: 'lbl_' + Date.now(),
            text,
            x,
            y,
            style: makeLabelStyle(),
          }
        ],
      };
    });
  };
  const removeLabel = id => setTag(p => ({ ...p, placedLabels: p.placedLabels.filter(pl => pl.id !== id) }));
  const updateLabel = updated => setTag(p => ({ ...p, placedLabels: p.placedLabels.map(pl => pl.id === updated.id ? updated : pl) }));

  const handleButtonClickSaveEdit = () => {
    if (!tag.name.trim()) {

      setOpenAlert(true);
      return;
    }

    if (isEdit) {
      // updateTag(tag.id, tag);
      updateTag(tag.id, tag);
      SaveApi(tag );
    } else {
      addTag(tag);
      SaveApi(tag);
    }

    setSaved(true);

    setTimeout(() => {
      onNavigate?.('list');
    }, 900);
  };

  const editingVarInstance = editingVarInstanceId ? tag.placedVariables.find(pv => pv.instanceId === editingVarInstanceId) : null;
  const editingVarDef = editingVarInstance ? spData.find(s => s.id === editingVarInstance.spId)?.variables.find(v => v.id === editingVarInstance.varId) : null;
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
        {/* <div style={{ background: 'linear-gradient(to right, #6400b8, #8d0096)', padding: '0 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.22)', position: 'sticky', top: 0, zIndex: 200, flexShrink: 0 }}> */}
        <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className='reset-btn' onClick={() => onNavigate?.('list')} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 10, padding: '7px 13px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 12, fontWeight: 600 }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {/* <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#c8922a,#e8b84b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TagIcon size={17} color="#fff" /></div> */}
            <div>
              <h1 style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 700 }}>{isEdit ? 'Edit Tag' : 'Create New Tag'}</h1>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className='reset-btn' onClick={handleClickOpen} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              <RotateCcw size={13} /> Reset

            </button>

            <Dialog
              open={open}

              keepMounted
              onClose={handleClose}
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle>{"Use Google's location service?"}</DialogTitle>

              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                <div
                  style={{
                    width: "380px",
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      padding: "22px 24px"
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#333"
                      }}
                    >
                      Confirm
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        color: "#555"
                      }}
                    >
                      Are you sure you want to reset the tag
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      borderTop: "1px solid #e0e0e0"
                    }}
                  >
                    <button


                      onClick={() => { handleClose(); resetLayout(); }}
                      style={{
                        flex: 1,
                        padding: "16px 0",
                        fontSize: "17px",
                        fontWeight: 600,
                        background: "#f8f8f8",
                        border: "none",
                        borderRight: "1px solid #e0e0e0",
                        cursor: "pointer"
                      }}
                    >
                      Reset
                    </button>

                    <button
                      onClick={() => { handleClose() }}

                      style={{
                        flex: 1,
                        padding: "16px 0",
                        fontSize: "17px",
                        fontWeight: 600,
                        background: "#f8f8f8",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
            {/* <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 7, background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#c8922a,#e8b84b)', border: 'none', borderRadius: 11, padding: '9px 20px', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,146,42,0.4)', transition: 'all 0.3s', fontFamily: 'inherit' }}>
              <Save size={14} />{saved ? 'Saved! ✓' : isEdit ? 'Update Tag' : 'Save Tag'}
            </button> */}
            <Snackbar
              open={openAlert}
              autoHideDuration={3000}
              onClose={() => setOpenAlert(false)}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert severity="warning" variant="filled">
                Please enter a tag name.
              </Alert>
            </Snackbar>
            <button className='reset-btn' onClick={handleButtonClickSaveEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Save size={14} />{saved ? 'Saved! ✓' : isEdit ? 'Update Tag' : 'Save Tag'}
            </button>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr 280px ', minHeight: 0, height: 'calc(100vh - 62px)' }}>

        {/* Panel 2 */}
        <div style={{ background: '#f8f9fe', borderRight: '2px solid #f0f2f8', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #e8eaf0', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: '#fff' }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgb(243, 232, 255)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#6400b8" }}><Settings2 size={12} color="#c8922a" /></div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Settings</h2>
          </div>
          <div style={{ height: '83vh' }}>
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
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgb(243, 232, 255)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: "#6400b8" }}><MoveIcon size={12} color="#6400b8" /></div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Live Preview Canvas</h2>
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
              spData={spData}
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

        {/* Panel 1 */}
        <div style={{ background: '#fff', borderRight: '2px solid #f0f2f8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f0f2f8', borderLeft: "2px solid rgb(232, 234, 240)", display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgb(243, 232, 255)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TagIcon size={12} color="#6400b8" /></div>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Variable List</h2>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#6400b8', background: 'rgb(243, 232, 255)', padding: '2px 8px', borderRadius: 10 }}>{tag.placedVariables.length} placed</span>
          </div>
          <div className='Panel1_overflow' style={{ flex: 1, overflowY: 'auto' }}>
            {/* {console.log("placedVariables:", tag.placedVariables)} */}

            <Panel1Variables
              tag={tag}
              placedVariables={tag.placedVariables}
              onPlace={placeVariable}
              onRemovePlaced={removePlaced}
              onEditInstance={setEditingVarInstanceId}
              spData={spData}

            />
          </div>

        </div>
      </div>
    </div>
  );
}