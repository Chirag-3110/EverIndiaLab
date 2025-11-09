import React, { useEffect, useState } from "react";
import { Table, Button, Input, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAuth } from "../../context/AuthContext";
import {
  useGetBookingQuery,
  useMarkAsCompleteBookingMutation,
} from "../../redux/api/bookingApi";
import { formatDateTime } from "../../utils/utils";
import { EyeIcon, LucideBanknote } from "lucide-react";

const BookingList = () => {
  // Your existing states
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // For custom popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [markAsCompleteBooking] = useMarkAsCompleteBookingMutation();

  const { data, isLoading } = useGetBookingQuery({
    searchText,
    page,
    pageSize,
    id: user?._id,
  });

  const labBooings = data?.response?.data ?? [];
  const total = data?.response?.data?.length ?? 0;

  const handlePaymentComplete = async (record) => {
    await markAsCompleteBooking(record._id).unwrap();
    toast.success("Payment marked as complete.");
    closePopup();
  };

  // Show popup for cash payment
  const handleCashPayment = (record) => {
    setSelectedRecord(record);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedRecord(null);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date) => formatDateTime(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "pending" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: ["userId", "name"],
      key: "customerName",
      render: (_, record) => record.userId?.name || "-",
    },
    {
      title: "Payment Type",
      dataIndex: "paymentType",
      key: "paymentType",
    },
    {
      title: "Collection Type",
      dataIndex: ["amount", "collectiontype"],
      key: "collectiontype",
    },
    {
      title: "Total Amount",
      dataIndex: ["amount", "finalAmount"],
      key: "finalAmount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button onClick={() => navigate(`/booking/details/${record._id}`)}>
            <EyeIcon size={18} />
          </Button>
          <Button
            onClick={() => {
              if (record.paymentType === "online") {
                handlePaymentComplete(record);
              } else if (record.paymentType === "cash") {
                handleCashPayment(record);
              }
            }}
            style={{
              color: "#27ae60",
              backgroundColor: "#e6f4ea",
              borderColor: "#27ae60",
              fontWeight: "600",
            }}
          >
            <LucideBanknote
              size={18}
              style={{ marginRight: 0, color: "#27ae60" }}
            />
            Payment
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Booking List" />
      <div className="flex justify-between items-center gap-4 mb-4">
        <Input.Search
          placeholder="Search packages"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          enterButton
        />
      </div>

      <Table
        columns={columns}
        dataSource={labBooings}
        rowKey="_id"
        loading={isLoading}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      {/* Custom Confirmation Popup */}
      {popupVisible && (
        <div style={overlayStyle as React.CSSProperties}>
          <div style={popupStyle as React.CSSProperties}>
            <p>
              Are you accepting the payment in "CASH" from the assigned staff
              member?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: 20,
              }}
            >
              <button
                style={yesButtonStyle}
                onClick={() => handlePaymentComplete(selectedRecord)}
              >
                Yes
              </button>
              <button style={noButtonStyle} onClick={closePopup}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for custom popup
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const popupStyle = {
  backgroundColor: "#fff",
  padding: "20px 30px",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  maxWidth: "350px",
  textAlign: "center",
};

const yesButtonStyle = {
  backgroundColor: "#1890ff",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
  width: "48%",
};

const noButtonStyle = {
  backgroundColor: "#f5f5f5",
  border: "1px solid #ccc",
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
  width: "48%",
};

export default BookingList;
