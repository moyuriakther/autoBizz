export const fetchSpreadsheetData = async (url, sheetName) => {
  if (!url) {
    throw new Error('URL is required');
  }

  try {
    // Extract the spreadsheet ID from the URL
    const matches = url.match(/\/d\/(.*?)\/edit/);
    if (!matches || !matches[1]) {
      throw new Error('Invalid Google Sheets URL');
    }
    
    const spreadsheetId = matches[1];
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    
    const response = await fetch(sheetUrl);
    const textData = await response.text();

    // Parse Google's response format
    const jsonString = textData.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonString || !jsonString[1]) {
      throw new Error('Failed to parse Google Sheets response');
    }

    const jsonData = JSON.parse(jsonString[1]);
    const headers = jsonData.table.cols.map(col => col.label);
    const rows = jsonData.table.rows.map(row => {
      const rowData = {};
      row.c.forEach((cell, index) => {
        rowData[headers[index]] = cell ? cell.v : null;
      });
      return rowData;
    });

    return rows;
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    throw error;
  }
};