import React, { useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Select,
} from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { useSidebar } from "../../context/SidebarContext";
import { CircleCheck, CircleX, Trash } from "lucide-react";

const LabManagement = () => {
  const { isExpanded, isHovered } = useSidebar();
  const [labs, setLabs] = useState([
    {
      id: 1,
      name: "City Pathology Lab",
      location: "123 Main St, Mumbai",
      tests_available: "Blood Test, COVID-19 Test",
      contact: "9876543210",
      status: "Active",
    },
    {
      id: 2,
      name: "HealthPlus Diagnostics",
      location: "45 Park Road, Delhi",
      tests_available: "Thyroid Test, Liver Function Test",
      contact: "9123456780",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Care Lab Solutions",
      location: "78 Green Avenue, Bangalore",
      tests_available: "Blood Test, Kidney Function Test",
      contact: "9988776655",
      status: "Active",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Delete Lab
  const handleDelete = (id: number) => {
    setLabs((prev) => prev.filter((lab) => lab.id !== id));
    toast.success("Lab Deleted Successfully!");
  };

  // Toggle Status
  const handleToggleStatus = (id: number) => {
    setLabs((prev) =>
      prev.map((lab) =>
        lab.id === id
          ? { ...lab, status: lab.status === "Active" ? "Inactive" : "Active" }
          : lab
      )
    );
    toast.success("Status changed successfully!");
  };

  // Add Lab
  const handleAddLab = () => {
    form.validateFields().then((values) => {
      const newLab = {
        id: labs.length ? Math.max(...labs.map((l) => l.id)) + 1 : 1,
        ...values,
      };
      setLabs((prev) => [...prev, newLab]);
      message.success("Lab added successfully");
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: "Lab Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span style={{ color: "#07868D", fontWeight: "bold" }}>{text}</span>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Tests Available",
      dataIndex: "tests_available",
      key: "tests_available",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="default"
            style={{
              backgroundColor: "#07868D",
              color: "white",
              // width: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => handleToggleStatus(record.id)}
            title={record.status === "Active" ? "Deactivate" : "Activate"}
          >
            {record.status === "Active" ? (
              <CircleX size={20} />
            ) : (
              <CircleCheck size={20} />
            )}
          </Button>
          <Popconfirm
            title="Are you sure to delete this lab?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              style={{
                backgroundColor: "red",
                color: "white",
                // width: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Delete"
            >
              <Trash size={20} />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        marginLeft: isExpanded || isHovered ? 0 : 0,
        width: isExpanded || isHovered ? "1180px" : "",
      }}
    >
      <PageBreadcrumb pageTitle="Lab Management" />

      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          style={{ backgroundColor: "#07868D", borderColor: "#07868D" }}
          onClick={() => setIsModalOpen(true)}
        >
          + Add Lab
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={labs}
        rowKey="id"
        pagination={{
          pageSizeOptions: ["5", "10", "15"],
          showSizeChanger: true,
          defaultPageSize: 5,
        }}
        scroll={{ x: 1000 }}
      />

      {/* Add Lab Modal */}
      <Modal
        title="Add New Lab"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAddLab}
        okText="Add"
        okButtonProps={{
          style: {
            backgroundColor: "#07868D",
            borderColor: "#07868D",
            color: "white",
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Lab Name"
            rules={[{ required: true, message: "Please enter lab name" }]}
          >
            <Input placeholder="Enter lab name" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter location" }]}
          >
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item
            name="tests_available"
            label="Tests Available"
            rules={[
              { required: true, message: "Please enter tests available" },
            ]}
          >
            <Input placeholder="Enter tests available (comma separated)" />
          </Form.Item>

          <Form.Item
            name="contact"
            label="Contact"
            rules={[{ required: true, message: "Please enter contact number" }]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="Active"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              {/* <Option value="Active">Active</Option> */}
              {/* <Option value="Inactive">Inactive</Option> */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LabManagement;
