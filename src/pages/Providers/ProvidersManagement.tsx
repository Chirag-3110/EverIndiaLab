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
import { useSidebar } from "../../context/SidebarContext";
import { useGetprovidersQuery } from "../../redux/api/providerApi";

const { Option } = Select;

const initialProviders = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    category: "Saloon",
    joinDate: "2025-06-15",
    status: "Active",
    approved: false,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 9123456780",
    category: "Health Care",
    joinDate: "2025-02-10",
    status: "Inactive",
    approved: false,
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael@example.com",
    phone: "+91 7894561230",
    category: "Pet Clinic",
    joinDate: "2024-12-01",
    status: "Active",
    approved: true,
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+91 7012345678",
    category: "Spa",
    joinDate: "2025-07-20",
    status: "Active",
    approved: false,
  },
  {
    id: 5,
    name: "William Brown",
    email: "william@example.com",
    phone: "+91 8096543212",
    category: "Automotive Car",
    joinDate: "2025-03-05",
    status: "Inactive",
    approved: true,
  },
  {
    id: 6,
    name: "Sophia Lee",
    email: "sophia@example.com",
    phone: "+91 9988776655",
    category: "Retail/Designer",
    joinDate: "2025-04-17",
    status: "Active",
    approved: false,
  },
];

const ProvidersManagement = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { data: ProviderList, isLoading, error } = useGetprovidersQuery();
  console.log(ProviderList?.data);
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialProviders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    message.success("Provider deleted successfully");
  };

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
    message.success("Provider status updated");
  };

  const handleApprove = (id) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, approved: true } : user))
    );
    message.success("Provider approved");
  };

  const handleDisapprove = (id) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, approved: false } : user))
    );
    message.success("Provider disapproved");
  };

  const handleAddUser = () => {
    form.validateFields().then((values) => {
      const newUser = {
        id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        approved: false,
        ...values,
      };
      setUsers((prev) => [...prev, newUser]);
      message.success("Provider added successfully");
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  // Filter users by search and status filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (statusFilter !== "All" && user.status !== statusFilter) return false;
      const lowerSearch = searchText.toLowerCase();
      if (
        !user.name.toLowerCase().includes(lowerSearch) &&
        !user.email.toLowerCase().includes(lowerSearch) &&
        !user.phone.toLowerCase().includes(lowerSearch)
      ) {
        return false;
      }
      return true;
    });
  }, [users, searchText, statusFilter]);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (text, record) => (
        <a
          style={{ color: "#465FFF", cursor: "pointer" }}
          onClick={() => navigate(`/providers-details/${record.id}`)}
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
      title: "Category",
      dataIndex: "service_category",
      sorter: (a, b) =>
        (a.service_category || "").localeCompare(b.service_category || ""),
      render: (text) => text || "N/A",
    },
    {
      title: "Location Served",
      dataIndex: "location_area_served",
      render: (text) => text || "N/A",
    },
    {
      title: "Join Date",
      dataIndex: "created_at",
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
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
      title: "Approval",
      dataIndex: "verified_by_admin",
      filters: [
        { text: "Approved", value: 1 },
        { text: "Not Approved", value: 0 },
      ],
      onFilter: (value, record) => record.verified_by_admin === value,
      render: (approved) =>
        approved ? (
          <Tag color="blue">Approved</Tag>
        ) : (
          <Tag color="default">Not Approved</Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            type="default"
            style={{
              backgroundColor: record.is_active ? "#E23D28" : "#00A86B",
              color: "white",
              width: "90px",
              whiteSpace: "nowrap",
            }}
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.is_active ? "Deactivate" : "Activate"}
          </Button>

          {record.verified_by_admin ? (
            <Button
              type="default"
              danger
              style={{ whiteSpace: "nowrap", width: "90px" }}
              onClick={() => handleDisapprove(record.id)}
            >
              Disapprove
            </Button>
          ) : (
            <Button
              type="primary"
              style={{ whiteSpace: "nowrap", width: "90px" }}
              onClick={() => handleApprove(record.id)}
            >
              Approve
            </Button>
          )}

          <Popconfirm
            title="Are you sure to delete this provider?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              style={{ backgroundColor: "red", color: "white" }}
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
      <PageBreadcrumb pageTitle="Providers Management" />

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
            + Add Provider
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
          <Table
            columns={columns}
            dataSource={ProviderList?.data}
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

      {/* Add Provider Modal */}
      <Modal
        title="Add New Provider"
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
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please enter category" }]}
          >
            <Input placeholder="Enter category" />
          </Form.Item>

          <Form.Item
            name="joinDate"
            label="Join Date"
            rules={[{ required: true, message: "Please enter join date" }]}
          >
            <Input placeholder="YYYY-MM-DD" />
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

export default ProvidersManagement;
