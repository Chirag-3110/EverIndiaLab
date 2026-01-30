import React, { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import {
  useGetManualUserQuery,
  useAddManualUserMutation,
  useAddManualUserFamilyMemberMutation,
  useGetManualUserFamilyMembersQuery,
  useEditUserFamilyMemberRelationMutation,
} from "../../../redux/api/manualApi";
import { formatDate } from "../../../utils/utils";
import { Modal, Form, Input, Select, message, Table } from "antd";
import { useNavigate } from "react-router";
import { useGetUsersQuery } from "../../../redux/api/UserApi";
import { toast } from "react-toastify";

const ManualBooking = () => {
  const navigate = useNavigate();
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [familyForm] = Form.useForm();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(false);
  const [bookingFor, setBookingFor] = useState<"self" | "family">("self");
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<any>(null);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<any>(null);

  const [addFamilyMember, { isLoading: isAddingFamily }] =
    useAddManualUserFamilyMemberMutation();
  const [editUserFamilyMemberRelation, { isLoading: isEditingFamily }] =
    useEditUserFamilyMemberRelationMutation();

  const [addManualUser, { isLoading: isCreatingUser }] =
    useAddManualUserMutation();

  const { data, isFetching } = useGetManualUserQuery(
    searchTrigger ? searchValue : "",
    {
      skip: !searchTrigger,
    }
  );

  const user = data?.response?.data;
  const userId = user?._id;

  const { data: familyMemberList } = useGetManualUserFamilyMembersQuery(
    userId,
    {
      skip: !userId,
    }
  );
  const familyMembers = familyMemberList?.response?.relations || [];

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setSearchValue(searchInput);
    setSearchTrigger(true);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchValue("");
    setSearchTrigger(false);
  };

  const handleCreateUser = async (values: any) => {
    try {
      const res = await addManualUser(values).unwrap();

      toast.success("User created successfully");

      const createdUser = res?.response?.data;
      setNewlyCreatedUser(createdUser);

      setIsCreateUserModalOpen(false);
      form.resetFields();

      setSearchValue(values.phoneNumber);
      setSearchTrigger(true);

      const sanitizedPhoneNumber = createdUser.phoneNumber?.replace(
        /^\+91\s?/,
        ""
      );
      setTimeout(() => {
        setIsFamilyModalOpen(true);

        familyForm.setFieldsValue({
          name: createdUser.name,
          gender: createdUser.gender,
          phoneNumber: sanitizedPhoneNumber,
          email: createdUser.email || "",
          relation: "self",
        });
      }, 300);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  const handleAddOrEditFamilyMember = async (values: any) => {
    try {
      if (editingMember) {
        // 🟡 EDIT
        await editUserFamilyMemberRelation({
          id: editingMember._id,
          ...values,
        }).unwrap();

        toast.success("Family member updated successfully");
      } else {
        // 🟢 ADD
        const payload = {
          ...values,
          userId: user?._id,
        };

        await addFamilyMember(payload).unwrap();
        toast.success("Family member added successfully");
      }

      familyForm.resetFields();
      setEditingMember(null);
      setIsFamilyModalOpen(false);

      // refresh list
      setSearchTrigger(false);
      setTimeout(() => setSearchTrigger(true), 0);
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };
  const handleEditMember = (record: any) => {
    setEditingMember(record);
    setIsFamilyModalOpen(true);

    familyForm.setFieldsValue({
      name: record.name,
      age: record.age,
      gender: record.gender,
      relation: record.relation,
      phoneNumber: record.phoneNumber,
      email: record.email,
    });
  };

  const familyColumns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Relation",
      dataIndex: "relation",
      render: (text: string) => text?.toUpperCase(),
    },
    {
      title: "Age",
      dataIndex: "age",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      render: (text: string) => text?.toUpperCase(),
    },
    {
      title: "Mobile",
      dataIndex: "phoneNumber",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) =>
        record?.relation !== "self" ? (
          <button
            className="text-indigo-600 hover:underline"
            onClick={() => handleEditMember(record)}
          >
            Edit
          </button>
        ) : null,
    },
  ];

  const rowSelection = {
    type: "radio" as const,
    selectedRowKeys: selectedFamilyMember ? [selectedFamilyMember._id] : [],
    onChange: (_keys: React.Key[], rows: any[]) => {
      setSelectedFamilyMember(rows[0]);
    },
  };

  const openCreateUserModal = () => {
    setIsCreateUserModalOpen(true);

    if (searchInput) {
      form.setFieldsValue({
        phoneNumber: searchInput,
      });
    }
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <PageBreadcrumb pageTitle="Create Booking" />

        {/* 🔍 Search User */}
        <div className="bg-white p-4 rounded shadow flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by mobile"
            className="border p-2 rounded w-64"
            value={searchInput}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);

              setSearchInput(value);
            }}
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>

        {/* ⏳ Loading */}
        {isFetching && <p>Searching user...</p>}

        {/* ❌ User Not Found */}
        {!isFetching && searchTrigger && !user && (
          <div className="bg-yellow-50 p-4 rounded">
            <p>User not found</p>
            <button
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => openCreateUserModal()}
            >
              Create User
            </button>
          </div>
        )}

        {/* ✅ User Found */}
        {user && (
          <div className="bg-white p-4 rounded shadow space-y-3">
            <h3 className="font-semibold">User Details</h3>
            <p>Name: {user.name}</p>
            <p>Mobile: {user.phoneNumber}</p>

            {/* Self / Family Choice */}
            <div className="flex gap-4 mt-2">
              {/* <label>
                <input
                  type="radio"
                  checked={bookingFor === "self"}
                  onChange={() => setBookingFor("self")}
                />
                <span className="ml-1">Self</span>
              </label> */}

              <label>
                <input
                  type="radio"
                  checked={bookingFor === "family"}
                  onChange={() => setBookingFor("family")}
                />
                <span className="ml-1">Select Member</span>
              </label>
            </div>

            {/* Family Member Section */}
            {bookingFor === "family" && (
              <div className="border p-3 rounded space-y-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Select Member</p>

                  <button
                    className="bg-indigo-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setEditingMember(null);
                      familyForm.resetFields();
                      setIsFamilyModalOpen(true);
                    }}
                  >
                    Add Member
                  </button>
                </div>

                <Table
                  rowKey="_id"
                  columns={familyColumns}
                  dataSource={familyMembers}
                  rowSelection={rowSelection}
                  pagination={{ pageSize: 5 }}
                  size="small"
                  scroll={{ x: 1000 }}
                />

                {!familyMembers.length && (
                  <p className="text-sm text-gray-500">
                    No members found. Please add one.
                  </p>
                )}
              </div>
            )}

            {/* Proceed to Booking */}
            <button
              onClick={() =>
                navigate("/manual-booking-create", {
                  state: {
                    userId: user?._id,
                    bookingFor,
                    familyMemberId:
                      bookingFor === "family"
                        ? selectedFamilyMember?._id
                        : null,
                  },
                })
              }
              disabled={bookingFor === "family" && !selectedFamilyMember}
              className="mt-4 bg-blue-700 text-white px-5 py-2 rounded disabled:opacity-50"
            >
              Proceed to Booking
            </button>
          </div>
        )}
      </div>

      {/* CREATE USER */}
      <Modal
        title="Create Manual User"
        open={isCreateUserModalOpen}
        onCancel={() => {
          setIsCreateUserModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={isCreatingUser}
        okText="Create User"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: "Phone number is required" },
              {
                pattern: /^[6-9]\d{9}$/,
                message: "Enter valid 10 digit number",
              },
            ]}
          >
            <Input maxLength={10} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Enter Name" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Gender is required" }]}
          >
            <Select placeholder="Select gender">
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Enter valid email" }]}
          >
            <Input placeholder="Enter Email" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ADD FAMILY MEMEBER */}
      <Modal
        title={editingMember ? "Edit Family Member" : "Add Family Member"}
        open={isFamilyModalOpen}
        onCancel={() => {
          setIsFamilyModalOpen(false);
          setEditingMember(null);
          familyForm.resetFields();
        }}
        onOk={() => familyForm.submit()}
        confirmLoading={isAddingFamily || isEditingFamily}
        okText={editingMember ? "Update Member" : "Add Member"}
      >
        <Form
          form={familyForm}
          layout="vertical"
          onFinish={handleAddOrEditFamilyMember}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: "Age is required" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Gender is required" }]}
          >
            <Select placeholder="Select gender">
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="relation"
            label="Relation"
            rules={[{ required: true, message: "Relation is required" }]}
          >
            <Select placeholder="Select relation">
              <Select.Option value="self">Self</Select.Option>
              <Select.Option value="father">Father</Select.Option>
              <Select.Option value="mother">Mother</Select.Option>
              <Select.Option value="brother">Brother</Select.Option>
              <Select.Option value="sister">Sister</Select.Option>
              <Select.Option value="spouse">Spouse</Select.Option>
              <Select.Option value="son">Son</Select.Option>
              <Select.Option value="daughter">Daughter</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { pattern: /^[6-9]\d{9}$/, message: "Enter valid phone number" },
            ]}
          >
            <Input maxLength={10} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Enter valid email" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ManualBooking;
