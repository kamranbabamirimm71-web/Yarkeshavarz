/* =========================================================
   یار کشاورز — کشاورزیار V1
   دستیار هوشمند محلی مبتنی بر اطلاعات واقعی اپ
   ========================================================= */

(function () {
  "use strict";

  const KEY = "yk-v3-clean";

  function faDigits(v) {
    return String(v ?? "")
      .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
      .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  }

  function num(v) {
    return Number(
      faDigits(v)
        .replace(/[٬,\s]/g, "")
    ) || 0;
  }

  function money(v) {
    return num(v).toLocaleString("fa-IR") + " تومان";
  }

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getState() {
    try {
      return JSON.parse(
        localStorage.getItem(KEY) || "{}"
      );
    } catch (e) {
      return {};
    }
  }

  function lands() {
    const s = getState();
    return Array.isArray(s.lands) ? s.lands : [];
  }

  function inventory() {
    const s = getState();
    return Array.isArray(s.inventory)
      ? s.inventory
      : [];
  }

  function transactions() {
    const s = getState();
    return Array.isArray(s.transactions)
      ? s.transactions
      : [];
  }

  function landTotals(id) {

    const tx = transactions()
      .filter(x => !id || x.landId === id);

    const cost = tx
      .filter(x => x.type === "expense")
      .reduce(
        (a, x) => a + num(x.amount),
        0
      );

    const income = tx
      .filter(x => x.type === "income")
      .reduce(
        (a, x) => a + num(x.amount),
        0
      );

    return {
      cost,
      income,
      profit: income - cost
    };
  }

  function appSummary() {

    const ls = lands();

    let area = 0;
    let cost = 0;
    let income = 0;

    ls.forEach(l => {

      area += num(l.area);

      const t = landTotals(l.id);

      cost += t.cost;
      income += t.income;

    });

    return {
      count: ls.length,
      area,
      cost,
      income,
      profit: income - cost
    };

  }

  /* =====================================================
     ANSWER ENGINE
     ===================================================== */

  function answer(question) {

    const q = String(question || "")
      .trim()
      .toLowerCase();

    const ls = lands();
    const inv = inventory();
    const summary = appSummary();

    if (!q) {
      return "سؤالت رو بنویس داداش 🌱";
    }

    /* تعداد زمین */

    if (
      q.includes("چند زمین") ||
      q.includes("تعداد زمین") ||
      q.includes("زمین دارم")
    ) {

      return (
        "الان " +
        summary.count.toLocaleString("fa-IR") +
        " زمین در یار کشاورز ثبت شده."
      );

    }

    /* مجموع مساحت */

    if (
      q.includes("مساحت زمین") ||
      q.includes("مساحت زمین‌ها") ||
      q.includes("متراژ زمین") ||
      q.includes("چقدر زمین")
    ) {

      return (
        "مجموع مساحت زمین‌های ثبت‌شده " +
        summary.area.toLocaleString("fa-IR") +
        " هکتار است."
      );

    }

    /* هزینه */

    if (
      q.includes("هزینه") ||
      q.includes("خرج") ||
      q.includes("مخارج")
    ) {

      return (
        "مجموع هزینه‌های ثبت‌شده: " +
        money(summary.cost) +
        "\n\n" +
        "مجموع درآمد: " +
        money(summary.income) +
        "\n\n" +
        "سود/زیان فعلی: " +
        money(summary.profit)
      );

    }

    /* درآمد */

    if (
      q.includes("درآمد") ||
      q.includes("فروش")
    ) {

      return (
        "مجموع درآمدهای ثبت‌شده: " +
        money(summary.income)
      );

    }

    /* سود */

    if (
      q.includes("سود") ||
      q.includes("زیان")
    ) {

      if (summary.profit > 0) {

        return (
          "بر اساس اطلاعات ثبت‌شده، سود فعلی " +
          money(summary.profit) +
          " است. 💰"
        );

      }

      if (summary.profit < 0) {

        return (
          "بر اساس اطلاعات ثبت‌شده، فعلاً " +
          money(Math.abs(summary.profit)) +
          " زیان داری."
        );

      }

      return "فعلاً سود یا زیان ثبت‌شده صفر است.";

    }

    /* انبار */

    if (
      q.includes("انبار") ||
      q.includes("موجودی") ||
      q.includes("چی دارم")
    ) {

      if (!inv.length) {
        return "هنوز موردی در انبار ثبت نشده.";
      }

      const lines = inv
        .slice(0, 12)
        .map((x, i) => {

          const name =
            x.name ||
            x.title ||
            "مورد " + (i + 1);

          const qty =
            x.quantity ??
            x.qty ??
            x.amount ??
            0;

          const unit =
            x.unit ||
            "";

          return (
            "• " +
            name +
            ": " +
            num(qty).toLocaleString("fa-IR") +
            (unit ? " " + unit : "")
          );

        });

      return (
        "موجودی فعلی انبار:\n\n" +
        lines.join("\n")
      );

    }

    /* لیست زمین‌ها */

    if (
      q.includes("اسم زمین") ||
      q.includes("نام زمین") ||
      q.includes("زمین‌هام") ||
      q.includes("زمین هام")
    ) {

      if (!ls.length) {
        return "هنوز زمینی ثبت نشده.";
      }

      return (
        "زمین‌های ثبت‌شده:\n\n" +
        ls.map((l, i) => {

          return (
            (i + 1) +
            ". " +
            (l.name || "بدون نام") +
            " — " +
            num(l.area)
              .toLocaleString("fa-IR") +
            " هکتار"
          );

        }).join("\n")
      );

    }

    /* جستجوی یک زمین */

    const found =
      ls.find(l =>
        l.name &&
        q.includes(
          String(l.name).toLowerCase()
        )
      );

    if (found) {

      const t =
        landTotals(found.id);

      return (
        "📍 اطلاعات «" +
        found.name +
        "»\n\n" +

        "مساحت: " +
        num(found.area)
          .toLocaleString("fa-IR") +
        " هکتار\n" +

        "منطقه: " +
        (found.region || "ثبت نشده") +
        "\n" +

        "محصول: " +
        (found.crop || "ثبت نشده") +
        "\n" +

        "نوع خاک: " +
        (found.soil || "ثبت نشده") +
        "\n" +

        "منبع آب: " +
        (found.water || "ثبت نشده") +
        "\n\n" +

        "هزینه: " +
        money(t.cost) +
        "\n" +

        "درآمد: " +
        money(t.income) +
        "\n" +

        "سود/زیان: " +
        money(t.profit)
      );

    }

    /* کمک */

    if (
      q.includes("کمک") ||
      q.includes("چه کار") ||
      q.includes("چی میتونی")
    ) {

      return (
        "من می‌تونم اطلاعات ثبت‌شده مزرعه رو بررسی کنم 🌾\n\n" +
        "مثلاً بپرس:\n" +
        "• چند تا زمین دارم؟\n" +
        "• مجموع مساحتم چقدره؟\n" +
        "• هزینه‌هام چقدره؟\n" +
        "• سودم چقدره؟\n" +
        "• موجودی انبارم چیه؟\n" +
        "• اطلاعات زمین شمالی رو بگو"
      );

    }

    return (
      "فعلاً جواب دقیق این سؤال رو از اطلاعات ثبت‌شده پیدا نکردم. 🌱\n\n" +
      "سؤالت رو درباره زمین، هزینه، درآمد، سود، محصول یا انبار بپرس."
    );

  }

  /* =====================================================
     UI
     ===================================================== */

  function injectStyle() {

    if (
      document.getElementById(
        "keshavar-yar-style"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "keshavar-yar-style";

    style.textContent = `

      .ky-screen{
        position:fixed;
        inset:0;
        z-index:99999;
        background:
          linear-gradient(
            180deg,
            #f0fdf4 0%,
            #ffffff 45%,
            #f7faf7 100%
          );
        direction:rtl;
        display:flex;
        flex-direction:column;
        font-family:inherit;
      }

      .ky-header{
        background:#166534;
        color:#fff;
        padding:
          calc(12px + env(safe-area-inset-top))
          15px
          13px;
        box-shadow:
          0 4px 18px
          rgba(0,0,0,.15);
      }

      .ky-header-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }

      .ky-title{
        font-size:19px;
        font-weight:900;
      }

      .ky-subtitle{
        font-size:11px;
        opacity:.85;
        margin-top:3px;
      }

      .ky-close{
        width:39px;
        height:39px;
        border:0;
        border-radius:50%;
        background:
          rgba(255,255,255,.15);
        color:#fff;
        font-size:23px;
        cursor:pointer;
      }

      .ky-status{
        margin-top:10px;
        background:
          rgba(255,255,255,.12);
        border-radius:12px;
        padding:8px 10px;
        font-size:11px;
      }

      .ky-messages{
        flex:1;
        overflow:auto;
        padding:15px 12px 120px;
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      .ky-msg{
        max-width:88%;
        padding:11px 13px;
        border-radius:17px;
        line-height:1.9;
        white-space:pre-line;
        font-size:14px;
      }

      .ky-bot{
        align-self:flex-start;
        background:#fff;
        border:
          1px solid #dce9df;
        color:#26352b;
        border-bottom-left-radius:5px;
        box-shadow:
          0 3px 12px
          rgba(20,60,30,.06);
      }

      .ky-user{
        align-self:flex-end;
        background:#166534;
        color:#fff;
        border-bottom-right-radius:5px;
        box-shadow:
          0 3px 12px
          rgba(22,101,52,.15);
      }

      .ky-suggestions{
        display:flex;
        gap:7px;
        overflow-x:auto;
        padding:
          8px 12px
          6px;
        scrollbar-width:none;
      }

      .ky-suggestions::-webkit-scrollbar{
        display:none;
      }

      .ky-suggest{
        flex:none;
        border:
          1px solid #cde4d2;
        background:#fff;
        color:#166534;
        border-radius:20px;
        padding:8px 11px;
        font:700 11px inherit;
        cursor:pointer;
      }

      .ky-inputbar{
        position:absolute;
        left:0;
        right:0;
        bottom:0;
        background:#fff;
        padding:
          8px
          10px
          calc(10px + env(safe-area-inset-bottom));
        border-top:
          1px solid #e2e9e3;
        display:flex;
        gap:7px;
      }

      .ky-input{
        flex:1;
        min-width:0;
        border:
          1px solid #d2ddd5;
        border-radius:16px;
        padding:12px;
        font:14px inherit;
        outline:0;
      }

      .ky-input:focus{
        border-color:#22a05a;
        box-shadow:
          0 0 0 3px
          rgba(34,160,90,.1);
      }

      .ky-send{
        width:48px;
        border:0;
        border-radius:15px;
        background:#166534;
        color:#fff;
        font-size:19px;
        cursor:pointer;
      }

    `;

    document.head.appendChild(style);

  }

  /* =====================================================
     OPEN
     ===================================================== */

  function openAssistant() {

    if (
      document.querySelector(".ky-screen")
    ) {
      return;
    }

    injectStyle();

    const s = appSummary();

    const screen =
      document.createElement("div");

    screen.className =
      "ky-screen";

    screen.innerHTML = `

      <div class="ky-header">

        <div class="ky-header-row">

          <div>

            <div class="ky-title">
              🤖 کشاورزیار
            </div>

            <div class="ky-subtitle">
              دستیار هوشمند مزرعه شما
            </div>

          </div>

          <button
            class="ky-close"
            type="button"
            id="kyClose"
          >
            ×
          </button>

        </div>

        <div class="ky-status">

          🌾 ${s.count.toLocaleString("fa-IR")}
          زمین
          ·
          📐 ${s.area.toLocaleString("fa-IR")}
          هکتار
          ·
          💰 ${money(s.profit)}

        </div>

      </div>

      <div
        class="ky-messages"
        id="kyMessages"
      >

        <div class="ky-msg ky-bot">
          سلام داداش 👋
          
          من کشاورزیارم.
          
          اطلاعات زمین‌ها، هزینه‌ها، درآمد و انبارت رو می‌بینم و بر اساس داده‌های خودت جواب می‌دم.
          
          هرچی می‌خوای بپرس 🌱
        </div>

      </div>

      <div class="ky-suggestions">

        <button class="ky-suggest">
          چند تا زمین دارم؟
        </button>

        <button class="ky-suggest">
          هزینه‌هام چقدره؟
        </button>

        <button class="ky-suggest">
          سودم چقدره؟
        </button>

        <button class="ky-suggest">
          انبارم چی داره؟
        </button>

      </div>

      <form
        class="ky-inputbar"
        id="kyForm"
      >

        <input
          class="ky-input"
          id="kyInput"
          autocomplete="off"
          placeholder="سؤالت رو از کشاورزیار بپرس..."
        >

        <button
          class="ky-send"
          type="submit"
        >
          ➤
        </button>

      </form>

    `;

    document.body.appendChild(screen);

    const messages =
      screen.querySelector("#kyMessages");

    const input =
      screen.querySelector("#kyInput");

    function send(text) {

      text =
        String(text || "").trim();

      if (!text) {
        return;
      }

      const user =
        document.createElement("div");

      user.className =
        "ky-msg ky-user";

      user.textContent =
        text;

      messages.appendChild(user);

      const response =
        document.createElement("div");

      response.className =
        "ky-msg ky-bot";

      response.textContent =
        answer(text);

      messages.appendChild(response);

      messages.scrollTop =
        messages.scrollHeight;

    }

    screen.querySelector("#kyForm")
      .addEventListener(
        "submit",
        function(event){

          event.preventDefault();

          const text =
            input.value;

          input.value = "";

          send(text);

        }
      );

    screen.querySelectorAll(
      ".ky-suggest"
    ).forEach(button => {

      button.addEventListener(
        "click",
        function(){

          send(
            button.textContent
          );

        }
      );

    });

    screen.querySelector("#kyClose")
      .addEventListener(
        "click",
        function(){

          screen.remove();

        }
      );

    setTimeout(
      function(){
        input.focus();
      },
      100
    );

  }

  /* =====================================================
     CONNECT TO BOTTOM NAV
     ===================================================== */

  function boot() {

    /*
      capture باعث می‌شود قبل از سیستم
      ناوبری فعلی برنامه، کشاورزیار
      صفحه خودش را باز کند.
    */

    document.addEventListener(
      "click",
      function(event){

        const button =
          event.target.closest(
            '[data-route="assistant"]'
          );

        if(!button){
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        openAssistant();

      },
      true
    );

    /*
      بعضی نسخه‌ها مسیر را مستقیماً
      yar قرار داده‌اند.
    */

    document.addEventListener(
      "click",
      function(event){

        const button =
          event.target.closest(
            '[data-route="yar"]'
          );

        if(!button){
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        openAssistant();

      },
      true
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
