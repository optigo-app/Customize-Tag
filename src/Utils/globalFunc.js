
export const getClientIpAddress = async () => {
  try {
    const cachedIp = sessionStorage.getItem("clientIpAddress");
    if (cachedIp) return cachedIp;
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    const ip = data?.ip || "";
    sessionStorage.setItem("clientIpAddress", ip);
    return ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "";
  }
};


function getCurrentBrowserUrl() {
  try {
    return window.top.location.href;
  } catch (e) {
    return window.location.href;
  }
}
export function getHomePageTypeFromBrowser() {
  try {
    const href = getCurrentBrowserUrl().toLowerCase();
    if (href.includes("/home.do")) {
      return "CompanyWise";
    }

    if (
      href.includes("/adminhome") &&
      href.includes("ctag")
    ) {
      return "Central";
    }
  } catch (err) {
    console.error(err);
  }

  return "UNKNOWN";
}