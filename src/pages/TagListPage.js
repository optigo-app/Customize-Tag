import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Tag, X, Copy, Eye } from 'lucide-react';
import { useTags } from '../context/TagContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import TagPreview from '../components/TagPreview';
import CommonAPI from '../api/api';
import { Snackbar, Alert } from "@mui/material";

const DESIGN_COLORS = {
  tag1: '#1a1a2e', tag2: '#c8922a', tag3: '#2d6a4f', tag4: '#e63946',
};

const extractStyleValue = (style, key) => {
  const match = style?.match(new RegExp(`${key}\\s*:\\s*([^;]+)`, 'i'));
  return match?.[1]?.trim();
};

const parseHtmlTemplateToCustomizeData = (html) => {
  if (!html) return {};

  const rootStyle = html.match(/<div\s+style=['"]([^'"]*)['"]/i)?.[1] || '';
  const widthMatch = extractStyleValue(rootStyle, 'width')?.match(/^([\d.]+)(mm|in)?$/i);
  const heightMatch = extractStyleValue(rootStyle, 'height')?.match(/^([\d.]+)(mm|in)?$/i);
  const borderMatch = extractStyleValue(rootStyle, 'border')?.match(/([\d.]+)px/i);
  const fontFamily = extractStyleValue(rootStyle, 'font-family') || '';
  const beforeLabels = html.split('<!-- LABELS -->')[0] || html;
  const placedLabels = [];
  const textDivRegex = /<div\s+style=['"]([^'"]*)['"]\s*>\s*([^<]*?)\s*<\/div>/gi;
  let textMatch;

  while ((textMatch = textDivRegex.exec(beforeLabels)) !== null) {
    const style = textMatch[1];
    const text = textMatch[2]?.trim();
    const left = extractStyleValue(style, 'left')?.replace('%', '');
    const top = extractStyleValue(style, 'top')?.replace('%', '');
    const fontSize = extractStyleValue(style, 'font-size')?.replace('px', '');
    const fontWeight = extractStyleValue(style, 'font-weight');
    const color = extractStyleValue(style, 'color');

    if (text && left !== undefined && top !== undefined) {
      placedLabels.push({
        id: `label_${placedLabels.length + 1}_${Date.now()}`,
        text,
        x: Number(left) || 0,
        y: Number(top) || 0,
        style: {
          fontSize: Number(fontSize) || 11,
          fontWeight: fontWeight || '800',
          color: color || '#1a1a2e',
          bg: 'transparent',
          italic: false
        }
      });
    }
  }

  const qrBlock = html.match(/<!-- QR -->([\s\S]*)/i)?.[1] || '';
  const qrStyle = qrBlock.match(/<div\s+style=['"]([^'"]*)['"]/i)?.[1] || '';
  const qrWidth = extractStyleValue(qrStyle, 'width')?.match(/^([\d.]+)/)?.[1];
  const qrLeft = extractStyleValue(qrStyle, 'left')?.replace('%', '');
  const qrTop = extractStyleValue(qrStyle, 'top')?.replace('%', '');

  return {
    width: widthMatch?.[1] || undefined,
    height: heightMatch?.[1] || undefined,
    unit: widthMatch?.[2] || heightMatch?.[2] || 'mm',
    borderWidth: borderMatch?.[1] || undefined,
    tagFontFamilly: fontFamily,
    showQR: /<!-- QR -->[\s\S]*<svg/i.test(html),
    qrSize: qrWidth || undefined,
    placedLabels,
    layout: {
      title: { x: 5, y: 3 },
      barcode: { x: 5, y: 76 },
      qr: {
        x: Number(qrLeft) || 55,
        y: Number(qrTop) || 76
      }
    }
  };
};



const mapApiTagToCustomizeTag = (tag, detail) => {
  const rd = detail?.rd?.[0] || tag;
  const rd1 = detail?.rd1?.[0] || {};
  const rd2 = detail?.rd2 || [];
  const rd3 = detail?.rd3 || [];

  const tagMasterId = rd?.id || rd?.TagMasterId || tag?.TagMasterId || tag?.id;
  const tagName = rd?.tagname || rd?.TagName || tag?.tagname || '';
  const htmlTemplate = rd?.HtmlTemplate || tag?.HtmlTemplate || '';

  // spData is built with id = TagSpMasterId (from fetchDashboardData → data.rd[0].TagSpMasterId)
  // variables inside spData have id = `${TagSpMasterId}_v${item.ColumnId}`
  // We don't know TagSpMasterId here yet — so we store a PENDING marker
  // and resolve it inside CustomizeTagPage after spData loads.
  // We store the raw column name (key) so we can match later.

  const placedVariables = rd2.map((v, idx) => {
    const rawKey = v.VariableName?.replace(/\{\{|\}\}/g, '').trim() || '';

    // ← use saved PosX/PosY if available, else fallback to auto-layout
    const hasSavedPos = v.PosX !== null && v.PosX !== undefined && v.PosY !== null;

    let x, y;
    if (hasSavedPos) {
      x = Number(v.PosX);
      y = Number(v.PosY);
    } else {
      const START_X = 5, START_Y = 5, GAP_Y = 14, GAP_X = 18, MAX_Y = 90;
      const itemsPerColumn = Math.floor((MAX_Y - START_Y) / GAP_Y) + 1;
      const colIdx = Math.floor(idx / itemsPerColumn);
      const rowIdx = idx % itemsPerColumn;
      x = START_X + colIdx * GAP_X;
      y = START_Y + rowIdx * GAP_Y;
    }

    return {
      instanceId: `var_edit_${v.id || idx}`,
      spId: '__PENDING__',
      varId: '__PENDING__',
      _rawKey: rawKey,
      varval: rawKey,
      varLabel: v.SpcolumnName || rawKey,
      x,
      y,
      style: {
        fontSize: v.FontSize || 10,
        fontWeight: String(v.Weight || '700'),
        color: '#1a1a2e',
        unit: v.Unit || '',
        decimal: v.Decimal ?? 0,
        trim: v.Trim ?? 0,
        roundOff: !!v.RoundOff,
      },
    };
  });

  const placedLabels = rd3.map((l, idx) => {
    const hasSavedPos = l.PosX !== null && l.PosX !== undefined && l.PosY !== null;

    let x, y;
    if (hasSavedPos) {
      x = Number(l.PosX);
      y = Number(l.PosY);
    } else {
      const START_X = 5, START_Y = 10, GAP_Y = 12, COLUMN_WIDTH = 22, MAX_Y = 90;
      const itemsPerColumn = Math.floor((MAX_Y - START_Y) / GAP_Y) + 1;
      const colIdx = Math.floor(idx / itemsPerColumn);
      const rowIdx = idx % itemsPerColumn;
      x = START_X + colIdx * COLUMN_WIDTH;
      y = START_Y + rowIdx * GAP_Y;
    }

    return {
      id: `lbl_edit_${l.id || idx}`,
      text: l.LableTitle || '',
      x,
      y,
      style: {
        fontSize: l.FontSize || 11,
        fontWeight: String(l.Weight || '800'),
        color: '#1a1a2e',
        bg: 'transparent',
        italic: !!l.Italic,
      },
    };
  });

  const barcodeKey = rd1?.BarcodeData || '';
  const qrKey = rd1?.QrData || '';
  const barcodeVarDef = rd2.find(v => v.VariableName?.replace(/\{\{|\}\}/g, '').trim() === barcodeKey);
  const qrVarDef = rd2.find(v => v.VariableName?.replace(/\{\{|\}\}/g, '').trim() === qrKey);

  return {
    id: tagMasterId,
    TagMasterId: tagMasterId,
    name: tagName,
    tagname: tagName,
    html: htmlTemplate,
    design: rd1?.Design || tag?.design || 'tag1',  // ← was: tag?.design || 'tag1'
    unit: rd1?.TagUnitId === 2 ? 'inch' : 'mm',  // ← already there, confirm rd1 is not empty
    width: String(rd1?.Width || '120'),
    height: String(rd1?.Height || '35'),
    fontSize: rd1?.FontPt || 10,
    borderWidth: rd1?.BorderPx || 1,
    headWidth: rd1?.BodyWidth > 0 ? String(rd1.BodyWidth) : '',
    tagFontFamilly: getFontNameById(rd1?.FontFamilyId),
    showBarcode: rd1?.showBarcode ?? false,
    showQR: rd1?.showQr ?? false,
    codeWidth: rd1?.BarcodeWidth || 30,
    codeHeight: rd1?.BarcodeHeight || 10,
    qrSize: rd1?.QrWidth || 12,
    barcodeval: barcodeKey
      ? { id: barcodeVarDef?.id, key: barcodeKey, label: barcodeVarDef?.SpcolumnName || barcodeKey }
      : '',
    qrcodeval: qrKey
      ? { id: qrVarDef?.id, key: qrKey, label: qrVarDef?.SpcolumnName || qrKey }
      : '',
    placedVariables,
    placedLabels,
    selectedSp: tag?.selectedSp || '',
    layout: {
      title: { x: 5, y: 3 },
      barcode: {
        x: rd1?.BarcodeX ?? 5,
        y: rd1?.BarcodeY ?? 76,
      },
      qr: {
        x: rd1?.QrX ?? 55,
        y: rd1?.QrY ?? 76,
      },
    },
  };
};

function getFontNameById(id) {
  const map = { 1: 'Arial', 2: 'Helvetica', 3: 'Calibri', 4: 'Verdana', 5: 'Roboto' };
  return map[id] || 'Calibri';
}

export default function TagListPage({ onNavigate }) {
  const { tags, deleteTag, addTag } = useTags();
  const [allTagData, setAllTagData] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const filtered = allTagData?.filter((t) =>
    (t.tagname || '').toLowerCase().includes(search.toLowerCase())
  );

  const fetchData = async () => {
    try {
      const body = {
        con: JSON.stringify({
          mode: "GETTAG",
          appuserid: "user@eg.com",
          IPAddress: "103.206.139.196",
        }),
        p: JSON.stringify({
          SearchText: "",
          PageSize: 10,
          CurrentPage: 1,
        }),
        f: "TagManagement",
      };

      const response = await CommonAPI(body, 164);
      if (response?.Data) {
        setAllTagData(response?.Data?.rd || [])
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTag = async () => {
    const tagMasterId = deleteTarget?.TagMasterId || deleteTarget?.tagmasterid || deleteTarget?.id;

    if (!tagMasterId) {
      setToast({ open: true, message: 'Tag id not found. Delete failed.', severity: 'error' });
      setDeleteTarget(null);
      return;
    }

    setDeleteLoading(true);

    try {
      const body = {
        con: JSON.stringify({
          mode: "DELETETAG",
          appuserid: "user@eg.com",
          IPAddress: "103.206.139.196",
        }),
        p: JSON.stringify({
          TagMasterId: tagMasterId,
        }),
        f: "TagManagement",
      };

      const response = await CommonAPI(body, 164);
      const isSuccess = response?.Status === '200' || response?.Status === 200 || response?.Data;

      if (isSuccess) {
        deleteTag(deleteTarget.id);
        setAllTagData((prev) => prev.filter((tag) => {
          const currentId = tag?.TagMasterId || tag?.tagmasterid || tag?.id;
          return currentId !== tagMasterId;
        }));
        setToast({ open: true, message: 'Tag deleted successfully.', severity: 'success' });
      } else {
        setToast({ open: true, message: response?.Message || 'Delete failed. Please try again.', severity: 'error' });
      }
    } catch (error) {
      console.error("API Error:", error);
      setToast({ open: true, message: 'Delete failed. Please try again.', severity: 'error' });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleEditTag = async (tag) => {
    const tagMasterId = tag?.TagMasterId || tag?.tagmasterid || tag?.id;
    if (!tagMasterId) {
      setToast({ open: true, message: 'Tag id not found. Edit failed.', severity: 'error' });
      return;
    }
    setEditLoadingId(tagMasterId);
    try {
      const body = {
        con: JSON.stringify({ mode: "GETTAG", appuserid: "user@eg.com", IPAddress: "103.206.139.196" }),
        p: JSON.stringify({ TagMasterId: tagMasterId }),
        f: "TagManagement",
      };
      const response = await CommonAPI(body, 164);
      const detail = response?.Data; // contains rd, rd1, rd2, rd3
      // ↓ pass full detail (rd/rd1/rd2/rd3) as second arg
      onNavigate('customize', mapApiTagToCustomizeTag(tag, detail));
    } catch (error) {
      console.error("API Error:", error);
      setToast({ open: true, message: 'Edit data load failed.', severity: 'error' });
    } finally {
      setEditLoadingId(null);
    }
  };

  const cloneTag = (tag) => {
    const newTag = {
      ...tag,
      id: Date.now().toString(),
      name: tag.name + " Copy"
    };

    addTag(newTag);
  };

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
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
                onEdit={() => handleEditTag(tag)}
                onDelete={() => setDeleteTarget(tag)}
                onClone={() => cloneTag(tag)}
                designColor={'#6400b8'}
                editLoading={editLoadingId === (tag?.TagMasterId || tag?.tagmasterid || tag?.id)}
              />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          tag={deleteTarget}
          onConfirm={handleDeleteTag}
          onCancel={() => {
            if (!deleteLoading) {
              setDeleteTarget(null);
            }
          }}
          loading={deleteLoading}
        />
      )}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}


function TagCard({ tag, onEdit, onDelete, onClone, designColor, editLoading }) {
  const [hovered, setHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);  // ← ADD

  const MM_TO_PX = 3.7795275591;
  const rawW = (Number(tag?.width) || 60) * MM_TO_PX;
  const rawH = (Number(tag?.height) || 30) * MM_TO_PX;


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

      <div style={{ flex: 1, minWidth: 120 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{tag.tagname}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <Chip label={`${tag.width} × ${tag.height} ${tag.unit}`} color={designColor} />
          <Chip label={tag.design?.toUpperCase()} color={designColor} />
          <Chip label={tag.codeType?.toUpperCase()} color={designColor} />
          <Chip label={`${tag.TotalRecords || 0} Variables`} color={designColor} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <ActionBtn
          icon={<Eye size={16} />}
          label="Preview"
          color="#6400b8"
          onClick={() => setShowPreview(true)}
        />
        <ActionBtn icon={<Pencil size={16} />} label={editLoading ? "Loading..." : "Edit"} color="#3b82f6" onClick={onEdit} disabled={editLoading} />
        <ActionBtn
          icon={<Copy size={16} />}
          label="Clone"
          color="#10b981"
          onClick={onClone}
        />

        <ActionBtn icon={<Trash2 size={16} />} label="Delete" color="#e63946" onClick={onDelete} />
      </div>

      {showPreview && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, fontFamily: '"DM Sans", sans-serif',
        }}
          onClick={() => setShowPreview(false)}
        >
          <div style={{
            background: '#fff', borderRadius: 16, minWidth: 620,
            overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #f0f2f8',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
                  Tag Preview
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {tag.tagname} &nbsp;·&nbsp; {tag.width} × {tag.height} {tag.unit}
                </div>
              </div>
              <button onClick={() => setShowPreview(false)}
                style={{
                  background: '#f1f5f9', border: 'none', borderRadius: 8,
                  padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: '#64748b'
                }}>
                ✕
              </button>
            </div>

            {/* Tag render area */}
            <div style={{
              padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'repeating-conic-gradient(#dde3ec 0% 25%,#eef0f6 0% 50%) 0 0/18px 18px',
              minHeight: 200,
            }}>
              <div style={{
                overflow: 'hidden', borderRadius: 6,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                width: Math.min(rawW * 0.8, 500),
                height: Math.min(rawH * 0.8, 300),
              }}>
                <div style={{
                  transform: `scale(${Math.min(500 / rawW, 300 / rawH, 0.8)})`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none',

                }}
                  dangerouslySetInnerHTML={{ __html: tag?.HtmlTemplate || tag?.html || '' }}
                />
              </div>
            </div>

            {/* Info bar */}
            <div style={{
              padding: '10px 20px', background: '#f8f9fe',
              borderTop: '1px solid #f0f2f8', display: 'flex', gap: 16,
              flexWrap: 'wrap', fontSize: 12, color: '#64748b'
            }}>
              <span>📐 {tag.width} × {tag.height} {tag.unit}</span>
              <span>🔤 {tag.tagFontFamilly || 'Calibri'}</span>
              {tag.showBarcode && <span>▦ Barcode</span>}
              {tag.showQR && <span>▣ QR Code</span>}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px', borderTop: '1px solid #f0f2f8',
              display: 'flex', justifyContent: 'flex-end', gap: 10
            }}>
              <button onClick={() => setShowPreview(false)}
                style={{
                  padding: '9px 18px', borderRadius: 10, border: '2px solid #e5e7eb',
                  background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13
                }}>
                Close
              </button>
              <button onClick={() => { setShowPreview(false); onEdit(); }}
                style={{
                  padding: '9px 18px', borderRadius: 10, border: 'none',
                  background: '#6400b8', color: '#fff', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13
                }}>
                ✏ Edit Tag
              </button>
            </div>
          </div>
        </div>
      )}
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

function ActionBtn({ icon, label, color, onClick, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 10, border: `2px solid ${color}30`,
        background: hov ? color : color + '10', color: hov ? '#fff' : color,
        fontWeight: 600, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        fontFamily: '"DM Sans", sans-serif',
        opacity: disabled ? 0.7 : 1,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {icon} {label}
    </button>
  );
}