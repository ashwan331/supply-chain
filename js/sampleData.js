/**
 * Pre-loaded Demo Datasets across various business domains
 */
const SAMPLE_DATASETS = {
    supply_chain: {
        id: 'supply_chain',
        name: 'Supply Chain & Inventory Dataset.csv',
        type: 'CSV',
        domain: 'Supply Chain & Inventory',
        description: 'Inventory levels, lead times, daily demand, costs, and suppliers.',
        data: [
            { Item_ID: 'SKU-1001', Product_Name: 'Industrial Bearing Unit A', Category: 'Hardware', Stock_Level: 450, Daily_Demand: 25, Lead_Time_Days: 7, Unit_Cost: 35.00, Unit_Price: 68.00, Supplier: 'Acme Metalworks', Storage_Location: 'Warehouse East', Last_Restock: '2026-08-15' },
            { Item_ID: 'SKU-1002', Product_Name: 'High-Torque Hydraulic Valve', Category: 'Hydraulics', Stock_Level: 85, Daily_Demand: 18, Lead_Time_Days: 14, Unit_Cost: 120.00, Unit_Price: 240.00, Supplier: 'FluidTech Inc', Storage_Location: 'Warehouse North', Last_Restock: '2026-09-01' },
            { Item_ID: 'SKU-1003', Product_Name: 'Precision Steel Fastener Kit', Category: 'Hardware', Stock_Level: 1200, Daily_Demand: 80, Lead_Time_Days: 5, Unit_Cost: 4.50, Unit_Price: 12.00, Supplier: 'Acme Metalworks', Storage_Location: 'Warehouse East', Last_Restock: '2026-09-10' },
            { Item_ID: 'SKU-1004', Product_Name: 'Microcontroller Circuit Board v2', Category: 'Electronics', Stock_Level: 310, Daily_Demand: 45, Lead_Time_Days: 21, Unit_Cost: 48.00, Unit_Price: 110.00, Supplier: 'Silicon Valley Semiconductors', Storage_Location: 'Warehouse West', Last_Restock: '2026-07-28' },
            { Item_ID: 'SKU-1005', Product_Name: 'Synthetic Lubricant Oil 5L', Category: 'Chemicals', Stock_Level: 620, Daily_Demand: 30, Lead_Time_Days: 10, Unit_Cost: 22.00, Unit_Price: 45.00, Supplier: 'ChemPro Global', Storage_Location: 'Warehouse South', Last_Restock: '2026-09-12' },
            { Item_ID: 'SKU-1006', Product_Name: 'Heavy-Duty Conveyor Belt 10m', Category: 'Machinery', Stock_Level: 42, Daily_Demand: 6, Lead_Time_Days: 18, Unit_Cost: 450.00, Unit_Price: 890.00, Supplier: 'Belting Dynamics', Storage_Location: 'Warehouse North', Last_Restock: '2026-08-20' },
            { Item_ID: 'SKU-1007', Product_Name: 'Thermal Temperature Sensor', Category: 'Electronics', Stock_Level: 190, Daily_Demand: 28, Lead_Time_Days: 12, Unit_Cost: 28.50, Unit_Price: 65.00, Supplier: 'Silicon Valley Semiconductors', Storage_Location: 'Warehouse West', Last_Restock: '2026-09-05' },
            { Item_ID: 'SKU-1008', Product_Name: 'Pneumatic Cylinder Assembly', Category: 'Hydraulics', Stock_Level: 65, Daily_Demand: 12, Lead_Time_Days: 15, Unit_Cost: 180.00, Unit_Price: 350.00, Supplier: 'FluidTech Inc', Storage_Location: 'Warehouse North', Last_Restock: '2026-08-11' },
            { Item_ID: 'SKU-1009', Product_Name: 'Heavy Duty Rubber Gasket Pack', Category: 'Hardware', Stock_Level: 850, Daily_Demand: 60, Lead_Time_Days: 6, Unit_Cost: 8.00, Unit_Price: 19.50, Supplier: 'Acme Metalworks', Storage_Location: 'Warehouse East', Last_Restock: '2026-09-15' },
            { Item_ID: 'SKU-1010', Product_Name: 'Industrial Power Inverter 5kW', Category: 'Electrical', Stock_Level: 95, Daily_Demand: 8, Lead_Time_Days: 25, Unit_Cost: 320.00, Unit_Price: 650.00, Supplier: 'VoltMasters Supply', Storage_Location: 'Warehouse South', Last_Restock: '2026-07-15' },
            { Item_ID: 'SKU-1011', Product_Name: 'High Voltage Copper Cable 50m', Category: 'Electrical', Stock_Level: 140, Daily_Demand: 15, Lead_Time_Days: 10, Unit_Cost: 85.00, Unit_Price: 160.00, Supplier: 'VoltMasters Supply', Storage_Location: 'Warehouse South', Last_Restock: '2026-08-30' },
            { Item_ID: 'SKU-1012', Product_Name: 'Industrial Filter Cartridge Pack', Category: 'Chemicals', Stock_Level: 410, Daily_Demand: 35, Lead_Time_Days: 8, Unit_Cost: 18.00, Unit_Price: 42.00, Supplier: 'ChemPro Global', Storage_Location: 'Warehouse South', Last_Restock: '2026-09-18' }
        ]
    },
    sales: {
        id: 'sales',
        name: 'Enterprise Sales Data.csv',
        type: 'CSV',
        domain: 'Sales Analytics',
        description: 'Revenue, orders, products, categories, discounts, and regional distribution.',
        data: [
            { Order_Date: '2026-01-05', Region: 'North America', Category: 'Technology', Product: 'Enterprise Laptop Pro', Units_Sold: 15, Revenue: 22500, Discount_Percent: 5, Customer_Segment: 'Corporate' },
            { Order_Date: '2026-01-12', Region: 'Europe', Category: 'Technology', Product: 'Wireless Monitor 27"', Units_Sold: 28, Revenue: 11200, Discount_Percent: 0, Customer_Segment: 'Consumer' },
            { Order_Date: '2026-01-20', Region: 'Asia Pacific', Category: 'Furniture', Product: 'Ergonomic Executive Chair', Units_Sold: 42, Revenue: 14700, Discount_Percent: 10, Customer_Segment: 'Corporate' },
            { Order_Date: '2026-02-02', Region: 'North America', Category: 'Office Supplies', Product: 'Laser Printer Toner', Units_Sold: 85, Revenue: 7650, Discount_Percent: 12, Customer_Segment: 'Small Business' },
            { Order_Date: '2026-02-15', Region: 'Latin America', Category: 'Technology', Product: 'Enterprise Laptop Pro', Units_Sold: 10, Revenue: 15000, Discount_Percent: 0, Customer_Segment: 'Corporate' },
            { Order_Date: '2026-03-01', Region: 'Europe', Category: 'Furniture', Product: 'Standing Electric Desk', Units_Sold: 20, Revenue: 16000, Discount_Percent: 8, Customer_Segment: 'Consumer' },
            { Order_Date: '2026-03-18', Region: 'Asia Pacific', Category: 'Technology', Product: 'Cloud Server Blade', Units_Sold: 8, Revenue: 32000, Discount_Percent: 3, Customer_Segment: 'Corporate' },
            { Order_Date: '2026-04-05', Region: 'North America', Category: 'Office Supplies', Product: 'Recycled Paper Pack (500 sheets)', Units_Sold: 300, Revenue: 3600, Discount_Percent: 15, Customer_Segment: 'Small Business' },
            { Order_Date: '2026-04-22', Region: 'Europe', Category: 'Technology', Product: 'Wireless Monitor 27"', Units_Sold: 35, Revenue: 14000, Discount_Percent: 5, Customer_Segment: 'Corporate' },
            { Order_Date: '2026-05-10', Region: 'Latin America', Category: 'Furniture', Product: 'Ergonomic Executive Chair', Units_Sold: 25, Revenue: 8750, Discount_Percent: 0, Customer_Segment: 'Small Business' },
            { Order_Date: '2026-05-28', Region: 'North America', Category: 'Technology', Product: 'Cloud Server Blade', Units_Sold: 12, Revenue: 48000, Discount_Percent: 2, Customer_Segment: 'Corporate' },
            { Order_Date: '2026-06-14', Region: 'Asia Pacific', Category: 'Office Supplies', Product: 'Laser Printer Toner', Units_Sold: 110, Revenue: 9900, Discount_Percent: 10, Customer_Segment: 'Consumer' },
            { Order_Date: '2026-07-02', Region: 'Europe', Category: 'Technology', Product: 'Enterprise Laptop Pro', Units_Sold: 22, Revenue: 33000, Discount_Percent: 5, Customer_Segment: 'Corporate' },
            { Order_Date: '2026-07-19', Region: 'North America', Category: 'Furniture', Product: 'Standing Electric Desk', Units_Sold: 30, Revenue: 24000, Discount_Percent: 10, Customer_Segment: 'Corporate' },
            { Order_Date: '2026-08-08', Region: 'Latin America', Category: 'Office Supplies', Product: 'Recycled Paper Pack (500 sheets)', Units_Sold: 250, Revenue: 3000, Discount_Percent: 0, Customer_Segment: 'Consumer' }
        ]
    },
    employee: {
        id: 'employee',
        name: 'HR Employee Census & Compensation.xlsx',
        type: 'XLSX',
        domain: 'HR & Employee Data',
        description: 'Headcount, department breakdown, salaries, experience, and performance.',
        data: [
            { Employee_ID: 'EMP-0101', Employee_Name: 'Sarah Jenkins', Department: 'Engineering', Job_Title: 'Principal Software Engineer', Salary: 165000, Experience_Years: 11, Age: 36, Performance_Score: 4.8, Attrition_Risk: 'Low', Join_Date: '2018-04-12' },
            { Employee_ID: 'EMP-0102', Employee_Name: 'Michael Chen', Department: 'Engineering', Job_Title: 'Senior Frontend Developer', Salary: 135000, Experience_Years: 7, Age: 31, Performance_Score: 4.5, Attrition_Risk: 'Low', Join_Date: '2020-09-01' },
            { Employee_ID: 'EMP-0103', Employee_Name: 'Elena Rostova', Department: 'Sales', Job_Title: 'VP of Global Sales', Salary: 185000, Experience_Years: 14, Age: 42, Performance_Score: 4.9, Attrition_Risk: 'Low', Join_Date: '2017-02-15' },
            { Employee_ID: 'EMP-0104', Employee_Name: 'David Miller', Department: 'Marketing', Job_Title: 'Growth Marketing Manager', Salary: 98000, Experience_Years: 4, Age: 28, Performance_Score: 3.9, Attrition_Risk: 'Medium', Join_Date: '2022-01-10' },
            { Employee_ID: 'EMP-0105', Employee_Name: 'Aisha Patel', Department: 'Finance', Job_Title: 'Senior Financial Analyst', Salary: 112000, Experience_Years: 6, Age: 30, Performance_Score: 4.4, Attrition_Risk: 'Low', Join_Date: '2021-06-20' },
            { Employee_ID: 'EMP-0106', Employee_Name: 'James Wilson', Department: 'Engineering', Job_Title: 'DevOps Lead Engineer', Salary: 145000, Experience_Years: 9, Age: 34, Performance_Score: 4.6, Attrition_Risk: 'Low', Join_Date: '2019-11-05' },
            { Employee_ID: 'EMP-0107', Employee_Name: 'Jessica Taylor', Department: 'HR', Job_Title: 'Talent Acquisition Partner', Salary: 82000, Experience_Years: 3, Age: 27, Performance_Score: 4.1, Attrition_Risk: 'High', Join_Date: '2023-03-14' },
            { Employee_ID: 'EMP-0108', Employee_Name: 'Robert Garcia', Department: 'Sales', Job_Title: 'Account Executive', Salary: 105000, Experience_Years: 5, Age: 29, Performance_Score: 3.8, Attrition_Risk: 'Medium', Join_Date: '2021-10-01' },
            { Employee_ID: 'EMP-0109', Employee_Name: 'Linda Wang', Department: 'Product', Job_Title: 'Group Product Manager', Salary: 160000, Experience_Years: 10, Age: 37, Performance_Score: 4.7, Attrition_Risk: 'Low', Join_Date: '2019-01-22' },
            { Employee_ID: 'EMP-0110', Employee_Name: 'Marcus Johnson', Department: 'Customer Success', Job_Title: 'Customer Support Lead', Salary: 75000, Experience_Years: 3, Age: 26, Performance_Score: 4.2, Attrition_Risk: 'Low', Join_Date: '2022-08-11' }
        ]
    },
    healthcare: {
        id: 'healthcare',
        name: 'Hospital Patient Admissions & Outcomes.json',
        type: 'JSON',
        domain: 'Healthcare Analytics',
        description: 'Patient admissions, treatments, length of stay, cost, and hospital units.',
        data: [
            { Patient_ID: 'PT-8801', Age: 64, Gender: 'Female', Primary_Diagnosis: 'Cardiovascular Hypertension', Treatment_Cost: 14200, Admission_Date: '2026-08-01', Length_Of_Stay_Days: 6, Unit: 'Cardiology', Outcome: 'Discharged - Recovered' },
            { Patient_ID: 'PT-8802', Age: 42, Gender: 'Male', Primary_Diagnosis: 'Acute Appendicitis', Treatment_Cost: 8500, Admission_Date: '2026-08-03', Length_Of_Stay_Days: 3, Unit: 'General Surgery', Outcome: 'Discharged - Recovered' },
            { Patient_ID: 'PT-8803', Age: 78, Gender: 'Female', Primary_Diagnosis: 'Pneumonia Respiratory', Treatment_Cost: 19800, Admission_Date: '2026-08-05', Length_Of_Stay_Days: 11, Unit: 'Pulmonology', Outcome: 'Transferred to Rehab' },
            { Patient_ID: 'PT-8804', Age: 35, Gender: 'Male', Primary_Diagnosis: 'Fractured Femur Trauma', Treatment_Cost: 12400, Admission_Date: '2026-08-08', Length_Of_Stay_Days: 4, Unit: 'Orthopedics', Outcome: 'Discharged - Recovered' },
            { Patient_ID: 'PT-8805', Age: 53, Gender: 'Female', Primary_Diagnosis: 'Type 2 Diabetes Complication', Treatment_Cost: 9600, Admission_Date: '2026-08-12', Length_Of_Stay_Days: 5, Unit: 'Endocrinology', Outcome: 'Discharged - Recovered' },
            { Patient_ID: 'PT-8806', Age: 69, Gender: 'Male', Primary_Diagnosis: 'Cardiovascular Hypertension', Treatment_Cost: 16500, Admission_Date: '2026-08-15', Length_Of_Stay_Days: 7, Unit: 'Cardiology', Outcome: 'Discharged - Under Observation' },
            { Patient_ID: 'PT-8807', Age: 29, Gender: 'Female', Primary_Diagnosis: 'Acute Appendicitis', Treatment_Cost: 7900, Admission_Date: '2026-08-18', Length_Of_Stay_Days: 2, Unit: 'General Surgery', Outcome: 'Discharged - Recovered' },
            { Patient_ID: 'PT-8808', Age: 82, Gender: 'Male', Primary_Diagnosis: 'Pneumonia Respiratory', Treatment_Cost: 22100, Admission_Date: '2026-08-20', Length_Of_Stay_Days: 14, Unit: 'Pulmonology', Outcome: 'Transferred to ICU' }
        ]
    }
};
