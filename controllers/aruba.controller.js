const axios = require("axios");
const employeeSchema = require("../models/Employees.model");

exports.getAruba = async (req, res) => {
  try {
    const url = process.env.ARUBA_URL;
    const token = req.headers["authorization"];

    if (!url)
      return res.status(500).json({ message: "ARUBA_URL is not configured" });
    if (!token)
      return res.status(401).json({ message: "Authorization token required" });

    // อ่านค่า page กับ pageSize จาก query string (default page=1, pageSize=100)
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 100;
    const offset = (page - 1) * pageSize;

    // เรียก external API โดยแนบ limit/offset
    const response = await axios.get(url, {
      headers: { Authorization: token },
      params: { limit: pageSize, offset },
    });

    const data = response.data; // สมมติว่า data เป็น Array

    // คำนวณข้อมูล pagination กลับไปให้ client
    const result = {
      page,
      pageSize,
      data,
      hasNext: data.length === pageSize, // ถ้าได้เต็ม pageSize แปลว่ายังมีหน้าถัดไป
      nextPage: data.length === pageSize ? page + 1 : null,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "Error fetching data from ARUBA_URL:",
      error.response?.data || error.message
    );
    return res.status(500).json({ message: "Failed to fetch data" });
  }
};

exports.getOnlineEmployees = async (req, res) => {
  const pageSize = 1000;
  let offset = 0;
  let allClients = [];
  let hasMore = true;

  function normalizeMac(mac) {
    if (!mac || typeof mac !== "string") return null;
    return mac.replace(/[^A-Fa-f0-9]/g, "").toUpperCase();
  }

  try {
    // === ดึงข้อมูล Aruba ทั้งหมด ===
    while (hasMore) {
      const response = await axios.get(
        "https://api-ap.central.arubanetworks.com/monitoring/v1/clients/wireless",
        {
          headers: {
            Authorization: `Bearer ${process.env.ARUBA_TOKEN}`,
          },
          params: {
            limit: pageSize,
            offset: offset,
          },
        }
      );

      const data = response.data.clients || [];
      allClients.push(...data);

      if (data.length < pageSize) {
        hasMore = false;
      } else {
        offset += pageSize;
      }
    }

    console.log(`Fetched ${allClients.length} clients from Aruba API.`);
    // console.log(allClients.slice(0, 5)); // แสดงตัวอย่าง 5 รายการแรก

    // === เตรียม MAC ทั้งหมดที่ออนไลน์ ===
    const onlineMacs = allClients
      .map((client) => normalizeMac(client.macaddr)) // normalize
      .filter((mac) => mac); // ตัด null

    // === ค้นหาพนักงานที่มี MAC ตรงกับคนที่ออนไลน์ ===
    const onlineEmployees = await employeeSchema.find(
      {
        $expr: {
          $in: [
            {
              $toUpper: {
                $replaceAll: { input: "$macaddr", find: ":", replacement: "" },
              },
            },
            onlineMacs,
          ],
        },
      },
      {
        _id: 0, 
        __v: 0, 
      }
    );
    res.status(200).json({
      totalOnline: onlineEmployees.length,
      employees: onlineEmployees,
    });
  } catch (error) {
    console.error("Error fetching online employees:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


