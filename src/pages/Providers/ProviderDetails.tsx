import React from "react";
import { Card, Col, Row, Table, Tag } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const provider = {
  id: 1,
  name: "John's Saloon",
  owner: "John Doe",
  email: "john.saloon@example.com",
  phone: "+91 9876543210",
  address: "123 Main St, Springfield, IL",
  joinedDate: "2023-04-12",
  status: "Active",
  categories: ["Saloon", "Beauty", "Hair Care"],
  revenue: {
    total: 125000,
    monthly: 15000,
    yearly: 90000,
  },
  orders: [
    {
      id: 101,
      orderNumber: "ORD-1001",
      customerName: "Alice Smith",
      date: "2025-07-10",
      amount: 1500,
      status: "Completed",
    },
    {
      id: 102,
      orderNumber: "ORD-1002",
      customerName: "Bob Johnson",
      date: "2025-07-15",
      amount: 3200,
      status: "Pending",
    },
    {
      id: 103,
      orderNumber: "ORD-1003",
      customerName: "Carol White",
      date: "2025-07-20",
      amount: 4500,
      status: "Completed",
    },
    {
      id: 104,
      orderNumber: "ORD-1004",
      customerName: "David Lee",
      date: "2025-08-01",
      amount: 6000,
      status: "Cancelled",
    },
  ],
};

const ProviderDetails = () => {
  const ordersColumns = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
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
      <PageBreadcrumb pageTitle="Provider Details" />

      {/* Personal Info */}
      <Card
        title="Personal Details"
        className="mb-6"
        bordered
        headStyle={{ fontWeight: "bold", fontSize: "1.25rem" }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <p className="flex justify-between">
              <strong>Provider Name: </strong> {provider.name}
            </p>
            <p className="flex justify-between">
              <strong>Owner Name: </strong> {provider.owner}
            </p>
            <p className="flex justify-between">
              <strong>Email: </strong> {provider.email}
            </p>
            <p className="flex justify-between mt-2">
              <strong>Status: </strong>{" "}
              <Tag color={provider.status === "Active" ? "green" : "red"}>
                {provider.status}
              </Tag>
            </p>
          </Col>
          <Col span={12}>
            <p className="flex justify-between">
              <strong>Phone: </strong> {provider.phone}
            </p>
            <p className="flex justify-between">
              <strong>Address: </strong> {provider.address}
            </p>
            <p className="flex justify-between">
              <strong>Member Since: </strong> {provider.joinedDate}
            </p>
          </Col>
        </Row>
      </Card>

      {/* Categories */}
      <div className="mt-2 mb-2">
        <Card
          title="Categories"
          className="mb-6 mt-4"
          bordered
          headStyle={{ fontWeight: "bold", fontSize: "1.25rem" }}
        >
          {provider.categories.map((cat) => (
            <Tag key={cat} color="blue" className="text-lg py-2 px-3">
              {cat}
            </Tag>
          ))}
        </Card>
      </div>

      {/* Revenue Summary */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={8}>
          <Card bordered className="text-center">
            <p className="text-gray-500 font-semibold">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{provider.revenue.total.toLocaleString()}
            </p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered className="text-center">
            <p className="text-gray-500 font-semibold">Monthly Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{provider.revenue.monthly.toLocaleString()}
            </p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered className="text-center">
            <p className="text-gray-500 font-semibold">Yearly Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{provider.revenue.yearly.toLocaleString()}
            </p>
          </Card>
        </Col>
      </Row>

      {/* Orders List */}
      <Card
        title={`Total Orders (${provider.orders.length})`}
        bordered
        headStyle={{ fontWeight: "bold", fontSize: "1.25rem" }}
      >
        <Table
          columns={ordersColumns}
          dataSource={provider.orders}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default ProviderDetails;
