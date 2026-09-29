/* =========================================================
   YarKeshavarz — Online Land Measurement
   modules/measurement.js

   امکانات:
   - نقشه آنلاین
   - جستجوی مکان
   - حالت ماهواره‌ای
   - انتخاب نقطه روی نقشه
   - جابه‌جایی نقاط
   - محاسبه مساحت مترمربع
   - محاسبه هکتار
   - محاسبه محیط
   - GPS
   - ذخیره اندازه‌گیری در پرونده زمین
   - انتقال اندازه‌گیری جدید به فرم ثبت زمین

   توجه:
   این ماژول برای اندازه‌گیری آنلاین است و به اینترنت نیاز دارد.
   ========================================================= */

(function () {

  'use strict';

  if (window.__YK_MEASUREMENT_V2__) return;
  window.__YK_MEASUREMENT_V2__ = true;

  let leafletReady = null;

  /* ---------------------------------------------------------
     بارگذاری Leaflet فقط زمانی که صفحه اندازه‌گیری باز شود
     --------------------------------------------------------- */

  function loadLeaflet() {

    if (leafletReady) return leafletReady;

    leafletReady = new Promise(function (resolve, reject) {

      function loadRotatePlugin() {
        if (window.L && window.L.Map && window.L.Map.prototype && typeof window.L.Map.prototype.setBearing === 'function') {
          resolve(window.L);
          return;
        }

        const plugin = document.createElement('script');
        plugin.id = 'yk-leaflet-rotate-js';
        plugin.src = 'https://cdn.jsdelivr.net/npm/@tomickigrzegorz/leaflet-rotate@0.2.4/dist/leaflet-rotate.umd.min.js';
        plugin.onload = function () { resolve(window.L); };
        plugin.onerror = function () {
          // The measurement screen still works without rotation if the CDN is unavailable.
          resolve(window.L);
        };
        document.head.appendChild(plugin);
      }

      function loadLeafletScript() {
        if (window.L) {
          loadRotatePlugin();
          return;
        }

        const script = document.createElement('script');
        script.id = 'yk-leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = loadRotatePlugin;
        script.onerror = function () { reject(new Error('Leaflet load failed')); };
        document.head.appendChild(script);
      }

      if (!document.getElementById('yk-leaflet-css')) {
        const css = document.createElement('link');
        css.id = 'yk-leaflet-css';
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }

      loadLeafletScript();
    });

    return leafletReady;
  }


  /* ---------------------------------------------------------
     اعداد فارسی
     --------------------------------------------------------- */

  function faNumber(value, decimals) {

    const number = Number(value || 0);

    return number.toLocaleString('fa-IR', {
      maximumFractionDigits:
        decimals == null ? 2 : decimals
    });
  }


  /* ---------------------------------------------------------
     Escape HTML
     --------------------------------------------------------- */

  function escapeMeasurement(value) {

    return String(value ?? '').replace(
      /[&<>"']/g,
      function (char) {

        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[char];

      }
    );

  }


  /* ---------------------------------------------------------
     پیام
     --------------------------------------------------------- */

  function measurementToast(message) {

    if (typeof window.toast === 'function') {
      window.toast(message);
    } else {
      alert(message);
    }

  }


  /* ---------------------------------------------------------
     فاصله بین دو نقطه GPS
     Haversine
     --------------------------------------------------------- */

  function distanceBetween(a, b) {

    const R = 6371000;

    const lat1 =
      Number(a[0]) * Math.PI / 180;

    const lat2 =
      Number(b[0]) * Math.PI / 180;

    const dLat =
      (Number(b[0]) - Number(a[0])) *
      Math.PI / 180;

    const dLng =
      (Number(b[1]) - Number(a[1])) *
      Math.PI / 180;

    const x =
      Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
      Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    return 2 * R *
      Math.asin(
        Math.sqrt(
          Math.min(1, x)
        )
      );

  }


  /* ---------------------------------------------------------
     محاسبه مساحت تقریبی بر اساس مختصات
     --------------------------------------------------------- */

  function calculateArea(pointsList) {

    if (
      !Array.isArray(pointsList) ||
      pointsList.length < 3
    ) {
      return 0;
    }

    const R = 6371000;

    const averageLatitude =
      pointsList.reduce(function (sum, point) {
        return sum + Number(point[0]);
      }, 0) /
      pointsList.length;

    const lat0 =
      averageLatitude * Math.PI / 180;

    let area = 0;

    for (
      let i = 0;
      i < pointsList.length;
      i++
    ) {

      const current =
        pointsList[i];

      const next =
        pointsList[
          (i + 1) % pointsList.length
        ];

      const x1 =
        R *
        Number(current[1]) *
        Math.PI / 180 *
        Math.cos(lat0);

      const y1 =
        R *
        Number(current[0]) *
        Math.PI / 180;

      const x2 =
        R *
        Number(next[1]) *
        Math.PI / 180 *
        Math.cos(lat0);

      const y2 =
        R *
        Number(next[0]) *
        Math.PI / 180;

      area +=
        x1 * y2 -
        x2 * y1;

    }

    return Math.abs(area) / 2;

  }


  /* ---------------------------------------------------------
     محاسبه محیط
     --------------------------------------------------------- */

  function calculatePerimeter(pointsList) {

    if (
      !Array.isArray(pointsList) ||
      pointsList.length < 2
    ) {
      return 0;
    }

    let perimeterValue = 0;

    for (
      let i = 0;
      i < pointsList.length;
      i++
    ) {

      const current =
        pointsList[i];

      const next =
        pointsList[
          (i + 1) % pointsList.length
        ];

      perimeterValue +=
        distanceBetween(
          current,
          next
        );

    }

    return perimeterValue;

  }


  /* ---------------------------------------------------------
     صفحه اندازه‌گیری
     --------------------------------------------------------- */

  window.measure = function (landId) {

    if (landId) {
      window.selected = landId;
    }

    if (!window.measureReturn) {

      window.measureReturn =
        landId ? 'land' : 'add';

    }

    if (typeof window.head === 'function') {
      window.head('متراژ آنلاین');
    }

    const appElement =
      document.getElementById('app');

    if (!appElement) return;


    appElement.innerHTML = `
      <div class="yk-measure-screen">
        <div class="yk-measure-map" id="measureMap"></div>

        <div class="yk-measure-top">
          <button class="yk-m-icon" id="measureClose" type="button" aria-label="بازگشت">‹</button>
          <div class="yk-m-title">
            <b>اندازه‌گیری زمین</b>
            <span id="measureModeHint">نقطه‌های گوشه زمین را روی نقشه بزن</span>
          </div>
          <button class="yk-m-icon" id="measureLocate" type="button" aria-label="موقعیت من">⌖</button>
        </div>

        <div class="yk-measure-search">
          <input id="measureSearch" type="search" placeholder="جستجوی شهر، روستا یا مکان..." autocomplete="off">
          <button id="measureSearchBtn" type="button">جستجو</button>
        </div>

        <div class="yk-measure-tools">
          <button id="measureSat" type="button"><span>🛰️</span><b>ماهواره</b></button>
          <button id="measureUndo" type="button"><span>↶</span><b>حذف نقطه</b></button>
          <button id="measureClear" type="button"><span>🗑️</span><b>پاک کردن</b></button>
          <button id="measureResetBearing" type="button"><span>🧭</span><b>شمال</b></button>
        </div>

        <div class="yk-measure-help">
          <span>● تک‌لمس = انتخاب گوشه زمین</span>
          <span>● دو انگشت = جابه‌جایی / بزرگ‌نمایی / چرخش نقشه</span>
        </div>

        <div class="yk-measure-sheet">
          <div class="yk-measure-sheet-head">
            <div>
              <b>اندازه زمین</b>
              <span id="measureStatus">در حال آماده‌سازی نقشه آنلاین...</span>
            </div>
            <div class="yk-point-badge"><b id="mn">۰</b><span>نقطه</span></div>
          </div>

          <div class="yk-measure-stats">
            <div><span>مساحت</span><b id="ma">۰</b><small>مترمربع</small></div>
            <div><span>هکتار</span><b id="mh">۰</b><small>ha</small></div>
            <div><span>محیط</span><b id="mp">۰</b><small>متر</small></div>
          </div>

          <div class="yk-measure-actions">
            <button class="yk-gps" id="gpsBtn" type="button">📍 شروع پیمایش زمین</button>
            <button class="yk-register" id="ykMeasureRegister" type="button" disabled>✓ ثبت زمین</button>
          </div>

          <div class="yk-measure-foot">برای مساحت دقیق حداقل ۳ گوشه را مشخص کن.</div>
        </div>
      </div>
    `;

    injectMeasurementStyles();



    /* -------------------------------------------------------
       وضعیت اندازه‌گیری
       ------------------------------------------------------- */

    window.points = [];

    window.markers = [];

    window.polygon = null;


    /* -------------------------------------------------------
       اگر زمین قبلاً اندازه‌گیری شده باشد
       ------------------------------------------------------- */

    if (
      landId &&
      window.state &&
      Array.isArray(window.state.lands)
    ) {

      const land =
        window.state.lands &&
        window.state.lands.find(
          function (item) {
            return item.id === landId;
          }
        );

      if (
        land &&
        land.measurement &&
        Array.isArray(
          land.measurement.points
        )
      ) {

        window.points =
          land.measurement.points
            .map(function (point) {

              return [
                Number(point[0]),
                Number(point[1])
              ];

            });

      }

    }


    /* -------------------------------------------------------
       اتصال دکمه‌ها
       ------------------------------------------------------- */

    const searchButton =
      document.getElementById(
        'measureSearchBtn'
      );

    if (searchButton) {
      searchButton.onclick =
        searchPlace;
    }


    const searchInput =
      document.getElementById(
        'measureSearch'
      );

    if (searchInput) {

      searchInput.addEventListener(
        'keydown',
        function (event) {

          if (event.key === 'Enter') {
            event.preventDefault();
            searchPlace();
          }

        }
      );

    }


    const locateButton =
      document.getElementById(
        'measureLocate'
      );

    if (locateButton) {
      locateButton.onclick =
        locateUser;
    }


    const satelliteButton =
      document.getElementById(
        'measureSat'
      );

    if (satelliteButton) {
      satelliteButton.onclick =
        toggleSatellite;
    }


    const undoButton =
      document.getElementById(
        'measureUndo'
      );

    if (undoButton) {
      undoButton.onclick =
        undoLastPoint;
    }


    const clearButton =
      document.getElementById(
        'measureClear'
      );

    if (clearButton) {
      clearButton.onclick =
        clearMeasurement;
    }


    const closeButton =
      document.getElementById(
        'measureClose'
      );

    if (closeButton) {
      closeButton.onclick =
        closeMeasurement;
    }


    const gpsButton =
      document.getElementById(
        'gpsBtn'
      );

    if (gpsButton) {
      gpsButton.onclick =
        toggleGPS;
    }


    const registerButton =
      document.getElementById(
        'ykMeasureRegister'
      );

    if (registerButton) {
      registerButton.onclick =
        registerMeasurement;
    }


    /* -------------------------------------------------------
       بارگذاری نقشه
       ------------------------------------------------------- */

    loadLeaflet()
      .then(function () {

        initializeMap();

      })
      .catch(function () {

        const status =
          document.getElementById(
            'measureStatus'
          );

        if (status) {

          status.textContent =
            '❌ نقشه آنلاین بارگذاری نشد. اینترنت را بررسی کن و دوباره تلاش کن.';

        }

      });

  };


  /* =========================================================
     متغیرهای نقشه
     ========================================================= */

  let mapInstance = null;

  let osmLayer = null;

  let satelliteLayer = null;

  let satelliteEnabled = false;

  let gpsWatchId = null;


  /* ---------------------------------------------------------
     ساخت نقشه
     --------------------------------------------------------- */

  function initializeMap() {

    const L =
      window.L;

    if (!L) return;


    const mapElement =
      document.getElementById(
        'measureMap'
      );

    if (!mapElement) return;


    if (mapInstance) {

      try {
        mapInstance.remove();
      } catch (error) {}

      mapInstance = null;

    }


    const rotationSupported = !!(L.Map && L.Map.prototype && typeof L.Map.prototype.setBearing === 'function');

    mapInstance =
      L.map(
        'measureMap',
        {
          zoomControl: true,
          touchZoom: true,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: false,
          keyboard: true,
          tap: false,
          ...(rotationSupported ? {
            rotate: true,
            touchRotate: true,
            dragRotate: false,
            shiftKeyRotate: false,
            rotateClockwise: true,
            preventPageGestures: true
          } : {})
        }
      );


    /* -------------------------------------------------------
       نقشه معمولی
       ------------------------------------------------------- */

    osmLayer =
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 20,
          attribution:
            '© OpenStreetMap'
        }
      );


    osmLayer.addTo(
      mapInstance
    );


    satelliteLayer = null;

    satelliteEnabled = false;


    /* -------------------------------------------------------
       مرکز اولیه ایران
       ------------------------------------------------------- */

    mapInstance.setView(
      [32.4279, 53.6880],
      5
    );


    /* -------------------------------------------------------
       لمس امن نقشه: تک لمس = نقطه، دو انگشت = حرکت/چرخش/زوم
       ------------------------------------------------------- */

    (function bindMapInput(){
      const container = mapInstance.getContainer();
      let multiTouch = false;
      let multiTouchTimer = null;

      container.style.touchAction = 'none';
      container.style.overscrollBehavior = 'none';

      container.addEventListener('touchstart', function(event){
        if (event.touches && event.touches.length >= 2) {
          multiTouch = true;
          clearTimeout(multiTouchTimer);
        }
      }, {passive:true});

      container.addEventListener('touchend', function(event){
        if (multiTouch && (!event.touches || event.touches.length === 0)) {
          multiTouchTimer = setTimeout(function(){ multiTouch = false; }, 550);
        }
      }, {passive:true});

      mapInstance.on('click', function(event){
        if (multiTouch) return;
        if (!event || !event.latlng) return;
        addPoint(event.latlng.lat, event.latlng.lng);
      });

      const resetBearingButton = document.getElementById('measureResetBearing');
      if (resetBearingButton) {
        resetBearingButton.onclick = function(){
          if (mapInstance && typeof mapInstance.setBearing === 'function') {
            mapInstance.setBearing(0);
            measurementToast('🧭 جهت نقشه به شمال برگشت.');
          } else {
            measurementToast('چرخش دو انگشتی در این مرورگر در دسترس نیست.');
          }
        };
      }

      const hint = document.getElementById('measureModeHint');
      if (hint && typeof mapInstance.setBearing === 'function') {
        hint.textContent = 'تک‌لمس برای گوشه‌ها؛ دو انگشت برای حرکت، زوم و چرخش';
      }
    })();


    /* -------------------------------------------------------
       نقاط قبلی
       ------------------------------------------------------- */

    if (
      Array.isArray(
        window.points
      ) &&
      window.points.length
    ) {

      window.points.forEach(
        function (point, index) {

          addMarker(
            point,
            index
          );

        }
      );

      try {
        if (window.points.length) {
          mapInstance.fitBounds(window.points, {padding:[50,50], maxZoom:17});
        }
      } catch (error) {}


      redrawPolygon();


      try {

        mapInstance.fitBounds(
          L.latLngBounds(
            window.points
          ),
          {
            padding: [
              50,
              50
            ]
          }
        );

      } catch (error) {}

    }


    updateMeasurementUI();


    const status =
      document.getElementById(
        'measureStatus'
      );

    if (
      status &&
      (!window.points ||
       window.points.length === 0)
    ) {

      status.textContent =
        'روی نقشه نقاط زمین را مشخص کن؛ حداقل ۳ نقطه برای محاسبه مساحت لازم است.';

    }

  }


  /* ---------------------------------------------------------
     اضافه کردن Marker
     --------------------------------------------------------- */

  function addMarker(
    point,
    index
  ) {

    if (!mapInstance) return;

    const L =
      window.L;

    const marker =
      L.marker(
        point,
        {
          draggable: true
        }
      ).addTo(
        mapInstance
      );


    marker.bindTooltip(
      'نقطه ' +
      faNumber(index + 1, 0),
      {
        direction: 'top'
      }
    );


    marker.on(
      'dragend',
      function () {

        const position =
          marker.getLatLng();

        window.points[index] = [
          position.lat,
          position.lng
        ];

        redrawPolygon();

      }
    );


    window.markers.push(
      marker
    );

  }


  /* ---------------------------------------------------------
     افزودن نقطه
     --------------------------------------------------------- */

  function addPoint(
    latitude,
    longitude
  ) {

    if (!mapInstance) return;


    const pointIndex =
      window.points.length;


    window.points.push([
      Number(latitude),
      Number(longitude)
    ]);


    addMarker(
      [
        Number(latitude),
        Number(longitude)
      ],
      pointIndex
    );


    redrawPolygon();

  }


  /* ---------------------------------------------------------
     رسم Polygon
     --------------------------------------------------------- */

  function redrawPolygon() {

    if (!mapInstance) return;


    const L =
      window.L;


    if (window.polygon) {

      try {
        mapInstance.removeLayer(
          window.polygon
        );
      } catch (error) {}

    }


    if (
      Array.isArray(
        window.points
      ) &&
      window.points.length >= 3
    ) {

      window.polygon =
        L.polygon(
          window.points,
          {
            color: '#17664b',
            weight: 3,
            fillOpacity: 0.18
          }
        ).addTo(
          mapInstance
        );

    } else {

      window.polygon = null;

    }


    updateMeasurementUI();

  }


  /* ---------------------------------------------------------
     بروزرسانی اطلاعات اندازه‌گیری
     --------------------------------------------------------- */

  function updateMeasurementUI() {

    const pointsList =
      Array.isArray(window.points)
        ? window.points
        : [];


    const area =
      calculateArea(
        pointsList
      );


    const perimeter =
      calculatePerimeter(
        pointsList
      );


    const areaElement =
      document.getElementById('ma');

    const hectareElement =
      document.getElementById('mh');

    const perimeterElement =
      document.getElementById('mp');

    const pointsElement =
      document.getElementById('mn');

    const registerElement =
      document.getElementById('ykMeasureRegister');

    const statusElement =
      document.getElementById(
        'measureStatus'
      );


    if (areaElement) {

      areaElement.textContent =
        faNumber(area, 0);

    }


    if (hectareElement) {

      hectareElement.textContent =
        faNumber(
          area / 10000,
          4
        );

    }


    if (perimeterElement) {

      perimeterElement.textContent =
        faNumber(
          perimeter,
          0
        );

    }


    if (pointsElement) {

      pointsElement.textContent =
        faNumber(
          pointsList.length,
          0
        );

    }


    if (registerElement) {

      registerElement.disabled =
        pointsList.length < 3;

    }


    if (statusElement) {

      if (
        pointsList.length < 3
      ) {

        statusElement.textContent =
          'حداقل ۳ نقطه لازم است.';

      } else {

        statusElement.textContent =
          '✅ اندازه‌گیری آماده ثبت است.';

      }

    }

  }


  /* ---------------------------------------------------------
     حذف آخرین نقطه
     --------------------------------------------------------- */

  function undoLastPoint() {

    if (
      !Array.isArray(
        window.points
      ) ||
      !window.points.length
    ) {
      return;
    }


    const marker =
      window.markers.pop();


    if (
      marker &&
      mapInstance
    ) {

      try {
        mapInstance.removeLayer(
          marker
        );
      } catch (error) {}

    }


    window.points.pop();


    redrawPolygon();

  }


  /* ---------------------------------------------------------
     پاک کردن کامل
     --------------------------------------------------------- */

  function clearMeasurement() {

    stopGPS();


    window.points = [];


    if (
      Array.isArray(
        window.markers
      )
    ) {

      window.markers.forEach(
        function (marker) {

          try {

            if (mapInstance) {
              mapInstance.removeLayer(
                marker
              );
            }

          } catch (error) {}

        }
      );

    }


    window.markers = [];


    if (
      window.polygon &&
      mapInstance
    ) {

      try {

        mapInstance.removeLayer(
          window.polygon
        );

      } catch (error) {}

    }


    window.polygon = null;


    updateMeasurementUI();

  }


  /* =========================================================
     GPS
     ========================================================= */

  function locateUser() {

    if (
      !navigator.geolocation
    ) {

      measurementToast(
        'GPS در این مرورگر در دسترس نیست.'
      );

      return;

    }


    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost'
    ) {

      measurementToast(
        'برای استفاده از GPS باید برنامه روی HTTPS اجرا شود.'
      );

      return;

    }


    navigator.geolocation.getCurrentPosition(

      function (position) {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        if (mapInstance) {

          mapInstance.setView(
            [
              latitude,
              longitude
            ],
            17
          );

        }


        addPoint(
          latitude,
          longitude
        );


        measurementToast(
          '📍 موقعیت شما به‌عنوان نقطه اندازه‌گیری ثبت شد.'
        );

      },

      function (error) {

        if (error.code === 1) {

          measurementToast(
            'اجازه دسترسی به موقعیت مکانی داده نشده است.'
          );

        } else {

          measurementToast(
            'موقعیت GPS دریافت نشد؛ GPS و اینترنت را بررسی کن.'
          );

        }

      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }

    );

  }


  /* ---------------------------------------------------------
     شروع / توقف GPS
     --------------------------------------------------------- */

  function toggleGPS() {

    if (
      gpsWatchId !== null
    ) {

      stopGPS();

      return;

    }


    if (
      !navigator.geolocation
    ) {

      measurementToast(
        'GPS در این دستگاه در دسترس نیست.'
      );

      return;

    }


    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost'
    ) {

      measurementToast(
        'پیمایش GPS فقط روی HTTPS فعال است.'
      );

      return;

    }


    gpsWatchId =
      navigator.geolocation.watchPosition(

        function (position) {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;


          if (mapInstance) {

            mapInstance.setView(
              [
                latitude,
                longitude
              ],
              18
            );

          }


          addPoint(
            latitude,
            longitude
          );

        },

        function (error) {

          stopGPS();

          if (
            error.code === 1
          ) {

            measurementToast(
              'اجازه Location داده نشده است.'
            );

          } else {

            measurementToast(
              'سیگنال GPS دریافت نشد.'
            );

          }

        },

        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 15000
        }

      );


    const button =
      document.getElementById(
        'gpsBtn'
      );


    if (button) {

      button.textContent =
        '■ توقف پیمایش زمین';

    }

  }


  /* ---------------------------------------------------------
     توقف GPS
     --------------------------------------------------------- */

  function stopGPS() {

    if (
      gpsWatchId !== null
    ) {

      navigator.geolocation.clearWatch(
        gpsWatchId
      );

      gpsWatchId = null;

    }


    const button =
      document.getElementById(
        'gpsBtn'
      );


    if (button) {

      button.textContent =
        '📍 شروع پیمایش زمین';

    }

  }


  /* =========================================================
     حالت ماهواره‌ای
     ========================================================= */

  function toggleSatellite() {

    if (!mapInstance) return;


    const L =
      window.L;


    if (satelliteEnabled) {

      if (
        satelliteLayer
      ) {

        try {

          mapInstance.removeLayer(
            satelliteLayer
          );

        } catch (error) {}

      }


      if (
        osmLayer &&
        !mapInstance.hasLayer(
          osmLayer
        )
      ) {

        osmLayer.addTo(
          mapInstance
        );

      }


      satelliteEnabled = false;


      const button =
        document.getElementById(
          'measureSat'
        );

      if (button) {

        button.textContent =
          '🛰️ ماهواره';

      }


      return;

    }


    if (
      osmLayer &&
      mapInstance.hasLayer(
        osmLayer
      )
    ) {

      mapInstance.removeLayer(
        osmLayer
      );

    }


    satelliteLayer =
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution:
            'Tiles © Esri'
        }
      );


    satelliteLayer.addTo(
      mapInstance
    );


    satelliteEnabled = true;


    const button =
      document.getElementById(
        'measureSat'
      );


    if (button) {

      button.textContent =
        '🗺️ نقشه معمولی';

    }

  }


  /* =========================================================
     جستجوی مکان
     ========================================================= */

  async function searchPlace() {

    const input =
      document.getElementById(
        'measureSearch'
      );


    const query =
      input ?
      input.value.trim() :
      '';


    if (!query) {

      measurementToast(
        'نام شهر، روستا یا مکان را وارد کن.'
      );

      return;

    }


    const status =
      document.getElementById(
        'measureStatus'
      );


    if (status) {

      status.textContent =
        '🔎 در حال جستجوی مکان...';

    }


    try {

      const searchQuery =
        query +
        (
          /iran|ایران/i.test(query)
            ? ''
            : ', Iran'
        );


      const url =
        'https://nominatim.openstreetmap.org/search' +
        '?format=json' +
        '&limit=5' +
        '&accept-language=fa' +
        '&q=' +
        encodeURIComponent(
          searchQuery
        );


      const response =
        await fetch(
          url,
          {
            headers: {
              'Accept':
                'application/json'
            }
          }
        );


      if (!response.ok) {
        throw new Error(
          'Search failed'
        );
      }


      const results =
        await response.json();


      if (
        !Array.isArray(results) ||
        !results.length
      ) {

        throw new Error(
          'Not found'
        );

      }


      const first =
        results[0];


      const latitude =
        Number(first.lat);

      const longitude =
        Number(first.lon);


      if (mapInstance) {

        mapInstance.setView(
          [
            latitude,
            longitude
          ],
          16
        );


        window.L
          .marker([
            latitude,
            longitude
          ])
          .addTo(
            mapInstance
          )
          .bindPopup(
            escapeMeasurement(
              first.display_name ||
              query
            )
          )
          .openPopup();

      }


      if (status) {

        status.textContent =
          '📍 مکان پیدا شد؛ حالا نقاط زمین را روی نقشه مشخص کن.';

      }

    } catch (error) {

      if (status) {

        status.textContent =
          '❌ مکان پیدا نشد؛ نام دقیق‌تر وارد کن.';

      }

      measurementToast(
        'مکان پیدا نشد. نام شهر یا روستا را دقیق‌تر وارد کن.'
      );

    }

  }


  /* =========================================================
     ثبت اندازه‌گیری
     ========================================================= */

  function registerMeasurement() {

    const pointsList =
      Array.isArray(window.points)
        ? window.points
        : [];


    if (
      pointsList.length < 3
    ) {

      measurementToast(
        'حداقل ۳ نقطه برای ثبت زمین لازم است.'
      );

      return;

    }


    const area =
      calculateArea(
        pointsList
      );


    const perimeter =
      calculatePerimeter(
        pointsList
      );


    const firstPoint =
      pointsList[0];


    /* -------------------------------------------------------
       حالت ویرایش یک زمین موجود
       ------------------------------------------------------- */

    if (
      window.measureReturn === 'land' &&
      window.state &&
      Array.isArray(window.state.lands) &&
      window.selected
    ) {

      const land =
        window.state.lands &&
        window.state.lands.find(
          function (item) {
            return item.id ===
              window.selected;
          }
        );


      if (land) {

        land.areaM2 =
          area;

        land.area =
          area / 10000;

        land.perimeter =
          perimeter;

        land.lat =
          firstPoint[0];

        land.lng =
          firstPoint[1];


        land.measurement = {

          points:
            pointsList.map(
              function (point) {

                return [
                  Number(point[0]),
                  Number(point[1])
                ];

              }
            ),

          areaM2:
            area,

          perimeter:
            perimeter,

          updatedAt:
            new Date().toISOString(),

          source:
            'online-map'

        };


        if (
          typeof window.save ===
          'function'
        ) {

          window.save();

        }


        sessionStorage.removeItem(
          'yk-pending-measure'
        );


        stopGPS();


        if (mapInstance) {

          try {
            mapInstance.remove();
          } catch (error) {}

          mapInstance = null;

        }


        window.measureReturn =
          null;


        measurementToast(
          '✅ اندازه‌گیری روی پرونده زمین ذخیره شد.'
        );


        if (
          typeof window.go ===
          'function'
        ) {

          window.go('lands');

        }


        return;

      }

    }


    /* -------------------------------------------------------
       اندازه‌گیری برای ثبت زمین جدید
       ------------------------------------------------------- */

    const pendingMeasurement = {

      areaM2:
        area,

      perimeter:
        perimeter,

      points:
        pointsList.map(
          function (point) {

            return [
              Number(point[0]),
              Number(point[1])
            ];

          }
        ),

      lat:
        firstPoint[0],

      lng:
        firstPoint[1],

      source:
        'online-map',

      updatedAt:
        new Date().toISOString()

    };


    sessionStorage.setItem(
      'yk-pending-measure',
      JSON.stringify(
        pendingMeasurement
      )
    );


    stopGPS();


    if (mapInstance) {

      try {
        mapInstance.remove();
      } catch (error) {}

      mapInstance = null;

    }


    window.measureReturn =
      'add';


    if (
      typeof window.go ===
      'function'
    ) {

      window.go('add');

    }

  }


  /* ---------------------------------------------------------
     ظاهر مستقل صفحه اندازه‌گیری
     --------------------------------------------------------- */
  function injectMeasurementStyles(){
    if (document.getElementById('yk-measure-v65-style')) return;
    const style=document.createElement('style');
    style.id='yk-measure-v65-style';
    style.textContent=`
      .yk-measure-screen{position:fixed;inset:0;z-index:7000;background:#dfe8e3;overflow:hidden;font-family:Tahoma,Arial,sans-serif}
      .yk-measure-map{position:absolute;inset:0;z-index:0;touch-action:none;overscroll-behavior:none}
      .yk-measure-map .leaflet-control-zoom{margin-top:120px!important;margin-right:10px!important;border:0!important;box-shadow:0 7px 20px #0003!important}
      .yk-measure-map .leaflet-control-zoom a{width:40px!important;height:40px!important;line-height:40px!important;font-size:22px!important;background:#fff!important;color:#145b40!important}
      .yk-measure-top{position:absolute;z-index:7100;top:max(10px,env(safe-area-inset-top));left:10px;right:10px;display:grid;grid-template-columns:46px 1fr 46px;align-items:center;gap:8px;pointer-events:none}
      .yk-m-title{min-width:0;background:#fffffff0;border-radius:17px;padding:9px 13px;text-align:center;box-shadow:0 8px 24px #0002;backdrop-filter:blur(12px);pointer-events:auto}
      .yk-m-title b{display:block;font-size:14px;color:#123e31}.yk-m-title span{display:block;font-size:9px;color:#65776f;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .yk-m-icon{width:46px;height:46px;border:0;border-radius:15px;background:#0b3d2e;color:#fff;font-size:28px;line-height:1;box-shadow:0 8px 22px #0003;pointer-events:auto}
      .yk-measure-search{position:absolute;z-index:7100;top:76px;left:10px;right:10px;display:grid;grid-template-columns:1fr 82px;gap:7px}
      .yk-measure-search input{min-width:0;border:0;background:#fffffff0;border-radius:15px;padding:12px 13px;outline:0;box-shadow:0 7px 20px #0002;font-size:12px}
      .yk-measure-search button{border:0;border-radius:15px;background:#17664b;color:#fff;font-weight:900;box-shadow:0 7px 20px #0002}
      .yk-measure-tools{position:absolute;z-index:7100;top:130px;right:10px;display:flex;flex-direction:column;gap:7px;pointer-events:none}
      .yk-measure-tools button{min-width:66px;height:56px;border:0;border-radius:16px;background:#fffffff2;color:#174d3a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 7px 20px #0002;pointer-events:auto;padding:4px 6px}
      .yk-measure-tools button span{font-size:21px;line-height:20px}.yk-measure-tools button b{font-size:8px;white-space:nowrap}
      .yk-measure-help{position:absolute;z-index:7100;top:130px;left:10px;max-width:205px;display:grid;gap:4px;background:#ffffffe8;border-radius:14px;padding:8px 10px;box-shadow:0 7px 20px #0002;color:#47655a;font-size:8px;line-height:1.5;pointer-events:none}
      .yk-measure-sheet{position:absolute;z-index:7200;left:8px;right:8px;bottom:max(8px,env(safe-area-inset-bottom));background:#fffffff5;border:1px solid #dce8e2;border-radius:22px;padding:11px;box-shadow:0 -10px 35px #0003;backdrop-filter:blur(16px)}
      .yk-measure-sheet-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.yk-measure-sheet-head>div:first-child b{display:block;color:#123e31;font-size:14px}.yk-measure-sheet-head>div:first-child span{display:block;color:#708079;font-size:8px;margin-top:3px}.yk-point-badge{min-width:47px;text-align:center;background:#eaf5ef;border-radius:13px;padding:5px 8px;color:#17664b}.yk-point-badge b{display:block;font-size:14px}.yk-point-badge span{font-size:7px}
      .yk-measure-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.yk-measure-stats>div{background:#f4f8f6;border:1px solid #e0eae5;border-radius:14px;padding:8px 5px;text-align:center}.yk-measure-stats span{display:block;color:#728079;font-size:8px}.yk-measure-stats b{display:block;color:#123e31;font-size:15px;margin:3px 0}.yk-measure-stats small{font-size:7px;color:#89948f}
      .yk-measure-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.yk-measure-actions button{min-height:44px;border:0;border-radius:13px;font-weight:900;font-size:11px}.yk-gps{background:#e7f3ec;color:#17664b}.yk-register{background:#0b3d2e;color:#fff}.yk-register:disabled{opacity:.42}.yk-measure-foot{text-align:center;color:#73827c;font-size:8px;margin-top:6px}
      .yk-measure-screen .leaflet-control-attribution{font-size:8px!important;background:#ffffffe0!important}
      @media(max-width:430px){.yk-measure-tools button{min-width:58px;height:52px}.yk-measure-help{max-width:180px}.yk-measure-search{top:74px}}
    `;
    document.head.appendChild(style);
  }

  /* =========================================================
     بستن صفحه
     ========================================================= */

  function closeMeasurement() {

    stopGPS();


    if (mapInstance) {

      try {
        mapInstance.remove();
      } catch (error) {}

      mapInstance = null;

    }


    const returnRoute =
      window.measureReturn ||
      'home';


    window.measureReturn =
      null;


    if (
      typeof window.go ===
      'function'
    ) {

      window.go(
        returnRoute
      );

    }

  }


  /* =========================================================
     توابع عمومی
     ========================================================= */

  window.initMap =
    initializeMap;

  window.searchPlace =
    searchPlace;

  window.toggleSat =
    toggleSatellite;

  window.locate =
    locateUser;

  window.toggleGPS =
    toggleGPS;

  window.stopGPS =
    stopGPS;

  window.undo =
    undoLastPoint;

  window.clearMeasure =
    clearMeasurement;

  window.updateMeasure =
    updateMeasurementUI;

  window.registerMeasured =
    registerMeasurement;

  window.closeMeasure =
    closeMeasurement;


  /* ---------------------------------------------------------
     اندازه‌گیری برای زمین جدید
     --------------------------------------------------------- */

  window.startMeasureForNewLand =
    function () {

      window.selected =
        null;

      window.measureReturn =
        'add';

      if (
        typeof window.go ===
        'function'
      ) {

        window.go(
          'measure'
        );

      }

    };


  /* ---------------------------------------------------------
     ویرایش نقاط زمین موجود
     --------------------------------------------------------- */

  window.editLandPoints =
    function (landId) {

      window.selected =
        landId;


      localStorage.setItem(
        'yk-last-land',
        landId
      );


      window.measureReturn =
        'land';


      if (
        typeof window.go ===
        'function'
      ) {

        window.go(
          'measure'
        );

      }

    };


  /* ---------------------------------------------------------
     خروج امن
     --------------------------------------------------------- */

  window.addEventListener(
    'beforeunload',
    function () {

      stopGPS();

    }
  );


})();
