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
 


export const SaveApi = async (tag) => {
  
   const htmlcode =  tag.html.replace(/\n/g, "")
   .replace(/\s{2,}/g, " ")
   .replace(/>\s+</g, "><")
   .trim()

  const queryParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const token_url  = queryParams.get("token");

  const header = {
    YearCode: 'e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19',
    version: "R50B3",
    sv: '0',
    sp: 164,
  };

  const Listvar = tag?.placedVariables.map(item => ({
    VariableName: `{{${item.varLabel}}}`,
    SpColumnName: item.varLabel
}));

  const varlist = JSON.stringify(Listvar);
 const isBarcode = tag?.showBarcode ? 0 : 1
  const body = {
    "con": "{\"mode\":\"addTag\",\"y\":\"404146_CentralUser\",\"appuserid\":\"soha@eg.com\",\"version\":\"R50B3\"}",
    
    "p": "{\"TagName\":\""+tag?.name+"\",\"UniqueNo\":\""+generateTagId(tag?.name)+"\",\"HtmlTemplate\":\""+htmlcode+"\",\"SpName\":\""+tag?.selectedSp?.name+"\",\"IsBarcodeQR\":"+isBarcode+",\"IsActive\":1,\"TagVariables\":"+varlist+"}",
    
    "f": "TagManagement"
    } 

console.log("TCL: SaveApi -> body", body)
  try {
    const response = await axios.post(getAPIURL(), body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("error is..", error);
  }
};

export default SaveApi;