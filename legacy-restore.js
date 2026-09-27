(function () {
  "use strict";

  function loadScript(url, done) {
    var s = document.createElement("script");
    s.src = url;
    s.onload = function () {
      if (done) done();
    };
    s.onerror = function () {
      console.error("YK Legacy load error:", url);
    };
    document.head.appendChild(s);
  }

  /* نسخه قدیمی «کشاورزیار» */
  loadScript(
    "https://z46689944-beep.github.io/YarKeshavarz/keshavar-yar.js",
    function () {

      /* نسخه قدیمی اندازه‌گیری زمین */
      loadScript(
        "https://z46689944-beep.github.io/YarKeshavarz/v14.4-modern-measure-fix.js",
        function () {

          /* اصلاح اسکرول کل برنامه */
          var style = document.createElement("style");

          style.id = "yk-final-scroll-fix";

          style.textContent = `
            html,
            body {
              height: auto !important;
              min-height: 100% !important;
              overflow-x: hidden !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
            }

            #app {
              height: auto !important;
              min-height: 100vh !important;
              overflow: visible !important;
            }

            .ky-screen {
              overflow: hidden !important;
            }

            .ky-messages {
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
            }
          `;

          document.head.appendChild(style);

          console.log("Yar Keshavarz legacy modules loaded");
        }
      );
    }
  );

})();
