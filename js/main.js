async function getCell(cell) {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?sheet=${CONFIG.SHEET_NAME}&range=${cell}`;

  const response = await fetch(url);
  const text = await response.text();

  const json = JSON.parse(text.substr(47).slice(0, -2));

  return json.table.rows[0].c[0].v;
}

async function loadData() {
  document.getElementById('sylvansPoints').innerText = await getCell(CONFIG.SylvansPoints);
  document.getElementById('cpfcPoints').innerText = await getCell(CONFIG.CPFCPoints);

  document.getElementById('latestScore').innerText =
    `${await getCell(CONFIG.LatestSylvansScore)} - ${await getCell(CONFIG.LatestCPFCScore)}`;

  document.getElementById('motm').innerText = await getCell(CONFIG.LatestMOTM);

  document.getElementById('sylvansWins').innerText = await getCell(CONFIG.SylvansWins);
  document.getElementById('cpfcWins').innerText = await getCell(CONFIG.CPFCWins);

  document.getElementById('sylvansGoals').innerText = await getCell(CONFIG.SylvansGoals);
  document.getElementById('cpfcGoals').innerText = await getCell(CONFIG.CPFCGoals);

  document.getElementById('sylvansRate').innerText = await getCell(CONFIG.SylvansWinRate) + '%';
  document.getElementById('cpfcRate').innerText = await getCell(CONFIG.CPFCWinRate) + '%';

  document.getElementById('draws').innerText = await getCell(CONFIG.Draws);
}

loadData();
