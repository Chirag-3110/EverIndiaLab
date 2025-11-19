import React, { useMemo, useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Upload,
  message,
  Select,
  DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAuth } from "../../context/AuthContext";
import {
  useGetBookingQuery,
  useMarkAsCompleteBookingMutation,
} from "../../redux/api/bookingApi";
import { formatDate, formatDateTime } from "../../utils/utils";
import { EyeIcon, LucideBanknote } from "lucide-react";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const BookingList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string | null>(
    null
  );
  const [collectionTypeFilter, setCollectionTypeFilter] = useState<
    string | null
  >(null);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Popup controls
  const [popupVisible, setPopupVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [file, setFile] = useState<any>(null);

  const [markAsCompleteBooking, { isLoading: isSubmiting }] =
    useMarkAsCompleteBookingMutation();

  const { data, isLoading } = useGetBookingQuery({
    searchText,
    page,
    pageSize,
    id: user?._id,
  });

  const labBookings = data?.response?.data ?? [];

  // ✅ File handler
  const handleFileChange = (info: any) => {
    const latestFile = info.fileList[info.fileList.length - 1];
    if (!latestFile) return setFile(null);

    const fileObj = latestFile.originFileObj;
    if (!fileObj) return;

    const isValid =
      fileObj.type === "application/pdf" || fileObj.type.startsWith("image/");
    if (!isValid) return message.error("Only PDF or image files are allowed!");

    setFile(fileObj);
  };

  // ✅ Handle Payment Completion
  const handlePaymentComplete = async () => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("bookingId", selectedRecord._id);

    try {
      await markAsCompleteBooking({
        id: selectedRecord._id,
      }).unwrap();
      toast.success("Payment marked as complete!");
      closeAllPopups();
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark payment complete.");
    }
  };

  // ✅ Cash & Online Payment Flow
  const handleCashPayment = (record: any) => {
    setSelectedRecord(record);
    setPopupVisible(true);
  };

  const handleCashConfirm = () => {
    handlePaymentComplete();
    setPopupVisible(false);
  };

  const handleOnlinePayment = (record: any) => {
    setSelectedRecord(record);
    setUploadVisible(true);
  };

  const closeAllPopups = () => {
    setPopupVisible(false);
    setUploadVisible(false);
    setSelectedRecord(null);
    setFile(null);
  };

  // ✅ Apply frontend filters
  const filteredData = useMemo(() => {
    return labBookings.filter((item: any) => {
      const matchesSearch =
        !searchText ||
        item.bookingId?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.userId?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.userAddress?.addressLine1
          ?.toLowerCase()
          .includes(searchText.toLowerCase());

      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesPayment =
        !paymentTypeFilter || item.paymentType === paymentTypeFilter;
      const matchesCollection =
        !collectionTypeFilter ||
        item.amount?.collectiontype === collectionTypeFilter;

      const matchesDate =
        !dateRange ||
        (!dateRange[0] && !dateRange[1]) ||
        (dayjs(item.createdAt).isAfter(dateRange[0]) &&
          dayjs(item.createdAt).isBefore(dateRange[1]));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesDate &&
        matchesCollection
      );
    });
  }, [
    labBookings,
    searchText,
    statusFilter,
    paymentTypeFilter,
    collectionTypeFilter,
    dateRange,
  ]);

  // ✅ Table Columns
  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
    {
      title: "Customer Name",
      dataIndex: ["userId", "name"],
      key: "customerName",
      render: (_: any, record: any) => record.userId?.name || "-",
    },
    {
      title: "Booking Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date: string, record: any) => {
        const dateStr = formatDate(date);
        const slotStr = record.slot
          ? ` (${record.slot.startTime} - ${record.slot.endTime})`
          : "";
        return `${dateStr}${slotStr}`;
      },
    },

    // {
    //   title: "Lab Name",
    //   dataIndex: ["assignedLabId", "name"],
    //   key: "assignedLabId",
    // },
    { title: "Payment Type", dataIndex: "paymentType", key: "paymentType" },
    {
      title: "Collection Type",
      dataIndex: ["amount", "collectiontype"],
      key: "collectiontype",
    },
    {
      title: "Total Amount",
      dataIndex: ["amount", "finalAmount"],
      key: "finalAmount",
      render: (amount: number) => `₹${amount}`,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (_: any, record: any) =>
        [
          record.userAddress?.addressLine1,
          record.userAddress?.city,
          record.userAddress?.state,
        ]
          .filter(Boolean)
          .join(", "),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "pending" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDateTime(date),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => {
        const allReportsUploaded = record.items?.every(
          (item: any) =>
            Array.isArray(item.reportFiles) && item.reportFiles.length > 0
        );

        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => navigate(`/booking/details/${record._id}`)}>
              <EyeIcon size={18} />
            </Button>
            {record?.status !== "completed" &&
            record?.paymentType === "cash" &&
            allReportsUploaded ? (
              <Button
                onClick={() => handleCashPayment(record)}
                style={{
                  color: "#27ae60",
                  backgroundColor: "#e6f4ea",
                  borderColor: "#27ae60",
                  fontWeight: "600",
                }}
                loading={isSubmiting}
              >
                Mark As Completed
              </Button>
            ) : null}

            {record?.paymentType === "online" && allReportsUploaded ? (
              <Button
                onClick={() => handleOnlinePayment(record)}
                style={{
                  color: "#27ae60",
                  backgroundColor: "#e6f4ea",
                  borderColor: "#27ae60",
                  fontWeight: "600",
                }}
                loading={isSubmiting}
              >
                Mark As Completed
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Booking List" />

      {/* 🔍 Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input.Search
          placeholder="Search Order / Name / Address"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 250 }}
        />

        <Select
          placeholder="Status"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
          options={[
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
            { value: "in_progress", label: "In Progress" },
            { value: "in_route", label: "In Route" },
            { value: "confirmed", label: "Confirmed" },
            { value: "assigned", label: "Assigned" },
            { value: "started", label: "Started" },
            { value: "test_collected", label: "Test Collected" },
            { value: "cancelled", label: "Cancelled" },
            {
              value: "temporary_completed",
              label: "Temporary Completed",
            },
          ]}
        />

        <Select
          placeholder="Payment Type"
          allowClear
          value={paymentTypeFilter}
          onChange={setPaymentTypeFilter}
          style={{ width: 160 }}
          options={[
            { value: "cash", label: "Cash" },
            { value: "online", label: "Online" },
          ]}
        />

        <RangePicker
          onChange={(val) => setDateRange(val)}
          style={{ width: 280 }}
          allowEmpty={[true, true]}
        />
      </div>

      {/* 📋 Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 1000 }}
      />

      {/* Popups stay same as your original code */}
      {popupVisible && (
        <div style={overlayStyle as React.CSSProperties}>
          <div style={popupStyle as React.CSSProperties}>
            <p className="text-sm">
              Are you accepting the payment in <b>cash</b> from the assigned
              staff member?
            </p>
            <p className="text-sm">
              Have you uploaded all the reports to the Tests/Packages?
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

      {uploadVisible && (
        <div style={overlayStyle as React.CSSProperties}>
          <div style={popupStyle as React.CSSProperties}>
            <p className="text-sm">
              Have you uploaded all the reports to the Tests/Packages?
            </p>
            <p className="text-sm">
              Are you accepting the payment directly from the customer?
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
                onClick={() => handlePaymentComplete()}
                disabled={isSubmiting}
              >
                {isSubmiting ? "Wait.." : "Mark As Complete"}
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

// Popup styles
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
