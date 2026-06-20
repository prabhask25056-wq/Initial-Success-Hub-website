const SPREADSHEET_ID = '1oRgx1Zw6TN9d9zp101Kc5PDqYaoE6nA_Pfj2ODNTudI';
const ENQUIRY_SHEET_NAME = 'Website Enquiries';
const HEADERS = [
  'Submitted At',
  'Student Name',
  'Parent Name',
  'Mobile Number',
  'Email',
  'Class/Course Interested In',
  'Message',
  'Source Page',
  'Status',
  'Class / Grade',
];

function doPost(e) {
  const params = parseRequest_(e);

  // Silently accept bot-filled submissions without storing them.
  if (params.website) {
    return jsonResponse_({ ok: true });
  }

  const required = ['studentName', 'parentName', 'mobile', 'email', 'course', 'className'];
  if (required.some((field) => !String(params[field] || '').trim())) {
    return jsonResponse_({ ok: false, error: 'Missing required fields' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateEnquirySheet_(spreadsheet);
    const row = [
      new Date(),
      safeCell_(params.studentName),
      safeCell_(params.parentName),
      safeCell_(params.mobile),
      safeCell_(params.email),
      safeCell_(params.course),
      safeCell_(params.message),
      'Website Enquiry Form',
      'New',
      safeCell_(params.className),
    ];

    sheet.appendRow(row);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat('dd-mmm-yyyy hh:mm:ss');
    sheet.getRange(lastRow, 4).setNumberFormat('@');

    return jsonResponse_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse_({ ok: true, service: 'Success Hub enquiry form' });
}

function getOrCreateEnquirySheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(ENQUIRY_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(ENQUIRY_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground('#11243f')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 165);
    sheet.setColumnWidths(2, 2, 150);
    sheet.setColumnWidth(4, 130);
    sheet.setColumnWidth(5, 210);
    sheet.setColumnWidth(6, 220);
    sheet.setColumnWidth(7, 300);
    sheet.setColumnWidth(8, 260);
    sheet.setColumnWidth(9, 90);
    sheet.setColumnWidth(10, 120);
  }

  return sheet;
}

function parseRequest_(e) {
  const body = e && e.postData && e.postData.contents;
  if (body) {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (error) {
      // Fall back to standard form parameters for backwards compatibility.
    }
  }
  return (e && e.parameter) || {};
}

function safeCell_(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
