import React, { useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Tag,
  Modal,
  Descriptions,
} from "antd";
import { Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const initialOrders = [
  {
    id: 1,
    orderNumber: "ORD-1001",
    customerName: "John Doe",
    providerName: "Saloon",
    category: "Beauty",
    status: "Completed",
    orderDate: "2025-07-20",
    totalAmount: 1500,
  },
  {
    id: 2,
    orderNumber: "ORD-1002",
    customerName: "Jane Smith",
    providerName: "Health Care",
    category: "Medical",
    status: "Pending",
    orderDate: "2025-08-10",
    totalAmount: 2300,
  },
  {
    id: 3,
    orderNumber: "ORD-1003",
    customerName: "Michael Johnson",
    providerName: "Spa",
    category: "Wellness",
    status: "Cancelled",
    orderDate: "2025-07-25",
    totalAmount: 800,
  },
  {
    id: 4,
    orderNumber: "ORD-1004",
    customerName: "Emily Davis",
    providerName: "Pet Clinic",
    category: "Pet Care",
    status: "Completed",
    orderDate: "2025-06-18",
    totalAmount: 1200,
  },
  {
    id: 5,
    orderNumber: "ORD-1005",
    customerName: "William Brown",
    providerName: "Automotive Car",
    category: "Repair",
    status: "Pending",
    orderDate: "2025-08-01",
    totalAmount: 4500,
  },
];

const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const navigate = useNavigate();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState(null);

   // Show order details in modal
   const showOrderDetails = (order) => {
     setSelectedOrder(order);
     setIsModalOpen(true);
   };

   // Close modal
   const handleModalClose = () => {
     setIsModalOpen(false);
     setSelectedOrder(null);
   };

  const handleDelete = (id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    message.success("Order deleted successfully");
  };

  const columns = [
    {
      title: "Order Number",
      dataIndex: "orderNumber",
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
      render: (text, record) => (
        <a
          style={{ color: "#465FFF", cursor: "pointer" }}
        //   onClick={() => navigate(`/orders/${record.id}`)}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Provider",
      dataIndex: "providerName",
      sorter: (a, b) => a.providerName.localeCompare(b.providerName),
    },
    {
      title: "Category",
      dataIndex: "category",
      filters: [
        { text: "Beauty", value: "Beauty" },
        { text: "Medical", value: "Medical" },
        { text: "Wellness", value: "Wellness" },
        { text: "Pet Care", value: "Pet Care" },
        { text: "Repair", value: "Repair" },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "Completed", value: "Completed" },
        { text: "Pending", value: "Pending" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = "default";
        if (status === "Completed") color = "green";
        else if (status === "Pending") color = "orange";
        else if (status === "Cancelled") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      sorter: (a, b) =>
        new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="default"
            icon={<Eye size={16} />}
            onClick={() => showOrderDetails(record)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure to delete this order?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              style={{ backgroundColor: "red", color: "white" }}
              icon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  return (
    <div>
      <PageBreadcrumb pageTitle="Orders List" />
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={{
          pageSizeOptions: ["5", "10", "15"],
          showSizeChanger: true,
          defaultPageSize: 5,
        }}
        scroll={{ x: "max-content" }}
      />
      {/* Modal for order details */}
      <Modal
        title={`Order Details - ${selectedOrder?.orderNumber || ""}`}
        visible={isModalOpen}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <Descriptions  bordered column={1} size="small">
            <Descriptions.Item label="Order Number">
              {selectedOrder.orderNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Customer">
              {selectedOrder.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Provider">
              {selectedOrder.providerName}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {selectedOrder.category}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedOrder.status}
            </Descriptions.Item>
            <Descriptions.Item label="Order Date">
              {selectedOrder.orderDate}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              ₹{selectedOrder.totalAmount.toLocaleString()}
            </Descriptions.Item>
            {/* Add more details as needed */}
          </Descriptions >
        )}
      </Modal>
    </div>
  );
};

export default Orders;
