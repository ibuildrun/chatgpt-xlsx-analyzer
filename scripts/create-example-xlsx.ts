import * as XLSX from 'xlsx';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// Ensure data directory exists
if (!existsSync('data')) {
  mkdirSync('data', { recursive: true });
}

// Create workbook
const workbook = XLSX.utils.book_new();

// Sample data with Name, Email, Amount, Formula columns
const data = [
  ['Name', 'Email', 'Amount', 'Tax', 'Total'],
  ['Alice Johnson', 'alice@example.com', 1500, null, null],
  ['Bob Smith', 'bob@example.com', 2300, null, null],
  ['Carol White', 'carol@example.com', 1800, null, null],
  ['David Brown', 'david@example.com', 3200, null, null],
  ['Eve Davis', 'eve@example.com', 950, null, null],
  ['Frank Miller', 'frank@example.com', 2750, null, null],
  ['Grace Wilson', 'grace@example.com', 1100, null, null],
  ['Henry Taylor', 'henry@example.com', 4500, null, null],
  ['Ivy Anderson', 'ivy@example.com', 2100, null, null],
  ['Jack Thomas', 'jack@example.com', 1650, null, null],
];

// Create worksheet
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Add formulas for Tax (10% of Amount) and Total (Amount + Tax)
for (let row = 2; row <= 11; row++) {
  // Tax formula: =C{row}*0.1
  worksheet[`D${row}`] = { t: 'n', f: `C${row}*0.1` };
  // Total formula: =C{row}+D{row}
  worksheet[`E${row}`] = { t: 'n', f: `C${row}+D${row}` };
}

// Add summary row
worksheet['A13'] = { t: 's', v: 'TOTAL' };
worksheet['C13'] = { t: 'n', f: 'SUM(C2:C11)' };
worksheet['D13'] = { t: 'n', f: 'SUM(D2:D11)' };
worksheet['E13'] = { t: 'n', f: 'SUM(E2:E11)' };

// Set column widths
worksheet['!cols'] = [
  { wch: 15 }, // Name
  { wch: 25 }, // Email
  { wch: 10 }, // Amount
  { wch: 10 }, // Tax
  { wch: 10 }, // Total
];

// Update sheet range
worksheet['!ref'] = 'A1:E13';

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

// Create second sheet with different data
const data2 = [
  ['Product', 'Category', 'Price', 'Quantity', 'Revenue'],
  ['Widget A', 'Electronics', 29.99, 150, null],
  ['Widget B', 'Electronics', 49.99, 85, null],
  ['Gadget X', 'Accessories', 15.99, 320, null],
  ['Gadget Y', 'Accessories', 24.99, 210, null],
  ['Tool Z', 'Hardware', 89.99, 45, null],
];

const worksheet2 = XLSX.utils.aoa_to_sheet(data2);

// Add Revenue formulas
for (let row = 2; row <= 6; row++) {
  worksheet2[`E${row}`] = { t: 'n', f: `C${row}*D${row}` };
}

worksheet2['A8'] = { t: 's', v: 'TOTAL REVENUE' };
worksheet2['E8'] = { t: 'n', f: 'SUM(E2:E6)' };

worksheet2['!cols'] = [
  { wch: 12 },
  { wch: 12 },
  { wch: 10 },
  { wch: 10 },
  { wch: 12 },
];

worksheet2['!ref'] = 'A1:E8';

XLSX.utils.book_append_sheet(workbook, worksheet2, 'Products');

// Write to file
const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
writeFileSync('data/example.xlsx', buffer);

console.log('Created data/example.xlsx with sample data');
console.log('Sheet1: Employee data with Name, Email, Amount, Tax, Total');
console.log('Products: Product data with Price, Quantity, Revenue');
