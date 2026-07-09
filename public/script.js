(function () {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const gridWrap = document.getElementById("gridWrap");
  const catalogGrid = document.getElementById("catalogGrid");
  const fileNameEl = document.getElementById("fileName");
  const fileDimEl = document.getElementById("fileDim");
  const resetBtn = document.getElementById("resetBtn");
  const downloadAllBtn = document.getElementById("downloadAllBtn");

  const COLS = 3;
  const ROWS = 2;
  const TOTAL = COLS * ROWS;

  let tileBlobs = new Array(TOTAL).fill(null);
  let baseName = "nima-dev-catalog";

  // ---- Open file picker ----
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // ---- Drag and drop ----
  ["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    });
  });
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  });

  resetBtn.addEventListener("click", () => {
    fileInput.value = "";
    gridWrap.hidden = true;
    catalogGrid.innerHTML = "";
    tileBlobs = new Array(TOTAL).fill(null);
    dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  function handleFile(file) {
    baseName = file.name.replace(/\.[^/.]+$/, "").trim() || "nima-dev-catalog";
    baseName = baseName.replace(/\s+/g, "-").toLowerCase();

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      buildGrid(img, file.name);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function buildGrid(img, displayName) {
    catalogGrid.innerHTML = "";
    tileBlobs = new Array(TOTAL).fill(null);

    const tileW = Math.floor(img.width / COLS);
    const tileH = Math.floor(img.height / ROWS);

    fileNameEl.textContent = displayName;
    fileDimEl.textContent = `${img.width}×${img.height}px → 6 tiles of ${tileW}×${tileH}px`;

    let index = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tileIndex = index; // 0-based
        index++;

        const tile = document.createElement("div");
        tile.className = "tile";

        const canvas = document.createElement("canvas");
        canvas.width = tileW;
        canvas.height = tileH;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          img,
          c * tileW, r * tileH, tileW, tileH,
          0, 0, tileW, tileH
        );

        const overlay = document.createElement("div");
        overlay.className = "tile-overlay";

        const num = document.createElement("span");
        num.className = "tile-num";
        num.textContent = String(tileIndex + 1).padStart(2, "0");

        const dlBtn = document.createElement("button");
        dlBtn.className = "tile-dl";
        dlBtn.setAttribute("aria-label", `Download tile ${tileIndex + 1}`);
        dlBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        overlay.appendChild(num);
        overlay.appendChild(dlBtn);
        tile.appendChild(canvas);
        tile.appendChild(overlay);
        catalogGrid.appendChild(tile);

        canvas.toBlob((blob) => {
          tileBlobs[tileIndex] = blob;
          dlBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            downloadBlob(blob, tileFileName(tileIndex));
          });
        }, "image/png");
      }
    }

    gridWrap.hidden = false;
    gridWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function tileFileName(i) {
    return `${baseName}-${String(i + 1).padStart(2, "0")}.png`;
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  downloadAllBtn.addEventListener("click", async () => {
    if (tileBlobs.some((b) => !b)) return;
    downloadAllBtn.textContent = "Zipping…";
    downloadAllBtn.disabled = true;

    const zip = new JSZip();
    tileBlobs.forEach((blob, i) => {
      zip.file(tileFileName(i), blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    downloadBlob(content, `${baseName}-catalog.zip`);

    downloadAllBtn.textContent = "Download all (.zip)";
    downloadAllBtn.disabled = false;
  });
})();
