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
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAssignStaffBookingMutation,
  useGetBookingDetailsQuery,
  useGetBookingQuery,
} from "../../redux/api/bookingApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useGetStaffsQuery } from "../../redux/api/staffApi";
import { toast } from "react-toastify";
import { formatDateTime } from "../../utils/utils";
import { UploadCloud } from "lucide-react";

const BookingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedUploadItem, setSelectedUploadItem] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const { data, isLoading } = useGetBookingDetailsQuery(id);

  const booking: any = data || [];
  const [form] = Form.useForm();
  const [selectedTests, setSelectedTests] = useState([]);
  const [includedTestsDetails, setIncludedTestsDetails] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [assignStaffBooking] = useAssignStaffBookingMutation();
  const { data: StaffList, isFetching } = useGetStaffsQuery({
    searchText,
    page,
    pageSize: 10,
  });

  const staffList = StaffList?.response?.users ?? [];

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
        staffId: selectedTests.map((t) => (typeof t === "object" ? t._id : t)),
      };

      console.log(payload);
      await assignStaffBooking({ id: id, body: payload }).unwrap();
      toast.success("Staff Assigned successfully");
      navigate("/booking-list");
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
    { title: "Item Type", dataIndex: "itemType", key: "itemType" },
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
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            onClick={() => {
              setSelectedUploadItem(record);
              setUploadModalOpen(true);
            }}
          >
            <UploadCloud /> Report
          </Button>
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

  return (
    <div>
      <PageBreadcrumb pageTitle={"Booking Details"} />
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back to Bookings
      </Button>
      <div className="flex justify-end mt-0">
        <div className="bg-green-50 border border-green-300 rounded-md px-4 py-2 shadow-sm flex items-center gap-2">
          <span className="text-green-700 font-semibold text-lg">Total:</span>
          <span className="text-green-800 font-bold text-lg">
            ₹{booking?.response?.data.amount.finalAmount || 0}
          </span>
        </div>
      </div>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Booking Info" key="1">
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Order ID">
              {booking?.response?.data.orderId}
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
                  booking?.response?.data.status === "pending"
                    ? "orange"
                    : "green"
                }
              >
                {booking?.response?.data.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Type">
              {booking?.response?.data.paymentType}
            </Descriptions.Item>
            <Descriptions.Item label="Address">{`${booking?.response?.data.userAddress.addressLine1}, ${booking?.response?.data.userAddress.city}, ${booking?.response?.data.userAddress.state}`}</Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

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

        <Tabs.TabPane tab="Assigned Packages/Tests" key="3">
          <Table
            columns={itemsColumns}
            dataSource={booking?.response?.data.items}
            rowKey="_id"
            pagination={false}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Staff" key="4">
          {!booking?.response?.data.assignedStaffId && (
            <div>
              <Form form={form} layout="vertical">
                {/* Slected Tests */}
                <h3 className="font-semibold mb-2">Selected Tests</h3>

                {includedTestsDetails.length > 0 ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {includedTestsDetails.map((test) => (
                      <div
                        key={test._id}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full border"
                      >
                        <span>{test.name}</span>
                        <Button
                          size="small"
                          danger
                          onClick={() => handleRemoveSelectedTest(test._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">No tests selected yet</p>
                )}

                <h3 className="font-semibold mb-2">Select Tests</h3>

                <Input.Search
                  placeholder="Search tests..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="mb-3"
                />

                <Table
                  columns={columns}
                  dataSource={staffList}
                  rowKey="_id"
                  pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total, // USE API total here!
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "25", "50", "100"],
                  }}
                  scroll={{ x: 1200 }}
                  loading={isFetching}
                  onChange={(pagination) => {
                    setPage(pagination.current);
                    setPageSize(pagination.pageSize);
                  }}
                />

                <div className="mt-6 flex justify-end gap-3">
                  <Button onClick={() => navigate("/packages")}>Cancel</Button>
                  <Button type="primary" onClick={handleSave}>
                    {"Assign Staff"}
                  </Button>
                </div>
              </Form>
            </div>
          )}
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Assigned Staff">
              {booking?.response?.data.assignedStaffId?.name || "Not assigned"}
            </Descriptions.Item>
            <Descriptions.Item label="Staff Phone">
              {booking?.response?.data.assignedStaffId?.phoneNumber || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false);
          setFile(null);
          setFilePreviewUrl(null);
        }}
        title="Upload Report (Image or PDF)"
        footer={null}
        destroyOnClose
      >
        <div className="border p-2 rounded-md">
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              setFile(selectedFile);
              if (selectedFile && selectedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (ev) =>
                  setFilePreviewUrl(ev.target.result as string);
                reader.readAsDataURL(selectedFile);
              } else {
                setFilePreviewUrl(null);
              }
              console.log("Selected file:", selectedFile);
            }}
          />
        </div>
        {file && file.type.startsWith("image/") && filePreviewUrl && (
          <img
            src={filePreviewUrl}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: 300,
              marginTop: 16,
              borderRadius: 6,
              objectFit: "contain",
            }}
          />
        )}
        {file && file.type === "application/pdf" && (
          <div style={{ marginTop: 16 }}>
            <p>
              PDF: <strong>{file.name}</strong>
            </p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            onClick={() => {
              if (file) {
                // You can later use file in an API call here
                console.log("File to upload:", file);
              }
              setUploadModalOpen(false); // Close or add further logic
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetails;
