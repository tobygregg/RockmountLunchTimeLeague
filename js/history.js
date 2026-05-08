async function loadHistory() {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?sheet=${CONFIG.SHEET_NAME}&range=${CONFIG.HistoryRange}`;

  const response = await fetch(url);
  const text = await response.text();

  const json = JSON.parse(text.substr(47).slice(0, -2));

  const rows = json.table.rows;

  const table = document.getElementById('historyBody');

  rows.reverse();

  rows.forEach(row => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${row.c[0]?.v || ''}</td>
      <td>${row.c[1]?.v || ''}</td>
      <td>${row.c[2]?.v || ''}</td>
      <td>${row.c[3]?.v || ''}</td>
    `;

    table.appendChild(tr);
  });
}

loadHistory();
