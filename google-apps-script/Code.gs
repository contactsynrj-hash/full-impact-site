/**
 * Full Impact — Google Apps Script receiver
 *
 * SETUP REQUIRED:
 * 1. Create a Google Sheet owned by Full Impact.
 * 2. Copy its ID from the URL and paste it into SPREADSHEET_ID below.
 * 3. Deploy this script as a Web App, executing as the owner and allowing
 *    access to anyone who needs to submit the public form.
 * 4. Copy the /exec URL into site/assets/js/config.js.
 */

const SPREADSHEET_ID = 'PASTE_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Contacts';

const HEADERS = [
  'timestamp_server',
  'submitted_at_client',
  'submission_id',
  'type_de_demande',
  'profil',
  'prenom',
  'nom',
  'email',
  'sport',
  'club',
  'niveau',
  'question',
  'consentement',
  'source_page',
  'utm_source',
  'utm_medium',
  'utm_campaign'
];

function doGet(e) {
  const check = e && e.parameter ? clean_(e.parameter.check) : '';
  const callback = e && e.parameter ? clean_(e.parameter.callback) : '';

  if (check && callback && /^[A-Za-z_$][0-9A-Za-z_$]{0,100}$/.test(callback)) {
    const stored = Boolean(PropertiesService.getScriptProperties().getProperty('submission:' + check));
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({ ok: true, stored: stored }) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return jsonResponse_({ ok: true, service: 'Full Impact form endpoint' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    if (!e || !e.parameter) {
      return jsonResponse_({ ok: false, error: 'empty_request' });
    }

    const p = e.parameter;

    // Honeypot: bots often fill every field.
    if (clean_(p.website)) {
      return jsonResponse_({ ok: true });
    }

    if (clean_(p.consentement).toLowerCase() !== 'oui') {
      return jsonResponse_({ ok: false, error: 'consent_required' });
    }

    const required = ['type_de_demande', 'profil', 'prenom', 'nom', 'email', 'sport', 'niveau', 'submission_id'];
    for (let i = 0; i < required.length; i += 1) {
      if (!clean_(p[required[i]])) {
        return jsonResponse_({ ok: false, error: 'missing_' + required[i] });
      }
    }

    if (!isEmail_(clean_(p.email))) {
      return jsonResponse_({ ok: false, error: 'invalid_email' });
    }

    if (SPREADSHEET_ID === 'PASTE_SPREADSHEET_ID_HERE') {
      throw new Error('SPREADSHEET_ID is not configured.');
    }

    // Keep a lightweight server-side deduplication key for 30 days.
    const props = PropertiesService.getScriptProperties();
    const dedupeKey = 'submission:' + clean_(p.submission_id);
    if (props.getProperty(dedupeKey)) {
      return jsonResponse_({ ok: true, duplicate: true });
    }

    const sheet = getOrCreateSheet_();
    ensureHeaders_(sheet);

    const row = [
      new Date(),
      clean_(p.submitted_at_client),
      clean_(p.submission_id),
      clean_(p.type_de_demande),
      clean_(p.profil),
      clean_(p.prenom),
      clean_(p.nom),
      clean_(p.email),
      clean_(p.sport),
      clean_(p.club),
      clean_(p.niveau),
      clean_(p.question),
      clean_(p.consentement),
      clean_(p.source_page),
      clean_(p.utm_source),
      clean_(p.utm_medium),
      clean_(p.utm_campaign)
    ];

    sheet.appendRow(row);
    props.setProperty(dedupeKey, String(Date.now()));
    pruneOldDedupeKeys_(props);

    return jsonResponse_({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    return;
  }

  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getValues()[0];
  const same = HEADERS.every((header, index) => String(current[index] || '') === header);
  if (!same) {
    throw new Error('The first row of the sheet does not match the expected headers.');
  }
}

function clean_(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, 5000);
}

function isEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function pruneOldDedupeKeys_(props) {
  // Runs rarely to keep PropertiesService tidy without adding complexity.
  if (Math.random() > 0.03) return;
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  const all = props.getProperties();
  Object.keys(all).forEach((key) => {
    if (key.indexOf('submission:') !== 0) return;
    const createdAt = Number(all[key]);
    if (!Number.isFinite(createdAt) || now - createdAt > maxAge) {
      props.deleteProperty(key);
    }
  });
}
