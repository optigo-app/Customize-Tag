// import QRCode from "qrcode/lib/core/qrcode";
// import SvgRenderer from "qrcode/lib/renderer/svg-tag";

// function generateQRCodeSVG(value, sizeMM) {
//   const mmToPx = (mm) => (mm * 96) / 25.4;
//   const pxSize = mmToPx(sizeMM);

//   const qrData = QRCode.create(value, {
//     errorCorrectionLevel: "M"
//   });

//   const svgString = SvgRenderer.render(qrData, {
//     width: pxSize,
//     margin: 0
//   });

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(svgString, "image/svg+xml");
//   const svgEl = doc.querySelector("svg");

//   svgEl.setAttribute("width", `${sizeMM}mm`);
//   svgEl.setAttribute("height", `${sizeMM}mm`);

//   return svgEl.outerHTML;
// }

// export default generateQRCodeSVG;

import QRCode from "qrcode/lib/core/qrcode";
import SvgRenderer from "qrcode/lib/renderer/svg-tag";

function generateQRCodeSVG(value, sizeMM) {

  const mmToPx = (mm) => (mm * 96) / 25.4;
  const pxSize = mmToPx(sizeMM);

  const qrData = QRCode.create(value, {
    errorCorrectionLevel: "M"
  });

  const svgString = SvgRenderer.render(qrData, {
    width: pxSize,
    margin: 0
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  const svgEl = doc.querySelector("svg");

  svgEl.setAttribute("width", `${sizeMM}mm`);
  svgEl.setAttribute("height", `${sizeMM}mm`);

  return svgEl.outerHTML.replace(/"/g, "'");
}

export default generateQRCodeSVG;