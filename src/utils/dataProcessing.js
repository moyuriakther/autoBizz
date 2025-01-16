export function processData(orders, lineItems, startDate, endDate) {
  try {
    // Validate inputs
    if (!orders || !lineItems || !startDate || !endDate) {
      throw new Error('Missing required parameters');
    }

    // Create a map to store total price for each date
    const dateTotalMap = new Map();

    // Process each line item
    lineItems.forEach(lineItem => {
      // Find corresponding order
      const order = orders.find(o => o['Order ID'] === lineItem['Order ID']);
      if (!order) return;

      const orderDate = order['Order Date'];
      if (!orderDate) return;

      // Format date to ensure consistent DD-MM-YYYY format
      let formattedDate = orderDate;
      if (typeof orderDate === 'string' && orderDate.startsWith('Date(')) {
        const [year, month, day] = orderDate.replace('Date(', '').replace(')', '').split(',').map(Number);
        formattedDate = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
      }

      // Check if date is within range
      if (isDateInRange(formattedDate, startDate, endDate)) {
        const price = parseFloat(lineItem['Price']) || 0;
        const currentTotal = dateTotalMap.get(formattedDate) || 0;
        dateTotalMap.set(formattedDate, currentTotal + price);
      }
    });

   // Calculate total sum of all prices in the date range
    const totalSum = Array.from(dateTotalMap.values()).reduce((sum, price) => sum + price, 0);

    console.log('Date totals:', Object.fromEntries(dateTotalMap));
    console.log('Total sum:', totalSum);


    // // Find the date with highest total
    // let bestDate = '';
    // let highestTotal = -1;

    // dateTotalMap.forEach((total, date) => {
    //   if (total > highestTotal) {
    //     highestTotal = total;
    //     bestDate = date;
    //   }
    // });
       let bestDate = '';
    let lowestRefundAmount = Infinity;

    dateTotalMap.forEach((dateTotal, date) => {
      // Calculate refund amount if we save this date
      // Refund amount = total sum - this date's total
      const refundAmount = totalSum - dateTotal;
      console.log(`Date: ${date}, Total: ${dateTotal}, Refund Amount: ${refundAmount}`);

      if (refundAmount < lowestRefundAmount) {
        lowestRefundAmount = refundAmount;
        bestDate = date;
      }
    });

    console.log('Best date:', bestDate, 'with total:', lowestRefundAmount); // Debug log

    if (!bestDate) {
      throw new Error('No valid dates found within the specified range');
    }

    return bestDate;
  } catch (error) {
    console.error('Error in processData:', error);
    throw error;
  }
}

function isDateInRange(dateStr, startDate, endDate) {
  try {
    const parseDate = (str) => {
      const [day, month, year] = str.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const date = parseDate(dateStr);
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    return date >= start && date <= end;
  } catch (error) {
    console.error('Error in date range check:', error, { dateStr, startDate, endDate });
    return false;
  }
}