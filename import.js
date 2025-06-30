const XLSX = require('xlsx');
const connectDB = require('./config/db');
const Aruba = require('./models/Employees.model');

(async () => {
  try {
    // เชื่อม MongoDB
    await connectDB();

    // โหลดไฟล์ Excel
    const workbook = XLSX.readFile('Mac Regis-com(Aruba).xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // แปลงข้อมูลจาก Sheet เป็น JSON
    const rows = XLSX.utils.sheet_to_json(sheet);

    // แปลงชื่อคีย์ Excel เป็นชื่อฟิลด์ใน Model
    const dataToInsert = rows.map(row => ({
      code: row['รหัส'],
      fullName: row['ชื่อ-สกุล'],
      fullNameEN: row['ชื่อ-สกุล(อังกฤษ)'],
      department: row['0'],           
      nickname: row['ชื่อเล่น'],
      company: row['บริษัท'],
      email: row['mail'],
      username: row['user'],
      macaddr: row['mac'],
      phone: row['เบอร์'],
      status: row['Column18'],       // ใช้ชื่อ status แทน Column18
    }));

    // แทรกข้อมูลลง MongoDB
    await Aruba.insertMany(dataToInsert);

    console.log('🎉 Import Excel เข้า MongoDB สำเร็จแล้ว!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ขณะ import:', error);
    process.exit(1);
  }
})();
