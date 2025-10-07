import React, { useState, useMemo } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Row,
  Col,
  Spin,
} from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useGetUsersQuery } from "../../redux/api/UserApi";
import { useSidebar } from "../../context/SidebarContext";

const { Option } = Select;

const CustomerManagement = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const { data: UserList, isLoading, error } = useGetUsersQuery("");
  console.log(UserList?.data);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleDelete = (id) => {
    message.success("User deleted successfully");
  };

  const handleToggleStatus = (id) => {
    message.success("User status updated");
  };

  const handleApprove = (id) => {
    message.success("User approved");
  };

  const handleDisapprove = (id) => {
    message.success("User disapproved");
  };

  const handleAddUser = () => {
    form.validateFields().then((values) => {
      message.success("User added successfully");
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (text, record) => (
        <a
          style={{ color: "#465FFF", cursor: "pointer" }}
          onClick={() => navigate(`/customer-details/${record.id}`)}
        >
          {text || "N/A"}
        </a>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text) => text || "N/A",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      render: (text) => text || "N/A",
    },
    {
      title: "Profile Image",
      dataIndex: "image",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="profile"
            style={{ width: 40, borderRadius: "50%" }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Role",
      dataIndex: "user_role_id",
      render: (roleId) => {
        switch (roleId) {
          case 1:
            return "Admin";
          case 2:
            return "User";
          case 3:
            return "Vendor";
          default:
            return "Unknown";
        }
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      filters: [
        { text: "Active", value: 1 },
        { text: "Inactive", value: 0 },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "volcano"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Verified",
      dataIndex: "is_verified",
      render: (verified) => (
        <Tag color={verified ? "green" : "orange"}>
          {verified ? "Verified" : "Not Verified"}
        </Tag>
      ),
    },
    {
      title: "Business Name",
      dataIndex: "business_name",
      render: (text) => text || "N/A",
    },
    {
      title: "Category",
      dataIndex: "service_category",
      render: (text) => text || "N/A",
    },
    {
      title: "Documents",
      dataIndex: "portfolio_images",
      render: (imgs) =>
        imgs && imgs.length > 0 ? `${imgs.length} Files` : "No Documents",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="default"
            style={{
              backgroundColor: record.is_active ? "#E23D28" : "#00A86B",
              color: "white",
              width: "100px",
              whiteSpace: "nowrap",
            }}
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              style={{ backgroundColor: "red", color: "white", width: "70px" }}
              type="link"
              icon={<Trash2 size={16} />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div
      className={`flex-1  transition-all duration-300 ease-in-out ${
        isExpanded || isHovered
          ? "lg:pl-0 lg:w-[1190px]"
          : "lg:pl-[0px] lg:w-[1390px]"
      } ${isMobileOpen ? "ml-0" : ""}`}
    >
      <PageBreadcrumb pageTitle="Customers Management" />

      {/* Search and Status Filter Row */}
      <Row
        gutter={[16, 16]}
        className="mb-4"
        justify="space-between"
        align="middle"
      >
        <Col xs={24} sm={14} md={12} lg={10} xl={8}>
          <Input.Search
            placeholder="Search by name, email or phone"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            enterButton
            onSearch={(val) => setSearchText(val)}
          />
        </Col>

        <Col xs={24} sm={10} md={6} lg={5} xl={4}>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: "100%" }}
          >
            <Option value="All">All Status</Option>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Col>

        {/* <Col
          xs={24}
          sm={24}
          md={6}
          lg={5}
          xl={6}
          style={{ textAlign: "right" }}
        >
          <Button
            onClick={() => setIsModalOpen(true)}
            type="primary"
            style={{ backgroundColor: "#465FFF", borderColor: "#465FFF" }}
          >
            + Add User
          </Button>
        </Col> */}
      </Row>

      {isLoading ? (
        <div className="flex justify-center items-center flex-col gap-4 h-[60vh] border">
          <Spin />
          Loading Please Wait....
        </div>
      ) : (
        <>
          {/* Table here */}
          <Table
            columns={columns}
            dataSource={UserList?.data}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={{
              pageSizeOptions: ["5", "10", "15"],
              showSizeChanger: true,
              defaultPageSize: 5,
            }}
          />
        </>
      )}
      {/* Add User Modal */}
      <Modal
        title="Add New User"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddUser}
        okText="Add"
        zIndex={10000}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please enter phone" },
              {
                pattern: /^[0-9+()\- ]+$/,
                message: "Enter a valid phone number.",
              },
            ]}
          >
            <Input placeholder="Enter phone" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="Active"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
