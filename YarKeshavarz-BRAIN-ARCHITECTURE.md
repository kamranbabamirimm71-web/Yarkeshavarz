# ساختمان و مغز کشاورزیار — مرجع این پروژه

این بسته نسخه اصلی پروژه را بدون حذف فایل‌های قدیمی نگه می‌دارد و یک نقطه ورود واحد برای لایه‌های مغز آفلاین اضافه می‌کند: `offline/yar-keshavarz-brain.js`.

## لایه‌های اصلی

1. **رابط/محصول**
   - `index.html` — رابط اصلی برنامه و جریان صفحه کشاورزیار
   - `offline/crop-ui.js` — نمایش شناسنامه محصول به صورت بخش‌های بازشونده
   - `keshavar-yar.js` — پیاده‌سازی قدیمی دستیار کشاورزیار

2. **مغز پاسخ آفلاین**
   - `offline/offline-ai.js` — موتور پاسخ، رتبه‌بندی دانش، تشخیص محصول و ساخت پاسخ پروفایل
   - `offline/intent-engine.js` — استخراج موجودیت/قصد از پرسش
   - `offline/context-engine.js` — نگهداری و تزریق context
   - `offline/global-agriculture-brain.js` — لایه عمومی دانش محصولات، خاک، آب، تغذیه، حفاظت، اقلیم، برداشت، اقتصاد و ...

3. **بانک محصولات و دانش کشاورزی**
   - `agriculture-db.js`
   - `offline/agriculture-db.js`
   - `offline/agriculture-db-extended.js`
   - `offline/crop-profiles.js`
   - `offline/crop-profiles-universal.js`
   - `offline/specialized-crop-profiles.js`
   - `offline/global-crop-registry.js`
   - `knowledge/knowledge.json`

4. **موتورهای محصول و محاسبه**
   - `offline/universal-crop-engine.js` — تولید پروفایل عمومی بر اساس گروه محصول
   - `offline/calculators.js` — محاسبات بذر، تعداد بوته، حجم آبیاری، محصول کودی و نقطه سربه‌سر

5. **زمین و context مزرعه**
   - `land-edit.js`
   - `land-plan.js`
   - `land-schematic.js`
   - `land-save-fix.js`
   - `offline/context-engine.js`

## مسیر منطقی مغز

`پرسش کاربر`
→ `intent-engine`
→ `context-engine`
→ `crop registry / crop profiles`
→ `agriculture DB + global agriculture brain + knowledge`
→ `offline-ai`
→ `crop-ui`
→ `yarChat`

## نکته مهم

این بسته عمداً **داده‌های موجود را جایگزین یا ساختگی نمی‌کند**. هدف آن این است که تمام اجزای واقعی نسخه قدیمی در یک مرجع مشخص باقی بمانند تا مرحله بعدی بتواند UI کامل «انتخاب زمین → انتخاب محصول → پرونده کشت → کاشت تا برداشت → هزینه/درآمد/سود و زیان» را روی همین مغز سوار کند.


## اتصال واقعی رابط به مغز و پرونده کشت

در نسخه فعلی، نقطه ورود واقعی صفحه `index.html` است. تابع `yar()` در همان فایل
صفحه کامل کشاورزیار را می‌سازد و از این لایه‌ها استفاده می‌کند:
- `offline/global-crop-registry.js` برای فهرست محصولات
- `offline/crop-profiles.js` برای شناسنامه محصول
- داده زمین و تراکنش‌های واقعی `state.lands` و `state.transactions`
- محاسبات مساحت/بذر/آب/تعداد بوته/کود در همان پرونده کشت

فایل‌های `pages/views.js` و `modules/yar.js` نسخه‌های ماژولار/قدیمی هستند و
ورودی اصلی GitHub Pages محسوب نمی‌شوند.
