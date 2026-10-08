/**
 * Parser Module - Handles reading CSV, XLSX/XLS, and JSON dataset files
 */
const DataParser = {
    /**
     * Parses a File object based on extension
     * @param {File} file 
     * @returns {Promise<{ name: string, type: string, sizeBytes: number, data: Array<Object> }>}
     */
    async parseFile(file) {
        const fileName = file.name;
        const fileSize = file.size;
        const extension = fileName.split('.').pop().toLowerCase();

        if (extension === 'csv') {
            return await this.parseCSV(file, fileName, fileSize);
        } else if (extension === 'xlsx' || extension === 'xls') {
            return await this.parseExcel(file, fileName, fileSize);
        } else if (extension === 'json') {
            return await this.parseJSON(file, fileName, fileSize);
        } else {
            throw new Error(`Unsupported file extension: .${extension}. Please upload CSV, XLSX, or JSON.`);
        }
    },

    /**
     * Parse CSV files with PapaParse
     */
    parseCSV(file, fileName, fileSize) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: 'greedy',
                complete: (results) => {
                    if (results.errors && results.errors.length > 0) {
                        console.warn('CSV Parse Warnings:', results.errors);
                    }
                    const cleaned = this.cleanRecords(results.data);
                    resolve({
                        name: fileName,
                        type: 'CSV',
                        sizeBytes: fileSize,
                        data: cleaned
                    });
                },
                error: (err) => {
                    reject(new Error(`CSV Parsing failed: ${err.message}`));
                }
            });
        });
    },

    /**
     * Parse Excel XLSX / XLS files with SheetJS
     */
    parseExcel(file, fileName, fileSize) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    
                    // Grab the first sheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Convert to array of objects
                    const jsonRecords = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });
                    const cleaned = this.cleanRecords(jsonRecords);

                    resolve({
                        name: fileName,
                        type: 'Excel (XLSX)',
                        sizeBytes: fileSize,
                        data: cleaned
                    });
                } catch (err) {
                    reject(new Error(`Excel Parsing failed: ${err.message}`));
                }
            };
            reader.onerror = (err) => reject(new Error('File reading error'));
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Parse JSON file
     */
    parseJSON(file, fileName, fileSize) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let parsed = JSON.parse(e.target.result);
                    
                    // If root is object with a nested array (e.g. { data: [...] } or { records: [...] })
                    if (!Array.isArray(parsed)) {
                        if (Array.isArray(parsed.data)) parsed = parsed.data;
                        else if (Array.isArray(parsed.records)) parsed = parsed.records;
                        else if (Array.isArray(parsed.items)) parsed = parsed.items;
                        else {
                            throw new Error('JSON structure must be an array of objects or contain a top-level array property (data, records, items).');
                        }
                    }

                    const cleaned = this.cleanRecords(parsed);
                    resolve({
                        name: fileName,
                        type: 'JSON',
                        sizeBytes: fileSize,
                        data: cleaned
                    });
                } catch (err) {
                    reject(new Error(`JSON Parsing failed: ${err.message}`));
                }
            };
            reader.onerror = (err) => reject(new Error('File reading error'));
            reader.readAsText(file);
        });
    },

    /**
     * Clean and normalize parsed records
     */
    cleanRecords(records) {
        if (!Array.isArray(records) || records.length === 0) {
            return [];
        }

        return records.map(row => {
            const newRow = {};
            for (const key in row) {
                if (Object.prototype.hasOwnProperty.call(row, key)) {
                    const cleanKey = key.trim();
                    let val = row[key];
                    if (typeof val === 'string') {
                        val = val.trim();
                        // Try parsing numbers formatted as strings like "22,500" or "$150"
                        if (/^\$?\s*[\d,]+(\.\d+)?$/.test(val) && !/^\d{4}-\d{2}-\d{2}/.test(val)) {
                            const numVal = parseFloat(val.replace(/[\$,]/g, ''));
                            if (!isNaN(numVal)) val = numVal;
                        }
                    }
                    newRow[cleanKey] = val;
                }
            }
            return newRow;
        });
    },

    /**
     * Format byte sizes into readable string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
