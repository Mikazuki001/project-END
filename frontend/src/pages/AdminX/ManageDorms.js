import React, { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API;

const ManageDorms = () => {
  const [dorms, setDorms] = useState([]);
  const [editingDorm, setEditingDorm] = useState(null);
  const [formData, setFormData] = useState({
    dormname: "",
    address: "",
    facilities: [],
    facilitiesOther: "",
    security: [],
    securityOther: "",
    lat: "",
    long: "",
  });
  const [selectedDorm, setSelectedDorm] = useState(null);

  // 🔎 state สำหรับค้นหา
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ options
  const facilityOptions = ["Wi-Fi", "เครื่องซักผ้า", "ที่จอดรถ", "ร้านค้า", "อื่นๆ"];
  const securityOptions = ["กล้องวงจรปิด", "รปภ.", "คีย์การ์ด", "ประตูล็อก 2 ชั้น", "อื่นๆ"];

  // โหลดข้อมูล dormitories
  const fetchDorms = async () => {
    try {
      const res = await axios.get(`${API}/dormitories`);
      setDorms(res.data);
    } catch (err) {
      console.error("❌ Error fetching dorms:", err);
    }
  };

  useEffect(() => {
    fetchDorms();
  }, []);

  // เริ่มแก้ไข
  const startEdit = (dorm) => {
    let facilitiesList = Array.isArray(dorm.facilities)
      ? dorm.facilities
      : dorm.facilities
      ? dorm.facilities.split(",").map((s) => s.trim())
      : [];

    let securityList = Array.isArray(dorm.security)
      ? dorm.security
      : dorm.security
      ? dorm.security.split(",").map((s) => s.trim())
      : [];

    const selectedFacilities = facilitiesList.filter((f) =>
      facilityOptions.includes(f)
    );
    const otherFacilities = facilitiesList.filter(
      (f) => !facilityOptions.includes(f)
    );

    const selectedSecurity = securityList.filter((s) =>
      securityOptions.includes(s)
    );
    const otherSecurity = securityList.filter(
      (s) => !securityOptions.includes(s)
    );

    setEditingDorm(dorm.dormid);
    setFormData({
      dormname: dorm.dormname,
      address: dorm.address,
      facilities: selectedFacilities,
      facilitiesOther: otherFacilities.join(", "),
      security: selectedSecurity,
      securityOther: otherSecurity.join(", "),
      lat: dorm.lat,
      long: dorm.long,
    });
  };

  // ยกเลิกแก้ไข
  const cancelEdit = () => {
    setEditingDorm(null);
    setFormData({
      dormname: "",
      address: "",
      facilities: [],
      facilitiesOther: "",
      security: [],
      securityOther: "",
      lat: "",
      long: "",
    });
  };

  // บันทึกการแก้ไข
  const saveEdit = async (id) => {
    try {
      const fullFacilities = [...formData.facilities];
      if (formData.facilities.includes("อื่นๆ") && formData.facilitiesOther) {
        fullFacilities.push(formData.facilitiesOther);
      }

      const fullSecurity = [...formData.security];
      if (formData.security.includes("อื่นๆ") && formData.securityOther) {
        fullSecurity.push(formData.securityOther);
      }

      await axios.put(`${API}/dormitories/${id}`, {
        dormname: formData.dormname,
        address: formData.address,
        facilities: fullFacilities,
        security: fullSecurity,
        lat: formData.lat,
        long: formData.long,
      });

      fetchDorms();
      setEditingDorm(null);
    } catch (err) {
      console.error("❌ Update failed:", err);
    }
  };

  // ลบ
  const deleteDorm = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบหอพักนี้?")) {
      try {
        await axios.delete(`${API}/dormitories/${id}`);
        fetchDorms();
      } catch (err) {
        console.error("❌ Delete failed:", err);
      }
    }
  };

  // ✅ ฟิลเตอร์ผลการค้นหา
  const filteredDorms = dorms.filter(
    (dorm) =>
      dorm.dormname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dorm.ownername || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-dorms">
      <h2>จัดการข้อมูลหอพักที่อนุมัติแล้ว</h2>

      {/* 🔎 ช่องค้นหา */}
      <input
        type="text"
        placeholder="ค้นหาด้วยชื่อหอพัก หรือชื่อเจ้าของหอ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: "15px",
          padding: "8px",
          width: "300px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>เจ้าของหอ</th>
            <th>ชื่อหอพัก</th>
            <th>ที่อยู่</th>
            <th>สิ่งอำนวยความสะดวก</th>
            <th>ระบบความปลอดภัย</th>
            <th>Lat</th>
            <th>Long</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredDorms.map((dorm) => (
            <tr key={dorm.dormid}>
              <td>{dorm.dormid}</td>
              <td>{dorm.ownername}</td>

              {editingDorm === dorm.dormid ? (
                <>
                  <td>
                    <input
                      name="dormname"
                      value={formData.dormname}
                      onChange={(e) =>
                        setFormData({ ...formData, dormname: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    {/* ✅ สิ่งอำนวยความสะดวก */}
                    {facilityOptions.map((opt) => (
                      <label key={opt} style={{ display: "block" }}>
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(opt)}
                          onChange={(e) => {
                            const value = e.target.checked
                              ? [...formData.facilities, opt]
                              : formData.facilities.filter((f) => f !== opt);
                            setFormData({ ...formData, facilities: value });
                          }}
                        />{" "}
                        {opt}
                      </label>
                    ))}
                    {formData.facilities.includes("อื่นๆ") && (
                      <input
                        placeholder="ระบุเพิ่มเติม"
                        value={formData.facilitiesOther}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            facilitiesOther: e.target.value,
                          })
                        }
                      />
                    )}
                  </td>
                  <td>
                    {/* ✅ ระบบความปลอดภัย */}
                    {securityOptions.map((opt) => (
                      <label key={opt} style={{ display: "block" }}>
                        <input
                          type="checkbox"
                          checked={formData.security.includes(opt)}
                          onChange={(e) => {
                            const value = e.target.checked
                              ? [...formData.security, opt]
                              : formData.security.filter((s) => s !== opt);
                            setFormData({ ...formData, security: value });
                          }}
                        />{" "}
                        {opt}
                      </label>
                    ))}
                    {formData.security.includes("อื่นๆ") && (
                      <input
                        placeholder="ระบุเพิ่มเติม"
                        value={formData.securityOther}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            securityOther: e.target.value,
                          })
                        }
                      />
                    )}
                  </td>
                  <td>
                    <input
                      name="lat"
                      value={formData.lat}
                      onChange={(e) =>
                        setFormData({ ...formData, lat: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      name="long"
                      value={formData.long}
                      onChange={(e) =>
                        setFormData({ ...formData, long: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => saveEdit(dorm.dormid)}
                      style={{ color: "green" }}
                    >
                      💾 บันทึก
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ marginLeft: "5px", color: "gray" }}
                    >
                      ❌ ยกเลิก
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{dorm.dormname}</td>
                  <td>{dorm.address}</td>
                  <td>
                    {Array.isArray(dorm.facilities)
                      ? dorm.facilities.join(", ")
                      : dorm.facilities}
                  </td>
                  <td>
                    {Array.isArray(dorm.security)
                      ? dorm.security.join(", ")
                      : dorm.security}
                  </td>
                  <td>{dorm.lat}</td>
                  <td>{dorm.long}</td>
                  <td>
                    <button onClick={() => setSelectedDorm(dorm)}>
                      👁 ดูรายละเอียด
                    </button>
                    <button
                      onClick={() => startEdit(dorm)}
                      style={{ marginLeft: "5px" }}
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      onClick={() => deleteDorm(dorm.dormid)}
                      style={{ marginLeft: "5px", color: "red" }}
                    >
                      🗑 ลบ
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Popup แสดงรายละเอียด */}
      {selectedDorm && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>รายละเอียดหอพัก</h3>
            <p>
              <b>เจ้าของหอ:</b> {selectedDorm.ownername}
            </p>
            <p>
              <b>ชื่อ:</b> {selectedDorm.dormname}
            </p>
            <p>
              <b>ที่อยู่:</b> {selectedDorm.address}
            </p>
            <p>
              <b>สิ่งอำนวยความสะดวก:</b>{" "}
              {Array.isArray(selectedDorm.facilities)
                ? selectedDorm.facilities.join(", ")
                : selectedDorm.facilities}
            </p>
            <p>
              <b>ระบบความปลอดภัย:</b>{" "}
              {Array.isArray(selectedDorm.security)
                ? selectedDorm.security.join(", ")
                : selectedDorm.security}
            </p>
            <p>
              <b>พิกัด:</b> {selectedDorm.lat}, {selectedDorm.long}
            </p>
            <button onClick={() => setSelectedDorm(null)}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDorms;
