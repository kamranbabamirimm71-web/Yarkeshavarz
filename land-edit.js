/* =========================================================
   یار کشاورز — land-edit.js V4
   ویرایش مستقل تمام زمین‌ها
   تغییر متراژ همان زمین با نقشه و GPS
   ========================================================= */

(function () {
  "use strict";

  const KEY = "yk-v3-clean";

  /* =========================================================
     HELPERS
     ========================================================= */

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch (e) {
      console.error("YK load error:", e);
      return null;
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error("YK save error:", e);
      return false;
    }
  }

  function faNumber(value) {
    return Number(value || 0).toLocaleString("fa-IR", {
      maximumFractionDigits: 2
    });
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function num(value) {
    return Number(
      String(value ?? "")
        .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
        .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
        .replace(/[٬,\s]/g, "")
    ) || 0;
  }

  function closeAll() {
    document
      .querySelectorAll(".yk-edit-overlay,.yk-measure-overlay")
      .forEach(el => el.remove());
  }

  /* =========================================================
     STYLE
     ========================================================= */

  const style = document.createElement("style");

  style.textContent = `

    /* ================================
       EDIT BUTTON
       ================================ */

    .yk-v4-edit-btn {
      width:100%;
      margin-top:10px;
      padding:13px 14px;
      border:0;
      border-radius:14px;
      background:#166534;
      color:#fff;
      font:800 14px inherit;
      cursor:pointer;
      box-shadow:0 5px 14px rgba(22,101,52,.18);
    }

    .yk-v4-edit-btn:active {
      transform:scale(.98);
    }

    /* ================================
       EDIT MODAL
       ================================ */

    .yk-edit-overlay {
      position:fixed;
      inset:0;
      z-index:99999;
      background:rgba(0,0,0,.55);
      display:flex;
      align-items:flex-end;
      justify-content:center;
      direction:rtl;
    }

    .yk-edit-modal {
      width:100%;
      max-width:680px;
      max-height:94vh;
      overflow:auto;
      background:#fff;
      border-radius:25px 25px 0 0;
      padding:18px;
      box-sizing:border-box;
    }

    .yk-edit-head {
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:14px;
    }

    .yk-edit-head h2 {
      margin:0;
      font-size:20px;
    }

    .yk-edit-close {
      width:40px;
      height:40px;
      border:0;
      border-radius:50%;
      background:#eef2ef;
      font-size:23px;
      cursor:pointer;
    }

    .yk-edit-note {
      padding:12px;
      margin-bottom:14px;
      border-radius:14px;
      background:#f0fdf4;
      border:1px solid #d7f1de;
      color:#166534;
      font-size:13px;
      line-height:1.8;
    }

    .yk-edit-field {
      margin-bottom:12px;
    }

    .yk-edit-field label {
      display:block;
      margin-bottom:6px;
      font-size:13px;
      font-weight:800;
    }

    .yk-edit-field input,
    .yk-edit-field select,
    .yk-edit-field textarea {
      width:100%;
      box-sizing:border-box;
      border:1px solid #d5ded8;
      border-radius:13px;
      padding:12px;
      background:#fff;
      outline:none;
      font:15px inherit;
    }

    .yk-edit-field input:focus,
    .yk-edit-field select:focus,
    .yk-edit-field textarea:focus {
      border-color:#22a05a;
      box-shadow:0 0 0 3px rgba(34,160,90,.1);
    }

    .yk-change-measure {
      width:100%;
      border:1px solid #b8ddc2;
      border-radius:15px;
      padding:14px;
      margin:2px 0 14px;
      background:#f0fdf4;
      color:#166534;
      font:900 15px inherit;
      cursor:pointer;
    }

    .yk-edit-actions {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:9px;
      margin-top:16px;
    }

    .yk-edit-save,
    .yk-edit-cancel {
      border:0;
      border-radius:14px;
      padding:14px;
      font:900 15px inherit;
      cursor:pointer;
    }

    .yk-edit-save {
      background:#166534;
      color:#fff;
    }

    .yk-edit-cancel {
      background:#edf1ee;
      color:#333;
    }

    /* ================================
       MEASUREMENT
       ================================ */

    .yk-measure-overlay {
      position:fixed;
      inset:0;
      z-index:100000;
      background:#fff;
      display:flex;
      flex-direction:column;
      direction:rtl;
    }

    .yk-measure-header {
      padding:10px 12px;
      background:#fff;
      box-shadow:0 2px 12px rgba(0,0,0,.12);
      z-index:5;
    }

    .yk-measure-title {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
    }

    .yk-measure-title strong {
      font-size:17px;
    }

    .yk-measure-close {
      width:38px;
      height:38px;
      border:0;
      border-radius:50%;
      background:#eef2ef;
      font-size:22px;
      cursor:pointer;
    }

    .yk-measure-sub {
      margin-top:4px;
      color:#657067;
      font-size:12px;
      line-height:1.7;
    }

    .yk-measure-map {
      position:relative;
      flex:1;
      min-height:280px;
    }

    .yk-measure-map .leaflet-container {
      width:100%;
      height:100%;
    }

    .yk-map-switch {
      position:absolute;
      top:10px;
      left:10px;
      z-index:1000;
      display:flex;
      flex-direction:column;
      gap:7px;
    }

    .yk-map-switch button {
      border:0;
      border-radius:12px;
      padding:9px 11px;
      background:rgba(255,255,255,.96);
      box-shadow:0 2px 9px rgba(0,0,0,.18);
      font:800 12px inherit;
      cursor:pointer;
    }

    .yk-map-switch button.active {
      background:#166534;
      color:#fff;
    }

    .yk-measure-bottom {
      background:#fff;
      padding:10px 12px 13px;
      box-shadow:0 -3px 15px rgba(0,0,0,.14);
      z-index:5;
    }

    .yk-measure-stats {
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:7px;
      margin-bottom:9px;
    }

    .yk-measure-stat {
      background:#f5f8f5;
      border-radius:12px;
      padding:9px 5px;
      text-align:center;
    }

    .yk-measure-stat b {
      display:block;
      color:#166534;
      font-size:15px;
    }

    .yk-measure-stat span {
      color:#59655d;
      font-size:11px;
    }

    .yk-measure-buttons {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:7px;
    }

    .yk-measure-buttons button {
      border:0;
      border-radius:13px;
      padding:12px 7px;
      font:800 13px inherit;
      cursor:pointer;
    }

    .yk-gps {
      background:#e8f5eb;
      color:#166534;
    }

    .yk-gps.active {
      background:#166534;
      color:#fff;
    }

    .yk-clear {
      background:#f8eeee;
      color:#a22d2d;
    }

    .yk-save-measure {
      width:100%;
      margin-top:8px;
      border:0;
      border-radius:14px;
      padding:14px;
      background:#166534;
      color:#fff;
      font:900 15px inherit;
      cursor:pointer;
    }

    .yk-measure-help {
      text-align:center;
      margin-top:6px;
      color:#68736c;
      font-size:11px;
      line-height:1.7;
    }

    .yk-point-label {
      background:#166534 !important;
      border:0 !important;
      color:#fff !important;
      font-weight:900;
      border-radius:8px !important;
      padding:3px 6px !important;
    }

    @media(min-width:700px) {

      .yk-edit-overlay {
        align-items:center;
        padding:20px;
      }

      .yk-edit-modal {
        border-radius:25px;
        max-height:90vh;
      }

      .yk-measure-bottom,
      .yk-measure-header {
        padding-left:22px;
        padding-right:22px;
      }
    }

  `;

  document.head.appendChild(style);

  /* =========================================================
     FIND ALL LAND CARDS
     ========================================================= */

  function addEditButtons() {

    const state = loadState();

    if (!state || !Array.isArray(state.lands)) {
      return;
    }

    /*
      مهم:
      این بار خود کارت‌های زمین را پیدا می‌کنیم.
      وابسته به article / parent تصادفی نیستیم.
    */

    document.querySelectorAll(".land-card").forEach(card => {

      const openButton =
        card.querySelector("[data-open-land]");

      if (!openButton) {
        return;
      }

      const id =
        openButton.getAttribute("data-open-land");

      if (!id) {
        return;
      }

      /*
        اگر قبلاً دکمه همین زمین ساخته شده،
        دوباره نساز.
      */

      if (
        card.querySelector(
          ".yk-v4-edit-btn[data-land-id=\"" +
          CSS.escape(id) +
          "\"]"
        )
      ) {
        return;
      }

      const landData =
        state.lands.find(x => String(x.id) === String(id));

      if (!landData) {
        return;
      }

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "yk-v4-edit-btn";
      button.dataset.landId = id;
      button.textContent = "✏️ ویرایش این زمین";

      button.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        openEditor(id);

      });

      /*
        داخل خود کارت و بعد از actions
      */

      const actions =
        card.querySelector(".actions");

      if (actions) {
        actions.insertAdjacentElement("afterend", button);
      } else {
        card.appendChild(button);
      }

    });

  }

  /* =========================================================
     EDITOR
     ========================================================= */

  function openEditor(id) {

    const state = loadState();

    if (!state || !Array.isArray(state.lands)) {
      alert("اطلاعات زمین پیدا نشد.");
      return;
    }

    const land =
      state.lands.find(x => String(x.id) === String(id));

    if (!land) {
      alert("زمین موردنظر پیدا نشد.");
      return;
    }

    closeAll();

    const overlay =
      document.createElement("div");

    overlay.className =
      "yk-edit-overlay";

    overlay.innerHTML = `

      <div class="yk-edit-modal">

        <div class="yk-edit-head">

          <h2>
            ✏️ ویرایش ${esc(land.name || "زمین")}
          </h2>

          <button
            type="button"
            class="yk-edit-close"
            id="ykEditClose"
          >
            ×
          </button>

        </div>

        <div class="yk-edit-note">

          این بخش فقط اطلاعات همین زمین را تغییر می‌دهد.
          زمین جدید ساخته نمی‌شود.

          <br>

          برای تغییر واقعی مساحت، از دکمه
          «📐 تغییر متراژ با نقشه و GPS» استفاده کن.

        </div>

        <div class="yk-edit-field">
          <label>نام زمین</label>
          <input
            id="ykName"
            value="${esc(land.name)}"
            placeholder="نام زمین"
          >
        </div>

        <div class="yk-edit-field">
          <label>مساحت فعلی (هکتار)</label>
          <input
            id="ykArea"
            inputmode="decimal"
            value="${esc(land.area)}"
            placeholder="مثلاً 2.5"
          >
        </div>

        <button
          type="button"
          class="yk-change-measure"
          id="ykChangeMeasure"
        >
          📐 تغییر متراژ با نقشه و GPS
        </button>

        <div class="yk-edit-field">
          <label>روستا / شهر / منطقه</label>
          <input
            id="ykRegion"
            value="${esc(land.region)}"
          >
        </div>

        <div class="yk-edit-field">
          <label>مالکیت</label>

          <select id="ykOwnership">

            <option
              value="own"
              ${land.ownership === "own" ? "selected" : ""}
            >
              مالک
            </option>

            <option
              value="rent"
              ${land.ownership === "rent" ? "selected" : ""}
            >
              اجاره‌ای
            </option>

          </select>
        </div>

        <div class="yk-edit-field">
          <label>نام مالک</label>
          <input
            id="ykOwner"
            value="${esc(land.ownerName)}"
          >
        </div>

        <div class="yk-edit-field">
          <label>نوع خاک</label>
          <input
            id="ykSoil"
            value="${esc(land.soil)}"
          >
        </div>

        <div class="yk-edit-field">
          <label>منبع آب</label>
          <input
            id="ykWater"
            value="${esc(land.water)}"
          >
        </div>

        <div class="yk-edit-field">
          <label>نوع آبیاری</label>
          <input
            id="ykIrrigation"
            value="${esc(land.irrigation)}"
          >
        </div>

        <div class="yk-edit-field">
          <label>محصول</label>
          <input
            id="ykCrop"
            value="${esc(land.crop)}"
          >
        </div>

        <div class="yk-edit-field">
          <label>توضیحات</label>
          <textarea
            id="ykNotes"
            rows="4"
          >${esc(land.notes)}</textarea>
        </div>

        <div class="yk-edit-actions">

          <button
            type="button"
            class="yk-edit-save"
            id="ykEditSave"
          >
            💾 ذخیره تغییرات
          </button>

          <button
            type="button"
            class="yk-edit-cancel"
            id="ykEditCancel"
          >
            انصراف
          </button>

        </div>

      </div>

    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#ykEditClose").onclick =
      () => overlay.remove();

    overlay.querySelector("#ykEditCancel").onclick =
      () => overlay.remove();

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    overlay.querySelector("#ykChangeMeasure").onclick =
      function () {
        openMeasurement(id, overlay);
      };

    overlay.querySelector("#ykEditSave").onclick =
      function () {

        const fresh = loadState();

        if (!fresh || !Array.isArray(fresh.lands)) {
          alert("خطا در اطلاعات زمین.");
          return;
        }

        const target =
          fresh.lands.find(
            x => String(x.id) === String(id)
          );

        if (!target) {
          alert("زمین پیدا نشد.");
          return;
        }

        const name =
          overlay.querySelector("#ykName").value.trim();

        const area =
          num(
            overlay.querySelector("#ykArea").value
          );

        if (!name) {
          alert("نام زمین را وارد کن.");
          return;
        }

        if (area <= 0) {
          alert("مساحت باید بیشتر از صفر باشد.");
          return;
        }

        target.name = name;
        target.area = area;

        target.region =
          overlay.querySelector("#ykRegion")
            .value.trim();

        target.ownership =
          overlay.querySelector("#ykOwnership")
            .value;

        target.ownerName =
          overlay.querySelector("#ykOwner")
            .value.trim();

        target.soil =
          overlay.querySelector("#ykSoil")
            .value.trim();

        target.water =
          overlay.querySelector("#ykWater")
            .value.trim();

        target.irrigation =
          overlay.querySelector("#ykIrrigation")
            .value.trim();

        target.crop =
          overlay.querySelector("#ykCrop")
            .value.trim();

        target.notes =
          overlay.querySelector("#ykNotes")
            .value.trim();

        /*
          اگر متراژ نقشه‌ای قبلاً وجود نداشته،
          مساحت دستی را به مترمربع تبدیل کن.
        */

        if (!target.areaM2) {
          target.areaM2 =
            area * 10000;
        }

        if (!saveState(fresh)) {
          alert("ذخیره انجام نشد.");
          return;
        }

        overlay.remove();

        refresh();

      };

  }

  /* =========================================================
     GEO
     ========================================================= */

  function distance(a, b) {

    const R = 6371008.8;
    const rad = Math.PI / 180;

    const dLat =
      (b[0] - a[0]) * rad;

    const dLon =
      (b[1] - a[1]) * rad;

    const lat1 =
      a[0] * rad;

    const lat2 =
      b[0] * rad;

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

    return (
      2 *
      R *
      Math.asin(
        Math.min(1, Math.sqrt(h))
      )
    );

  }

  function areaOf(points) {

    if (points.length < 3) {
      return 0;
    }

    const R = 6371008.8;
    const rad = Math.PI / 180;

    let total = 0;

    for (
      let i = 0;
      i < points.length;
      i++
    ) {

      const a = points[i];

      const b =
        points[
          (i + 1) % points.length
        ];

      total +=
        (b[1] - a[1]) *
        rad *
        (
          2 +
          Math.sin(a[0] * rad) +
          Math.sin(b[0] * rad)
        );

    }

    return Math.abs(
      total * R * R / 2
    );

  }

  function perimeterOf(points) {

    if (points.length < 2) {
      return 0;
    }

    let total = 0;

    for (
      let i = 0;
      i < points.length;
      i++
    ) {

      total +=
        distance(
          points[i],
          points[
            (i + 1) % points.length
          ]
        );

    }

    return total;

  }

  /* =========================================================
     MEASUREMENT
     ========================================================= */

  function openMeasurement(id, editorOverlay) {

    if (typeof L === "undefined") {

      alert(
        "نقشه هنوز آماده نشده است. دوباره امتحان کن."
      );

      return;
    }

    editorOverlay.remove();

    const state = loadState();

    const land =
      state &&
      Array.isArray(state.lands)
        ? state.lands.find(
            x => String(x.id) === String(id)
          )
        : null;

    if (!land) {
      return;
    }

    const overlay =
      document.createElement("div");

    overlay.className =
      "yk-measure-overlay";

    overlay.innerHTML = `

      <div class="yk-measure-header">

        <div class="yk-measure-title">

          <strong>
            📐 تغییر متراژ — ${esc(land.name)}
          </strong>

          <button
            type="button"
            class="yk-measure-close"
            id="ykMeasureClose"
          >
            ×
          </button>

        </div>

        <div class="yk-measure-sub">

          روی نقشه نقطه بزن، یا GPS را روشن کن.
          نقاط قابل جابه‌جایی هستند.

        </div>

      </div>

      <div
        class="yk-measure-map"
        id="ykMeasureMap"
      >

        <div class="yk-map-switch">

          <button
            id="ykStreet"
            class="active"
          >
            🗺️ نقشه
          </button>

          <button
            id="ykSatellite"
          >
            🛰️ ماهواره
          </button>

        </div>

      </div>

      <div class="yk-measure-bottom">

        <div class="yk-measure-stats">

          <div class="yk-measure-stat">
            <b id="ykAreaM2">۰</b>
            <span>مترمربع</span>
          </div>

          <div class="yk-measure-stat">
            <b id="ykAreaHa">۰</b>
            <span>هکتار</span>
          </div>

          <div class="yk-measure-stat">
            <b id="ykPerimeter">۰</b>
            <span>متر محیط</span>
          </div>

        </div>

        <div class="yk-measure-buttons">

          <button
            class="yk-gps"
            id="ykGps"
          >
            📍 شروع GPS
          </button>

          <button
            class="yk-clear"
            id="ykClear"
          >
            🗑️ پاک کردن
          </button>

        </div>

        <button
          class="yk-save-measure"
          id="ykSaveMeasure"
        >
          💾 ثبت متراژ برای همین زمین
        </button>

        <div class="yk-measure-help">

          حداقل ۳ نقطه برای محاسبه مساحت لازم است.
          این ابزار برای اندازه‌گیری تقریبی است.

        </div>

      </div>

    `;

    document.body.appendChild(overlay);

    /* =====================================================
       MAP
       ===================================================== */

    const map =
      L.map(
        "ykMeasureMap",
        {
          zoomControl: true
        }
      ).setView(
        [35.7, 51.4],
        13
      );

    const street =
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom:20,
          attribution:"© OpenStreetMap"
        }
      ).addTo(map);

    const satellite =
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom:20,
          attribution:"© Esri"
        }
      );

    /* =====================================================
       POINTS
       ===================================================== */

    let points = [];

    if (
      land.measurement &&
      Array.isArray(land.measurement.points)
    ) {

      points =
        land.measurement.points
          .map(p => [
            Number(p[0]),
            Number(p[1])
          ])
          .filter(
            p =>
              Number.isFinite(p[0]) &&
              Number.isFinite(p[1])
          );

    }

    let markers = [];
    let polygon = null;

    let gpsWatch = null;
    let gpsActive = false;

    /* =====================================================
       DRAW
       ===================================================== */

    function redraw() {

      markers.forEach(
        marker => marker.remove()
      );

      markers = [];

      if (polygon) {
        polygon.remove();
        polygon = null;
      }

      points.forEach(
        (point, index) => {

          const marker =
            L.marker(
              point,
              {
                draggable:true
              }
            ).addTo(map);

          marker.bindTooltip(
            String(index + 1),
            {
              permanent:true,
              direction:"top",
              offset:[0,-10],
              className:"yk-point-label"
            }
          );

          marker.on(
            "dragend",
            function () {

              const p =
                marker.getLatLng();

              points[index] = [
                p.lat,
                p.lng
              ];

              redraw();

            }
          );

          markers.push(marker);

        }
      );

      if (points.length >= 2) {

        polygon =
          L.polygon(
            points,
            {
              color:"#166534",
              weight:4,
              fillOpacity:.16
            }
          ).addTo(map);

      }

      updateStats();

    }

    /* =====================================================
       STATS
       ===================================================== */

    function updateStats() {

      const area =
        areaOf(points);

      const perimeter =
        perimeterOf(points);

      overlay.querySelector(
        "#ykAreaM2"
      ).textContent =
        faNumber(area);

      overlay.querySelector(
        "#ykAreaHa"
      ).textContent =
        faNumber(area / 10000);

      overlay.querySelector(
        "#ykPerimeter"
      ).textContent =
        faNumber(perimeter);

    }

    /* =====================================================
       MAP CLICK
       ===================================================== */

    map.on(
      "click",
      function (event) {

        points.push([
          event.latlng.lat,
          event.latlng.lng
        ]);

        redraw();

      }
    );

    /* =====================================================
       MAP TYPE
       ===================================================== */

    overlay.querySelector(
      "#ykStreet"
    ).onclick =
      function () {

        if (!map.hasLayer(street)) {
          map.addLayer(street);
        }

        if (map.hasLayer(satellite)) {
          map.removeLayer(satellite);
        }

        this.classList.add("active");

        overlay.querySelector(
          "#ykSatellite"
        ).classList.remove("active");

      };

    overlay.querySelector(
      "#ykSatellite"
    ).onclick =
      function () {

        if (!map.hasLayer(satellite)) {
          map.addLayer(satellite);
        }

        if (map.hasLayer(street)) {
          map.removeLayer(street);
        }

        this.classList.add("active");

        overlay.querySelector(
          "#ykStreet"
        ).classList.remove("active");

      };

    /* =====================================================
       CLEAR
       ===================================================== */

    overlay.querySelector(
      "#ykClear"
    ).onclick =
      function () {

        if (
          !confirm(
            "همه نقاط اندازه‌گیری پاک شود؟"
          )
        ) {
          return;
        }

        points = [];

        redraw();

      };

    /* =====================================================
       GPS
       ===================================================== */

    function stopGPS() {

      if (
        gpsWatch !== null &&
        navigator.geolocation
      ) {

        navigator.geolocation.clearWatch(
          gpsWatch
        );

      }

      gpsWatch = null;
      gpsActive = false;

      const button =
        overlay.querySelector(
          "#ykGps"
        );

      if (button) {

        button.textContent =
          "📍 شروع GPS";

        button.classList.remove(
          "active"
        );

      }

    }

    overlay.querySelector(
      "#ykGps"
    ).onclick =
      function () {

        if (gpsActive) {

          stopGPS();

          return;

        }

        if (!navigator.geolocation) {

          alert(
            "GPS در این دستگاه در دسترس نیست."
          );

          return;

        }

        gpsActive = true;

        this.textContent =
          "⏹️ توقف GPS";

        this.classList.add(
          "active"
        );

        navigator.geolocation.getCurrentPosition(

          function (position) {

            const point = [
              position.coords.latitude,
              position.coords.longitude
            ];

            if (points.length === 0) {

              map.setView(
                point,
                18
              );

            }

            points.push(point);

            redraw();

          },

          function () {

            alert(
              "اجازه دسترسی به موقعیت مکانی داده نشد."
            );

            stopGPS();

          },

          {
            enableHighAccuracy:true,
            timeout:15000,
            maximumAge:0
          }

        );

        gpsWatch =
          navigator.geolocation.watchPosition(

            function (position) {

              const point = [
                position.coords.latitude,
                position.coords.longitude
              ];

              /*
                هر ۲ متر یک نقطه جدید.
              */

              if (
                points.length === 0 ||
                distance(
                  points[points.length - 1],
                  point
                ) >= 2
              ) {

                points.push(point);

                map.setView(
                  point,
                  18
                );

                redraw();

              }

            },

            function () {},

            {
              enableHighAccuracy:true,
              timeout:15000,
              maximumAge:1000
            }

          );

      };

    /* =====================================================
       CLOSE
       ===================================================== */

    overlay.querySelector(
      "#ykMeasureClose"
    ).onclick =
      function () {

        stopGPS();

        overlay.remove();

        openEditor(id);

      };

    /* =====================================================
       SAVE
       ===================================================== */

    overlay.querySelector(
      "#ykSaveMeasure"
    ).onclick =
      function () {

        if (points.length < 3) {

          alert(
            "حداقل ۳ نقطه برای اندازه‌گیری لازم است."
          );

          return;

        }

        const fresh =
          loadState();

        if (
          !fresh ||
          !Array.isArray(fresh.lands)
        ) {

          alert(
            "اطلاعات زمین پیدا نشد."
          );

          return;

        }

        const target =
          fresh.lands.find(
            x => String(x.id) === String(id)
          );

        if (!target) {

          alert(
            "زمین پیدا نشد."
          );

          return;

        }

        const area =
          areaOf(points);

        const perimeter =
          perimeterOf(points);

        if (area <= 0) {

          alert(
            "مساحت قابل محاسبه نیست."
          );

          return;

        }

        /*
          مهم:
          همین زمین به‌روزرسانی می‌شود.
          زمین جدید ساخته نمی‌شود.
        */

        target.areaM2 =
          area;

        target.area =
          area / 10000;

        target.perimeter =
          perimeter;

        target.measurement = {

          points:
            points.map(
              p => [
                p[0],
                p[1]
              ]
            ),

          areaM2:
            area,

          perimeterM:
            perimeter,

          updatedAt:
            new Date().toISOString()

        };

        /*
          اگر مختصات مرکز زمین موجود نباشد،
          مرکز تقریبی ذخیره می‌شود.
        */

        if (
          !Number.isFinite(
            Number(target.lat)
          ) ||
          !Number.isFinite(
            Number(target.lng)
          )
        ) {

          let lat = 0;
          let lng = 0;

          points.forEach(
            p => {
              lat += p[0];
              lng += p[1];
            }
          );

          target.lat =
            lat / points.length;

          target.lng =
            lng / points.length;

        }

        if (!saveState(fresh)) {

          alert(
            "ذخیره متراژ انجام نشد."
          );

          return;

        }

        // Keep the main V3 in-memory state in sync with the editor.
        // Otherwise the next render could show the old area until reload.
        if (typeof state !== "undefined" && typeof normalize === "function") {
          state = normalize(fresh);
        }

        stopGPS();

        overlay.remove();

        refresh();

        /*
          ویرایش همان زمین دوباره باز می‌شود.
        */

        setTimeout(
          () => openEditor(id),
          350
        );

      };

    /* =====================================================
       INITIAL
       ===================================================== */

    if (points.length >= 2) {

      map.fitBounds(
        L.latLngBounds(points),
        {
          padding:[25,25]
        }
      );

    }

    redraw();

    setTimeout(
      () => map.invalidateSize(),
      200
    );

  }

  /* =========================================================
     REFRESH
     ========================================================= */

  function refresh() {

    try {

      if (typeof window.go === "function") {

        window.go("home");

        setTimeout(
          function () {
            window.go("lands");
          },
          120
        );

        return;

      }

    } catch (e) {
      console.error(e);
    }

    location.reload();

  }

  /* =========================================================
     OBSERVER
     ========================================================= */

  let scheduled = false;

  function scheduleButtons() {

    if (scheduled) {
      return;
    }

    scheduled = true;

    setTimeout(
      function () {

        scheduled = false;

        addEditButtons();

      },
      80
    );

  }

  const observer =
    new MutationObserver(
      scheduleButtons
    );

  /* =========================================================
     BOOT
     ========================================================= */

  function boot() {

    addEditButtons();

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

    setTimeout(
      addEditButtons,
      300
    );

    setTimeout(
      addEditButtons,
      1000
    );

    setTimeout(
      addEditButtons,
      2000
    );

  }

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      boot
    );

  } else {

    boot();

  }

})();
