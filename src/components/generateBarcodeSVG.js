import JsBarcode from "jsbarcode";

function generateBarcodeSVG(value, widthMM, heightMM) {
  const svgNode = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  const mmToPx = (mm) => (mm * 96) / 25.4;

  JsBarcode(svgNode, value, {
    format: "CODE128",
    width: 1.5,
    height: mmToPx(heightMM),
    displayValue: false,
    margin: 0,
  });

  // CRITICAL: force physical size
  svgNode.style.width = `${widthMM}mm`;
  svgNode.style.height = `${heightMM}mm`;

  return svgNode.outerHTML;
}

export default generateBarcodeSVG