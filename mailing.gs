/***** PIXSELF — Order Confirmation (HTML) with Cover + Voucher + Robust Header Matching (HEADER_ROW=5) *****/

// PIXSELF CHECKOUT EMAIL AUTOMATION
// This script processes order data from the PixSelf Studio checkout API

const UNIT_PRICE = 49000;                 // VND/chiếc (Base keychain price)
const CHARM_PRICE = 6000;                 // VND (Sac Viet Charm)
const GIFT_BOX_PRICE = 40000;             // VND (20.10 Gift Box)
const SHIPPING_DELIVERY = 20000;          // VND (Home delivery fee)
const COVER_URL  = 'https://lh7-rt.googleusercontent.com/formsz/AN7BsVCEEam_JVgs14Fjtkbx4lerfyGHLI1tlhEHI7Aju7RlIGVVQUM3LGVcrbE08ha5xE1G4rFI5S0fLWLtd8m7fMY6AiYw3GqlZbWiEum34nJBpLQAQod-uPs_z4Xbh4mn_sb2eM3sRq3-as9FeT0AVsqDTg=w3520?key=1Ld_OjrYvx3gitQRtFva9g';
const COVER_ALT  = 'Pixself City — Pixel Keychain';

// ——— Voucher config: CODE -> % ———
const COUPON_MAP = { 'PIX10': 10, 'MOA20': 20, 'TIENDUONGDZVCL99': 99 };
const PICK_BEST_COUPON = true;

// ——— Email detection options ———
const AUTO_DETECT_EMAIL_FROM_ROW = true;   // nếu không bắt được theo cột, quét cả dòng tìm email

// ——— HÀNG TIÊU ĐỀ ———
// Đặt = 5 vì sheet của bạn có 4 hàng đầu không phải header.
// Nếu muốn auto-detect thì đặt = 0.
const HEADER_ROW = 5;

// Webhook function for API integration
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.event === 'order_completed') {
      const orderData = data.data;
      sendOrderConfirmationEmail(orderData);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Email sent successfully' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid event type' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Webhook error:', error);
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Main function to send order confirmation email
function sendOrderConfirmationEmail(orderData) {
  const emailData = buildEmailDataFromOrder(orderData);

  if (!emailData.to) {
    throw new Error('Không tìm thấy email khách hàng');
  }

  const mailOpts = { name: 'Pixself', htmlBody: emailData.html };
  GmailApp.sendEmail(emailData.to, emailData.subject, emailData.plain, mailOpts);

  console.log('✅ Email sent successfully to:', emailData.to);
}

/* ===================== TRIGGERS & MENUS ===================== */
function onFormSubmit(e) {
  try {
    const sheet = e.range.getSheet();
    const row = e.range.getRow();
    // Bảo vệ: nếu ai đó chỉnh các hàng trên header, bỏ qua
    const headerRow = getHeaderRow_(sheet);
    if (row <= headerRow) return;

    sendEmailForRow_(sheet, row, /*updateStatus=*/true);
  } catch (err) {
    console.error('onFormSubmit error:', err);
  }
}

function setupMenu() {
  SpreadsheetApp.getUi()
    .createMenu('Pixself Email')
    .addItem('Gửi email cho dòng đang chọn', 'sendEmailForActiveRow_')
    .addItem('Xem HTML (Logs)', 'logHtmlForActiveRow_')
    .addItem('Debug dòng đang chọn', 'debugInspectActiveRow')
    .addToUi();
}

function sendEmailForActiveRow_() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  const headerRow = getHeaderRow_(sheet);
  if (row <= headerRow) throw new Error('Hãy chọn một dòng dữ liệu (bên dưới hàng tiêu đề).');
  sendEmailForRow_(sheet, row, /*updateStatus=*/false);
}

function logHtmlForActiveRow_() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  const headerRow = getHeaderRow_(sheet);
  if (row <= headerRow) throw new Error('Hãy chọn một dòng dữ liệu (bên dưới hàng tiêu đề).');
  const data = buildEmailData_(sheet, row, /*coverSrc=*/COVER_URL);
  Logger.log(data.subject);
  Logger.log('\n--- PLAIN ---\n' + data.plain);
  Logger.log('\n--- HTML ---\n' + data.html);
}

/* ===================== CORE SEND ===================== */
function sendEmailForRow_(sheet, row, updateStatus) {
  const data = buildEmailData_(sheet, row, /*coverSrc=*/COVER_URL);

  if (!data.to) {
    throw new Error('Không tìm thấy cột email hợp lệ và cũng không dò được email trong dòng.');
  }

  const mailOpts = { name: 'Pixself', htmlBody: data.html };
  GmailApp.sendEmail(data.to, data.subject, data.plain, mailOpts);

  if (updateStatus) {
    try {
      const headers = getHeaders_(sheet);
      const idx = headers.findIndex(h => String(h).trim().toLowerCase() === 'status' ||
                                         String(h).trim().toLowerCase() === 'email status');
      if (idx !== -1) sheet.getRange(getHeaderRow_(sheet) + (row - getHeaderRow_(sheet)), idx + 1).setValue('Sent ' + new Date());
    } catch (_) {}
  }
}

/* ===================== HEADER NORMALIZATION & PICKERS ===================== */
function normalizeHeader_(h) {
  return String(h || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s*\(\d+\)\s*$/, '')                  // bỏ (1), (2)...
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')// bỏ dấu
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getHeaderRow_(sheet) {
  if (HEADER_ROW && HEADER_ROW > 0) return HEADER_ROW;
  // Auto-detect: tìm hàng có chứa vài từ khoá core
  const maxScan = Math.min(20, sheet.getLastRow());
  for (let r = 1; r <= maxScan; r++) {
    const rowVals = sheet.getRange(r, 1, 1, sheet.getLastColumn()).getValues()[0];
    const line = normalizeHeader_(rowVals.join(' '));
    if (line.includes('email') && (line.includes('ten') || line.includes('so luong') || line.includes('phuong thuc'))) {
      return r;
    }
  }
  return 1; // fallback
}

function buildHeaderMap_(sheet) {
  const headerRow = getHeaderRow_(sheet);
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach((h, i) => {
    const key = normalizeHeader_(h);
    if (!map[key]) map[key] = [];
    map[key].push(i + 1); // 1-based index
  });
  return { headers, map, headerRow };
}

function keyHasAllTokens_(key, tokens) {
  for (const t of tokens) { if (!key.includes(t)) return false; }
  return true;
}

/**
 * Lấy giá trị theo alias; nếu không thấy, thử:
 *  - startsWith alias đầu
 *  - contains alias đầu
 *  - match theo bộ token AND (từ khoá không dấu)
 */
function pickByAliases_(rowValues, headerMap, aliases, defVal, tokenSets) {
  const tried = new Set();

  // 0) exact theo các alias
  for (const a of (aliases || [])) {
    const key = normalizeHeader_(a);
    if (tried.has(key)) continue;
    tried.add(key);
    const cols = headerMap.map[key] || [];
    for (const c of cols) {
      const v = rowValues[c - 1];
      if (v !== '' && v != null) return v;
    }
  }

  // 1) startsWith theo alias đầu
  const head = aliases && aliases.length ? normalizeHeader_(aliases[0]) : '';
  if (head) {
    for (const k in headerMap.map) {
      if (k.startsWith(head)) {
        const cols = headerMap.map[k];
        for (const c of cols) {
          const v = rowValues[c - 1];
          if (v !== '' && v != null) return v;
        }
      }
    }
  }

  // 2) contains theo alias đầu
  if (head) {
    for (const k in headerMap.map) {
      if (k.indexOf(head) !== -1) {
        const cols = headerMap.map[k];
        for (const c of cols) {
          const v = rowValues[c - 1];
          if (v !== '' && v != null) return v;
        }
      }
    }
  }

  // 3) token AND (ưu tiên theo thứ tự bộ tokenSets)
  if (tokenSets && tokenSets.length) {
    for (const ts of tokenSets) {
      const tokens = ts.map(t => normalizeHeader_(t));
      for (const k in headerMap.map) {
        if (keyHasAllTokens_(k, tokens)) {
          const cols = headerMap.map[k];
          for (const c of cols) {
            const v = rowValues[c - 1];
            if (v !== '' && v != null) return v;
          }
        }
      }
    }
  }

  return defVal;
}

function findEmailInRow_(rowValues) {
  const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  for (const v of rowValues) {
    const m = String(v || '').match(re);
    if (m) return m[0];
  }
  return '';
}

// Function to build email data from checkout order structure
function buildEmailDataFromOrder(orderData) {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const nf = (n) => new Intl.NumberFormat('vi-VN').format(n);
  const formatVND = (n) => `${nf(n)} VND`;
  const normalizeCode = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g,'');
  const parseVoucher = (raw) => {
    const text = String(raw || '').trim();
    if (!text) return { code: '', percent: 0 };
    const parts = text.split(/[,;|\/\s]+/).map(normalizeCode).filter(Boolean);
    let best = { code: '', percent: 0 };
    for (const c of parts) {
      const p = (typeof COUPON_MAP[c] === 'number') ? COUPON_MAP[c] : 0;
      if (p > 0) {
        if (PICK_BEST_COUPON) { if (p > best.percent) best = { code: c, percent: p }; }
        else { return { code: c, percent: p }; }
      }
    }
    return best;
  };

  // Extract data from order structure
  const customerName = orderData.customer?.name || 'bạn';
  const customerEmail = orderData.customer?.email || '';
  const customerPhone = orderData.customer?.phone || '';

  // Get items data
  const items = orderData.items || [];
  const itemCount = items.length;

  // Get pricing breakdown from orderData (sent from API)
  const baseTotal = orderData.pricing?.itemsTotal || (itemCount * UNIT_PRICE);
  const charmTotal = orderData.pricing?.charmsTotal || 0;
  const giftBoxTotal = orderData.pricing?.giftBoxTotal || 0;
  const extraItemsTotal = orderData.pricing?.extraItemsTotal || 0;
  const shippingCost = orderData.pricing?.shippingCost || 0;

  // Calculate discount
  const subTotal = baseTotal + charmTotal + giftBoxTotal + extraItemsTotal;
  const { code: appliedCode, percent: discountPercent } = parseVoucher(orderData.discountCode || '');
  const discountVal = Math.round(subTotal * (discountPercent / 100));
  
  // Use total from API if available, otherwise calculate
  const totalVal = orderData.pricing?.totalPrice || Math.max(0, subTotal - discountVal + shippingCost);

  // Shipping info
  const shippingOption = orderData.shipping?.option || 'pickup';
  const shippingAddress = orderData.shipping?.address ?
    `${orderData.shipping.address.street}, ${orderData.shipping.address.district}, ${orderData.shipping.address.city}` :
    'Pickup at NEU';

  const orderDate = new Date().toLocaleDateString('vi-VN');

  // Build email content (same as original template)
  const subject = `[PIXSELF CITY] Đơn hàng của bạn đã được xác nhận - Liệu bạn đã sẵn sàng "unlock" phiên bản pixel của mình chưa!`;

  const plain =
`Xin chào ${customerName},

Chào mừng bạn chính thức trở thành cư dân Pixself City! Đơn hàng của bạn đã được xác nhận vào ${orderDate}.

Thông tin đơn hàng
${items.map((item, index) => {
  let line = `Keychain #${index + 1}: "${item.nametag}"`;
  const extras = [];
  if (item.hasCharm) extras.push('Sac Viet Charm');
  if (item.hasGiftBox) extras.push('20.10 Gift Box');
  if (item.hasExtraItems) extras.push('Extra Items');
  if (extras.length > 0) line += ` + ${extras.join(' + ')}`;
  return line;
}).join('\n')}
Số lượng: ${itemCount} keychain(s)
Tạm tính: ${formatVND(baseTotal)} (${formatVND(UNIT_PRICE)}/chiếc)
${charmTotal > 0 ? `Sac Viet Charm: ${formatVND(charmTotal)}\n` : ''}${giftBoxTotal > 0 ? `20.10 Gift Box: ${formatVND(giftBoxTotal)}\n` : ''}${extraItemsTotal > 0 ? `Extra Items: ${formatVND(extraItemsTotal)}\n` : ''}${discountPercent > 0 ? `Giảm giá: -${formatVND(discountVal)} (${appliedCode} ${discountPercent}%)\n` : ''}${shippingCost > 0 ? `Phí vận chuyển: ${formatVND(shippingCost)}\n` : ''}Tổng cộng: ${formatVND(totalVal)}
Thanh toán: Chuyển khoản QR - Đã thanh toán

Giao nhận
Phương thức: ${shippingOption === 'pickup' ? 'PICKUP AT NEU' : 'HOME DELIVERY'}
Địa chỉ nhận: ${shippingAddress}
Thời gian xử lý dự kiến: ${shippingOption === 'pickup' ? '~4-5 ngày' : '~3-5 ngày'}

Lợi ích cư dân Pixself
• Cá nhân hoá phiên bản pixel "có 1-0-2".
• "Khắc" lời nhắn/nickname/chữ ký đúng vibe riêng.
• Chiếc Pixel Keychain như "tấm hộ chiếu" vào Pixself City!

Nếu cần hỗ trợ, reply email này hoặc liên hệ:
0345205918 (Mr. Tiên) | 0961726061 (Ms. Giang)
207 Giải Phóng, P. Đồng Tâm, Q. Hai Bà Trưng, Hà Nội

Pixself - PIXture yourSELF in PIXSELF City
Fanpage: https://www.facebook.com/wearepixself/
Instagram: https://www.instagram.com/pixself.exe/

Pixself cảm ơn bạn rất nhiều! ✨`;

  // HTML body — same content, refined visual only
  const html =
`<div style="margin:0;padding:24px;background:#f6f7fb;color:#111;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #eceef3;border-radius:16px;overflow:hidden">
    <!-- Cover -->
    <tr>
      <td style="padding:0;line-height:0;background:#000">
        <a href="https://www.facebook.com/wearepixself/" target="_blank" style="text-decoration:none;border:0">
          <img src="${esc(COVER_URL)}" alt="${esc(COVER_ALT)}" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0;outline:none;text-decoration:none">
        </a>
      </td>
    </tr>

    <!-- Header / Status -->
    <tr>
      <td style="padding:20px 24px 12px 24px">
        <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:#eef2ff;color:#3b5bfd;font-size:12px;font-weight:700;letter-spacing:.3px">
          ĐÃ XÁC NHẬN
        </div>
        <h1 style="margin:10px 0 6px 0;font-size:22px;line-height:1.3">
          <strong>Đơn hàng của bạn đã được xác nhận</strong>
        </h1>
        <p style="margin:0;font-size:14px;color:#555">
          Xin chào <strong>${esc(customerName)}</strong>, chào mừng bạn đến với <em>Pixself City</em>!<br>
          Thời gian xác nhận: <strong>${esc(orderDate)}</strong>
        </p>
      </td>
    </tr>

    <!-- Order summary -->
    <tr>
      <td style="padding:16px 24px;background:#fafbff;border-top:1px solid #eceef3;border-bottom:1px solid #eceef3">
        <h3 style="margin:0 0 10px 0;font-size:16px"><strong>Thông tin đơn hàng</strong></h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#333">
          ${items.map((item, index) => {
            const extras = [];
            if (item.hasCharm) extras.push('Sac Viet Charm');
            if (item.hasGiftBox) extras.push('20.10 Gift Box');
            if (item.hasExtraItems) extras.push('Extra Items');
            const extrasText = extras.length > 0 ? ` + ${extras.join(' + ')}` : '';
            return `
          <tr>
            <td style="padding:6px 0;color:#555">Keychain #${index + 1}</td>
            <td style="padding:6px 0" align="right"><strong>"${esc(item.nametag)}"${extrasText}</strong></td>
          </tr>`;
          }).join('')}

          <tr><td colspan="2" style="padding:8px 0"><div style="height:1px;background:#eceef3"></div></td></tr>

          <tr>
            <td style="padding:6px 0;color:#555">Tạm tính (${itemCount} keychain${itemCount > 1 ? 's' : ''})</td>
            <td style="padding:6px 0" align="right">${esc(formatVND(baseTotal))}</td>
          </tr>
          ${charmTotal > 0 ? `
          <tr>
            <td style="padding:6px 0;color:#555">Sac Viet Charm</td>
            <td style="padding:6px 0" align="right">${esc(formatVND(charmTotal))}</td>
          </tr>` : ``}
          ${giftBoxTotal > 0 ? `
          <tr>
            <td style="padding:6px 0;color:#555">20.10 Gift Box</td>
            <td style="padding:6px 0" align="right">${esc(formatVND(giftBoxTotal))}</td>
          </tr>` : ``}
          ${extraItemsTotal > 0 ? `
          <tr>
            <td style="padding:6px 0;color:#555">Extra Items</td>
            <td style="padding:6px 0" align="right">${esc(formatVND(extraItemsTotal))}</td>
          </tr>` : ``}
          ${discountPercent > 0 ? `
          <tr>
            <td style="padding:6px 0;color:#b12704">Giảm giá</td>
            <td style="padding:6px 0" align="right"><strong style="color:#b12704">-${esc(formatVND(discountVal))} (${appliedCode} ${discountPercent}%)</strong></td>
          </tr>` : ``}
          ${shippingCost > 0 ? `
          <tr>
            <td style="padding:6px 0;color:#555">Phí vận chuyển</td>
            <td style="padding:6px 0" align="right">${esc(formatVND(shippingCost))}</td>
          </tr>` : ``}
          <tr>
            <td style="padding:6px 0"><strong>Tổng cộng</strong></td>
            <td style="padding:6px 0" align="right">
              <strong style="font-size:16px">${esc(formatVND(totalVal))}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555">Thanh toán</td>
            <td style="padding:6px 0" align="right"><strong>Chuyển khoản QR - Đã thanh toán</strong></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Shipping -->
    <tr>
      <td style="padding:16px 24px">
        <h3 style="margin:0 0 10px 0;font-size:16px"><strong>Giao nhận</strong></h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#333">
          <tr>
            <td style="padding:6px 0;color:#555">Phương thức</td>
            <td style="padding:6px 0" align="right"><strong>${esc(shippingOption === 'pickup' ? 'PICKUP AT NEU' : 'HOME DELIVERY')}</strong></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555">Địa chỉ nhận</td>
            <td style="padding:6px 0" align="right">${esc(shippingAddress)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555">Thời gian xử lý dự kiến</td>
            <td style="padding:6px 0" align="right"><strong>${esc(shippingOption === 'pickup' ? '~4-5 ngày' : '~3-5 ngày')}</strong></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Perks -->
    <tr>
      <td style="padding:16px 24px;background:#fafbff;border-top:1px solid #eceef3">
        <h3 style="margin:0 0 8px 0;font-size:16px"><strong>Lợi ích cư dân Pixself</strong></h3>
        <ul style="margin:8px 0 0 18px;padding:0;font-size:14px">
          <li>Cá nhân hoá phiên bản pixel "có 1-0-2".</li>
          <li>"Khắc" lời nhắn/nickname/chữ ký đúng vibe riêng.</li>
          <li>Chiếc Pixel Keychain như "tấm hộ chiếu" vào Pixself City!</li>
        </ul>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:16px 24px">
        <p style="margin:0 0 6px 0;font-size:14px">
          Nếu cần hỗ trợ, reply email này hoặc liên hệ:
          <strong>0345205918 (Mr. Tiên)</strong> • <strong>0961726061 (Ms. Giang)</strong>
        </p>
        <p style="margin:0 0 6px 0;font-size:14px">207 Giải Phóng, P. Đồng Tâm, Q. Hai Bà Trưng, Hà Nội</p>
        <p style="margin:0;font-size:13px;color:#666">
          <strong>Pixself — PIXture yourSELF in PIXSELF City</strong><br>
          Fanpage: <a href="https://www.facebook.com/wearepixself/" style="color:#111">facebook.com/wearepixself</a> •
          Instagram: <a href="https://www.instagram.com/pixself.exe/" style="color:#111">@pixself.exe</a>
        </p>
      </td>
    </tr>
  </table>

  <p style="text-align:center;margin:14px 0 0 0;font-size:12px;color:#888">
    Pixself cảm ơn bạn rất nhiều! ✨
  </p>
</div>`;

  return { to: customerEmail, subject, plain, html };
}

/* ===================== BUILD EMAIL (MATCH SHEET CỦA BẠN) ===================== */
function buildEmailData_(sheet, row, coverSrc) {
  const { headers, map, headerRow } = buildHeaderMap_(sheet);
  const rowValues = sheet.getRange(row, 1, 1, headers.length).getValues()[0];

  // Helpers
  const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const nf = (n) => new Intl.NumberFormat('vi-VN').format(n);
  const formatVND = (n) => `${nf(n)} VND`;
  const normalizeCode = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g,'');
  const parseVoucher = (raw) => {
    const text = String(raw || '').trim();
    if (!text) return { code: '', percent: 0 };
    const parts = text.split(/[,;|\/\s]+/).map(normalizeCode).filter(Boolean);
    let best = { code: '', percent: 0 };
    for (const c of parts) {
      const p = (typeof COUPON_MAP[c] === 'number') ? COUPON_MAP[c] : 0;
      if (p > 0) {
        if (PICK_BEST_COUPON) { if (p > best.percent) best = { code: c, percent: p }; }
        else { return { code: c, percent: p }; }
      }
    }
    return best;
  };

  // ——— pick fields with robust aliases + tokens ———
  let to = pickByAliases_(rowValues, {map},
    ['Email của cậu', 'Email', 'Địa chỉ email', 'email', 'email address'], '', [['email','cau'], ['email']]
  );
  if (!to && AUTO_DETECT_EMAIL_FROM_ROW) to = findEmailInRow_(rowValues);

  const rawName = pickByAliases_(rowValues, {map},
    ['Tên của cậu', 'Họ tên', 'Tên', 'CUSTOMER_NAME'], '', [['ten','cau'], ['ho','ten'], ['ten']]
  );
  const name = rawName ? String(rawName).trim() : 'bạn';

  const nickname = pickByAliases_(rowValues, {map},
    [
      'Nội dung cậu muốn viết trên keychain',
      'Nội dung cậu muốn viết trên keychain (tối đa 15 ký tự)',
      'Nội dung cậu muốn viết trên keychain (tối đa 15 ký tự) (Mỗi keychain sẽ có tên kèm theo như trong ảnh, nếu cậu đặt nhiều và muốn mỗi chiếc một tên riêng thì chỉ cần ghi N/A và inbox cho page để chúng mình hỗ trợ nhé!)'
    ],
    '', [['noi','dung','keychain'], ['noi','dung','viet','keychain'], ['nickname']]
  );

  const qtyRaw = pickByAliases_(rowValues, {map},
    [
      'Số lượng đặt hàng', 'Số lượng',
      'Số lượng sản phẩm đặt hàng (Chỉ điền số nha! VD: Order 5 cái -> Bạn điền: 5) Giá bán mỗi sản phẩm: 49.000VND',
      'Số lượng sản phẩm đặt hàng (Chỉ điền số nha! VD: Order 5 cái -> Bạn điền: 5)'
    ],
    1, [['so','luong','dat','hang'], ['so','luong']]
  );

  const voucherRaw = pickByAliases_(rowValues, {map},
    ['Mã ưu đãi (nếu có)', 'Mã ưu đãi', 'Mã giảm giá', 'Voucher', 'Voucher code', 'VOUCHER'],
    '', [['ma','uu','dai'], ['voucher'], ['ma','giam','gia']]
  );

  const shippingMethod = pickByAliases_(rowValues, {map},
    ['Phương thức giao/nhận hàng', 'Phương thức giao hàng', 'SHIPPING_METHOD'],
    '', [['phuong','thuc','giao','nhan','hang'], ['phuong','thuc','giao','hang']]
  );

  const shippingAddress = pickByAliases_(rowValues, {map},
    ['Địa chỉ nhận hàng', 'Địa chỉ nhận', 'SHIPPING_ADDRESS'],
    '', [['dia','chi','nhan','hang'], ['dia','chi','nhan']]
  );

  const orderDate = (function() {
    const d = pickByAliases_(rowValues, {map}, ['Timestamp', 'Ngày đặt', 'Order Date', 'ORDER_DATE', 'Thời gian']);
    if (d) return d;
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  })();

  // ——— Money calc (subtotal -> discount -> total) ———
  const qty = Math.max(1, parseInt(String(qtyRaw).toString().replace(/[^\d]/g,''), 10) || 1);
  const subTotalVal = qty * UNIT_PRICE;

  const { code: appliedCode, percent: discountPercent } = parseVoucher(voucherRaw);
  const discountVal = Math.round(subTotalVal * (discountPercent / 100));
  let totalVal = Math.max(0, subTotalVal - discountVal);

  const subTotalText = formatVND(subTotalVal);
  const discountText = discountPercent > 0 ? `-${formatVND(discountVal)} (${appliedCode} ${discountPercent}%)` : '';
  const totalText = formatVND(totalVal);

  // ——— Subject & Bodies ———
  const subject = `[PIXSELF CITY] Đơn hàng của bạn đã được xác nhận - Liệu bạn đã sẵn sàng “unlock” phiên bản pixel của mình chưa!`;

  const plain =
`Xin chào ${name},

Chào mừng bạn chính thức trở thành cư dân Pixself City! Đơn hàng của bạn đã được xác nhận vào ${orderDate}.

Thông tin đơn hàng
Sản phẩm: Pixel Keychain - Pixself City Character
Tuỳ biến: “${nickname}”
Số lượng: ${qty}
Tạm tính: ${subTotalText}
${discountPercent > 0 ? `Giảm giá: ${discountText}\n` : ''}Tổng cộng: ${totalText} (chưa tính phí vận chuyển + sản phẩm add in nếu có)
Thanh toán: Chuyển khoản QR - Đã thanh toán

Giao nhận
Phương thức: ${shippingMethod}
Địa chỉ nhận: ${shippingAddress}
Thời gian xử lý dự kiến: ~3-5 ngày (Đối với đơn từ ngày 28.08 - 2.9, đơn sẽ được giao sau thời gian nghỉ lễ 2.9)

Lợi ích cư dân Pixself
• Cá nhân hoá phiên bản pixel “có 1-0-2”.
• “Khắc” lời nhắn/nickname/chữ ký đúng vibe riêng.
• Chiếc Pixel Keychain như “tấm hộ chiếu” vào Pixself City!

Nếu cần hỗ trợ, reply email này hoặc liên hệ:
0345205918 (Mr. Tiên) | 0961726061 (Ms. Giang)
207 Giải Phóng, P. Đồng Tâm, Q. Hai Bà Trưng, Hà Nội

Pixself - PIXture yourSELF in PIXSELF City
Fanpage: https://www.facebook.com/wearepixself/
Instagram: https://www.instagram.com/pixself.exe/

Pixself cảm ơn bạn rất nhiều! ✨`;

  // HTML body — same content, refined visual only
  const html =
`<div style="margin:0;padding:24px;background:#f6f7fb;color:#111;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #eceef3;border-radius:16px;overflow:hidden">
    <!-- Cover -->
    <tr>
      <td style="padding:0;line-height:0;background:#000">
        <a href="https://www.facebook.com/wearepixself/" target="_blank" style="text-decoration:none;border:0">
          <img src="${esc(coverSrc)}" alt="${esc(COVER_ALT)}" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0;outline:none;text-decoration:none">
        </a>
      </td>
    </tr>

    <!-- Header / Status -->
    <tr>
      <td style="padding:20px 24px 12px 24px">
        <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:#eef2ff;color:#3b5bfd;font-size:12px;font-weight:700;letter-spacing:.3px">
          ĐÃ XÁC NHẬN
        </div>
        <h1 style="margin:10px 0 6px 0;font-size:22px;line-height:1.3">
          <strong>Đơn hàng của bạn đã được xác nhận</strong>
        </h1>
        <p style="margin:0;font-size:14px;color:#555">
          Xin chào <strong>${esc(name)}</strong>, chào mừng bạn đến với <em>Pixself City</em>!<br>
          Thời gian xác nhận: <strong>${esc(orderDate)}</strong>
        </p>
      </td>
    </tr>

    <!-- Order summary -->
    <tr>
      <td style="padding:16px 24px;background:#fafbff;border-top:1px solid #eceef3;border-bottom:1px solid #eceef3">
        <h3 style="margin:0 0 10px 0;font-size:16px"><strong>Thông tin đơn hàng</strong></h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#333">
          <tr>
            <td style="padding:6px 0;color:#555">Sản phẩm</td>
            <td style="padding:6px 0" align="right"><strong>Pixel Keychain - Pixself City Character</strong></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555">Tuỳ biến</td>
            <td style="padding:6px 0" align="right">“${esc(nickname)}”</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555">Số lượng</td>
            <td style="padding:6px 0" align="right">${esc(qty)}</td>
          </tr>

          <tr><td colspan="2" style="padding:8px 0"><div style="height:1px;background:#eceef3"></div></td></tr>

          <tr>
            <td style="padding:6px 0;color:#555">Tạm tính</td>
            <td style="padding:6px 0" align="right">${esc(subTotalText)}</td>
          </tr>
          ${discountPercent > 0 ? `
          <tr>
            <td style="padding:6px 0;color:#b12704">Giảm giá</td>
            <td style="padding:6px 0" align="right"><strong style="color:#b12704">${esc(discountText)}</strong></td>
          </tr>` : ``}
          <tr>
            <td style="padding:6px 0"><strong>Tổng cộng</strong></td>
            <td style="padding:6px 0" align="right">
              <strong style="font-size:16px">${esc(totalText)}</strong>
              <span style="color:#777;font-size:12px"> (chưa tính phí vận chuyển + sản phẩm add in nếu có)</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555">Thanh toán</td>
            <td style="padding:6px 0" align="right"><strong>Chuyển khoản QR - Đã thanh toán</strong></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Shipping -->
    <tr>
      <td style="padding:16px 24px">
        <h3 style="margin:0 0 10px 0;font-size:16px"><strong>Giao nhận</strong></h3>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#333">
          <tr>
            <td style="padding:6px 0;color:#555">Phương thức</td>
            <td style="padding:6px 0" align="right"><strong>${esc(shippingMethod)}</strong></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555">Địa chỉ nhận</td>
            <td style="padding:6px 0" align="right">${esc(shippingAddress)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#555">Thời gian xử lý dự kiến</td>
            <td style="padding:6px 0" align="right"><strong>~3-5 ngày (Đối với đơn từ ngày 28.08 - 2.9, đơn sẽ được giao sau thời gian nghỉ lễ 2.9)</strong></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Perks -->
    <tr>
      <td style="padding:16px 24px;background:#fafbff;border-top:1px solid #eceef3">
        <h3 style="margin:0 0 8px 0;font-size:16px"><strong>Lợi ích cư dân Pixself</strong></h3>
        <ul style="margin:8px 0 0 18px;padding:0;font-size:14px">
          <li>Cá nhân hoá phiên bản pixel “có 1-0-2”.</li>
          <li>“Khắc” lời nhắn/nickname/chữ ký đúng vibe riêng.</li>
          <li>Chiếc Pixel Keychain như “tấm hộ chiếu” vào Pixself City!</li>
        </ul>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:16px 24px">
        <p style="margin:0 0 6px 0;font-size:14px">
          Nếu cần hỗ trợ, reply email này hoặc liên hệ:
          <strong>0345205918 (Mr. Tiên)</strong> • <strong>0961726061 (Ms. Giang)</strong>
        </p>
        <p style="margin:0 0 6px 0;font-size:14px">207 Giải Phóng, P. Đồng Tâm, Q. Hai Bà Trưng, Hà Nội</p>
        <p style="margin:0;font-size:13px;color:#666">
          <strong>Pixself — PIXture yourSELF in PIXSELF City</strong><br>
          Fanpage: <a href="https://www.facebook.com/wearepixself/" style="color:#111">facebook.com/wearepixself</a> •
          Instagram: <a href="https://www.instagram.com/pixself.exe/" style="color:#111">@pixself.exe</a>
        </p>
      </td>
    </tr>
  </table>

  <p style="text-align:center;margin:14px 0 0 0;font-size:12px;color:#888">
    Pixself cảm ơn bạn rất nhiều! ✨
  </p>
</div>`;

  return { to, subject, plain, html };
}

/* ===================== UTILS ===================== */
function getHeaders_(sheet) {
  const { headers } = buildHeaderMap_(sheet);
  return headers;
}

/* Debug: in log xem tiêu đề đã normalize & value theo cột */
function debugInspectActiveRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveCell().getRow();
  const { headers, headerRow } = buildHeaderMap_(sheet);
  if (row <= headerRow) {
    Logger.log('Bạn đang chọn hàng tiêu đề. Hãy chọn một dòng dữ liệu bên dưới.');
    return;
  }
  const rowValues = sheet.getRange(row, 1, 1, headers.length).getValues()[0];

  Logger.log('HEADER_ROW = ' + headerRow);
  Logger.log('--- HEADERS (index: normalized) & values ---');
  headers.forEach((h, i) => {
    Logger.log((i+1) + ': ' + h + '  =>  [' + normalizeHeader_(h) + ']  | value=' + rowValues[i]);
  });
}
