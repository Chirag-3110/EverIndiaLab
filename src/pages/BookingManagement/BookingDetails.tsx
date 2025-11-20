import React, { useState } from "react";
import {
  Tabs,
  Descriptions,
  Button,
  Tag,
  Table,
  Spin,
  Input,
  Form,
  Modal,
  Select,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAssignStaffBookingMutation,
  useGetBookingDetailsQuery,
  useGetBookingQuery,
  useMarkAsCompleteBookingMutation,
  useMarkedAsPaidBookingMutation,
  useUploadReportToBookingMutation,
} from "../../redux/api/bookingApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useGetStaffsQuery } from "../../redux/api/staffApi";
import { toast } from "react-toastify";
import { bookingStatusColors, formatDateTime } from "../../utils/utils";
import { UploadCloud } from "lucide-react";

const BookingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedUploadItem, setSelectedUploadItem] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [markAsCompleteBooking, { isLoading: isSubmiting }] =
    useMarkAsCompleteBookingMutation();

  const { data, isLoading } = useGetBookingDetailsQuery(id);

  const booking: any = data || [];
  const [form] = Form.useForm();
  const [selectedTests, setSelectedTests] = useState([]);
  const [includedTestsDetails, setIncludedTestsDetails] = useState([]);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [uploadReportToBooking, { isLoading: isUploading }] =
    useUploadReportToBookingMutation();
  const [assignStaffBooking, { isLoading: isAssigning }] =
    useAssignStaffBookingMutation();
  const [markedAsPaidBooking, { isLoading: isPaying }] =
    useMarkedAsPaidBookingMutation();
  const { data: StaffList, isFetching } = useGetStaffsQuery({
    searchText,
    page,
    pageSize: 10,
  });

  const staffList = StaffList?.response?.users ?? [];
  console.log(staffList);

  const total = StaffList?.response?.users?.length ?? 0;

  const handleRemoveSelectedTest = (id) => {
    setSelectedTests((prev) => prev.filter((t) => t !== id));
    setIncludedTestsDetails((prev) => prev.filter((t) => t._id !== id));
  };

  const handleCheckboxChange = (checked, test) => {
    if (checked) {
      if (!selectedTests.includes(test._id)) {
        setSelectedTests((prev) => [...prev, test._id]);
        setIncludedTestsDetails((prev) => [...prev, test]);
      }
    } else {
      handleRemoveSelectedTest(test._id);
    }
  };

  // 💾 Save handler
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        staffId: selectedStaff,
      };

      await assignStaffBooking({ id: id, body: payload }).unwrap();
      toast.success("Staff Assigned successfully");
      // navigate("/booking-list");
    } catch (err) {
      console.error("Save error:", err);

      if (err?.data?.message) {
        if (Array.isArray(err.data.message)) {
          err.data.message.forEach((msg) => {
            toast.error(`${msg.field ? msg.field + ": " : ""}${msg.message}`);
          });
        } else if (typeof err.data.message === "string") {
          toast.error(err.data.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        toast.error("Failed to save. Check all fields or your connection.");
      }
    }
  };

  if (isLoading)
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center">
        <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
        <p>Loading Please Wait...</p>
      </div>
    );
  if (!booking)
    return (
      <div className="h-[60vh]  flex flex-col justify-center items-center">
        <p>No booking found</p>;
      </div>
    );

  const itemsColumns = [
    {
      title: "Item Type",
      dataIndex: "itemType",
      key: "itemType",
      render: (value) => (value === "TestForm" ? "Test" : value),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {Array.isArray(record.reportFiles) &&
          record.reportFiles.length > 0 ? (
            <div className="flex flex-col gap-1">
              {record.reportFiles.map((fileUrl, index) => (
                <a
                  key={index}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline", color: "#1890ff" }}
                >
                  View Report {index + 1}
                </a>
              ))}
            </div>
          ) : (
            <Button
              type="primary"
              onClick={() => {
                setSelectedUploadItem(record);
                setUploadModalOpen(true);
              }}
            >
              <UploadCloud /> Report
            </Button>
          )}
        </div>
      ),
    },
  ];

  // 🧮 Table Columns
  const columns = [
    {
      title: "Select",
      dataIndex: "_id",
      render: (id, record) => (
        <input
          type="checkbox"
          checked={selectedTests.includes(id)}
          onChange={(e) => handleCheckboxChange(e.target.checked, record)}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  const handleMarkAsPaid = async () => {
    try {
      await markedAsPaidBooking({ id: booking?.response?.data?._id }).unwrap();
      toast.success("Payment marked as paid!");
      closeAllPopups();
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark payment paid.");
    }
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

  const closeAllPopups = () => {
    setPopupVisible(false);
    setSelectedRecord(null);
    setFile(null);
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
  };

  const allReportsUploaded = booking?.response?.data?.items?.every(
    (item: any) =>
      Array.isArray(item.reportFiles) && item.reportFiles.length > 0
  );

  console.log(allReportsUploaded);

  return (
    <div>
      <PageBreadcrumb pageTitle={"Booking Details"} />
      <div className="flex justify-between items-center">
        <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
          ← Back to Bookings
        </Button>
        <div className="flex justify-end">
          {/* <label htmlFor="">Payment Status:</label> */}
          <p
            className={`font-bold uppercase px-2 py-1 rounded ${
              booking?.response?.data?.paymentStatus === "paid"
                ? "text-green-700 bg-green-100"
                : "text-red-700 bg-red-100"
            }`}
          >
            {booking?.response?.data?.paymentStatus}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-0">
        {booking?.response?.data?.status === "cancelled" && (
          <div className="bg-red-50 border border-red-300 rounded-md py-1.5 px-2 italic shadow-sm text-sm text-red-700 font-medium">
            {booking?.response?.data?.cancellationReason ||
              "No cancellation reason provided"}
          </div>
        )}

        <div className="bg-green-50 border border-green-300 rounded-md px-4 py-1.5 shadow-sm flex items-center gap-2">
          <span className="text-green-700 font-semibold text-md">Total:</span>
          <span className="text-green-800 font-bold text-md">
            ₹{booking?.response?.data.amount.finalAmount || 0}
          </span>
        </div>
      </div>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Booking Info" key="1">
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="User Name">
              {booking.response?.data.userId.name || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {booking.response?.data.userId.gender || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="Age">
              {booking.response?.data.userId.dob || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Number">
              {booking.response?.data.userId.contactNumber || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {booking.response?.data.userId.email || "--"}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Order ID">
              {booking?.response?.data.orderId || "--"}
            </Descriptions.Item> */}
            <Descriptions.Item label="Booking ID">
              {booking?.response?.data.bookingId || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="Booking Type">
              {booking?.response?.data.amount?.collectiontype || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="Booking Date">
              {formatDateTime(booking?.response?.data.bookingDate)}
              {booking?.response?.data?.slot
                ? ` (${booking.response.data.slot.startTime} - ${booking.response.data.slot.endTime})`
                : ""}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag
                color={
                  bookingStatusColors[booking?.response?.data.status] ||
                  "default"
                }
              >
                {booking?.response?.data.status}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Payment Type">
              {booking?.response?.data.paymentType}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {booking?.response?.data.addressId
                ? `${booking?.response?.data.addressId.description}`
                : "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Cost Breakdown">
              <div>
                {booking?.response?.data?.amount?.total != null &&
                  booking.response.data.amount.total !== 0 && (
                    <ol className="flex justify-between">
                      <label>Total Amount:</label>
                      {booking.response.data.amount.total}
                    </ol>
                  )}
                {/* {booking?.response?.data?.amount?.discount != null &&
                  booking.response.data.amount.discount !== 0 && (
                    <ol className="flex justify-between">
                      <label>Discount:</label>
                      {booking.response.data.amount.discount}
                    </ol>
                  )} */}
                {booking?.response?.data?.amount?.everCash != null &&
                  booking.response.data.amount.everCash !== 0 && (
                    <ol className="flex justify-between">
                      <label>Ever Cash:</label>
                      {booking.response.data.amount.everCash}
                    </ol>
                  )}
                {booking?.response?.data?.amount?.couponAppliedAmount != null &&
                  booking.response.data.amount.couponAppliedAmount !== 0 && (
                    <ol className="flex justify-between">
                      <label>Coupon Discount:</label>
                      {booking.response.data.amount.couponAppliedAmount}
                    </ol>
                  )}
                {booking?.response?.data?.amount?.platformFee != null &&
                  booking?.response?.data?.amount.platformFee !== 0 && (
                    <ol className="flex justify-between">
                      <label htmlFor="">Home Collection Fee:</label>
                      {booking?.response?.data?.amount.platformFee}
                    </ol>
                  )}
                {booking?.response?.data?.amount?.finalAmount != null &&
                  booking.response.data.amount.finalAmount !== 0 && (
                    <ol className="flex justify-between">
                      <label>Final Amount:</label>
                      {booking.response.data.amount.finalAmount}
                    </ol>
                  )}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        {booking?.response?.data.familyMemberId && (
          <Tabs.TabPane tab="Member Details" key="2">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Name">
                {booking?.response?.data.familyMemberId?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Age">
                {booking?.response?.data.familyMemberId?.age}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {booking?.response?.data.familyMemberId?.gender}
              </Descriptions.Item>
              <Descriptions.Item label="Relation">
                {booking?.response?.data.familyMemberId?.relation}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {booking?.response?.data.familyMemberId?.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {booking?.response?.data.familyMemberId?.email}
              </Descriptions.Item>
            </Descriptions>
          </Tabs.TabPane>
        )}

        <Tabs.TabPane tab="Assigned Packages/Tests" key="3">
          <Table
            columns={itemsColumns}
            dataSource={booking?.response?.data.items}
            rowKey="_id"
            pagination={false}
          />
          <div className="mt-8 flex justify-end">
            {booking?.response?.data?.status !== "completed" &&
            booking?.response?.data?.status !== "cancelled" &&
            booking?.response?.data?.paymentType === "cash" &&
            booking?.response?.data?.paymentStatus === "paid" &&
            allReportsUploaded ? (
              <Button
                onClick={() => handleCashPayment(booking?.response?.data)}
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
            {booking?.response?.data?.paymentType === "online" &&
            booking?.response?.data?.status !== "completed" &&
            booking?.response?.data?.status !== "cancelled" &&
            allReportsUploaded ? (
              <Button
                onClick={() => handleOnlinePayment(booking?.response?.data)}
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
            {booking?.response?.data?.paymentStatus === "unpaid" && (
              <Button
                onClick={() => handleMarkAsPaid()}
                style={{
                  color: "#ffff",
                  backgroundColor: "#27ae60",
                  borderColor: "#27ae60",
                  fontWeight: "600",
                }}
                loading={isPaying}
              >
                Mark As Paid
              </Button>
            )}
          </div>
        </Tabs.TabPane>

        {booking?.response?.data.amount.collectiontype ===
          "Home Collection" && (
          <Tabs.TabPane tab="Staff" key="4">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Assigned Staff">
                {booking?.response?.data.assignedStaffId?.name ||
                  "Not assigned"}
              </Descriptions.Item>
              <Descriptions.Item label="Staff Phone">
                {booking?.response?.data.assignedStaffId?.phoneNumber || "-"}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-4">
              <Form form={form} layout="vertical" onFinish={handleSave}>
                <h3 className="font-semibold mb-2">Select Staff</h3>

                <Form.Item
                  name="assignedStaffId"
                  rules={[
                    {
                      required: true,
                      message: "Please select a staff member!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select a staff member"
                    showSearch
                    optionFilterProp="children"
                    allowClear
                    filterOption={(input, option) => {
                      const label = String(option?.children || "");
                      return label.toLowerCase().includes(input.toLowerCase());
                    }}
                    onChange={(value) => setSelectedStaff(value)}
                  >
                    {staffList.map((staff) => (
                      <Select.Option key={staff._id} value={staff._id}>
                        {staff.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isAssigning}
                  >
                    {!booking?.response?.data?.assignedStaffId
                      ? " Assign Staff"
                      : "Edit Staff"}
                  </Button>
                </div>
              </Form>
            </div>
          </Tabs.TabPane>
        )}
      </Tabs>

      <Modal
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          setFiles([]);
          setPreviews([]);
        }}
        title="Upload Reports (Images or PDFs)"
        footer={null}
        destroyOnClose
      >
        {/* FILE INPUT */}
        <div>
          <input
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || []);

              // Merge new + old files
              const updatedFiles = [...files, ...selectedFiles];
              setFiles(updatedFiles);

              // Generate previews for new files only
              const newPreviewPromises = selectedFiles.map((file) => {
                if (file.type.startsWith("image/")) {
                  return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (ev) =>
                      resolve({
                        type: "image",
                        url: ev.target.result,
                        name: file.name,
                      });
                    reader.readAsDataURL(file);
                  });
                } else {
                  return Promise.resolve({
                    type: "pdf",
                    name: file.name,
                  });
                }
              });

              Promise.all(newPreviewPromises).then((newPreviews) => {
                setPreviews((prev) => [...prev, ...newPreviews]);
              });
            }}
            className="border w-full p-2 rounded-md cursor-pointer"
          />
        </div>

        {/* PREVIEWS WITH REMOVE OPTION */}
        {previews.length > 0 && (
          <div style={{ marginTop: 16 }} className="flex felx-col">
            {previews.map((p, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #eee",
                  padding: 10,
                  borderRadius: 6,
                  marginBottom: 12,
                  position: "relative",
                }}
              >
                {/* REMOVE BUTTON */}
                <button
                  onClick={() => {
                    const updatedPreviews = previews.filter(
                      (_, i) => i !== idx
                    );
                    const updatedFiles = files.filter((_, i) => i !== idx);

                    setPreviews(updatedPreviews);
                    setFiles(updatedFiles);
                  }}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    color: "white",
                    background: "red",
                    border: "none",
                    padding: "2px 8px",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </button>

                {/* IMAGE PREVIEW */}
                {p.type === "image" ? (
                  <img
                    src={p.url}
                    alt={p.name}
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      borderRadius: 6,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  /* PDF PREVIEW */
                  <p>
                    📄 PDF: <strong>{p.name}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            loading={isUploading}
            disabled={files.length === 0}
            onClick={async () => {
              if (files.length > 0) {
                const formData = new FormData();

                files.forEach((file) => {
                  formData.append("images", file);
                });

                formData.append("itemId", selectedUploadItem?._id);
                formData.append("bookingId", booking?.response?.data?._id);

                await uploadReportToBooking({
                  fd: formData,
                  id: booking?.response?.data?._id,
                })
                  .unwrap()
                  .then(() => toast.success("Reports uploaded successfully"))
                  .catch(() => toast.error("Failed to upload reports"));
              }

              setUploadModalOpen(false);
              setFiles([]);
              setPreviews([]);
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>

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
    </div>
  );
};

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

export default BookingDetails;
