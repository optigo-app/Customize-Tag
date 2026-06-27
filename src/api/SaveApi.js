import axios from "axios";
import Cookies from "js-cookie";
import { getHomePageTypeFromBrowser } from "../Utils/globalFunc";

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

const toFlag = (value) => (value ? 1 : 0);

const toId = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : fallback;
};

const fontFamilyMap = {
  Calibri: 3,
  Verdana: 1,
  Arial: 2,
  Helvetica: 4,
  Roboto: 5,
};

// ✅ Encode HTML to Base64 so it can never break backend XML/SQL parsing.
// unescape(encodeURIComponent(str)) safely handles unicode (₹, ✓, etc.) before btoa.
export const encodeHtmlSafe = (str) => {
  if (!str) return "";
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    console.error("HTML encode failed:", e);
    return "";
  }
};

// ✅ Decode Base64 back to HTML. Falls back to the raw string if it isn't
// valid Base64 (covers legacy rows saved before this fix was applied).
export const decodeHtmlSafe = (str) => {
  if (!str) return "";
  const looksLikeHtml = str.includes("<") || str.includes(">");
  if (looksLikeHtml) return str; // legacy / already-plain HTML row

  try {
    return decodeURIComponent(escape(atob(str)));
  } catch (e) {
    // Not valid base64 — return as-is rather than throwing
    return str;
  }
};

export const SaveApi = async (tag, companyDbName = "", show = "") => {
  const currentShow = show || getHomePageTypeFromBrowser();
  const isCentral = currentShow === "Central";

  const cleanedHtml = (tag.html || tag.htmltemplate || "")
    .replace(/\n/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim();

  // ✅ Base64-encode — eliminates ALL quote/angle-bracket XML issues
  // const htmlcode = cleanedHtml;

  // Alternative if backend can't decode Base64:
  const htmlcode = cleanedHtml
    .replace(/\\/g, '')           // remove backslashes
    .replace(/"/g, "'")           // double quotes → single quotes  
    .replace(/[\r\n\t]/g, ' ');   // newlines/tabs → space

  const Listvar = (tag?.placedVariables || []).map((item) => {
    // Strip any accidental {{ }} already in varval before re-wrapping
    const rawKey = (item.varval || item._rawKey || "").replace(/^\{\{|\}\}$/g, "");
    return {
      VariableName: `{{${rawKey}}}`,        // {{StockBarcode}}
      SpColumnName: rawKey,                 // StockBarcode
      BindSpColumName: item.varLabel || rawKey, // Stock No
      Unit: item?.style?.unit || "",
      FontSize: toNumber(item?.style?.fontSize, toNumber(tag?.fontSize, 10)),
      Weight: toNumber(item?.style?.fontWeight, 500),
      Decimal: toNumber(item?.style?.decimal, 0),
      Trim: toNumber(item?.style?.trim, 0),
      RoundOff: toFlag(item?.style?.roundOff),
      PosX: toNumber(item?.x, 5),
      PosY: toNumber(item?.y, 5),
    };
  });

  const Listlabel = (tag?.placedLabels || []).map((item) => ({
    LableTitle: item?.text || item?.labelText || "",
    FontSize: toNumber(item?.style?.fontSize, toNumber(tag?.fontSize, 10)),
    Weight: toNumber(item?.style?.fontWeight, 500),
    Italic: toFlag(item?.style?.italic),
    PosX: toNumber(item?.x, 5),
    PosY: toNumber(item?.y, 10),
  }));

  const tagMasterId = tag?.TagMasterId || tag?.tagmasterid || tag?.id;
  const tagName = tag?.name || tag?.tagname || "";
  const uniqueNo = tag?.UniqueNo || tag?.uniqueno || generateTagId(tagName);
  const spName = tag?.selectedSp?.name || tag?.spname || "";

  const tagSpId = toId(
    tag?.TagSpId ||
    tag?.tagspid ||
    tag?.selectedSp?.TagSpId ||
    tag?.selectedSp?.tagspid ||
    tag?.selectedSp?.id,
    2
  );

  const barcodeData = tag?.barcodeval?.key || tag?.barcodeval?.label || tag?.BarcodeData || tag?.barcodedata || "";
  const qrData = tag?.qrcodeval?.key || tag?.qrcodeval?.label || tag?.QrData || tag?.qrdata || "";
  const isBarcode = tag?.showBarcode ? 0 : 1;

  const FontFamilyId =
    fontFamilyMap[tag?.tagFontFamilly] ||
    tag?.FontFamilyId ||
    tag?.fontfamilyid ||
    3;

  const mode = tagMasterId ? "EDITTAG" : "ADDTAG";

  const baseParams = {
    TagName: tagName,
    UniqueNo: uniqueNo,
    SpName: spName,
    Design: tag?.design || "tag1",
    HtmlTemplate: htmlcode,
    IsBarcodeQR: isBarcode,
    DefaultTag: tag?.DefaultTag || tag?.defaultTag || 0,
    TagSpId: tagSpId,
    TagUnitId: tag?.unit === "inch" ? 2 : 1,
    Width: toNumber(tag?.width || tag?.Width, 0),
    Height: toNumber(tag?.height || tag?.Height, 0),
    FontPt: toNumber(tag?.fontSize || tag?.FontPt || tag?.fontpt, 10),
    BorderPx: toNumber(tag?.borderWidth || tag?.BorderPx || tag?.borderpx, 0),

    // ✅ Send null when missing so SP's ISNULL keeps existing DB value
    BodyWidth: (tag?.headWidth || tag?.BodyWidth || tag?.bodywidth)
      ? toNumber(tag?.headWidth || tag?.BodyWidth || tag?.bodywidth, 0)
      : null,
    TailWidth: (tag?.tailWidth || tag?.TailWidth || tag?.tailwidth)
      ? toNumber(tag?.tailWidth || tag?.TailWidth || tag?.tailwidth, 0)
      : null,

    FontFamilyId,
    showBarcode: toFlag(tag?.showBarcode),
    showQr: toFlag(tag?.showQR || tag?.showQr || tag?.showqr),
    BarcodeWidth: toNumber(tag?.codeWidth || tag?.BarcodeWidth || tag?.barcodewidth, 0),
    BarcodeHeight: toNumber(tag?.codeHeight || tag?.BarcodeHeight || tag?.barcodeheight, 0),
    BarcodeData: barcodeData,
    QrWidth: toNumber(tag?.qrSize || tag?.QrWidth || tag?.qrwidth, 0),
    QrData: qrData,
    LableData: tag?.LableData || tag?.labelData || "{}",
    VariableData: tag?.VariableData || tag?.variableData || "{}",
    BarcodeX: toNumber(tag?.layout?.barcode?.x, 5),
    BarcodeY: toNumber(tag?.layout?.barcode?.y, 76),
    QrX: toNumber(tag?.layout?.qr?.x, 55),
    QrY: toNumber(tag?.layout?.qr?.y, 76),
    TagVariables: Listvar,
    TagLables: Listlabel,
    ...(companyDbName ? { CompanyDbName: companyDbName } : {}),
  };

  const params = tagMasterId
    ? { TagMasterId: tagMasterId, ...baseParams }
    : { ...baseParams };

  const AllData = JSON.parse(sessionStorage.getItem("reportVarible") || "{}");
  const clientIpAddress = sessionStorage.getItem("clientIpAddress") || "";

  const body = {
    con: JSON.stringify({
      mode,
      appuserid: AllData?.LUId || "",
      IPAddress: clientIpAddress,
    }),
    p: JSON.stringify(params),
    f: "TagManagement",
  };

  const header = isCentral
    ? { Yearcode: "", version: "v1", sv: "0", sp: 196 }
    : {
      Yearcode: `${AllData?.YearCode ?? ""}`,
      version: "live",
      sv: `${atob(AllData?.SV ?? "")}`,
      sp: 197,
    };

  console.log(`[SaveApi] mode=${mode} isCentral=${isCentral} tagMasterId=${tagMasterId}`);

  try {
    const response = await axios.post(getAPIURL(), body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("SaveApi error:", error);
    throw error;
  }
};

export default SaveApi;