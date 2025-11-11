import React, { useEffect, useState } from "react";
import { Table, Button, Input, Tag, Upload, message } from "antd";
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
import { UploadOutlined } from "@ant-design/icons";

const BookingList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Popup controls
  const [popupVisible, setPopupVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [file, setFile] = useState(null);

  const [markAsCompleteBooking, { isLoading: isSubmiting }] =
    useMarkAsCompleteBookingMutation();

  const { data, isLoading } = useGetBookingQuery({
    searchText,
    page,
    pageSize,
    id: user?._id,
  });

  const labBooings = data?.response?.data ?? [];
  const total = data?.response?.data?.length ?? 0;

  // ✅ File handler
  const handleFileChange = (info) => {
    // Get latest file from fileList (AntD stores it here)
    const latestFile = info.fileList[info.fileList.length - 1];

    if (!latestFile) {
      setFile(null);
      return;
    }

    // If file was removed
    if (info.file.status === "removed" || info.fileList.length === 0) {
      setFile(null);
      return;
    }

    const fileObj = latestFile.originFileObj;
    if (!fileObj) {
      console.warn("File object not available yet");
      return;
    }

    // Validate type
    const isValid =
      fileObj.type === "application/pdf" || fileObj.type.startsWith("image/");
    if (!isValid) {
      message.error("Only PDF or image files are allowed!");
      return;
    }

    setFile(fileObj);
  };

  // ✅ API handler with file
  const handlePaymentComplete = async (record) => {
    if (!file) {
      toast.warning(
        "Please upload a report file (PDF or image) before proceeding."
      );
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("bookingId", record._id);

    try {
      await markAsCompleteBooking({
        fd: formData,
        id: record._id,
      }).unwrap();
      toast.success("Payment marked as complete with report uploaded.");
      closeAllPopups();
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark payment complete.");
    }
  };

  // ✅ For CASH: show confirmation first
  const handleCashPayment = (record) => {
    setSelectedRecord(record);
    setPopupVisible(true);
  };

  const handleCashConfirm = () => {
    setPopupVisible(false);
    setUploadVisible(true);
  };

  // ✅ For ONLINE: directly show upload popup
  const handleOnlinePayment = (record) => {
    setSelectedRecord(record);
    setUploadVisible(true);
  };

  const closeAllPopups = () => {
    setPopupVisible(false);
    setUploadVisible(false);
    setSelectedRecord(null);
    setFile(null);
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
                handleOnlinePayment(record);
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
            <LucideBanknote size={18} style={{ color: "#27ae60" }} />
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

      {/* 🧾 Cash Confirmation Popup */}
      {popupVisible && (
        <div style={overlayStyle as React.CSSProperties}>
          <div style={popupStyle as React.CSSProperties}>
            <p>
              Are you accepting the payment in <b>cash</b> from the assigned
              staff member?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: 20,
              }}
            >
              <button style={yesButtonStyle} onClick={handleCashConfirm}>
                Yes
              </button>
              <button style={noButtonStyle} onClick={closeAllPopups}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📁 Report Upload Popup (used in both cash and online) */}
      {uploadVisible && (
        <div style={overlayStyle as React.CSSProperties}>
          <div style={popupStyle as React.CSSProperties}>
            <p style={{ fontSize: "16px", marginBottom: "10px" }}>
              Upload report (PDF/Image) before completing payment
            </p>

            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              accept=".pdf,image/*"
              maxCount={1}
              fileList={file ? [{ uid: "1", name: file.name }] : []}
              onRemove={() => setFile(null)}
            >
              <Button icon={<UploadOutlined />}>Upload Report</Button>
            </Upload>

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
                disabled={isSubmiting}
              >
                {isSubmiting ? "Wait.." : " Submit"}
              </button>
              <button style={noButtonStyle} onClick={closeAllPopups}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for custom popups
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
  maxWidth: "450px",
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
