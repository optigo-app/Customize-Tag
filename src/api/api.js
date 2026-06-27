// api/api.js
import axios from "axios";

function getHomePageType() {
  try {
    const url = (window.top.location.href || window.location.href).toLowerCase();

    // Production detection
    if (url.includes("/adminhome#")) return "Central";
    if (url.includes("/home.do")) return "CompanyWise";

    // ✅ Localhost fallback — check URL path
    if (url.includes("localhost") || url.includes("nzen")) {
      const path = window.location.pathname.toLowerCase(); // e.g. "/ctag/"
      const params = new URLSearchParams(window.location.search);
      const CN = params.get("CN");

      // /ctag/ = Central Tag → Central
      if (path.includes("/ctag")) return "Central";

      // If CN param exists → CompanyWise
      if (CN) return "CompanyWise";

      // Default localhost → Central
      return "Central";
    }

  } catch (e) {
    const url = window.location.href.toLowerCase();
    if (url.includes("/adminhome#")) return "Central";
    if (url.includes("/home.do")) return "CompanyWise";
  }

  return "UNKNOWN";
}

export const CommonAPI = async (body, sp , getSpCOL) => {
  const rawData = typeof window !== "undefined"
    ? sessionStorage.getItem("reportVarible")
    : null;

  const AllData = rawData ? JSON.parse(rawData) : {};
  const pageType = getSpCOL ?? getHomePageType();
  const isCentral = pageType === "Central";
  
  const header = isCentral
    ? {    
        Yearcode: "",
        version: "v1",
        sv: "0",
        sp: 196,  // always 196 for central, ignore caller's sp
      }
    : {
        Yearcode: `${AllData?.YearCode ?? ""}`,
        version: 'live',
        // sv: `${atob(AllData?.SV ?? "")}`,
        sv: AllData?.SV ? atob(AllData.SV) : "0",
        sp: sp,   // caller passes 197 for company-wise
      };

  const APIURL =
    window.location.hostname === "localhost" || window.location.hostname === "nzen"
      ? "http://newnextjs.web/api/report"
      : "https://apilx.optigoapps.com/api/report";

  try {
    const response = await axios.post(APIURL, body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("CommonAPI error:", error);
  }
};

export default CommonAPI;