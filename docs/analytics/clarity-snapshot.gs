// Clarity daily snapshot for the Looker Studio dashboard (page 8, Behaviour).
//
// Lives as an Apps Script bound to the "NamingContest dashboard scaffold"
// Google Sheet. The source copy is kept in the repo at
// docs/analytics/clarity-snapshot.gs.
//
// Why: Clarity's Data Export API only returns the last 1-3 days and allows
// 10 calls per project per day, so history has to be saved by us. Every night
// this makes 3 calls (whole site, per page, per device) for the last 24 hours
// and appends the numbers to the "Clarity" tab. Looker reads that tab.
//
// Setup (once):
//   1. Clarity > Settings > Data Export > Generate new API token.
//   2. Apps Script > Project Settings > Script Properties:
//      add CLARITY_TOKEN = <the token>.
//   3. Run setup() from the editor and approve the permissions.
// If the token is replaced in Clarity, update CLARITY_TOKEN; nothing else.

const API_URL = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';
const DATA_SHEET = 'Clarity';
const LOG_SHEET = 'Clarity log';
const HEADER = ['Date', 'Breakdown', 'Segment', 'Detail', 'Metric', 'Field', 'Value'];

// One call each. Keep this list at 3 or fewer so a manual re-run the same day
// still fits inside Clarity's 10 calls a day.
const BREAKDOWNS = [
  { name: 'Site', dimension: null },
  { name: 'Page', dimension: 'URL' },
  { name: 'Device', dimension: 'Device' },
];

function setup() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'dailySnapshot')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailySnapshot').timeBased().everyDays(1).atHour(1).create();
  dailySnapshot();
}

function dailySnapshot() {
  const token = PropertiesService.getScriptProperties().getProperty('CLARITY_TOKEN');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = sheetWithHeader(ss, DATA_SHEET, HEADER);
  const log = sheetWithHeader(ss, LOG_SHEET, ['Run at', 'Date', 'Status', 'Rows', 'Message']);

  // The API covers the 24 hours before the call; running at ~01:00 means that
  // is (almost exactly) yesterday.
  const day = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const date = Utilities.formatDate(day, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');

  if (!token) {
    log.appendRow([new Date(), date, 'ERROR', 0, 'CLARITY_TOKEN script property is missing']);
    return;
  }

  // A re-run for the same date replaces that date's rows instead of doubling them.
  removeRowsForDate(data, date, ss.getSpreadsheetTimeZone());

  let total = 0;
  const problems = [];
  BREAKDOWNS.forEach((b) => {
    try {
      const rows = fetchBreakdown(token, b).map((r) => [date, b.name].concat(r));
      if (rows.length) {
        data.getRange(data.getLastRow() + 1, 1, rows.length, HEADER.length).setValues(rows);
      }
      total += rows.length;
    } catch (e) {
      problems.push(b.name + ': ' + e.message);
    }
  });

  log.appendRow([new Date(), date, problems.length ? 'ERROR' : 'OK', total, problems.join(' | ')]);
}

// Returns [Segment, Detail, Metric, Field, Value] rows for one breakdown.
function fetchBreakdown(token, breakdown) {
  let url = API_URL + '?numOfDays=1';
  if (breakdown.dimension) url += '&dimension1=' + encodeURIComponent(breakdown.dimension);

  const res = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  if (code !== 200) throw new Error('HTTP ' + code + ' ' + res.getContentText().slice(0, 200));

  const out = [];
  JSON.parse(res.getContentText()).forEach((metric) => {
    (metric.information || []).forEach((info) => {
      const segment = breakdown.dimension ? String(info[breakdown.dimension] ?? '') : 'All';
      // Text fields (a page URL in "Popular pages", a title...) become Detail;
      // every numeric field becomes its own row.
      const detail = Object.keys(info)
        .filter((k) => k !== breakdown.dimension && !isNumeric(info[k]))
        .map((k) => String(info[k]))
        .join(' ');
      Object.keys(info)
        .filter((k) => k !== breakdown.dimension && isNumeric(info[k]))
        .forEach((k) => out.push([segment, detail, metric.metricName, k, Number(info[k])]));
    });
  });
  return out;
}

function isNumeric(v) {
  return v !== null && v !== '' && typeof v !== 'boolean' && !isNaN(Number(v));
}

function sheetWithHeader(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, header.length).setValues([header]);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Sheets turns the written yyyy-MM-dd text into a real date, so compare both forms.
function removeRowsForDate(sh, date, tz) {
  const last = sh.getLastRow();
  if (last < 2) return;
  const dates = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = dates.length - 1; i >= 0; i--) {
    const v = dates[i][0];
    const s = v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v);
    if (s === date) sh.deleteRow(i + 2);
  }
}
