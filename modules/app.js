// =========================================================
// YarKeshavarz - Modular Core V2
// =========================================================

const KEY = 'yar-keshavarz-v4-single';

const app = document.getElementById('app');
const title = document.getElementById('pageTitle');

// =========================================================
// State
// =========================================================

let state = {
  lands: [],
  inventory: [],
  equipment: [],
  profile: {},
  expenses: [],
  income: [],
  transactions: [],
  settings: {},
  messages: []
};

// خواندن امن اطلاعات ذخیره‌شده
try {
  const raw = localStorage.getItem(KEY);

  if (raw) {
    const parsed = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      state = parsed;
    }
  }
} catch (error) {
  console.warn(
    'اطلاعات ذخیره‌شده خراب بود؛ برنامه با داده سالم اجرا می‌شود.',
    error
  );
}

// سازگاری با نسخه‌های قدیمی
state.lands = Array.isArray(state.lands) ? state.lands : [];
state.inventory = Array.isArray(state.inventory) ? state.inventory : [];
state.equipment = Array.isArray(state.equipment) ? state.equipment : [];
state.expenses = Array.isArray(state.expenses) ? state.expenses : [];
state.income = Array.isArray(state.income) ? state.income : [];
state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
state.messages = Array.isArray(state.messages) ? state.messages : [];
state.profile = state.profile || {};
state.settings = state.settings || {};

let selected = null;

let points = [];
let markers = [];
let polygon = null;
let map = null;
let watch = null;
let satellite = false;

let measureReturn = 'add';


// =========================================================
// Save
// =========================================================

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
}


// =========================================================
// Page title
// =========================================================

function head(x) {
  if (title) {
    title.textContent = x;
  }
}


// =========================================================
// Helpers
// =========================================================

function uid() {
  return 'yk-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 9);
}


function n(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const s = String(value)
    .replace(/[٬,]/g, '')
    .replace(/[۰-۹]/g, d =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    )
    .replace(/[٠-٩]/g, d =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    );

  const x = Number(s);

  return Number.isFinite(x) ? x : 0;
}


function num(value) {
  return n(value).toLocaleString('fa-IR');
}


function faNum(value) {
  return n(value).toLocaleString('fa-IR');
}


function money(value) {
  return n(value).toLocaleString('fa-IR') + ' تومان';
}


function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// =========================================================
// Totals / Economy
// =========================================================

function totals(landId) {

  let rows = [];

  /*
   * نسخه جدید
   */
  if (Array.isArray(state.transactions)) {
    rows = state.transactions.slice();

    if (landId) {
      rows = rows.filter(x => x.landId === landId);
    }
  }

  /*
   * سازگاری با نسخه قدیمی
   */
  if (!rows.length) {

    const expenses = Array.isArray(state.expenses)
      ? state.expenses
      : [];

    const income = Array.isArray(state.income)
      ? state.income
      : [];

    rows = [
      ...expenses.map(x => ({
        ...x,
        type: 'expense'
      })),

      ...income.map(x => ({
        ...x,
        type: 'income'
      }))
    ];

    if (landId) {
      rows = rows.filter(x => x.landId === landId);
    }
  }

  const cost = rows
    .filter(x => x.type === 'expense')
    .reduce((a, x) => a + n(x.amount), 0);

  const income = rows
    .filter(x => x.type === 'income')
    .reduce((a, x) => a + n(x.amount), 0);

  return {
    cost,
    income,
    profit: income - cost
  };
}


// =========================================================
// Date helpers
// =========================================================

function jalaliDate(value) {

  try {

    const d = value instanceof Date
      ? value
      : new Date(value);

    if (Number.isNaN(d.getTime())) {
      return String(value || '');
    }

    return new Intl.DateTimeFormat(
      'fa-IR-u-ca-persian',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
    ).format(d);

  } catch (e) {

    return String(value || '');

  }
}


function parseJalaliDate(value) {

  const s = String(value || '')
    .trim()
    .replace(/[۰-۹]/g, d =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    )
    .replace(/[٠-٩]/g, d =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    );

  const m = s.match(
    /^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/
  );

  if (!m) {
    return '';
  }

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = Number(m[3]);

  if (
    y < 1300 ||
    mo < 1 ||
    mo > 12 ||
    day < 1 ||
    day > 31
  ) {
    return '';
  }

  return s;
}


// =========================================================
// Toast
// =========================================================

function toast(message) {

  const old = document.querySelector('.yk-toast');

  if (old) {
    old.remove();
  }

  const el = document.createElement('div');

  el.className = 'yk-toast';
  el.textContent = message;

  Object.assign(el.style, {
    position: 'fixed',
    left: '20px',
    right: '20px',
    bottom: '20px',
    zIndex: '99999',
    padding: '14px',
    borderRadius: '14px',
    background: '#222',
    color: '#fff',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0,0,0,.25)'
  });

  document.body.appendChild(el);

  setTimeout(() => {

    if (el.parentNode) {
      el.remove();
    }

  }, 2500);
}


// =========================================================
// Navigation
// =========================================================

function go(route) {

  if (!app) {
    console.error(
      'YarKeshavarz: #app not found'
    );
    return;
  }

  try {

    if (typeof window.renderPage === 'function') {

      window.renderPage(route);
      return;

    }

    if (
      typeof window.views === 'object' &&
      typeof window.views[route] === 'function'
    ) {

      window.views[route]();
      return;

    }

    const fn = window[route];

    if (typeof fn === 'function') {

      fn();
      return;

    }

    console.warn(
      'Route not found:',
      route
    );

  } catch (error) {

    console.error(
      'Navigation error:',
      route,
      error
    );

    app.innerHTML = `
      <div class="card" style="margin:20px;text-align:center">

        <h3>خطا در باز کردن صفحه</h3>

        <p class="muted">
          صفحه موردنظر نتوانست اجرا شود.
        </p>

        <button class="primary"
                onclick="location.reload()">
          تلاش دوباره
        </button>

      </div>
    `;

  }
}


// =========================================================
// Land helpers
// =========================================================

function openLand(id) {

  selected = id;

  try {
    localStorage.setItem(
      'yk-last-land',
      id
    );
  } catch (e) {}

  /*
   * views.js فعلی از تابع openLand
   * به صورت مستقیم استفاده می‌کند.
   */
  if (typeof window.openLandView === 'function') {

    window.openLandView(id);
    return;

  }

  /*
   * در پروژه فعلی صفحه زمین با route land
   * یا تابع openLand مدیریت می‌شود.
   */
  go('land');
}


function editLand(id) {

  selected = id;

  try {

    localStorage.setItem(
      'yk-last-land',
      id
    );

  } catch (e) {}

  measureReturn = 'land';

  if (
    typeof window.editLandPoints ===
    'function'
  ) {

    window.editLandPoints(id);

  } else {

    go('measure');

  }
}


// =========================================================
// Weather
// =========================================================

function weatherForObject(land) {

  if (!land) {
    return null;
  }

  if (
    typeof window.weatherForModule ===
    'function'
  ) {

    try {

      return window.weatherForModule(land);

    } catch (e) {

      console.warn(
        'Weather module error:',
        e
      );

    }

  }

  return {
    temperature: '--',
    description:
      'اطلاعات آب‌وهوا در دسترس نیست'
  };
}


// =========================================================
// Measurement return state
// =========================================================

function getMeasureReturn() {
  return measureReturn;
}


function setMeasureReturn(value) {

  measureReturn =
    value || 'add';

}


// =========================================================
// Compatibility bridge
// =========================================================
//
// ماژول measurement.js و بعضی ماژول‌های
// قدیمی از window.state و window.points
// و window.selected استفاده می‌کنند.
//
// این bridge همان داده اصلی را در اختیار
// آن ماژول‌ها قرار می‌دهد.
// =========================================================

const bridge = [

  [
    'state',
    () => state,
    value => {

      if (
        value &&
        typeof value === 'object'
      ) {

        state = value;

      }

    }
  ],

  [
    'selected',
    () => selected,
    value => {

      selected = value;

    }
  ],

  [
    'points',
    () => points,
    value => {

      points =
        Array.isArray(value)
          ? value
          : [];

    }
  ],

  [
    'markers',
    () => markers,
    value => {

      markers =
        Array.isArray(value)
          ? value
          : [];

    }
  ],

  [
    'polygon',
    () => polygon,
    value => {

      polygon = value;

    }
  ],

  [
    'map',
    () => map,
    value => {

      map = value;

    }
  ],

  [
    'watch',
    () => watch,
    value => {

      watch = value;

    }
  ],

  [
    'satellite',
    () => satellite,
    value => {

      satellite = !!value;

    }
  ],

  [
    'measureReturn',
    () => measureReturn,
    value => {

      measureReturn =
        value || 'add';

    }
  ]

];


for (const item of bridge) {

  const name = item[0];
  const getter = item[1];
  const setter = item[2];

  try {

    Object.defineProperty(
      window,
      name,
      {
        configurable: true,
        enumerable: false,
        get: getter,
        set: setter
      }
    );

  } catch (error) {

    console.warn(
      'YK bridge failed for:',
      name,
      error
    );

  }

}


// =========================================================
// Public YK API
// =========================================================

window.YK =
  window.YK || {};


window.YK.getState =
  function() {

    return state;

  };


window.YK.save =
  function() {

    return save();

  };


window.YK.getSelected =
  function() {

    return selected;

  };


window.YK.setSelected =
  function(id) {

    selected = id;

  };


window.YK.getPoints =
  function() {

    return points;

  };


window.YK.setPoints =
  function(value) {

    points =
      Array.isArray(value)
        ? value
        : [];

  };


window.YK.getMeasureReturn =
  function() {

    return measureReturn;

  };


window.YK.setMeasureReturn =
  function(value) {

    measureReturn =
      value || 'add';

  };


window.YK.totals =
  function(landId) {

    return totals(landId);

  };


window.YK.uid =
  function() {

    return uid();

  };


window.YK.number =
  function(value) {

    return n(value);

  };


// =========================================================
// Navigation from data-r buttons
// =========================================================

document.addEventListener(
  'click',
  function(e) {

    const button =
      e.target.closest('[data-r]');

    if (!button) {
      return;
    }

    const route =
      button.dataset.r;

    if (!route) {
      return;
    }

    e.preventDefault();

    go(route);

  }
);


// =========================================================
// Global API
// =========================================================

window.go = go;

window.openLand = openLand;

window.editLand = editLand;

window.weatherForObject = weatherForObject;

window.save = save;

window.toast = toast;

window.uid = uid;

window.n = n;

window.num = num;

window.money = money;

window.totals = totals;

window.jalaliDate = jalaliDate;

window.parseJalaliDate =
  parseJalaliDate;

window.esc = esc;


// =========================================================
// Measurement helpers
// =========================================================

window.startMeasureForNewLand =
  function() {

    selected = null;

    measureReturn = 'add';

    points = [];

    markers = [];

    polygon = null;

    try {

      sessionStorage.removeItem(
        'yk-pending-measure'
      );

    } catch (e) {}

    go('measure');

  };


window.editLandPoints =
  function(id) {

    selected = id;

    measureReturn = 'land';

    try {

      localStorage.setItem(
        'yk-last-land',
        id
      );

    } catch (e) {}

    go('measure');

  };



// =========================================================
// Start application
// =========================================================

try {
  go('home');
} catch (error) {
  console.error('YarKeshavarz startup error:', error);

  if (app) {
    app.innerHTML = `
      <div class="card" style="margin:20px;text-align:center">

        <h3 style="color:#b42318">
          خطای واقعی برنامه
        </h3>

        <p class="muted"
           style="direction:ltr;text-align:left;word-break:break-word">
          ${String(
            error && error.message
              ? error.message
              : error
          )}
        </p>

        <details style="text-align:left;direction:ltr;margin-top:15px">
          <summary>جزئیات خطا</summary>

          <pre style="white-space:pre-wrap;word-break:break-word;font-size:12px">${String(
            error && error.stack
              ? error.stack
              : ''
          )}</pre>

        </details>

        <button class="primary"
                onclick="location.reload()">
          تلاش دوباره
        </button>

      </div>
    `;
  }
}


// =========================================================
// Service Worker
// =========================================================

if ('serviceWorker' in navigator) {

  window.addEventListener(
    'load',
    function() {

      navigator.serviceWorker
        .register('./sw.js')
        .then(function() {

          console.log(
            'YarKeshavarz Service Worker registered'
          );

        })
        .catch(function(error) {

          console.warn(
            'Service Worker registration failed:',
            error
          );

        });

    }
  );

}

// =========================================================
// Service Worker
// =========================================================

if ('serviceWorker' in navigator) {

  window.addEventListener(
    'load',
    function() {

      navigator.serviceWorker
        .register('./sw.js')
        .then(function() {

          console.log(
            'YarKeshavarz Service Worker registered'
          );

        })
        .catch(function(error) {

          console.warn(
            'Service Worker registration failed:',
            error
          );

        });

    }
  );

}
