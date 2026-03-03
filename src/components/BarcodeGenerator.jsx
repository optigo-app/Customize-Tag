import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

function BarcodeGenerator({ value = "dummy", width = 30, height = 15 }) {
  const svgRef = useRef(null);

  const mmToPx = (mm) => (mm * 96) / 25.4;

  useEffect(() => {
    if (!svgRef.current) return;

    JsBarcode(svgRef.current, value, {
      format: "CODE128",
      width: 1.5,                      
      height: mmToPx(height),           
      displayValue: false,
      margin: 0,
    });

   
    svgRef.current.style.width = `${width}mm`;
    svgRef.current.style.height = `${height}mm`;

  }, [value, width, height]);

  return <svg ref={svgRef} />;
}

export default BarcodeGenerator;