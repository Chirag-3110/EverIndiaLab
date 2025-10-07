import React from "react";
import { Card, Col, Row, Table, Tag } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const customer = {
  id: 1,
  fullName: "Alice Smith",
  username: "alice123",
  email: "alice.smith@example.com",
  phone: "+91 9876543210",
  address: "456 Oak Avenue, Springfield, IL",
  joinedDate: "2023-02-20",
  status: "Active",
  totalOrders: 12,
  totalSpent: 45700,
  lastOrderDate: "2025-07-15",
  recentOrders: [
    {
      id: 201,
      orderNumber: "ORD-2001",
      providerName: "John's Saloon",
      date: "2025-07-15",
      amount: 3500,
      status: "Completed",
    },
    {
      id: 202,
      orderNumber: "ORD-2002",
      providerName: "Health Care Plus",
      date: "2025-06-10",
      amount: 5000,
      status: "Completed",
    },
    {
      id: 203,
      orderNumber: "ORD-2003",
      providerName: "City Spa",
      date: "2025-05-05",
      amount: 2700,
      status: "Cancelled",
    },
    {
      id: 204,
      orderNumber: "ORD-2004",
      providerName: "Pet Clinic",
      date: "2025-04-20",
      amount: 4300,
      status: "Completed",
    },
  ],
};

const CustomerDetails = () => {
  const ordersColumns = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Provider Name",
      dataIndex: "providerName",
      key: "providerName",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "Completed") color = "green";
        else if (status === "Pending") color = "orange";
        else if (status === "Cancelled") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageBreadcrumb pageTitle="Customer Details" />

      {/* Personal Details */}
      <Card
        title="Personal Details"
        className="mb-6"
        bordered
        headStyle={{ fontWeight: "bold", fontSize: "1.25rem" }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <p className="flex justify-between">
              <strong>Full Name: </strong> {customer.fullName}
            </p>
            <p className="flex justify-between">
              <strong>Username: </strong> {customer.username}
            </p>
            <p className="flex justify-between">
              <strong>Email: </strong> {customer.email}
            </p>
            <p className="flex justify-between mt-2">
              <strong>Status: </strong>{" "}
              <Tag color={customer.status === "Active" ? "green" : "red"}>
                {customer.status}
              </Tag>
            </p>
          </Col>
          <Col span={12}>
            <p className="flex justify-between">
              <strong>Phone: </strong> {customer.phone}
            </p>
            <p className="flex justify-between">
              <strong>Address: </strong> {customer.address}
            </p>
            <p className="flex justify-between">
              <strong>Member Since: </strong> {customer.joinedDate}
            </p>
          </Col>
        </Row>
      </Card>

      {/* Order Summary */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={8}>
          <Card bordered className="text-center">
            <p className="text-gray-500 font-semibold">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600">
              {customer.totalOrders}
            </p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered className="text-center">
            <p className="text-gray-500 font-semibold">Total Spent</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{customer.totalSpent.toLocaleString()}
            </p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered className="text-center">
            <p className="text-gray-500 font-semibold">Last Order Date</p>
            <p className="text-3xl font-bold text-gray-700">
              {customer.lastOrderDate}
            </p>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card
        title={`Recent Orders (${customer.recentOrders.length})`}
        bordered
        headStyle={{ fontWeight: "bold", fontSize: "1.25rem" }}
      >
        <Table
          columns={ordersColumns}
          dataSource={customer.recentOrders}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default CustomerDetails;
