// 1/8272

import React, { useEffect, useState } from 'react';
import { TagProvider } from './context/TagContext';
import TagListPage from './pages/TagListPage/TagListPage';
import CustomizeTagPage from './pages/CustomizeTagPage/CustomizeTagPage';
import axios from 'axios';
import { getClientIpAddress, getHomePageTypeFromBrowser } from './Utils/globalFunc';
import CommonAPI from './api/api';
import { CircularProgress } from '@mui/material';

export default function App() {
  const [page, setPage] = useState('list');
  const [editTag, setEditTag] = useState(null);
  const [ready, setReady] = useState(false);         // ✅ true only after ALL steps done
  const [companyDbName, setCompanyDbName] = useState(null);
  console.log('companyDbName: ', companyDbName);

  const navigate = (target, tag = null) => {
    setEditTag(tag);
    setPage(target);
  };

  const searchParams = new URLSearchParams(window.location.search);
  const newToken = searchParams.get("Token");
  const show = getHomePageTypeFromBrowser(); // "Central" | "CompanyWise" | "UNKNOWN"
  // const show = "CompanyWise"  // | "CompanyWise" | "UNKNOWN"
  const isCentral = show === 'Central';
  console.log('isCentral: ', isCentral);
  useEffect(() => {
    getClientIpAddress();
  }, []);

  // useEffect(() => {
  //   sessionStorage.setItem("5F383721-FC33-F111-B3AE-F875A496BA9D", JSON?.stringify({
  //   "tkn": "OTA2NTQ3MTcwMDUzNTY1MQ==",
  //   "pid": 18531,
  //   "IsEmpLogin": 0,
  //   "IsPower": 2,
  //   "SpNo": "MA==",
  //   "SpVer": "",
  //   "SV": "MA==",
  //   "LId": "MTAyMA==",
  //   "LUId": "dGVzdEBuemVuLmNvbQ==",
  //   "DAU": "aHR0cDovL256ZW4vam8vYXBpLWxpYi9BcHAvQ2VudHJhbEFwaQ==",
  //   "YearCode": "e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19",
  //   "cuVer": "UjUwQjM=",
  //   "rptapiurl": "aHR0cDovL25ld25leHRqcy53ZWIvYXBpL3JlcG9ydA==",
  //   "dxver": "YmV0YQ=="
  //   }))
  //   window.location.replace("http://localhost:3000/ctag/?CN=UkRTRF8yMDI2MDQwOTEwMDkwOV9iZGIzY2Y1NjRiNDc0NWJmYWY4NjNkYjBhZmI2MzZmNg==&pid=18333&Token=5F383721-FC33-F111-B3AE-F875A496BA9D");
  // }, []);


  useEffect(() => {
    const initialize = async () => {
      if (!newToken) {
        if (isCentral) { setReady(true); return; }
        console.error("No token found");
        setReady(true); // still unblock UI even with no token
        return;
      }

      try {
        let parsedData;
        const storedJson = sessionStorage.getItem(newToken);
        if (storedJson) {
          parsedData = JSON.parse(storedJson);
          if (parsedData?.LUId) parsedData.LUId = atob(parsedData.LUId);
          sessionStorage.setItem("reportVarible", JSON.stringify(parsedData));
        } else {
          const APIURL = ["localhost", "nzen"].includes(window.location.hostname)
            ? "http://nzen/jo/api-lib/App/CentralCrossDomainToken"
            : "https://vw.optigoapps.com/linkedapp/App/CentralCrossDomainToken";

          const tokenResponse = await axios.post(APIURL, {
            ReqData: `[{"ForEvt":"GetTokenVal","Token":"${newToken}"}]`,
          });

          const tokenData = tokenResponse?.data?.Data?.DT?.[0];
          if (!tokenData?.JsonData || !tokenData?.Token) {
            console.error("Invalid token response");
            setReady(true);
            return;
          }

          parsedData = JSON.parse(tokenData.JsonData);
          if (parsedData?.LUId) parsedData.LUId = atob(parsedData.LUId);
          sessionStorage.setItem(newToken, JSON.stringify(parsedData));
          sessionStorage.setItem("reportVarible", JSON.stringify(parsedData));
        }
        if (isCentral) {
          setReady(true);
          return;
        }

        // ── CompanyWise → must resolve companyDbName BEFORE rendering ───
        const tkn = parsedData?.tkn;
        if (!tkn) {
          setReady(true); // no tkn key → render without companyDbName
          return;
        }

        const decodedKey = atob(tkn);
        const clientIpAddress = sessionStorage.getItem("clientIpAddress") || '';
        const body = {
          con: JSON.stringify({
            mode: "getCompanyMaster",
            appuserid: parsedData?.LUId,
            IPAddress: clientIpAddress,
          }),
            p: JSON.stringify({ }),
          f: "getCompanyMaster",
        };

        const response = await CommonAPI(body, 197, "Central");
        const rd = response?.Data?.rd || [];
        const matched = rd.find(c => String(c.dbUniqueKey) === String(decodedKey));

        if (matched?.dbname) {
          setCompanyDbName(matched.dbname); // e.g. "orail25"
        }

        setReady(true);

      } catch (err) {
        console.error("Initialization error:", err);
        setReady(true); // don't hang forever on error
      }
    };

    initialize();
  }, [newToken]);

  if (!ready) {
    return (
      <div style={{
        height: "100vh", width: "100%",
        display: "flex", justifyContent: "center", alignItems: "center",
      }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <TagProvider>
      {page === 'list' ? (
        <TagListPage
          onNavigate={navigate}
          companyDbName={companyDbName}
          show={show}
        />
      ) : (
        <CustomizeTagPage
          onNavigate={navigate}
          editTag={editTag}
          companyDbName={companyDbName}
          show={show}
        />
      )}
    </TagProvider>
  );
}
