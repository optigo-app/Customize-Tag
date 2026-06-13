import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

function QRCodeGenerator({ value = "dummy", size = 20 }) {
  const svgRef = useRef(null);

  const mmToPx = (mm) => (mm * 96) / 25.4;

  useEffect(() => {
    if (!svgRef.current) return;
    let isMounted = true;

    const pxSize = mmToPx(size);

    QRCode.toString(value, {
      type: "svg",
      width: pxSize,
      margin: 0,
      errorCorrectionLevel: "M", // L M Q H
    }).then(svgString => {
      if (!isMounted || !svgRef.current) return;
      svgRef.current.innerHTML = svgString;

      // Force physical size
      const svgEl = svgRef.current.querySelector("svg");
      if (svgEl) {
        svgEl.style.width = `${size}mm`;
        svgEl.style.height = `${size}mm`;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return <div ref={svgRef} />;
}

export default QRCodeGenerator;