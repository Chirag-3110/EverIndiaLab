import React from "react";
import { Button, Card, Descriptions, Table, Tabs, Image } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate, useParams } from "react-router";
import { useGetDetailsStaffsQuery } from "../../redux/api/staffApi";
import moment from "moment";

const { TabPane } = Tabs;

const StaffDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useGetDetailsStaffsQuery(id);

  const staff = data?.response?.data?.staffDetails || {};
  const totalAmount = data?.response?.data?.totalAmount ?? 0;
  const totalBookings = data?.response?.data?.totalBookings ?? 0;
  const totalPendingBookings = data?.response?.data?.totalPendingBookings ?? 0;
  const pendingPayment = (data?.response?.data?.pendingPayment || []).map(item => ({
    bookingId: item.bookingId,
    amount: item.amount?.finalAmount,        // ₹ final amount
    // dueDate: item.bookingDate,               // or any other date field you want
  })); const subPayment = data?.response?.data?.subPayment || [];
  const TotalBookingForStaff =
    (data?.response?.data?.staffAllBookings || []).map(item => ({
      _id: item._id,   // <-- ADD THIS
      bookingId: item.bookingId,
      status: item.status,
      amount: item.amount?.finalAmount,
      date: item.bookingDate
        ? moment(item.bookingDate).format("DD-MM-YYYY")
        : "-",
      timeSlot: item.slot
        ? `${item.slot.startTime} - ${item.slot.endTime}`
        : "-",
    }));

  const lab = staff?.connectedLabId || {};

  // Columns for payments
  const pendingColumns = [
    { title: "Booking ID", dataIndex: "bookingId", key: "bookingId" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    // { title: "Due Date", dataIndex: "dueDate", key: "dueDate" },
  ];
  const subColumns = [
    { title: "Reference No.", dataIndex: "refNo", key: "refNo" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Paid Date", dataIndex: "paidDate", key: "paidDate" },
  ];
  const isOverdueBooking = (item) => {
    if (!item.date || !item.timeSlot) return false;

    // Convert date from "DD-MM-YYYY" to correct format
    const bookingDate = moment(item.date, "DD-MM-YYYY");

    // Extract end time from "6:00 - 6:30" or "6:00 AM - 6:30 AM"
    const endTime = item.timeSlot.split('-')[1].trim(); // "6:30" OR "6:30 AM"

    // Combine date + end time
    const bookingEnd = moment(
      `${bookingDate.format("YYYY-MM-DD")} ${endTime}`,
      ["YYYY-MM-DD h:mm A", "YYYY-MM-DD H:mm"]  // handles both formats
    );

    return (
      moment().isAfter(bookingEnd) &&
      item.status !== "completed" &&
      item.status !== "temporary_completed" &&
      item.status !== "cancelled"
    );
  };


  const bookingColumns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const displayText =
          status === "temporary_completed"
            ? "SAMPLE COLLECTED"
            : status === "in_route"
              ? "ON THE WAY"
              : status?.replace(/_/g, " ")?.toUpperCase();

        return (
          <div >
            {displayText}
          </div>
        );
      },
    },

    {
      title: "Amount (₹)",
      dataIndex: "amount",
      key: "amount",
      render: (v) => `₹ ${v}`,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Time Slot",
      dataIndex: "timeSlot",
      key: "timeSlot",
    },
    {
      title: "Alert",
      dataIndex: "alert",
      key: "alert",
      render: (_, record) =>
        isOverdueBooking(record) ? (
          <span style={{ color: "red", fontWeight: "bold" }}>
            ⛔ Time Passed
          </span>
        ) : (
          "-"
        ),
    }
  ];


  return (
    <div>
      <PageBreadcrumb pageTitle="Phlebotomist Details" />
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back to Phlebotomist List
      </Button>

      <Card>
        <Tabs
          defaultActiveKey="1"
          tabPosition="top"
          size="large"
          style={{ minHeight: 250 }}
        >
          <TabPane tab="Basic Info" key="1">
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Name">
                {staff.name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {staff.role || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {staff.contactNumber || staff.phoneNumber || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {staff.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Current City">
                {staff.currentCity || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <span style={{ color: staff.status ? "#4caf50" : "#f44336" }}>
                  {staff.status ? "Active" : "Inactive"}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Registered">
                {staff.isRegistered ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Available for Work">
                {staff.isAvailable ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Redeem Code">
                {staff.redeemCode || "—"}
              </Descriptions.Item>
              {staff.profileImage && (
                <Descriptions.Item label="Photo">
                  <Image src={staff.profileImage} height={60} alt="Profile" />
                </Descriptions.Item>
              )}
            </Descriptions>
          </TabPane>
          <TabPane tab="Lab Details" key="2">
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Name">
                {lab.name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {lab.address || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {lab.contactNumber || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {lab.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Certificate">
                {lab.registrationCertificate || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Latitude">
                {lab.latitude || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Longitude">
                {lab.longitude || "—"}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>
          <TabPane tab="Summary" key="3">
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Total Amount">
                {totalAmount}
              </Descriptions.Item>
              <Descriptions.Item label="Total Bookings">
                {totalBookings}
              </Descriptions.Item>
              <Descriptions.Item label="Pending Bookings">
                {totalPendingBookings}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>
          <TabPane tab="Pending Payments" key="4">
            <Table
              columns={pendingColumns}
              dataSource={pendingPayment}
              rowKey="bookingId"
              pagination={{ pageSize: 5 }}
              style={{ marginTop: 16 }}
              bordered
              locale={{ emptyText: "No pending payments" }}
            />
          </TabPane>
          <TabPane tab="Bookings" key="5">
            <Table
              columns={bookingColumns}
              dataSource={TotalBookingForStaff}
              rowKey="_id"

              pagination={{ pageSize: 5 }}
              style={{ marginTop: 16 }}
              bordered
              locale={{ emptyText: "No Bookings Available" }}
            />
          </TabPane>
          {/* <TabPane tab="Sub Payments" key="5">
            <Table
              columns={subColumns}
              dataSource={subPayment}
              rowKey="refNo"
              pagination={{ pageSize: 5 }}
              style={{ marginTop: 16 }}
              bordered
              locale={{ emptyText: "No sub payments" }}
            />
          </TabPane> */}
        </Tabs>
      </Card>
    </div>
  );
};

export default StaffDetails;
