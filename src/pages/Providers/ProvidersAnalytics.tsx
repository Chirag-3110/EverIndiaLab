import React, { useState } from "react";
import { Table, Select } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const initialUsers = [
  {
    id: 1,
    name: "Saloon",
    total: "85",
  },
  {
    id: 2,
    name: "Health Care",
    total: "75",
  },
  {
    id: 3,
    name: "Spa",
    total: "5",
  },
  {
    id: 4,
    name: "Pet Clinic",
    total: "40",
  },
  {
    id: 5,
    name: "Automotive Car",
    total: "60",
  },
  {
    id: 6,
    name: "Retail/Designer",
    total: "35",
  },
];

const ProvidersAnalytics = () => {
  const [users, setUsers] = useState(initialUsers);

  function getPercentColor(percent: string) {
    const value = Number(percent);

    if (value >= 0 && value <= 5) return "red";
    if (value > 5 && value <= 35) return "#EF9B0F";
    if (value > 36 && value < 50) return "blue";
    if (value > 51 && value < 85) return "#F94D00";
    if (value >= 85 && value < 100) return "green";
    if (value === 100) return "darkgreen";

    return "gray";
  }

  //  Customer overview items
  const customerOverviewItems = [
    { label: "Total Providers Listed", value: 1750 },
    { label: "Profile Completed/In Review", value: 890 },
    { label: "Average Revenue per Provider(MoM)", value: "$500" },
    { label: "Total Cancellation Charges Generated", value: "$15,670" },
  ];

  //  Appointment status items
  const appointmentStatusItems = [
    {
      icon: <CheckCircleOutlined style={{ color: "green", fontSize: 22 }} />,
      percent: "85%",
      label: "Completed",
    },
    {
      icon: <ClockCircleOutlined style={{ color: "#EAB308", fontSize: 22 }} />,
      percent: "5%",
      label: "Pending",
    },
    {
      icon: <CloseCircleOutlined style={{ color: "red", fontSize: 22 }} />,
      percent: "5%",
      label: "Cancelled",
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Providers Analytics" />
      <section className="border rounded-xl mb-4 shadow-sm p-5 bg-white flex flex-col">
        <h3 className="font-semibold text-lg mb-5">Customer Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {customerOverviewItems.map(({ label, value }) => (
            <div
              key={label}
              className="border rounded-lg p-4 shadow-sm flex flex-col justify-center"
            >
              <span className="text-gray-600 text-sm">{label}</span>
              <span className="font-bold text-xl text-[#07868D] mt-1">
                {value}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-6 bg-blue-100 hover:bg-blue-200 transition-colors text-blue-700 font-semibold py-2 px-4 rounded-lg w-full">
          Export Customer Overview CSV
        </button>
      </section>

      {/* Appointment Status Section */}
      <section className="border rounded-xl shadow-sm p-5 mb-4 bg-white flex flex-col">
        <h3 className="font-semibold text-lg mb-5">Appointment Status</h3>
        <div className="flex flex-col gap-4">
          {appointmentStatusItems.map(({ icon, percent, label }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-3 bg-pink-100 rounded-lg"
            >
              <div>{icon}</div>
              <div className="font-bold text-lg text-[#07868D]">{percent}</div>
              <div className="text-gray-700">{label}</div>
            </div>
          ))}
        </div>
        <button className="mt-6 bg-blue-100 hover:bg-blue-200 transition-colors text-blue-700 font-semibold py-2 px-4 rounded-lg w-full">
          Export Appointment Status CSV
        </button>
      </section>
    </div>
  );
};

export default ProvidersAnalytics;
