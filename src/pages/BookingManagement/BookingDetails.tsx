import React from "react";
import { Tabs, Descriptions, Button, Tag, Table, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetBookingDetailsQuery,
  useGetBookingQuery,
} from "../../redux/api/bookingApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const BookingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading } = useGetBookingDetailsQuery(id);

  const booking: any = data || [];

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
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={"Booking Details"} />
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back to Bookings
      </Button>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Booking Info" key="1">
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Order ID">
              {booking?.response?.data.orderId}
            </Descriptions.Item>
            <Descriptions.Item label="Booking Date">
              {new Date(booking?.response?.data.bookingDate).toLocaleString()}
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
          </Descriptions>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Family Member Details" key="2">
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
            <Descriptions.Item label="Address">{`${booking?.response?.data.userAddress.addressLine1}, ${booking?.response?.data.userAddress.city}, ${booking?.response?.data.userAddress.state}`}</Descriptions.Item>
          </Descriptions>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Items" key="3">
          <Table
            columns={itemsColumns}
            dataSource={booking?.response?.data.items}
            rowKey="_id"
            pagination={false}
          />
          <h4 className="mt-4">
            Total: ₹{booking?.response?.data.amount.finalAmount}
          </h4>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Staff" key="4">
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Assigned Staff">
              {booking?.response?.data.assignedStaffId?.name || "Not assigned"}
            </Descriptions.Item>
            <Descriptions.Item label="Staff Phone">
              {booking?.response?.data.assignedStaffId?.phoneNumber || "-"}
            </Descriptions.Item>
          </Descriptions>
          <Button type="primary" style={{ marginTop: 16 }}>
            Assign Staff
          </Button>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default BookingDetails;
