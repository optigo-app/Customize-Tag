import axios from "axios";
import Cookies from "js-cookie";

const getAPIURL = () => {
  if (typeof window === "undefined") return "https://apilx.optigoapps.com/api/report";
  const host = window.location.hostname;
  return host === "localhost" || host === "nzen"
    ? "http://newnextjs.web/api/report"
    : "https://apilx.optigoapps.com/api/report";
};

const isLocal = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "nzen" || host === "supersalesrep.web";
};

export const CommonAPI = async (body, sp ) => {

  const queryParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const token_url  = queryParams.get("token");

  const header = {
    YearCode: 'e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19',
    version: "R50B3",
    sv: '0',
    sp: sp,
  };

  try {
    const response = await axios.post(getAPIURL(), body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("error is..", error);
  }
};

export default CommonAPI;