// src/pages/DormMapPage.js
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// fix marker icon (required for most setups)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ✅ ย้าย style objects มาไว้นอกคอมโพเนนต์
const input = {
  flex: 1,
  padding: "8px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
};

const textarea = {
  width: "100%",
  padding: "8px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  resize: "vertical",
};

const DormMapPage = () => {
  const navigate = useNavigate();
  const [dorms, setDorms] = useState([]);
  const [selectedDorm, setSelectedDorm] = useState(null);
  const [dormImages, setDormImages] = useState([]);

   // ✅ ย้ายมาที่นี่
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");


// filter
const filteredDorms = dorms.filter((d) => {
  const matchSearch =
    d.dormname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.address.toLowerCase().includes(searchTerm.toLowerCase());

  // ห้องที่กรอง (ตามประเภทถ้ามีเลือก)
  const relevantRooms = Array.isArray(d.rooms)
    ? d.rooms.filter((r) =>
        roomTypeFilter
          ? (r.roomtype || "")
              .toLowerCase()
              .includes(roomTypeFilter.toLowerCase())
          : true
      )
    : [];

  // ถ้าเลือกประเภท แต่ไม่มีห้องที่ตรงเลย → ไม่ match
  if (roomTypeFilter && relevantRooms.length === 0) return false;

  // กรองราคาบนห้องที่เหลือ
  const matchPrice =
    (!minPrice && !maxPrice) ||
    relevantRooms.some((r) => {
      const price = parseFloat(r.pricemonthly) || 0;
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;
      return true;
    });

  return matchSearch && matchPrice;
});



  // ฟังก์ชันเปลี่ยนค่าที่พิมพ์
const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchTerm(value);

  if (value.trim() === "") {
    setSuggestions([]);
    return;
  }

  const filtered = dorms.filter((d) =>
    (d.dormname || "").toLowerCase().includes(value.toLowerCase())
  );
  setSuggestions(filtered.slice(0, 5)); // โชว์แค่ 5 อันดับแรก
};

// ฟังก์ชันเลือกจาก suggestion
const handleSelectSuggestion = (dorm) => {
  setSearchTerm(dorm.dormname);
  setSuggestions([]);
  handleViewDetails(dorm); // เปิด popup ของหอนั้น
};

  // ✅ โหลดข้อมูลหอพักที่อนุมัติแล้ว
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API}/dormitories`)
      .then((res) => {
        const approved = res.data.filter((d) => d.isapproved === "approved");
        setDorms(approved);
      })
      .catch((err) => console.error("Error fetching dorms:", err));
  }, []);

  // ✅ ฟังก์ชันเปิดรายละเอียด
  const handleViewDetails = async (dorm) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API}/images/${dorm.dormid}`
      );
      setDormImages(res.data);
    } catch (err) {
      console.error("Error fetching images:", err);
      setDormImages([]);
    }
    setSelectedDorm(dorm);
  };

  // ✅ แปลง Array เป็นข้อความสวยๆ
  const renderArray = (field) => {
    if (!field) return "ไม่ระบุ";
    try {
      if (typeof field === "string") {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed.join(", ");
        return field;
      }
      if (Array.isArray(field)) return field.join(", ");
      return String(field);
    } catch {
      return String(field);
    }
  };

  

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
   {/* Header + ปุ่มเข้าสู่ระบบ/ไปที่ Dashboard */}
<div
  style={{
    background: "#1f2937",   // พื้นหลังน้ำเงินเข้ม
    color: "white",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
  }}
>
{/* โลโก้ */}
<div
  onClick={() => navigate("/")}   // ✅ เพิ่ม event ให้กลับหน้าแรก
  style={{
    fontSize: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",           // ✅ ทำให้เมาส์เป็นรูปมือ
  }}
>
  <span style={{ fontSize: "22px" }}>🏠</span>
  ระบบค้นหาหอพักสำหรับนักศึกษา มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา พิษณุโลก
</div>


  {/* ปุ่มขวา */}
<div style={{ display: "flex", gap: "10px" }}>
   {(() => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        return (
          <>
            <span style={{ alignSelf: "center" }}>👋 สวัสดี, {user.name}</span>
            <button
              onClick={() =>
                user.status === "admin"
                  ? navigate("/admin")
                  : navigate("/owner")
              }
              style={{
                padding: "8px 16px",
                background: "#3b82f6",  // ฟ้า
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
                {/* ✅ ปุ่มคู่มือ */}
  <a
    href="/คู่มือ.pdf"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      padding: "8px 16px",
      background: "#10b981", // เขียวสวยๆ
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      textDecoration: "none",
    }}
  >
    📖 คู่มือการใช้งาน
  </a>
              ไปที่ Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/");
                window.location.reload();
              }}
              style={{
                padding: "8px 16px",
                background: "#ef4444", // แดง
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              ออกจากระบบ
            </button>
          </>
        );
      } else {
        return (
          <>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => navigate("/register")}
              style={{
                padding: "8px 16px",
                background: "white",
                color: "#3b82f6",
                border: "1px solid #3b82f6",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              สมัคร
            </button>
          </>
        );
      }
    })()}
  </div>
</div>

      {/* Leaflet Map */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={[16.862206964123057, 100.18312463727388]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ วาดหมุดจากข้อมูลหอพัก */}
          {filteredDorms.map(
            (dorm) =>
              dorm.lat &&
              dorm.long && (
                <Marker
                  key={dorm.dormid}
                  position={[parseFloat(dorm.lat), parseFloat(dorm.long)]}
                >
                  <Popup>
                    <div style={{ maxWidth: "200px" }}>
                      {/* รูปแรก */}
                      {dorm.images?.length > 0 ? (
                        <img
                          src={`${process.env.REACT_APP_API}${dorm.images[0].path}`}
                          alt="Dorm"
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            marginBottom: "6px",
                          }}
                        />
                      ) : (
                        <p style={{ fontSize: "12px" }}>ไม่มีรูปภาพ</p>
                      )}

                      <h4>{dorm.dormname}</h4>
                      <p>{dorm.address}</p>
                      <p>
                        <b>สิ่งอำนวยความสะดวก:</b>{" "}
                        {renderArray(dorm.facilities)}
                      </p>
                      <p>
                        <b>ระบบความปลอดภัย:</b>{" "}
                        {renderArray(dorm.security)}
                      </p>

                      {/* ปุ่มดูรายละเอียด */}
                      <button
                        style={{
                          marginTop: "6px",
                          padding: "6px 10px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleViewDetails(dorm)}
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
          )}
        </MapContainer>

       {/* 🔎 Search + Filter overlay */}
<div
  style={{
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1000,
    display: "flex",
    flexDirection: "row",
    gap: "6px",
    background: "white",
    padding: "6px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    alignItems: "flex-start",
  }}
>
  {/* ช่องค้นหา */}
  <div style={{ position: "relative", width: "220px" }}>
    <input
      type="text"
      placeholder="ค้นหาหอพัก..."
      value={searchTerm}
      onChange={handleSearchChange}
      style={{
        padding: "6px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        width: "100%",
      }}
    />

    {/* รายการ suggestions */}
    {suggestions.length > 0 && (
      <ul
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginTop: "2px",
          listStyle: "none",
          padding: 0,
          zIndex: 2000,
          maxHeight: "150px",
          overflowY: "auto",
        }}
      >
        {suggestions.map((dorm) => (
          <li
            key={dorm.dormid}
            onClick={() => handleSelectSuggestion(dorm)}
            style={{
              padding: "6px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.target.style.background = "white")}
          >
            {dorm.dormname}
          </li>
        ))}
      </ul>
    )}
  </div>

  {/* Dropdown Filter */}
  <select
    value={roomTypeFilter}
    onChange={(e) => setRoomTypeFilter(e.target.value)}
    style={{
      padding: "6px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      width: "120px",
    }}
  >
    <option value="">ทุกประเภท</option>
    <option value="แอร์">ห้องแอร์</option>
    <option value="พัดลม">ห้องพัดลม</option>
  </select>

  {/* Input Filter: ช่วงราคา */}
<input
  type="number"
  placeholder="ราคาเริ่มต้น"
  value={minPrice}
  onChange={(e) => setMinPrice(e.target.value)}
  style={{
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100px",
  }}
/>
<input
  type="number"
  placeholder="ราคาสูงสุด"
  value={maxPrice}
  onChange={(e) => setMaxPrice(e.target.value)}
  style={{
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100px",
  }}
/>

</div>

      </div>

      {/* ✅ Modal: รายละเอียดหอพัก */}
      {selectedDorm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedDorm(null)}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>รายละเอียดหอพัก</h2>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: 600 }}>ชื่อหอพัก</label>
              <input
                style={input}
                value={selectedDorm.dormname || ""}
                readOnly
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: 600 }}>ชื่อเจ้าของหอพัก</label>
              <input
                style={input}
                value={selectedDorm.ownername || "ไม่ระบุ"}
                readOnly
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: 600 }}>เบอร์โทรศัพท์</label>
              <input
                style={input}
                value={selectedDorm.phonenumber || "ไม่ระบุ"}
                readOnly
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: 600 }}>ที่อยู่</label>
              <textarea
                style={textarea}
                value={selectedDorm.address || ""}
                readOnly
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: 600 }}>สิ่งอำนวยความสะดวก</label>
              <textarea
                style={textarea}
                value={renderArray(selectedDorm.facilities)}
                readOnly
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontWeight: 600 }}>ระบบความปลอดภัย</label>
              <textarea
                style={textarea}
                value={renderArray(selectedDorm.security)}
                readOnly
              />
            </div>

            {/* ✅ ประเภทห้องและราคา (UI เหมือน OwnerDashboardPage) */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ fontWeight: 600, marginBottom: 6, display: "block" }}>
                ประเภทห้องและราคา
              </label>
              {(selectedDorm.rooms || []).length > 0 ? (
                (selectedDorm.rooms || []).map((r, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    {/* ประเภทห้อง */}
                    <input
                      style={input}
                      value={r.roomtype || "ไม่ระบุ"}
                      readOnly
                    />

                    {/* ราคา/เดือน */}
                    <input
                      style={input}
                      value={
                        r.pricemonthly
                          ? `${r.pricemonthly} บาท/เดือน`
                          : "ไม่ระบุ"
                      }
                      readOnly
                    />

                    {/* ราคา/เทอม */}
                    <input
                      style={input}
                      value={
                        r.priceterm
                          ? `${r.priceterm} บาท/เทอม`
                          : "ไม่ระบุ"
                      }
                      readOnly
                    />
                  </div>
                ))
              ) : (
                <input style={input} value="ไม่ระบุ" readOnly />
              )}
            </div>

            {/* รูปทั้งหมด */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "12px",
              }}
            >
              {dormImages.length > 0 ? (
                dormImages.map((img) => (
                  <img
                    key={img.imageid}
                    src={`${process.env.REACT_APP_API}${img.path}`}
                    alt="Dorm"
                    style={{
                      width: "180px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                ))
              ) : (
                <p>ไม่มีรูปภาพ</p>
              )}
            </div>

            <button
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onClick={() => setSelectedDorm(null)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DormMapPage;