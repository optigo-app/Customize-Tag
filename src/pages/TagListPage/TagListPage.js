import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Tag, X, Copy, Eye, ScanLine, AlertCircle } from 'lucide-react';
import { Snackbar, Alert } from "@mui/material";
import './TagListPage.scss';
import { decodeHtmlSafe } from '../../api/SaveApi';
import { useTags } from '../../context/TagContext';
import CommonAPI from '../../api/api';
import generateBarcodeSVG from '../../components/generateBarcodeSVG';
import generateQRCodeSVG from '../../components/generateQRCodeSVG';
import TagPreview from '../../components/TagPreview';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const MM_TO_PX = 3.7795275591;

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
        text, x: Number(left) || 0, y: Number(top) || 0,
        style: { fontSize: Number(fontSize) || 11, fontWeight: fontWeight || '800', color: color || '#1a1a2e', bg: 'transparent', italic: false },
      });
    }
  }
  const qrBlock = html.match(/<!-- QR -->([\s\S]*)/i)?.[1] || '';
  const qrStyle = qrBlock.match(/<div\s+style=['"]([^'"]*)['"]/i)?.[1] || '';
  const qrWidth = extractStyleValue(qrStyle, 'width')?.match(/^([\d.]+)/)?.[1];
  const qrLeft = extractStyleValue(qrStyle, 'left')?.replace('%', '');
  const qrTop = extractStyleValue(qrStyle, 'top')?.replace('%', '');
  return {
    width: widthMatch?.[1] || undefined, height: heightMatch?.[1] || undefined,
    unit: widthMatch?.[2] || heightMatch?.[2] || 'mm',
    borderWidth: borderMatch?.[1] || undefined, tagFontFamilly: fontFamily,
    showQR: /<!-- QR -->[\s\S]*<svg/i.test(html), qrSize: qrWidth || undefined,
    placedLabels,
    layout: { title: { x: 5, y: 3 }, barcode: { x: 5, y: 76 }, qr: { x: Number(qrLeft) || 55, y: Number(qrTop) || 76 } },
  };
};

const mapApiTagToCustomizeTag = (tag, detail) => {
  const rd = detail?.rd?.[0] || tag;
  const rd1 = detail?.rd1?.[0] || {};
  const rd2 = detail?.rd2 || [];
  const rd3 = detail?.rd3 || [];
  const tagMasterId = rd?.id || rd?.TagMasterId || tag?.TagMasterId || tag?.id;
  const tagName = rd?.tagname || rd?.TagName || tag?.tagname || '';
  const htmlTemplate = decodeHtmlSafe(rd?.HtmlTemplate || tag?.HtmlTemplate || '');
  const placedVariables = rd2.map((v, idx) => {
    const rawKey = v.VariableName?.replace(/\{\{|\}\}/g, '').trim() || '';
    const hasSavedPos = v.PosX !== null && v.PosX !== undefined && v.PosY !== null;
    let x, y;
    if (hasSavedPos) { x = Number(v.PosX); y = Number(v.PosY); }
    else {
      const START_X = 5, START_Y = 5, GAP_Y = 14, GAP_X = 18, MAX_Y = 90;
      const itemsPerColumn = Math.floor((MAX_Y - START_Y) / GAP_Y) + 1;
      const colIdx = Math.floor(idx / itemsPerColumn);
      const rowIdx = idx % itemsPerColumn;
      x = START_X + colIdx * GAP_X; y = START_Y + rowIdx * GAP_Y;
    }
    return {
      instanceId: `var_edit_${v.id || idx}`, spId: '__PENDING__', varId: '__PENDING__',
      _rawKey: rawKey, varval: rawKey, varLabel: v.SpcolumnName || rawKey, x, y,
      style: { fontSize: v.FontSize || 10, fontWeight: String(v.Weight || '700'), color: '#1a1a2e', unit: v.Unit || '', decimal: v.Decimal ?? 0, trim: v.Trim ?? 0, roundOff: !!v.RoundOff },
    };
  });
  const placedLabels = rd3.map((l, idx) => {
    const hasSavedPos = l.PosX !== null && l.PosX !== undefined && l.PosY !== null;
    let x, y;
    if (hasSavedPos) { x = Number(l.PosX); y = Number(l.PosY); }
    else {
      const START_X = 5, START_Y = 10, GAP_Y = 12, COLUMN_WIDTH = 22, MAX_Y = 90;
      const itemsPerColumn = Math.floor((MAX_Y - START_Y) / GAP_Y) + 1;
      const colIdx = Math.floor(idx / itemsPerColumn);
      const rowIdx = idx % itemsPerColumn;
      x = START_X + colIdx * COLUMN_WIDTH; y = START_Y + rowIdx * GAP_Y;
    }
    return {
      id: `lbl_edit_${l.id || idx}`, text: l.LableTitle || '', x, y,
      style: { fontSize: l.FontSize || 11, fontWeight: String(l.Weight || '800'), color: '#1a1a2e', bg: 'transparent', italic: !!l.Italic },
    };
  });
  const barcodeKey = rd1?.BarcodeData || '';
  const qrKey = rd1?.QrData || '';
  const barcodeVarDef = rd2.find(v => v.VariableName?.replace(/\{\{|\}\}/g, '').trim() === barcodeKey);
  const qrVarDef = rd2.find(v => v.VariableName?.replace(/\{\{|\}\}/g, '').trim() === qrKey);
  return {
    id: tagMasterId, TagMasterId: tagMasterId, name: tagName, tagname: tagName,
    html: htmlTemplate, design: rd1?.Design || tag?.design || 'tag1',
    unit: rd1?.TagUnitId === 2 ? 'inch' : 'mm',
    width: String(rd1?.Width || '120'), height: String(rd1?.Height || '35'),
    fontSize: rd1?.FontPt || 10, borderWidth: rd1?.BorderPx || 1,
    headWidth: rd1?.BodyWidth > 0 ? String(rd1.BodyWidth) : '',
    tagFontFamilly: getFontNameById(rd1?.FontFamilyId),
    showBarcode: rd1?.showBarcode ?? false, showQR: rd1?.showQr ?? false,
    codeWidth: rd1?.BarcodeWidth || 30, codeHeight: rd1?.BarcodeHeight || 10,
    qrSize: rd1?.QrWidth || 12,
    barcodeval: barcodeKey ? { id: barcodeVarDef?.id, key: barcodeKey, label: barcodeVarDef?.SpcolumnName || barcodeKey } : '',
    qrcodeval: qrKey ? { id: qrVarDef?.id, key: qrKey, label: qrVarDef?.SpcolumnName || qrKey } : '',
    placedVariables, placedLabels, selectedSp: tag?.selectedSp || '',
    layout: { title: { x: 5, y: 3 }, barcode: { x: rd1?.BarcodeX ?? 5, y: rd1?.BarcodeY ?? 76 }, qr: { x: rd1?.QrX ?? 55, y: rd1?.QrY ?? 76 } },
  };
};

function getFontNameById(id) {
  const map = { 1: 'Arial', 2: 'Helvetica', 3: 'Calibri', 4: 'Verdana', 5: 'Roboto' };
  return map[id] || 'Calibri';
}

const formatJobValueForVariable = (rawValue, varDef) => {
  if (rawValue === null || rawValue === undefined || rawValue === '') return '';

  const decimal = varDef?.Decimal ?? varDef?.style?.decimal ?? null;
  const roundOff = varDef?.RoundOff ?? varDef?.style?.roundOff ?? false;
  const trim = varDef?.Trim ?? varDef?.style?.trim ?? 0;
  const unit = varDef?.Unit ?? varDef?.style?.unit ?? '';

  let val = rawValue;
  const numeric = Number(val);

  if (!Number.isNaN(numeric) && val !== '' && typeof val !== 'boolean') {
    if (roundOff) {
      val = Math.round(numeric);
    } else if (decimal !== null && decimal !== undefined) {
      // ✅ decimal=0 is valid — toFixed(0) removes decimals
      val = numeric.toFixed(Number(decimal));
    } else {
      val = numeric;
    }

    // ✅ trim: remove N digits from the right of the integer part
    if (trim && Number(trim) > 0) {
      const trimCount = Number(trim);
      let strVal = String(val).replace('.', '');
      const dotIdx = String(val).indexOf('.');
      if (trimCount >= strVal.length) {
        val = '0';
      } else {
        const trimmed = strVal.slice(0, strVal.length - trimCount);
        if (dotIdx !== -1) {
          const intLen = dotIdx;
          const newInt = trimmed.slice(0, intLen) || '0';
          const newDec = trimmed.slice(intLen);
          val = newDec ? `${newInt}.${newDec}` : newInt;
        } else {
          val = trimmed || '0';
        }
      }
    }
  }

  return `${val}${unit ? ' ' + unit : ''}`;
};

export default function TagListPage({ onNavigate, companyDbName, show }) {
  const isCentral = show === 'Central';
  const isCompanyMode = !!companyDbName;
  const { tags, deleteTag, addTag } = useTags();
  const [allTagData, setAllTagData] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [companies, setCompanies] = useState([]);
  const [cloneTarget, setCloneTarget] = useState(null);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);   // tag pending activate/deactivate confirm
  const [activeLoading, setActiveLoading] = useState(false);
  const [defaultTarget, setDefaultTarget] = useState(null); // tag pending set-default confirm
  const [defaultLoading, setDefaultLoading] = useState(false);

  const filtered = allTagData?.filter(t =>
    (t.tagname || '').toLowerCase().includes(search.toLowerCase())
  );

  const clientIpAddress = sessionStorage.getItem("clientIpAddress");
  const AllData = JSON.parse(sessionStorage.getItem("reportVarible"));

  const fetchCompanies = async () => {
    try {
      const body = {
        con: JSON.stringify({ mode: "getCompanyMaster", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({}), f: "getCompanyMaster",
      };
      const sp = show === 'Central' ? 196 : 197;
      const response = await CommonAPI(body, sp);
      const rd = response?.Data?.rd || [];
      if (rd.length > 0) {
        setCompanies(rd.filter(c => c.UFCC !== null && c.UFCC !== undefined && c.UFCC !== '').map(c => ({
          id: c.dbname, name: c.UFCC, dbname: c.dbname, uKey: c.uKey,
        })));
      }
    } catch (error) { console.error("API Error:", error); }
  };

  const fetchData = async () => {
    try {
      const body = {
        con: JSON.stringify({ mode: "GETTAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({ SearchText: "", PageSize: 10, CurrentPage: 1, ...(!isCentral && companyDbName ? { CompanyDbName: companyDbName } : {}) }),
        f: "TagManagement",
      };
      const sp = show === 'Central' ? 196 : 197;
      const response = await CommonAPI(body, sp);
      if (response?.Data) setAllTagData(response?.Data?.rd || []);
    } catch (error) { console.error("API Error:", error); }
  };

  useEffect(() => {
    if (isCentral) fetchCompanies();
    fetchData();
  }, [isCompanyMode]);

  const handleDeleteTag = async () => {
    const tagMasterId = deleteTarget?.TagMasterId || deleteTarget?.tagmasterid || deleteTarget?.id;
    if (!tagMasterId) {
      setToast({ open: true, message: 'Tag id not found. Delete failed.', severity: 'error' });
      setDeleteTarget(null); return;
    }
    setDeleteLoading(true);
    try {
      if (isCentral) {
        const body = {
          con: JSON.stringify({ mode: "DELETETAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
          p: JSON.stringify({ TagMasterId: tagMasterId }), f: "TagManagement",
        };
        const response = await CommonAPI(body, 196);
        const isSuccess = response?.Data?.rd?.[0]?.stat === 1 || response?.Status === '200' || response?.Status === 200;
        if (isSuccess) {
          setAllTagData(prev => prev.filter(tag => (tag?.TagMasterId || tag?.tagmasterid || tag?.id) !== tagMasterId));
          setToast({ open: true, message: 'Tag deleted successfully.', severity: 'success' });
        } else {
          setToast({ open: true, message: response?.Data?.rd?.[0]?.stat_msg || response?.Message || 'Delete failed.', severity: 'error' });
        }
      } else {
        const body164 = {
          con: JSON.stringify({ mode: "DELETETAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
          p: JSON.stringify({ TagMasterId: tagMasterId, CompanyDbName: companyDbName }), f: "TagManagement",
        };
        const response164 = await CommonAPI(body164, 197);
        const isSuccess = response164?.Data?.rd?.[0]?.stat === 1;
        if (!isSuccess) {
          setToast({ open: true, message: response164?.Data?.rd?.[0]?.stat_msg || 'Delete from company failed.', severity: 'error' }); return;
        }
        const body196 = {
          con: JSON.stringify({ mode: "UPDATEASSIGNCOMPANY", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
          p: JSON.stringify({ TagMasterId: deleteTarget?.CentralTagMasterId, CompanyDbNameToRemove: companyDbName }), f: "TagManagement",
        };
        await CommonAPI(body196, 197, "Central");
        setAllTagData(prev => prev.filter(tag => (tag?.TagMasterId || tag?.tagmasterid || tag?.id) !== tagMasterId));
        setToast({ open: true, message: 'Tag deleted from company successfully.', severity: 'success' });
      }
    } catch (error) {
      console.error("API Error:", error);
      setToast({ open: true, message: 'Delete failed. Please try again.', severity: 'error' });
    } finally {
      setDeleteLoading(false); setDeleteTarget(null);
    }
  };

  const handleEditTag = async (tag) => {
    const tagMasterId = tag?.TagMasterId || tag?.tagmasterid || tag?.id;
    if (!tagMasterId) { setToast({ open: true, message: 'Tag id not found. Edit failed.', severity: 'error' }); return; }
    setEditLoadingId(tagMasterId);
    try {
      const body = {
        con: JSON.stringify({ mode: "GETTAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({ TagMasterId: tagMasterId, ...(!isCentral && companyDbName ? { CompanyDbName: companyDbName } : {}) }), f: "TagManagement",
      };
      const sp = show === 'Central' ? 196 : 197;
      const response = await CommonAPI(body, sp);
      onNavigate('customize', mapApiTagToCustomizeTag(tag, response?.Data));
    } catch (error) {
      console.error("API Error:", error);
      setToast({ open: true, message: 'Edit data load failed.', severity: 'error' });
    } finally { setEditLoadingId(null); }
  };

  const handleCloneTag = async () => {
    if (!cloneTarget) return;
    setCloneLoading(true);
    try {
      const tagMasterId = cloneTarget?.TagMasterId || cloneTarget?.id;

      // ✅ Fetch from company SP (197) in company mode, central (196) in central mode
      const fetchSp = isCentral ? 196 : 197;
      const bodyGet = {
        con: JSON.stringify({ mode: "GETTAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({
          TagMasterId: tagMasterId,
          ...(!isCentral && companyDbName ? { CompanyDbName: companyDbName } : {})
        }),
        f: "TagManagement",
      };
      const getResp = await CommonAPI(bodyGet, fetchSp);
      const detail = getResp?.Data;
      const rd = detail?.rd?.[0] || {};
      const rd1 = detail?.rd1?.[0] || {};
      const rd2 = detail?.rd2 || [];
      const rd3 = detail?.rd3 || [];

      const ts = Date.now();
      const newUnique = `${(rd.tagname || 'tag').replace(/\s+/g, '_')}_copy_${ts}`;

      const pPayload = {
        TagName: (rd.tagname || '') + ' Copy',
        UniqueNo: newUnique,
        HtmlTemplate: rd.HtmlTemplate || '',
        SpName: rd.SpName || '',
        IsBarcodeQR: rd.IsBarcodeQR ?? 0,
        DefaultTag: 0,
        TagSpId: rd1.TagSpId ?? null,
        TagUnitId: rd1.TagUnitId ?? null,
        Width: rd1.Width ?? null,
        Height: rd1.Height ?? null,
        FontPt: rd1.FontPt ?? null,
        BorderPx: rd1.BorderPx ?? null,
        BodyWidth: rd1.BodyWidth ?? null,
        TailWidth: rd1.TailWidth ?? null,
        FontFamilyId: rd1.FontFamilyId ?? null,
        showBarcode: rd1.showBarcode ?? false,
        showQr: rd1.showQr ?? false,
        BarcodeWidth: rd1.BarcodeWidth ?? null,
        BarcodeHeight: rd1.BarcodeHeight ?? null,
        BarcodeData: rd1.BarcodeData || '',
        QrWidth: rd1.QrWidth ?? null,
        QrData: rd1.QrData || '',
        Design: rd1.Design || 'tag1',
        BarcodeX: rd1.BarcodeX ?? null,
        BarcodeY: rd1.BarcodeY ?? null,
        QrX: rd1.QrX ?? null,
        QrY: rd1.QrY ?? null,
        LableData: rd1.LableData || '',
        VariableData: rd1.VariableData || '',
        TagVariables: rd2.map(v => ({
          VariableName: v.VariableName,
          SpColumnName: v.SpcolumnName,
          Unit: v.Unit || '',
          FontSize: v.FontSize,
          Weight: v.Weight,
          Decimal: v.Decimal ?? 0,
          Trim: v.Trim ?? 0,
          RoundOff: v.RoundOff ?? 0,
          PosX: v.PosX,
          PosY: v.PosY,
        })),
        TagLables: rd3.map(l => ({
          LableTitle: l.LableTitle,
          FontSize: l.FontSize,
          Weight: l.Weight,
          Italic: l.Italic ?? 0,
          PosX: l.PosX,
          PosY: l.PosY,
        })),
        // ✅ Include CompanyDbName for company mode so SP saves to the right DB
        ...(!isCentral && companyDbName ? { CompanyDbName: companyDbName } : {}),
      };

      // ✅ Use ADDTAG on company SP (197) for company mode, central SP (196) for central
      const saveSp = isCentral ? 196 : 197;
      const bodyAdd = {
        con: JSON.stringify({ mode: "ADDTAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify(pPayload),
        f: "TagManagement",
      };
      const addResp = await CommonAPI(bodyAdd, saveSp);
      const d = addResp?.Data?.rd?.[0];

      if (d?.stat === 1) {
        setToast({ open: true, message: `Cloned as "${pPayload.TagName}" successfully.`, severity: 'success' });
        fetchData(); // refresh list
      } else {
        setToast({ open: true, message: d?.stat_msg || 'Clone failed.', severity: 'error' });
      }
    } catch (err) {
      console.error("Clone error:", err);
      setToast({ open: true, message: 'Clone failed. Please try again.', severity: 'error' });
    } finally {
      setCloneLoading(false);
      setCloneTarget(null);
    }
  };

  const handleToggleActive = async () => {
    if (!activeTarget) return;
    const tagMasterId = activeTarget?.TagMasterId || activeTarget?.id;
    const isCurrentlyActive = !!activeTarget?.IsActive;     // normalize true/false/1/0 → boolean
    const nextActive = isCurrentlyActive ? 0 : 1;            // what we SEND to SP (BIT wants 0/1)
    setActiveLoading(true);
    try {
      const body = {
        con: JSON.stringify({ mode: "SETACTIVE", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({ TagMasterId: tagMasterId, IsActive: nextActive, CompanyDbName: companyDbName }),
        f: "TagManagement",
      };
      const response = await CommonAPI(body, 197);
      const d = response?.Data?.rd?.[0];
      if (d?.stat === 1) {
        setAllTagData(prev => prev.map(t =>
          (t?.TagMasterId || t?.id) === tagMasterId
            ? { ...t, IsActive: !!nextActive }   // store back as boolean — matches API shape
            : t
        ));
        setToast({ open: true, message: nextActive ? 'Tag activated.' : 'Tag deactivated.', severity: 'success' });
      } else {
        setToast({ open: true, message: d?.stat_msg || 'Status update failed.', severity: 'error' });
      }
    } catch (err) {
      console.error("Active toggle error:", err);
      setToast({ open: true, message: 'Status update failed. Please try again.', severity: 'error' });
    } finally {
      setActiveLoading(false); setActiveTarget(null);
    }
  };

  const handleSetDefault = async () => {
    if (!defaultTarget) return;
    const tagMasterId = defaultTarget?.TagMasterId || defaultTarget?.id;
    setDefaultLoading(true);
    try {
      const body = {
        con: JSON.stringify({ mode: "SETDEFAULT", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({ TagMasterId: tagMasterId, CompanyDbName: companyDbName }),
        f: "TagManagement",
      };
      const response = await CommonAPI(body, 197);
      const d = response?.Data?.rd?.[0];
      if (d?.stat === 1) {
        // Unset default on every other tag, set it on this one — mirrors "only one default" rule
        setAllTagData(prev => prev.map(t => ({
          ...t,
          IsDefault: (t?.TagMasterId || t?.id) === tagMasterId ? 1 : 0,
        })));
        setToast({ open: true, message: 'Default tag updated.', severity: 'success' });
      } else {
        setToast({ open: true, message: d?.stat_msg || 'Set default failed.', severity: 'error' });
      }
    } catch (err) {
      console.error("Set default error:", err);
      setToast({ open: true, message: 'Set default failed. Please try again.', severity: 'error' });
    } finally {
      setDefaultLoading(false); setDefaultTarget(null);
    }
  };

  const handleAssignTag = async (tag, selectedCompanyIds) => {
    if (!selectedCompanyIds || selectedCompanyIds.length === 0) {
      setToast({ open: true, message: 'Please select at least one company.', severity: 'warning' }); return;
    }
    try {
      const body = {
        con: JSON.stringify({ mode: "ASSIGNTAGTOCOMPANY", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({ TagMasterId: tag?.TagMasterId || tag?.id, CompanyDbNames: selectedCompanyIds }), f: "TagManagement",
      };
      const sp = show === 'Central' ? 196 : 197;
      const response = await CommonAPI(body, sp);
      const d = response?.Data?.rd?.[0];
      if (d?.stat === 1) {
        setToast({ open: true, message: `Assigned to ${d.SuccessCount} company(s). ${d.stat_msg}`, severity: 'success' });
      } else {
        setToast({ open: true, message: d?.stat_msg || 'Assignment failed.', severity: 'error' });
      }
    } catch (error) {
      console.error("Assign error:", error);
      setToast({ open: true, message: 'Assignment failed.', severity: 'error' });
    }
  };

  const handleUnassignTag = async (tag, removedCompanyIds) => {
    for (const companyId of removedCompanyIds) {
      try {
        await CommonAPI({
          con: JSON.stringify({ mode: "DELETETAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
          p: JSON.stringify({ TagMasterId: tag?.TagMasterId || tag?.id, CompanyDbName: companyId }), f: "TagManagement",
        }, 197, "CompnyWise");
        await CommonAPI({
          con: JSON.stringify({ mode: "UPDATEASSIGNCOMPANY", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
          p: JSON.stringify({ TagMasterId: tag?.CentralTagMasterId || tag?.centraltagmasterid || tag?.TagMasterId || tag?.id, CompanyDbNameToRemove: companyId }), f: "TagManagement",
        }, 196);
      } catch (err) { console.error("Unassign error for", companyId, err); }
    }
    setToast({ open: true, message: `Removed from ${removedCompanyIds.length} company(s).`, severity: 'info' });
    fetchData();
  };

  const fetchTagLiveDataForJob = async (tag, jobNo) => {
    const tagMasterId = tag?.TagMasterId || tag?.tagmasterid || tag?.id;
    const spDetail = show === 'Central' ? 196 : 197;
    const detailResp = await CommonAPI({
      con: JSON.stringify({ mode: "GETTAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
      p: JSON.stringify({ TagMasterId: tagMasterId, ...(!isCentral && companyDbName ? { CompanyDbName: companyDbName } : {}) }), f: "TagManagement",
    }, spDetail);
    const detail = detailResp?.Data;
    let jobCompanyDb = companyDbName;
    if (isCentral) {
      try {
        const parsed = typeof (tag?.AssignCompany || tag?.assigncompany || '[]') === 'string'
          ? JSON.parse(tag?.AssignCompany || tag?.assigncompany || '[]')
          : (tag?.AssignCompany || tag?.assigncompany || []);
        jobCompanyDb = Array.isArray(parsed) ? parsed[0] : null;
      } catch { jobCompanyDb = null; }
    }
    if (jobCompanyDb) {
      const jobResp = await CommonAPI({
        con: JSON.stringify({ mode: "getjobdata", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
        p: JSON.stringify({ JobNo: jobNo, StockBarcode: jobNo, CompanyDbName: jobCompanyDb }), f: "TagManagement",
      }, 197);
      return { detail, jobRow: jobResp?.Data?.rd?.[0] || null };
    }
    const jobResp = await CommonAPI({
      con: JSON.stringify({ mode: "getjobdata", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
      p: JSON.stringify({ JobNo: jobNo, StockBarcode: jobNo, ...(!isCentral && companyDbName ? { CompanyDbName: companyDbName } : {}) }), f: "TagManagement",
    }, 197);
    return { detail, jobRow: jobResp?.Data?.rd?.[0] || null };
  };

  const fetchTagDetailOnly = async (tag) => {
    const tagMasterId = tag?.TagMasterId || tag?.tagmasterid || tag?.id;
    const sp = show === 'Central' ? 196 : 197;
    const response = await CommonAPI({
      con: JSON.stringify({ mode: "GETTAG", appuserid: AllData?.LUId, IPAddress: clientIpAddress }),
      p: JSON.stringify({ TagMasterId: tagMasterId, ...(!isCentral && companyDbName ? { CompanyDbName: companyDbName } : {}) }), f: "TagManagement",
    }, sp);
    return response?.Data;
  };

  return (
    <div className="tl-page">

      {/* ── Clone confirm modal ── */}
      {cloneTarget && (
        <div className="cm-overlay">
          <div className="cm-modal">
            <div className="cm-modal__emoji">📋</div>
            <h3 className="cm-modal__title">Clone Tag?</h3>
            <p className="cm-modal__subtitle">
              This will create a copy of <strong>"{cloneTarget?.tagname}"</strong> with all its settings.
            </p>
            <div className="cm-modal__footer">
              <button className="cm-modal__cancel-btn" onClick={() => setCloneTarget(null)} disabled={cloneLoading}>
                Cancel
              </button>
              <button className="cm-modal__confirm-btn" onClick={handleCloneTag} disabled={cloneLoading}>
                {cloneLoading ? 'Cloning...' : '📋 Yes, Clone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTarget && (
        <div className="cm-overlay">
          <div className="cm-modal">
            <div className="cm-modal__emoji">{!!activeTarget?.IsActive ? '🚫' : '✅'}</div>
            <h3 className="cm-modal__title">{!!activeTarget?.IsActive ? 'Deactivate Tag?' : 'Activate Tag?'}</h3>
            <p className="cm-modal__subtitle">
              {activeTarget?.IsActive
                ? <>This will deactivate <strong>"{activeTarget?.tagname}"</strong>. It won't be available for use until reactivated.</>
                : <>This will activate <strong>"{activeTarget?.tagname}"</strong> for use.</>}
            </p>
            <div className="cm-modal__footer">
              <button className="cm-modal__cancel-btn" onClick={() => setActiveTarget(null)} disabled={activeLoading}>
                Cancel
              </button>
              <button className="cm-modal__confirm-btn" onClick={handleToggleActive} disabled={activeLoading}>
                {activeLoading ? 'Updating...' : (activeTarget?.IsActive ? '🚫 Yes, Deactivate' : '✅ Yes, Activate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {defaultTarget && (
        <div className="cm-overlay">
          <div className="cm-modal">
            <div className="cm-modal__emoji">⭐</div>
            <h3 className="cm-modal__title">Set as Default?</h3>
            <p className="cm-modal__subtitle">
              <strong>"{defaultTarget?.tagname}"</strong> will become the default tag. Any other default tag will automatically be unset.
            </p>
            <div className="cm-modal__footer">
              <button className="cm-modal__cancel-btn" onClick={() => setDefaultTarget(null)} disabled={defaultLoading}>
                Cancel
              </button>
              <button className="cm-modal__confirm-btn" onClick={handleSetDefault} disabled={defaultLoading}>
                {defaultLoading ? 'Setting...' : '⭐ Yes, Set Default'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      {!isCompanyMode && (
        <div className="tl-header">
          <div className="tl-header__inner">
            <div className="tl-header__brand">
              <div className="tl-header__icon">
                <Tag size={20} color="#fff" />
              </div>
              <h1 className="tl-header__title">TagCraft</h1>
            </div>
            <button className="tl-header__add-btn" onClick={() => onNavigate('customize', null)}>
              <Plus size={18} />
              Add Tag
            </button>
          </div>
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="tl-search">
        <div className="tl-search__wrap">
          <Search size={18} className="tl-search__icon" />
          <input
            className="tl-search__input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tags by name..."
          />
          {search && (
            <button className="tl-search__clear" onClick={() => setSearch('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <p className="tl-search__count">
          {filtered.length} tag{filtered.length !== 1 ? 's' : ''} {search ? `found for "${search}"` : 'total'}
        </p>
      </div>

      {/* ── Tag list ── */}
      <div className="tl-list">
        {filtered.length === 0 ? (
          <div className="tl-empty">
            <div className="tl-empty__icon">
              <Tag size={36} color="#cbd5e1" />
            </div>
            <h3 className="tl-empty__title">No tags found</h3>
            <p className="tl-empty__subtitle">
              {search ? 'Try a different search term' : 'Click "Add Tag" to create your first tag'}
            </p>
          </div>
        ) : (
          <div className="tl-list__grid TagListMainDiv">
            {filtered.map(tag => (
              <TagCard
                key={tag.id}
                tag={tag}
                onAssign={handleAssignTag}
                companies={companies}
                onEdit={() => handleEditTag(tag)}
                onDelete={() => setDeleteTarget(tag)}
                onClone={() => setCloneTarget(tag)}
                onToggleActive={() => setActiveTarget(tag)}   // NEW
                onSetDefault={() => setDefaultTarget(tag)}    // NEW
                designColor="#6400b8"
                editLoading={editLoadingId === (tag?.TagMasterId || tag?.tagmasterid || tag?.id)}
                isCentral={isCentral}
                isCompanyMode={isCompanyMode}                 // NEW — pass this through
                onUnassign={handleUnassignTag}
                onLoadJobData={fetchTagLiveDataForJob}
                onLoadDetail={fetchTagDetailOnly}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Delete modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          tag={deleteTarget}
          onConfirm={handleDeleteTag}
          onCancel={() => { if (!deleteLoading) setDeleteTarget(null); }}
          loading={deleteLoading}
          isCentral={isCentral}
          companyDbName={companyDbName}
        />
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(prev => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

// ─── CompanyAssignDropdown ────────────────────────────────────────────────────
function CompanyAssignDropdown({ tag, companies, onAssign, onClose, onUnassign }) {
  const ref = React.useRef(null);
  const searchRef = React.useRef(null);
  const [search, setSearch] = React.useState('');

  const getInitialSelected = () => {
    try {
      const raw = tag?.AssignCompany ?? tag?.assigncompany ?? '[]';
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
    } catch { return new Set(); }
  };

  const [selected, setSelected] = React.useState(getInitialSelected);
  const [initialSelected] = React.useState(getInitialSelected);

  React.useEffect(() => { setTimeout(() => searchRef.current?.focus(), 50); }, []);
  React.useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filteredCompanies = companies
    .filter(c => (c.name || c.UFCC || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aChecked = selected.has(a.id || a.dbname) ? 0 : 1;
      const bChecked = selected.has(b.id || b.dbname) ? 0 : 1;
      if (aChecked !== bChecked) return aChecked - bChecked;
      return (a.name || '').localeCompare(b.name || '');
    });

  const assignedCount = [...selected].length;

  return (
    <div ref={ref} className="ca-dropdown">
      <div className="ca-dropdown__header">
        <span className="ca-dropdown__header-label">🏢 Assign to Company</span>
        {assignedCount > 0 && (
          <span className="ca-dropdown__count-badge">{assignedCount} selected</span>
        )}
      </div>

      <div className="ca-dropdown__search-wrap">
        <input
          ref={searchRef}
          className="ca-dropdown__search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search company..."
        />
      </div>

      <div className="ca-dropdown__list">
        {filteredCompanies.length === 0 && (
          <div className="ca-dropdown__empty">No companies found</div>
        )}

        {filteredCompanies.some(c => selected.has(c.id)) &&
          filteredCompanies.some(c => !selected.has(c.id)) && search === '' && (
            <div className="ca-dropdown__section-label">Assigned</div>
          )}

        {filteredCompanies.map((c, idx) => {
          const id = c.id || c.dbname;
          const name = c.name || c.UFCC || c.dbname;
          const isChecked = selected.has(id);
          const prevChecked = idx > 0 ? selected.has(filteredCompanies[idx - 1].id || filteredCompanies[idx - 1].dbname) : isChecked;
          const showDivider = search === '' && !isChecked && prevChecked && idx > 0;

          return (
            <React.Fragment key={id}>
              {showDivider && (
                <div className="ca-dropdown__section-divider">All Companies</div>
              )}
              <label className={`ca-dropdown__item${isChecked ? ' ca-dropdown__item--checked' : ''}`}>
                <input
                  type="checkbox"
                  className="ca-dropdown__checkbox"
                  checked={isChecked}
                  onChange={() => toggle(id)}
                />
                <span className={`ca-dropdown__item-name${isChecked ? ' ca-dropdown__item-name--checked' : ''}`}>
                  {name}
                </span>
                {isChecked && <span className="ca-dropdown__check-mark">✓</span>}
              </label>
            </React.Fragment>
          );
        })}
      </div>

      <div className="ca-dropdown__footer">
        <button
          className="ca-dropdown__save-btn"
          onClick={() => {
            const newlySelected = [...selected].filter(id => !initialSelected.has(id));
            const newlyUnselected = [...initialSelected].filter(id => !selected.has(id));
            if (newlyUnselected.length > 0) onUnassign(tag, newlyUnselected);
            if (newlySelected.length > 0) onAssign(tag, newlySelected);
            onClose();
          }}
        >
          Save Assignment {assignedCount > 0 ? `(${assignedCount})` : ''}
        </button>
        <button className="ca-dropdown__cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── TagCard ──────────────────────────────────────────────────────────────────
function TagCard({ tag, companies, onAssign, onEdit, onDelete, onClone, onToggleActive, onSetDefault, designColor, editLoading, isCentral, isCompanyMode, onUnassign, onLoadJobData, onLoadDetail }) {
  const [hovered, setHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showJobPrompt, setShowJobPrompt] = useState(false);
  const [jobNoInput, setJobNoInput] = useState('');
  const [jobDataLoading, setJobDataLoading] = useState(false);
  const [jobDataError, setJobDataError] = useState('');
  const [liveJobRow, setLiveJobRow] = useState(null);
  const [liveTagDetail, setLiveTagDetail] = useState(null);

  useEffect(() => { return () => setShowPreview(false); }, []);

  const openJobPrompt = () => {
    setJobNoInput(''); setJobDataError(''); setLiveJobRow(null); setLiveTagDetail(null); setShowJobPrompt(true);
  };

  const handleLoadJobData = async () => {
    const jobNo = jobNoInput.trim();
    if (!jobNo) return;
    setJobDataLoading(true); setJobDataError('');
    try {
      const { detail, jobRow } = await onLoadJobData(tag, jobNo);
      if (!jobRow) { setJobDataError(`No job/stock data found for "${jobNo}".`); return; }
      setLiveTagDetail(detail); setLiveJobRow(jobRow); setShowJobPrompt(false); setShowPreview(true);
    } catch (err) {
      console.error('getjobdata error:', err);
      setJobDataError('Failed to load job data. Please try again.');
    } finally { setJobDataLoading(false); }
  };

  const handlePreviewTemplateOnly = async () => {
    setJobDataLoading(true); setJobDataError('');
    try {
      const detail = await onLoadDetail(tag);
      setLiveTagDetail(detail);
    } catch (err) { console.error('detail fetch error:', err); }
    finally { setLiveJobRow(null); setShowJobPrompt(false); setShowPreview(true); setJobDataLoading(false); }
  };

  const liveVariables = liveTagDetail?.rd2 || [];
  const liveRd1 = liveTagDetail?.rd1?.[0] || {};
  const effectiveWidth = liveRd1?.Width ?? tag?.width ?? 120;
  const effectiveHeight = liveRd1?.Height ?? tag?.height ?? 35;
  const rawW = Number(effectiveWidth) * MM_TO_PX;
  const rawH = Number(effectiveHeight) * MM_TO_PX;

  const handlePrintTag = () => {
    const widthMm = effectiveWidth;
    const heightMm = effectiveHeight;
    const html = decodeHtmlSafe(tag?.HtmlTemplate || tag?.html || '');
    const jobMap = {};
    if (liveJobRow) Object.entries(liveJobRow).forEach(([k, v]) => { jobMap[k.toLowerCase()] = v; });

    const resolvedHtml = html.replace(/\{\{([^}]+)\}\}(\s+[^\s<"']+)?/g, (match, varName, _trailingUnit) => {
      const key = varName.trim().toLowerCase();
      if (key in jobMap) {
        const val = jobMap[key];
        if (val === null || val === undefined || val === '') return '';
        const varDef = liveVariables.find(v => {
          const colName = (v.SpcolumnName || '').toLowerCase();
          const rawKey = (v.VariableName || '').replace(/\{\{|\}\}/g, '').trim().toLowerCase();
          return colName === key || rawKey === key;
        });
        return varDef ? formatJobValueForVariable(val, varDef) : String(val);
      }
      return match;
    });

    const tagBgCss = tag.design === 'tag2' ? 'linear-gradient(135deg,#fffdf5,#fef3dc)' : tag.design === 'tag4' ? 'linear-gradient(160deg,#fff0f0,#fff)' : '#fff';

    // Cover boxes: stretch from posX% to right edge so they fully hide base-HTML label text
    const varCoverHtml = liveJobRow ? liveVariables.map(v => {
      const posX = v.PosX ?? 5;
      const posY = v.PosY ?? 5;
      const fs = v.FontSize || 10;
      const lineH = fs * 1.8;
      // width = percentage-based so it scales with the printed tag size
      const coverPct = 100 - posX;
      return `<div style="position:absolute;left:${posX}%;top:${posY}%;width:${coverPct}%;height:${lineH}px;background:${tagBgCss};z-index:8;"></div>`;
    }).join('') : '';

    const varOverlaysHtml = liveVariables.map(v => {
      const colName = v.SpcolumnName || v.VariableName?.replace(/\{\{|\}\}/g, '').trim() || '';
      const rawKey = v.VariableName?.replace(/\{\{|\}\}/g, '').trim() || colName;
      const rawValue = jobMap[colName.toLowerCase()] ?? jobMap[rawKey.toLowerCase()] ?? undefined;
      let display = '';
      if (liveJobRow && rawValue !== null && rawValue !== undefined) {
        display = formatJobValueForVariable(rawValue, v);
        if ((display === '' || display === null) && rawValue === 0) display = '0';
      }
      if (!liveJobRow) display = v.SpcolumnName || rawKey;
      if (!display && display !== '0') return '';
      const posX = v.PosX ?? 5;
      const posY = v.PosY ?? 5;
      const fs = v.FontSize || 10;
      const maxPct = 100 - posX;   // never exceed the right edge
      return `<div style="position:absolute;left:${posX}%;top:${posY}%;width:${maxPct}%;max-width:${maxPct}%;font-size:${fs}px;font-weight:${v.Weight || 700};color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:9;font-family:Calibri,Arial,sans-serif;line-height:1.3;">${display}</div>`;
    }).join('');

    const barcodeColName = liveRd1?.BarcodeData || '';
    const barcodeValue = barcodeColName ? String(jobMap[barcodeColName.toLowerCase()] ?? barcodeColName) : '';
    const qrColName = liveRd1?.QrData || '';
    const qrValue = qrColName ? String(jobMap[qrColName.toLowerCase()] ?? qrColName) : '';

    const barcodeHtml = liveRd1?.showBarcode && barcodeValue
      ? `<div style="position:absolute;left:${liveRd1?.BarcodeX ?? 5}%;top:${liveRd1?.BarcodeY ?? 76}%;z-index:10;">${generateBarcodeSVG(barcodeValue, liveRd1?.BarcodeWidth ?? 30, liveRd1?.BarcodeHeight ?? 10)}</div>`
      : '';

    const qrSizeMm = liveRd1?.QrWidth ?? 12;
    const qrPx = Math.round(qrSizeMm * MM_TO_PX);
    let qrSvgHtml = generateQRCodeSVG(qrValue, qrPx);
    qrSvgHtml = qrSvgHtml.replace(/width=['"][^'"]*['"]/i, `width="${qrSizeMm}mm"`).replace(/height=['"][^'"]*['"]/i, `height="${qrSizeMm}mm"`);
    if (!/viewBox=/i.test(qrSvgHtml)) qrSvgHtml = qrSvgHtml.replace(/<svg/i, `<svg viewBox="0 0 ${qrPx} ${qrPx}" preserveAspectRatio="xMidYMid meet"`);
    const qrHtml = liveRd1?.showQr && qrValue
      ? `<div style="position:absolute;left:${liveRd1?.QrX ?? 55}%;top:${liveRd1?.QrY ?? 76}%;width:${qrSizeMm}mm;height:${qrSizeMm}mm;overflow:hidden;z-index:10;">${qrSvgHtml}</div>`
      : '';

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) { console.error('Print window blocked.'); return; }
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Print Tag - ${tag?.tagname || ''}</title>
  <style>
    @page {
      margin: 0;
      size: ${widthMm}mm ${heightMm}mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      background: #fff;
      overflow: hidden;
    }
    .tag-canvas {
      position: absolute;    /* ← was relative */
      top: 0;                /* ← ADD */
      left: 0;               /* ← ADD */
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      background: #fff;
      overflow: hidden;
    }
    .tag-canvas > * {
      border: none !important;
    }
    /* Kill any top margin/padding inside the template's root div */
    .tag-canvas > div:first-child {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
  </style>
</head>
<body>
  <div class="tag-canvas">
    ${resolvedHtml}${varCoverHtml}${varOverlaysHtml}${barcodeHtml}${qrHtml}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.onafterprint = function() { window.close(); };
      }, 500);
    };
  <\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div
      className={`tc-card${hovered ? ' tc-card--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="tc-card__thumb">
        <TagPreview tag={tag} maxWidth={140} maxHeight={80} />
      </div>

      {/* Info */}
      <div className="tc-card__info">
        <h3 className="tc-card__name">{tag.tagname}</h3>
        <div className="tc-card__chips">
          <Chip label={`${tag.TotalRecords || 0} Variables`} color={designColor} />
          <Chip label={`SP : ${tag.SpName}`} color={designColor} />
        </div>
      </div>

      {/* Actions */}
      <div className="tc-card__actions">
        {isCentral && (
          <div className="tc-card__assign-wrap">
            <ActionBtn
              icon={<span style={{ fontSize: 14 }}>🏢</span>}
              label="Assign"
              color="#6400b8"
              onClick={e => { e.stopPropagation(); setShowAssign(v => !v); }}
            />
            {showAssign && (
              <CompanyAssignDropdown
                tag={tag} companies={companies}
                onAssign={onAssign} onUnassign={onUnassign}
                onClose={() => setShowAssign(false)}
              />
            )}
          </div>
        )}
        {!isCentral && <ActionBtn icon={<Eye size={16} />} label="Preview" color="#6400b8" onClick={openJobPrompt} />}
        <ActionBtn icon={<Pencil size={16} />} label={editLoading ? "Loading..." : "Edit"} color="#3b82f6" onClick={onEdit} disabled={editLoading} />
        <ActionBtn icon={<Copy size={16} />} label="Clone" color="#10b981" onClick={onClone} />
        {isCompanyMode && (
          <>
            <ActionBtn
              icon={!!tag?.IsActive ? <span style={{ fontSize: 14 }}>🚫</span> : <span style={{ fontSize: 14 }}>✅</span>}
              label={!!tag?.IsActive ? 'Deactivate' : 'Activate'}
              color={!!tag?.IsActive ? '#e63946' : '#10b981'}
              onClick={onToggleActive}
            />
            <ActionBtn
              icon={<span style={{ fontSize: 14 }}>{!!tag?.IsDefault ? '⭐' : '☆'}</span>}
              label={!!tag?.IsDefault ? 'Default ✓' : 'Set Default'}
              color="#c8922a"
              onClick={!!tag?.IsDefault ? undefined : onSetDefault}
              disabled={!!tag?.IsDefault}
            />
          </>
        )}
        <ActionBtn icon={<Trash2 size={16} />} label="Delete" color="#e63946" onClick={() => { setShowPreview(false); setShowAssign(false); onDelete(); }} />
      </div>

      {/* ── Job prompt modal ── */}
      {showJobPrompt && (
        <div className="jp-overlay" onClick={() => !jobDataLoading && setShowJobPrompt(false)}>
          <div className="jp-modal" onClick={e => e.stopPropagation()}>
            <div className="jp-modal__icon-wrap">
              <ScanLine size={22} color="#6400b8" />
            </div>
            <h3 className="jp-modal__title">Preview with Live Job Data</h3>
            <p className="jp-modal__subtitle">
              Enter a Job No. / Stock Barcode to fill <strong>"{tag?.tagname}"</strong> with real data.
            </p>
            <input
              autoFocus
              className="jp-modal__input"
              value={jobNoInput}
              onChange={e => { setJobNoInput(e.target.value); setJobDataError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLoadJobData()}
              placeholder="e.g. 1/2"
            />
            {jobDataError && (
              <div className="jp-modal__error">
                <AlertCircle size={13} /> {jobDataError}
              </div>
            )}
            <div className="jp-modal__footer">
              <button className="jp-modal__skip-btn" onClick={handlePreviewTemplateOnly} disabled={jobDataLoading}>
                Skip / Template Only
              </button>
              <button className="jp-modal__load-btn" onClick={handleLoadJobData} disabled={jobDataLoading || !jobNoInput.trim()}>
                {jobDataLoading ? 'Loading...' : 'Load Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview modal ── */}
      {showPreview && (() => {
        const jobMap = {};
        if (liveJobRow) Object.entries(liveJobRow).forEach(([k, v]) => { jobMap[k.toLowerCase()] = v; });

        const barcodeColName = liveRd1?.BarcodeData || '';
        const barcodeValue = barcodeColName ? String(jobMap[barcodeColName.toLowerCase()] ?? barcodeColName) : '';
        const qrColName = liveRd1?.QrData || '';
        const qrValue = qrColName ? String(jobMap[qrColName.toLowerCase()] ?? qrColName) : '';

        const availW = Math.min((window?.innerWidth || 1000) * 0.88, 1150) - 48;
        const availH = 420; // a bit more vertical room than before
        const fitScale = Math.min(availW / rawW, availH / rawH, 2.5);

        const rawHtml = decodeHtmlSafe(tag?.HtmlTemplate || tag?.html || '');

        // ✅ Resolve {{placeholders}} directly inside the template — same approach as handlePrintTag.
        // This keeps labels intact since we never cover/blank anything; we just swap the text.
        const resolvedHtml = liveJobRow
          ? rawHtml.replace(/\{\{([^}]+)\}\}(\s+[^\s<"']+)?/g, (match, varName, _trailingUnit) => {
            const key = varName.trim().toLowerCase();
            if (key in jobMap) {
              const varDef = liveVariables.find(v => {
                const colName = (v.SpcolumnName || '').toLowerCase();
                const rawKey = (v.VariableName || '').replace(/\{\{|\}\}/g, '').trim().toLowerCase();
                return colName === key || rawKey === key;
              });
              const val = jobMap[key];
              if (val === null || val === undefined || val === '') return '';
              // formatJobValueForVariable already appends unit — _trailingUnit is discarded
              return varDef ? formatJobValueForVariable(val, varDef) : String(val);
            }
            return match;
          })
          : rawHtml;
        return (
          <div className="tp-overlay" onClick={() => setShowPreview(false)}>
            <div className="tp-modal" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="tp-modal__header">
                <div>
                  <div className="tp-modal__header-title">Tag Preview</div>
                  <div className="tp-modal__header-meta">
                    {tag.tagname} &nbsp;·&nbsp; {effectiveWidth} × {effectiveHeight} mm
                    {liveJobRow && (
                      <span className="tp-modal__live-badge">
                        &nbsp;·&nbsp; Live data: Job {liveJobRow?.jobno || liveJobRow?.StockBarcode}
                      </span>
                    )}
                  </div>
                </div>
                <button className="tp-modal__close-btn" onClick={() => setShowPreview(false)}>✕</button>
              </div>

              {/* Canvas */}
              <div className="tp-modal__canvas" style={{ height: availH, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div
                  className="tp-modal__canvas-inner"
                  style={{
                    width: rawW * fitScale,
                    height: rawH * fitScale,
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0
                  }}
                >
                  <div
                    className="tp-modal__base-html"
                    style={{
                      width: rawW,
                      height: rawH,
                      transform: `scale(${fitScale})`,
                      transformOrigin: 'top left',
                      overflow: 'hidden'   // ← ADD THIS
                    }}
                    dangerouslySetInnerHTML={{ __html: resolvedHtml }}
                  />

                  {/* Barcode overlay — overrides the template's placeholder barcode SVG with the live value */}
                  {liveRd1?.showBarcode && barcodeValue && (
                    <div
                      className="tp-modal__code-overlay"
                      style={{ left: `${liveRd1?.BarcodeX ?? 5}%`, top: `${liveRd1?.BarcodeY ?? 76}%`, transform: `scale(${fitScale})`, transformOrigin: 'top left' }}
                      dangerouslySetInnerHTML={{ __html: generateBarcodeSVG(barcodeValue, liveRd1?.BarcodeWidth ?? 30, liveRd1?.BarcodeHeight ?? 10) }}
                    />
                  )}

                  {/* QR overlay — overrides the template's placeholder QR SVG with the live value */}
                  {liveRd1?.showQr && qrValue && (() => {
                    const qx = liveRd1?.QrX ?? 55; const qy = liveRd1?.QrY ?? 76;
                    const qsMm = liveRd1?.QrWidth ?? 12;
                    const qrPx = Math.round(qsMm * MM_TO_PX);
                    let svgHtml = generateQRCodeSVG(qrValue, qrPx);
                    svgHtml = svgHtml.replace(/width=['"][^'"]*['"]/i, `width='100%'`).replace(/height=['"][^'"]*['"]/i, `height='100%'`);
                    if (!/viewBox=/i.test(svgHtml)) svgHtml = svgHtml.replace(/<svg/i, `<svg viewBox='0 0 ${qrPx} ${qrPx}' preserveAspectRatio='xMidYMid meet'`);
                    return (
                      <div
                        className="tp-modal__code-overlay"
                        style={{ left: `${qx}%`, top: `${qy}%`, width: qrPx * fitScale, height: qrPx * fitScale, overflow: 'hidden', background: '#fff' }}
                        dangerouslySetInnerHTML={{ __html: svgHtml }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Info bar */}
              <div className="tp-modal__infobar">
                <span>📐 {effectiveWidth} × {effectiveHeight} mm</span>
                <span>🔤 {tag.tagFontFamilly || 'Calibri'}</span>
                {liveRd1?.showBarcode && liveRd1?.BarcodeData && (
                  <span>▦ Barcode · <strong>{liveJobRow ? String(jobMap?.[liveRd1.BarcodeData?.toLowerCase()] ?? liveRd1.BarcodeData) : liveRd1.BarcodeData}</strong></span>
                )}
                {liveRd1?.showQr && liveRd1?.QrData && (
                  <span>▣ QR · <strong>{liveJobRow ? String(jobMap?.[liveRd1.QrData?.toLowerCase()] ?? liveRd1.QrData) : liveRd1.QrData}</strong></span>
                )}
                {liveJobRow && <span>🟢 Live data · Job {liveJobRow?.jobno || liveJobRow?.StockBarcode}</span>}
              </div>

              {/* Footer */}
              <div className="tp-modal__footer">
                <button className="tp-modal__footer-close" onClick={() => setShowPreview(false)}>Close</button>
                <button className="tp-modal__footer-print" onClick={handlePrintTag}>🖨 Print</button>
                <button className="tp-modal__footer-edit" onClick={() => { setShowPreview(false); onEdit(); }}>✏ Edit Tag</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, color }) {
  return (
    <span
      className="tc-chip"
      style={{ background: color + '15', color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  );
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────
function ActionBtn({ icon, label, color, onClick, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      className="tc-action-btn"
      disabled={disabled}
      onClick={onClick}
      style={{
        border: `2px solid ${color}30`,
        background: hov ? color : color + '10',
        color: hov ? '#fff' : color,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {icon} {label}
    </button>
  );
}