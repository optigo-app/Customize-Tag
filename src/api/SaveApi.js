import axios from "axios";
import Cookies from "js-cookie";

const getAPIURL = () => {
  if (typeof window === "undefined") return "https://apilx.optigoapps.com/api/report";
  const host = window.location.hostname;
  return host === "localhost" || host === "nzen"
    ? "http://newnextjs.web/api/report"
    : "https://apilx.optigoapps.com/api/report";
};

function generateTagId(tagName) {
  const now = new Date();
  const datetime =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  return `${tagName}_${datetime}`;
}

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? fallback : numberValue;
};

const toFlag = (value) => value ? 1 : 0;

const toId = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : fallback;
};



export const SaveApi = async (tag) => {

  const htmlcode = (tag.html || tag.htmltemplate || "").replace(/\n/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim()

  const queryParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const token_url = queryParams.get("token");

  const header = {
    YearCode: 'e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19',
    version: "R50B3",
    sv: '0',
    sp: 164,
  };

  const Listvar = (tag?.placedVariables || []).map(item => ({
    VariableName: `{{${item.varval || item.varLabel || ""}}}`,
    SpColumnName: item.varLabel || item.varval || "",
    Unit: item?.style?.unit || "",
    FontSize: toNumber(item?.style?.fontSize, toNumber(tag?.fontSize, 10)),
    Weight: toNumber(item?.style?.fontWeight, 500),
    Decimal: toNumber(item?.style?.decimal, 0),
    Trim: toNumber(item?.style?.trim, 0),
    RoundOff: toFlag(item?.style?.roundOff),
    PosX: toNumber(item?.x, 5),   // ← ADD
    PosY: toNumber(item?.y, 5),   // ← ADD
  }));

  const Listlabel = (tag?.placedLabels || []).map(item => ({
    LableTitle: item?.text || item?.labelText || "",
    FontSize: toNumber(item?.style?.fontSize, toNumber(tag?.fontSize, 10)),
    Weight: toNumber(item?.style?.fontWeight, 500),
    Italic: toFlag(item?.style?.italic),
    PosX: toNumber(item?.x, 5),   // ← ADD
    PosY: toNumber(item?.y, 10),  // ← ADD
  }));

  const isBarcode = tag?.showBarcode ? 0 : 1
  const tagMasterId = tag?.TagMasterId || tag?.tagmasterid || tag?.id;
  const tagName = tag?.name || tag?.tagname || "";
  const uniqueNo = tag?.UniqueNo || tag?.uniqueno || generateTagId(tagName);
  const spName = tag?.selectedSp?.name || tag?.spname || "";
  const tagSpId = toId(tag?.TagSpId || tag?.tagspid || tag?.selectedSp?.TagSpId || tag?.selectedSp?.tagspid || tag?.selectedSp?.id, 2);
  const barcodeData = tag?.barcodeval?.key || tag?.barcodeval?.label || tag?.BarcodeData || tag?.barcodedata || "";
  const qrData = tag?.qrcodeval?.key || tag?.qrcodeval?.label || tag?.QrData || tag?.qrdata || "";
  const baseParams = {
    TagName: tagName,
    UniqueNo: uniqueNo,
    SpName: spName,
    Design: tag?.design || 'tag1',   // ← ADD THIS
    HtmlTemplate: htmlcode,
    IsBarcodeQR: isBarcode,
    DefaultTag: tag?.DefaultTag || tag?.defaultTag || tag?.deafultTag || tag?.deafulttag || 0,
    TagSpId: tagSpId,
    TagUnitId: tag?.unit === 'inch' ? 2 : 1,  // ← already there but check this maps correctly
    Width: toNumber(tag?.width || tag?.Width, 0),
    Height: toNumber(tag?.height || tag?.Height, 0),
    FontPt: toNumber(tag?.fontSize || tag?.FontPt || tag?.fontpt, 10),
    BorderPx: toNumber(tag?.borderWidth || tag?.BorderPx || tag?.borderpx, 0),
    BodyWidth: toNumber(tag?.headWidth || tag?.BodyWidth || tag?.bodywidth, 0),
    TailWidth: toNumber(tag?.tailWidth || tag?.TailWidth || tag?.tailwidth, 0),
    FontFamilyId: tag?.FontFamilyId || tag?.fontfamilyid || 3,
    showBarcode: toFlag(tag?.showBarcode),
    showQr: toFlag(tag?.showQR || tag?.showQr || tag?.showqr),
    BarcodeWidth: toNumber(tag?.codeWidth || tag?.BarcodeWidth || tag?.barcodewidth, 0),
    BarcodeHeight: toNumber(tag?.codeHeight || tag?.BarcodeHeight || tag?.barcodeheight, 0),
    BarcodeData: barcodeData,
    QrWidth: toNumber(tag?.qrSize || tag?.QrWidth || tag?.qrwidth, 0),
    QrData: qrData,
    LableData: tag?.LableData || tag?.labelData || "{}",
    VariableData: tag?.VariableData || tag?.variableData || "{}",
    BarcodeX: toNumber(tag?.layout?.barcode?.x, 5),   // ← ADD
    BarcodeY: toNumber(tag?.layout?.barcode?.y, 76),  // ← ADD
    QrX: toNumber(tag?.layout?.qr?.x, 55),            // ← ADD
    QrY: toNumber(tag?.layout?.qr?.y, 76),            // ← ADD
    TagVariables: Listvar,
    TagLables: Listlabel
  };
  const mode = tagMasterId ? "EDITTAG" : "ADDTAG";
  const params = tagMasterId
    ? {
      TagMasterId: tagMasterId,
      ...baseParams,
    }
    : baseParams;
  const body = {
    "con": JSON.stringify({ mode, appuserid: "user@eg.com", IPAddress: "103.206.139.196" }),
    "p": JSON.stringify(params),
    "f": "TagManagement"
  }

  try {
    const response = await axios.post(getAPIURL(), body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("error is..", error);
  }
};

export default SaveApi;