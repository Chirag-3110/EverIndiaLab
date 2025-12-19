import React, { useEffect, useState } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Space,
  message,
} from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  useGetlabEmployeesQuery,
  useAddlabEmployeeMutation,
  useDeletelabEmployeeMutation,
  useEditlabEmployeeMutation,
} from "../../redux/api/labEmployeeApi";
import { useAuth } from "../../context/AuthContext";
import { PenBox, Trash } from "lucide-react";
import { toast } from "react-toastify";

const { Option } = Select;

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const PERMISSION_OPTIONS = [
  "view-dashboard",
  "manage-category",
  "manage-phlebotomist",
  "manage-staff",
  "manage-package",
  "manage-test",
  "manualbookings",
  "manage-bookings",
  "manage-inquiry",
];

const EmployeeStaffManagement: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();

  const {
    data,
    isLoading: isFetching,
    error: fetchError,
    refetch,
  } = useGetlabEmployeesQuery({ id: user?._id });

  const [addLabEmployee, { isLoading: isAdding }] = useAddlabEmployeeMutation();
  const [editLabEmployee, { isLoading: isEditing }] =
    useEditlabEmployeeMutation();
  const [deleteLabEmployee, { isLoading: isDeleting }] =
    useDeletelabEmployeeMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(
    null
  );

  // Open modal for add or edit
  const openModal = (record?: any) => {
    setIsModalVisible(true);
    if (record) {
      setEditingEmployeeId(record._id);
      form.setFieldsValue({
        ...record,
        permissions: record.permissions || [],
      });
    } else {
      setEditingEmployeeId(null);
      form.resetFields();
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingEmployeeId(null);
  };

  // Submit add or edit
  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      permissions: values.permissions || [],
      connectedLabId: user?._id,
    };

    try {
      if (editingEmployeeId) {
        await editLabEmployee({
          id: editingEmployeeId,
          formData: payload,
        }).unwrap();
        toast.success("Employee updated successfully");
      } else {
        await addLabEmployee(payload).unwrap();
        toast.success("Employee added successfully");
      }
      refetch();
      closeModal();
    } catch (err: any) {
      const apitoast =
        err?.data?.message ||
        err?.error ||
        "Operation failed. Please try again.";

      toast.error(apitoast);
    }
  };

  // Confirm and delete employee
  const handleDelete = async (id: string) => {
    try {
      await deleteLabEmployee(id).unwrap();
      toast.success("Employee deleted successfully");
      refetch();
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  // Table columns configuration
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Phone",
      key: "phone",
      render: (text: any, record: any) =>
        `${record.countryCode} ${record.phoneNumber}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (perms: string[]) => perms.join(", "),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button onClick={() => openModal(record)} type="link">
            <PenBox size={18} />
          </Button>
          <Button danger onClick={() => handleDelete(record._id)} type="link">
            <Trash size={18} />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <PageBreadcrumb pageTitle="Staff Management" />

      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        Add Employee
      </Button>

      <Table
        loading={isFetching}
        dataSource={data?.response?.data || []}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingEmployeeId ? "Edit Employee" : "Add New Employee"}
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ countryCode: "+91", permissions: [] }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[{ required: true, message: "Please input phone number!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Country Code"
            name="countryCode"
            rules={[{ required: true, message: "Please input country code!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Please select gender!" }]}
          >
            <Select placeholder="Select gender">
              {GENDER_OPTIONS.map((g) => (
                <Option value={g} key={g}>
                  {g}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Permissions" name="permissions">
            <Checkbox.Group>
              {PERMISSION_OPTIONS.map((perm) => (
                <Checkbox value={perm} key={perm}>
                  {perm}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isAdding || isEditing}
              style={{ width: "100%" }}
            >
              {editingEmployeeId ? "Update Employee" : "Add Employee"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeStaffManagement;
