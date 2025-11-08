import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Popconfirm, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import { useAuth } from "../../context/AuthContext";
import { useGetBookingQuery } from "../../redux/api/bookingApi";

const BookingList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data, isLoading, refetch } = useGetBookingQuery({
    searchText,
    page,
    pageSize,
    id: user?._id,
  });

  const labBooings = data?.response?.data ?? [];
  const total = data?.response?.data?.length ?? 0;

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
      render: (date) => new Date(date).toLocaleString(),
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
      title: "Total Amount",
      dataIndex: ["amount", "finalAmount"],
      key: "finalAmount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button onClick={() => navigate(`/booking/details/${record._id}`)}>
          View Details
        </Button>
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
        scroll={{ x: 1200 }}
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
    </div>
  );
};

export default BookingList;
