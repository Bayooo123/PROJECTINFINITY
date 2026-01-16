
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

console.log('Type of pdfParse:', typeof pdfParse);
console.log('pdfParse keys:', Object.keys(pdfParse));
console.log('pdfParse:', pdfParse);

if (typeof pdfParse !== 'function') {
    if (pdfParse.default && typeof pdfParse.default === 'function') {
        console.log('Has default export function');
    }
}
