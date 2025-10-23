import React, { useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Avatar,
  Upload,
} from "antd";
import { RcFile, UploadFile } from "antd/es/upload/interface";
import { ConsoleSqlOutlined, UploadOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { useSidebar } from "../../context/SidebarContext";
import { Ban, CheckCircle, SquarePen, Trash2, XCircle } from "lucide-react";
import {
  useAddStaffMutation,
  useGetStaffsQuery,
  useDeleteStaffMutation,
  useEditStaffMutation,
  useUpdateStaffStatusMutation,
} from "../../redux/api/staffApi";
import { formatDate } from "../../utils/utils";
import { useGetlabsQuery } from "../../redux/api/labsApi";

const { Option } = Select;

const Staff = () => {
  const [searchText, setSearchText] = useState("");

  const { data: labList } = useGetlabsQuery({});
  const { data, isLoading } = useGetStaffsQuery(searchText);
  const { isExpanded, isHovered } = useSidebar();

  const [addUser] = useAddStaffMutation();
  const [editUser] = useEditStaffMutation();
  const [deleteUser] = useDeleteStaffMutation();
  const [updateUserStatus] = useUpdateStaffStatusMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [editingUser, setEditingUser] = useState<any>(null);
  const [imageFile, setImageFile] = useState<RcFile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  console.log(imageFile, imagePreview);

  const handleSearchChange = (e: any) => {
    setSearchText(e.target.value);
  };

  // Open modal for adding new user
  const openAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setImagePreview(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const openEditModal = (user: any) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email || "",
      phoneNumber: user.contactNumber,
      status: user.status ? "Active" : "Deactive",
    });
    setImagePreview(user.profileImage || null);
    setIsModalOpen(true);
  };

  // Delete User
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      toast.success("User Deleted Successfully!");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateUserStatus({
        id,
        formdata: { status: !currentStatus },
      }).unwrap();
      toast.success("Status changed successfully!");
    } catch {
      toast.error("Failed to change status");
    }
  };

  // Handle form submission for Add/Edit
  const handleFormSubmit = async () => {
    form.validateFields().then(async (values) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email || "");
      formData.append("phoneNumber", values.phoneNumber);
      formData.append("status", values.status === "Active" ? "true" : "false");
      formData.append("labId", values.labId);
      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      try {
        if (editingUser) {
          await editUser({ id: editingUser._id, formData }).unwrap();
          toast.success("User updated successfully");
        } else {
          await addUser(formData).unwrap();
          toast.success("User added successfully");
        }
        setIsModalOpen(false);
        form.resetFields();
        setImagePreview(null);
        setImageFile(null);
      } catch {
        toast.error("Failed to save user");
      }
    });
  };

  // Handle image upload change - FIXED
  const handleImageChange = (info: any) => {
    const fileObj = info.fileList?.[0]?.originFileObj as RcFile;
    if (fileObj) {
      setImageFile(fileObj);
      setImagePreview(URL.createObjectURL(fileObj));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "profileImage",
      key: "avatar",
      render: (image: string) => (
        <Avatar src={image || "/default-avatar.png"} size={40} />
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Phone",
      dataIndex: "contactNumber",
      key: "phone",
      render: (phone: string) =>
        phone?.startsWith("+91") ? phone.slice(3) : phone,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value: any) => <span>{value || "NA"}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: true },
        { text: "Deactive", value: false },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Active" : "Deactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: any) => <span>{formatDate(value)}</span>,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      minWidth: 160,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {/* <Button
            type="default"
            style={{
              backgroundColor: record.status ? "#F56C6C" : "#67C23A",
              color: "white",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            onClick={() => handleToggleStatus(record._id, record.status)}
            icon={
              record.status ? <XCircle size={16} /> : <CheckCircle size={16} />
            }
          /> */}
          {/* <Button
            type="default"
            onClick={() => openEditModal(record)}
            style={{
              backgroundColor: "#4096ff",
              color: "white",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <SquarePen size={16} />
          </Button> */}
          <Popconfirm
            title="Are you sure to delete this Phlebotomist member?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              style={{
                backgroundColor: "red",
                color: "white",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              icon={<Trash2 size={16} />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        // marginLeft: isExpanded || isHovered ? 0 : 0,
        // width: isExpanded || isHovered ? "1180px" : "",
      }}
    >
      <PageBreadcrumb pageTitle="Phlebotomist" />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <Input.Search
          placeholder="Search Phlebotomist"
          value={searchText}
          onChange={handleSearchChange}
          // onSearch={handleSearch}
          allowClear
          enterButton
          className="w-full sm:w-1/2 md:w-1/3"
        />
        {/* <Button type="primary" onClick={openAddModal}>
          + Add Phlebotomist
        </Button> */}
      </div>

      <Table
        columns={columns}
        dataSource={data?.response?.users || []}
        rowKey="_id"
        pagination={{
          pageSizeOptions: ["25", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 15,
        }}
        // scroll={{ x: 1200 }} 
        loading={isLoading}
      />

      {/* Add / Edit User Modal */}
      <Modal
        title={editingUser ? "Edit Phlebotomist" : "Add New Phlebotomist"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleFormSubmit}
        okText={editingUser ? "Update" : "Add"}
        zIndex={10000}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="labId"
            label="Select Lab"
            rules={[{ required: true, message: "Please select a lab" }]}
          >
            <Select placeholder="Select Lab">
              {labList?.response?.labs?.map((lab: any) => (
                <Option key={lab._id} value={lab._id}>
                  {lab.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Phone number must be exactly 10 digits",
              },
            ]}
          >
            <Input
              placeholder="Enter phone number"
              maxLength={10}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ type: "email", message: "Enter a valid email" }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="Deactive"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Deactive">Deactive</Option>
            </Select>
          </Form.Item>

          <Form.Item label="User Image (Optional)">
            <Upload
              beforeUpload={() => false} // prevent automatic upload
              showUploadList={false}
              onChange={handleImageChange}
              accept="image/*"
              fileList={
                imageFile
                  ? [
                      {
                        uid: "-1",
                        name: imageFile.name,
                        status: "done",
                        type: imageFile.type,
                        originFileObj: imageFile,
                      } as UploadFile<RcFile>,
                    ]
                  : []
              }
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            {imagePreview && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: 100, height: 100, borderRadius: "50%" }}
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Staff;
