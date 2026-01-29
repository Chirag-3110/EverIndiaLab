import React, { useMemo, useState } from "react";
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
} from "antd";
import { EyeOutlined, FileExcelOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { SquarePen, Trash2 } from "lucide-react";
import {
  useGetdrQuery,
  useAdddrMutation,
  useUpdatedrMutation,
  useDeletedrMutation,
} from "../../redux/api/drApi";
import { formatDate } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const { Option } = Select;

const Doctor = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("All");

  // ✅ Changed all hooks to dr hooks
  const { data, isLoading, error } = useGetdrQuery({});
  console.log(error);

  const [adddr, { isLoading: isAdding }] = useAdddrMutation();
  const [updatedr, { isLoading: isEditing }] = useUpdatedrMutation();
  const [deletedr] = useDeletedrMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingDoctor, setEditingDoctor] = useState<any>(null);

  const handleSearchChange = (e: any) => {
    setSearchText(e.target.value);
  };

  // Open modal for adding new doctor
  const openAddModal = () => {
    setEditingDoctor(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Open modal for editing doctor
  const openEditModal = (doctor: any) => {
    setEditingDoctor(doctor);
    form.setFieldsValue({
      name: doctor.name,
      speciality: doctor.speciality,
    });
    setIsModalOpen(true);
  };

  // Delete Doctor
  const handleDelete = async (id: string) => {
    try {
      await deletedr(id).unwrap();
      toast.success("Doctor Deleted Successfully!");
    } catch {
      toast.error("Failed to delete doctor");
    }
  };

  // Handle form submission for Add/Edit
  const handleFormSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        // ✅ Doctor payload: { name, speciality } or { name, speciality, id }
        const payload = editingDoctor
          ? { ...values, id: editingDoctor._id }
          : values;

        try {
          if (editingDoctor) {
            const res = await updatedr({ body: payload }).unwrap();
            toast.success(res?.message || "Doctor updated successfully");
          } else {
            const res = await adddr(payload).unwrap();
            toast.success(res?.message || "Doctor added successfully");
          }
          setIsModalOpen(false);
          form.resetFields();
        } catch (error: any) {
          const errorMsg =
            error?.data?.message || error?.error || "Failed to save doctor";
          toast.error(errorMsg);
        }
      })
      .catch((validationError) => {
        if (validationError.errorFields) {
          validationError.errorFields.forEach(
            (fieldError: { name: string[]; errors: string[] }) => {
              fieldError.errors.forEach((errMsg: string) => {
                toast.error(errMsg);
              });
            }
          );
        } else {
          toast.error("Validation failed");
        }
      });
  };

  const handleExportExcel = () => {
    const doctors = data?.response?.data || [];
    const exportData = doctors.map((doctor: any) => ({
      Name: doctor.name,
      Speciality: doctor.speciality,
      "Created At": formatDate(doctor.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doctors");

    XLSX.writeFile(workbook, "doctors-list.xlsx");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <span
          style={{
            cursor: "pointer",
            color: "#1890ff",
            whiteSpace: "normal",
            wordBreak: "break-word",
            display: "inline-block",
          }}
          onClick={() => navigate(`/doctors-details?doctor=${record?._id}`)}
        >
          {text}
        </span>
      ),
      width: 200,
    },
    {
      title: "Speciality",
      dataIndex: "speciality",
      key: "speciality",
      width: 180,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: any) => (
        <div style={{ width: "100px" }}>{formatDate(value)}</div>
      ),
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
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
          </Button>
          <Popconfirm
            title="Are you sure to delete this doctor?"
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

  const doctorsData = useMemo(() => {
    let filtered = data?.response?.data || [];

    // Search: name OR speciality (case-insensitive)
    if (searchText) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          doctor.speciality?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Speciality filter (exact match)
    if (specialityFilter !== "All") {
      filtered = filtered.filter(
        (doctor) => doctor.speciality === specialityFilter
      );
    }

    return filtered;
  }, [data?.response?.data, searchText, specialityFilter]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Doctors Management" />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <Input.Search
          placeholder="Search doctors"
          value={searchText}
          onChange={handleSearchChange}
          allowClear
          enterButton
          className="w-full sm:w-1/2 md:w-1/3"
        />

        <Button
          type="primary"
          icon={<FileExcelOutlined size={14} style={{ color: "#fff" }} />}
          onClick={handleExportExcel}
          style={{
            backgroundColor: "#008000",
            borderColor: "#b7eb8f",
            color: "#fff",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 10,
          }}
          className="w-full sm:w-1/4 md:w-1/6"
        >
          Export Excel
        </Button>
        <Button
          type="primary"
          onClick={openAddModal}
          className="w-full sm:w-1/4 md:w-1/6"
        >
          + Add Doctor
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={doctorsData}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSizeOptions: ["15", "25", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 15,
          showTotal: (total, range) => (
            <span>
              Showing {range[0]}-{range[1]} of <span>{total}</span> total
              doctors
            </span>
          ),
        }}
        scroll={{ x: 1000 }}
      />

      {/* Add / Edit Doctor Modal */}
      <Modal
        title={editingDoctor ? "Edit Doctor" : "Add New Doctor"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleFormSubmit}
        okText={editingDoctor ? "Update" : "Add"}
        confirmLoading={editingDoctor ? isEditing : isAdding}
        zIndex={100}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Doctor Name"
            rules={[{ required: true, message: "Please enter doctor name" }]}
          >
            <Input placeholder="Enter doctor name" />
          </Form.Item>

          <Form.Item
            name="speciality"
            label="Speciality"
            rules={[{ required: true, message: "Please enter speciality" }]}
          >
            <Input placeholder="Enter speciality (e.g., Dermatologist)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Doctor;
