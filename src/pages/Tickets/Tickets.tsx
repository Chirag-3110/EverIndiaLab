import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Space } from "antd";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  useGetTicketListQuery,
  useReplyToTicketMutation,
} from "../../redux/api/ticketListApi.js";
import { useSidebar } from "../../context/SidebarContext";
import { formatDate, getStatusTextAndColor } from "../../utils/utils";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const Tickets = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { data: ticketList, isLoading } = useGetTicketListQuery();
  const [replyToTicket, { isLoading: isSaving }] = useReplyToTicketMutation();

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    setTickets(ticketList?.data?.data);
  }, [ticketList]);

  const handleChangeStatus = async (id: any, type: string) => {
    console.log(id, type);
    const formdata = new FormData();
    formdata.append("status", type);
    await replyToTicket({ formdata, id })
      .unwrap()
      .then(() => {
        toast.success("Status updated successfully");
      })
      .catch(() => {
        toast.error("Status update failed");
      });
  };

  const columns: any = [
    {
      title: "Ticket ID",
      dataIndex: "id",
      key: "id",
      responsive: ["sm"],
      render: (id: any) => {
        const paddedId = id.toString().padStart(4, "0");
        const prefix = "TCK-"; // example prefix
        const suffix = Date.now().toString().slice(-2); // example suffix (last 2 digits of timestamp)
        return `${prefix}${paddedId}-${suffix}`;
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Name",
      dataIndex: ["user", "name"],
      key: "name",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const { text, color } = getStatusTextAndColor(status);
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: "Open", value: "open" },
        { text: "Pending", value: "pending" },
        { text: "Closed", value: "closed" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (item: string) => <span>{formatDate(item)}</span>,
      // responsive: ["lg"],
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status !== "closed" && (
            <Button
              danger
              type="primary"
              style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
              onClick={() => handleChangeStatus(record.id, "closed")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#ff7875")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ff4d4f")
              }
            >
              Close
            </Button>
          )}
          {record.status === "closed" && (
            <Button
              type="primary"
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                color: "white",
              }}
              onClick={() => handleChangeStatus(record.id, "open")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#73d13d")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#52c41a")
              }
            >
              Open
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div
          style={{
            marginLeft: isExpanded || isHovered ? 0 : 0,
            width: isExpanded || isHovered ? "1180px" : "",
          }}
        >
          <PageBreadcrumb pageTitle="Tickets" />
          <Table
            columns={columns}
            dataSource={tickets}
            rowKey="id"
            pagination={{
              pageSizeOptions: ["5", "10", "15"],
              showSizeChanger: true,
              defaultPageSize: 5,
            }}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}
    </>
  );
};

export default Tickets;
