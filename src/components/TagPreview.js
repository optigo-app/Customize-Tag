import React from 'react';

const MM_TO_PX = 3.78;
const INCH_TO_PX = 96;

function toPx(value, unit) {
  return unit === 'inch' ? value * INCH_TO_PX : value * MM_TO_PX;
}
 
// ─── Design 1: Classic dark header ───────────────────────────────────────────
function DesignTag1({ tag, scale }) {
  const f = (n) => tag.fontSize * scale * n;
  return (
    <div style={{
      width: '100%', height: '100%',
      border: `${tag.borderWidth}px solid #6400b8`,
      borderRadius: 4, background: '#fff',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>

      <div style={{ flex: 1, padding: `${scale * 1.5}px ${scale * 5}px`, overflow: 'hidden' }}>
        {(tag.placedVariables || []).map((v) => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: f(0.78), borderBottom: '1px dashed #e5e7eb', padding: '1px 0' }}>
            <span style={{ color: '#666', fontFamily: 'Georgia, serif' }}>{v.varId}:</span>
            <span style={{ fontWeight: 700, color: '#6400b8', fontFamily: 'Georgia, serif' }}>{v.value}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: f(0.65), background: '#f5f5f5', padding: '2px 0', color: '#555', fontFamily: 'monospace' }}>
        {tag.codeType === 'qr' ? '▣ QR CODE' : '|||||||||| BARCODE ||||||||||'}
      </div>
    </div>
  );
}

// ─── Design 2: Gold luxury ───────────────────────────────────────────────────
function DesignTag2({ tag, scale }) {
  const f = (n) => tag.fontSize * scale * n;
  return (
    <div style={{
      width: '100%', height: '100%',
      border: `${tag.borderWidth}px solid #6400b8`,
      borderRadius: 8, background: 'linear-gradient(135deg, #fffdf5 60%, #fef3dc)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ flex: 1, padding: `${scale * 1.5}px ${scale * 5}px`, overflow: 'hidden' }}>
        {(tag.variables || []).map((v) => (
          <div key={v.id} style={{ fontSize: f(0.78), color: '#7a5c1e', fontFamily: 'Georgia, serif', marginBottom: 1 }}>
            <b>{v.label}:</b> {v.value}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: f(0.65), color: '#6400b8', padding: '2px 0' }}>
        {tag.codeType === 'qr' ? '▣ QR' : '||| BARCODE |||'}
      </div>
    </div>
  );
}

// ─── Design 3: Sidebar accent ────────────────────────────────────────────────
function DesignTag3({ tag, scale }) {
  const f = (n) => tag.fontSize * scale * n;
  return (
    <div style={{
      width: '100%', height: '100%',
      border: `${tag.borderWidth}px solid #2d6a4f`,
      background: '#fff', display: 'flex',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ width: '28%', background: '#2d6a4f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: f(0.7), fontWeight: 900, fontFamily: 'monospace', writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {tag.name || 'TAG'}
        </span>
      </div>
      <div style={{ flex: 1, padding: `${scale * 2}px ${scale * 3}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        <div>
          {(tag.variables || []).map((v) => (
            <div key={v.id} style={{ fontSize: f(0.78), fontFamily: 'monospace', color: '#2d6a4f', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {v.label}: <b>{v.value}</b>
            </div>
          ))}
        </div>
        <div style={{ fontSize: f(0.65), color: '#888', fontFamily: 'monospace' }}>
          {tag.codeType === 'qr' ? '[QR]' : '[=====BAR=====]'}
        </div>
      </div>
    </div>
  );
}

// ─── Design 4: Bold vibrant ──────────────────────────────────────────────────
function DesignTag4({ tag, scale }) {
  const f = (n) => tag.fontSize * scale * n;
  return (
    <div style={{
      width: '100%', height: '100%',
      border: `${tag.borderWidth}px solid #e63946`,
      borderRadius: 10, background: 'linear-gradient(160deg, #fff0f0 0%, #fff 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', overflow: 'hidden',
      boxSizing: 'border-box', padding: `${scale * 3}px`,
    }}>
      <div style={{ fontWeight: 900, fontFamily: '"Arial Black", sans-serif', color: '#e63946', fontSize: f(1), letterSpacing: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {tag.name || 'TAG'}
      </div>
      <div style={{ width: '90%', height: 1, background: '#e63946', margin: '2px 0' }} />
      {(tag.variables || []).map((v) => (
        <div key={v.id} style={{ fontSize: f(0.78), color: '#333', fontFamily: 'Arial, sans-serif', width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <b style={{ color: '#e63946' }}>{v.label}</b>: {v.value}
        </div>
      ))}
      <div style={{ marginTop: 'auto', fontSize: f(0.65), color: '#e63946' }}>
        {tag.codeType === 'qr' ? '◼ QR' : '⊟ BARCODE'}
      </div>
    </div>
  );
}

export const DESIGN_COMPONENTS = {
  tag1: DesignTag1,
  tag2: DesignTag2,
  tag3: DesignTag3,
  tag4: DesignTag4,
};

export default function TagPreview({ tag, maxWidth = 320, maxHeight = 220 }) {
  const rawW = toPx(tag.width || 60, tag.unit || 'mm');
  const rawH = toPx(tag.height || 30, tag.unit || 'mm');

  // Scale to fit, allow up to 2× for small tags so they look big in preview

  
  console.log("TCL: TagPreview -> tag", tag)
  const scaleW = maxWidth / rawW;
  const scaleH = maxHeight / rawH;
  const scale = Math.min(scaleW, scaleH, 2.2);

  const dispW = rawW * scale;
  const dispH = rawH * scale;
  
  console.log("TCL: TagPreview -> tag", tag)
  const DesignComponent = DESIGN_COMPONENTS[tag.design] || DesignTag1;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: maxWidth, height: maxHeight,
    }}>
      <div style={{
        width: dispW, height: dispH,
        flexShrink: 0,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        borderRadius: 4,
      }}>
        <DesignComponent tag={tag} scale={scale} />
      </div>
    </div>
  );
}