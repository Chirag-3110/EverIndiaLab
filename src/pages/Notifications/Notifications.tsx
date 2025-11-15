import React, { useState } from "react";
import { Table, Tag, Pagination, Button } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  useGetnotificationQuery,
  useMarkAsSeenNotificationMutation,
} from "../../redux/api/notificationApi";
import { formatDate } from "../../utils/utils";

const Notifications = () => {
  const { data, isLoading } = useGetnotificationQuery({});
  const notifications = data?.response?.notifications || [];

  const [markAsSeenNotification, { isLoading: isMarking }] =
    useMarkAsSeenNotificationMutation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of items per page

  // Slice data for current page
  const paginatedData = notifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Columns for Table
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "unseen" ? "blue" : "green"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
  ];

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const handleMarkAsSeen = async () => {
    await markAsSeenNotification({}).unwrap();
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Notifications" />

      <Button
        onClick={() => handleMarkAsSeen()}
        style={{
          backgroundColor: "#1890ff",
          color: "#fff",
          borderRadius: 6,
          fontWeight: "600",
          border: "none",
          padding: "6px 16px",
          transition: "background-color 0.3s",
          boxShadow: "0 2px 8px rgba(24, 144, 255, 0.2)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#40a9ff")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#1890ff")
        }
      >
        Mark All As Seen
      </Button>

      <Table
        columns={columns}
        dataSource={paginatedData}
        rowKey={(record: any) => record._id}
        pagination={false} // disable default pagination
        loading={isLoading}
      />

      {/* Custom Pagination */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={notifications.length}
        onChange={onPageChange}
        style={{ marginTop: 16, textAlign: "right" }}
      />
    </div>
  );
};

export default Notifications;
