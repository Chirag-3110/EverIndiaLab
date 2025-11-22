import React, { useState } from "react";
import { Table, Tag, Button } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  useGetInquiryQuery,
  useUpdateUserticketMutation,
} from "../../redux/api/ticketApi";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const Inquiry = () => {
  // Fetch all inquiries
  const { data, isLoading, refetch } = useGetInquiryQuery({});
  // Mutation for update status
  const [updateUserticket, { isLoading: updating }] =
    useUpdateUserticketMutation();
  // Local loading state to track which row is updating
  const [loadingId, setLoadingId] = useState(null);

  // Flatten inquiry list from response
  const inquiries = data?.response?.data || [];

  // Handler for status update API
  const handleStatusUpdate = async (id) => {
    setLoadingId(id);
    try {
      await updateUserticket({
        id,
        formData: { status: "Completed" },
      }).unwrap();
      setLoadingId(null);
      refetch();
    } catch {
      setLoadingId(null);
    }
  };

  // AntD columns definition
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Unread", value: "Pending" },
        { text: "Read", value: "Completed" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <>
          {status === "Pending" ? (
            <Tag color="orange">Unread</Tag>
          ) : status === "Completed" ? (
            <Tag color="green">Read</Tag>
          ) : null}
        </>
      ),
    },
    {
      title: "Update Status",
      key: "action",
      render: (__, record) => (
        <Button
          icon={
            loadingId === record._id ? (
              <LoadingOutlined />
            ) : (
              <CheckCircleOutlined />
            )
          }
          type="primary"
          disabled={loadingId === record._id || record.status === "Completed"}
          loading={loadingId === record._id}
          onClick={() => handleStatusUpdate(record._id)}
        >
          Mark as Read
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <PageBreadcrumb pageTitle="Inquiry" />
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={inquiries}
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default Inquiry;
