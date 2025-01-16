import { useState } from 'react';
import { fetchSpreadsheetData } from '../utils/spreadsheet';
import { processData } from '../utils/dataProcessing';

export function OrderOptimizer() {
  const [url, setUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ordersData, setOrdersData] = useState(null);
  const [lineItemsData, setLineItemsData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const orders = await fetchSpreadsheetData(url, 'Orders');
      const lineItems = await fetchSpreadsheetData(url, 'LineItems');

      if (!orders.length || !lineItems.length) {
        throw new Error('No data found in one or both sheets');
      }

      if (orders.length + lineItems.length > 10000) {
        throw new Error('Total number of rows exceeds 10,000');
      }

      setOrdersData(orders);
      setLineItemsData(lineItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 // ... previous imports ...

const handleProcessData = () => {
  setError(null);
  try {
    if (!ordersData || !lineItemsData) {
      throw new Error('Please load data first');
    }

    if (!startDate || !endDate) {
      throw new Error('Please enter both start and end dates');
    }

    // Validate date format
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error('Dates must be in DD-MM-YYYY format');
    }

    console.log('Processing data with:', {
      ordersCount: ordersData.length,
      lineItemsCount: lineItemsData.length,
      startDate,
      endDate
    });

    const bestDate = processData(ordersData, lineItemsData, startDate, endDate);
    
    if (!bestDate) {
      throw new Error('Could not determine best date');
    }

    setResult(bestDate);
  } catch (err) {
    setError(err.message);
    console.error('Process Data Error:', err);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Order Date Optimizer
          </h1>
          <p className="text-gray-600">
            Find the optimal date to minimize refund impact
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Spreadsheet URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Paste your spreadsheet URL here"
              />
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleFetchData}
                disabled={loading || !url}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Load Data'
                )}
              </button>
              <button
                onClick={handleProcessData}
                disabled={!ordersData || !lineItemsData || !startDate || !endDate}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Process Data
              </button>
            </div>

            {/* Status Section */}
            {(ordersData || lineItemsData) && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Data Status</h3>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${ordersData ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Orders: {ordersData ? `${ordersData.length} rows` : 'Not loaded'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${lineItemsData ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Line Items: {lineItemsData ? `${lineItemsData.length} rows` : 'Not loaded'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <h2 className="text-lg font-semibold text-green-800 mb-2">
                  Best Date to Save
                </h2>
                <p className="text-3xl font-bold text-green-900">{result}</p>
                <p className="mt-2 text-sm text-green-600">
                  This date will minimize the total refund amount
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Make sure your spreadsheet has the correct format and is publicly accessible</p>
        </div>
      </div>
    </div>
  );
}