import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  TimePicker,
  Switch,
  Row,
  Col,
  Space,
  Popconfirm,
  Spin,
  Tag,
  DatePicker,
  Upload,
} from "antd";
import { RcFile, UploadFile } from "antd/es/upload/interface";
import moment, { Moment } from "moment";
import { UploadCloud, Trash2, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  useAddlabsMutation,
  useDeletelabsMutation,
  useGetlabsQuery,
  useUpdatelabsMutation,
} from "../../redux/api/labsApi";
import { useSidebar } from "../../context/SidebarContext";
import { formatDate } from "../../utils/utils";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useNavigate } from "react-router";

const { Item } = Form;
const { Option } = Select;

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const sampleCollectionOptions = ["Home Collection", "Lab Visit", "Both"];

interface OperatingHour {
  day: string;
  isClosed: boolean;
  openTime?: Moment;
  closeTime?: Moment;
}

interface Lab {
  _id: string;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  sampleCollectionType: string;
  operatingHours: OperatingHour[];
  contactPersonName: string;
  dateOfEstablishment: string | null;
  registrationCertificate?: string; // URL string
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

const LabsTable = () => {
  const navigate = useNavigate();
  const { isExpanded, isHovered } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [registrationCertificate, setRegistrationCertificate] = useState<
    UploadFile<RcFile>[] // AntD Upload expects this type for fileList
  >([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const { data: labs = [], isLoading, isError } = useGetlabsQuery({});
  const [addLab] = useAddlabsMutation();
  const [updateLab] = useUpdatelabsMutation();
  const [deleteLab] = useDeletelabsMutation();

  // Reset state & form on modal close
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingLab(null);
    setRegistrationCertificate([]);
  };

  // Prepare form for adding new lab
  const openAddModal = () => {
    setEditingLab(null);
    form.resetFields();
    setRegistrationCertificate([]);
    setIsModalOpen(true);
  };

  // Prepare form for editing existing lab
  // Prepare form for editing existing lab
  const openEditModal = (lab: Lab) => {
    setEditingLab(lab);
    form.setFieldsValue({
      ...lab,
      dateOfEstablishment: lab.dateOfEstablishment
        ? moment(lab.dateOfEstablishment)
        : null,
    });

    console.log(lab.operatingHours);

    // Set operating hours
    daysOfWeek.forEach((day) => {
      const opForDay = lab.operatingHours.find((op) => op.day === day);

      form.setFields([
        {
          name: `isOpen_${day}`,
          value: opForDay && !opForDay.isClosed,
        },
        {
          name: `openTime_${day}`,
          value:
            opForDay && !opForDay.isClosed
              ? moment(opForDay.openTime) // parse ISO string
              : undefined,
        },
        {
          name: `closeTime_${day}`,
          value:
            opForDay && !opForDay.isClosed
              ? moment(opForDay.closeTime) // parse ISO string
              : undefined,
        },
      ]);
    });

    // Setup uploaded file preview for existing registrationCertificate url
    if (lab.registrationCertificate) {
      setRegistrationCertificate([
        {
          uid: "-1",
          name: lab.registrationCertificate.split("/").pop() || "certificate",
          status: "done",
          url: lab.registrationCertificate,
        },
      ]);
    } else {
      setRegistrationCertificate([]);
    }

    setIsModalOpen(true);
  };

  // Handle file upload change (only 1 file at a time)
  const handleUploadChange = ({
    fileList,
  }: {
    fileList: UploadFile<RcFile>[];
  }) => {
    setRegistrationCertificate(fileList.slice(-1)); // Keep last uploaded only
  };

  // Validate time required when isOpen is true for that day
  const operatingHoursValidation = daysOfWeek.map((day) => ({
    day,
    rules: [
      {
        required: true,
        message: `${day} open time is required`,
      },
      {
        required: true,
        message: `${day} close time is required`,
      },
    ],
  }));

  // Handle form submission
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const operatingHours = daysOfWeek
        .map((day) => {
          const isOpen = values[`isOpen_${day}`];
          if (!isOpen) return null;
          return {
            day,
            isClosed: false,
            openTime: values[`openTime_${day}`],
            closeTime: values[`closeTime_${day}`],
          };
        })
        .filter(Boolean);

      const labData = new FormData();
      labData.append("name", values.name);
      labData.append("address", values.address);
      labData.append("contactNumber", values.contactNumber);
      labData.append("email", values.email || "");
      labData.append("sampleCollectionType", values.sampleCollectionType);
      labData.append("operatingHours", JSON.stringify(operatingHours));
      labData.append("contactPersonName", values.contactPersonName || "");
      labData.append(
        "dateOfEstablishment",
        values.dateOfEstablishment
          ? values.dateOfEstablishment.format("YYYY-MM-DD")
          : ""
      );

      if (registrationCertificate.length > 0) {
        const file = registrationCertificate[0].originFileObj as RcFile;
        if (file) labData.append("registrationCertificate", file);
      }

      setLoading(true);

      // Call add or update API here, example pseudocode:
      if (editingLab) {
        await updateLab({ id: editingLab._id, body: labData }).unwrap();
        toast.success("Lab updated successfully");
      } else {
        await addLab(labData).unwrap();
        toast.success("Lab added successfully");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingLab(null);
      setRegistrationCertificate([]);
    } catch (error: any) {
      const errorMsg =
        error?.data?.message || error?.error || "Failed to save lab data";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleDelete = async (id) => {
    try {
      await deleteLab(id).unwrap();
      toast.success("Lab deleted successfully");
    } catch {
      toast.error("Failed to delete lab");
    }
  };

  // Define your table columns here (omitted for brevity, reuse yours)
  const columns = [
    {
      title: "Lab Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <strong
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => navigate(`/labs/${record._id}`)}
        >
          {text}
        </strong>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      minWidth: 180,
    },
    {
      title: "Establishment",
      dataIndex: "dateOfEstablishment",
      key: "dateOfEstablishment",
      render: (text, record) => <span>{formatDate(text)}</span>,

      minWidth: 180,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      minWidth: 200,
    },

    {
      title: "Contact",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      minWidth: 180,
    },
    {
      title: "Sample Collection",
      dataIndex: "sampleCollectionType",
      key: "sampleCollectionType",
      render: (type) => <Tag color="blue">{type}</Tag>,
      minWidth: 180,
    },
    {
      title: "Operating Hours",
      key: "operatingHours",
      render: (_, record) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {record.operatingHours.map((op) => (
            <Tag key={op.day} color={op.isClosed ? "red" : "green"}>
              {op.day}:{" "}
              {op.isClosed
                ? "Closed"
                : `${moment(op.openTime).format("hh:mm A")} - ${moment(
                    op.closeTime
                  ).format("hh:mm A")}`}
            </Tag>
          ))}
        </div>
      ),
      minWidth: 180,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: any) => <span>{formatDate(value)}</span>,
      minWidth: 180,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<Edit2 size={16} />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this lab?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger icon={<Trash2 size={16} />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
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
      <PageBreadcrumb pageTitle="Labs" />
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Button type="primary" onClick={openAddModal}>
          + Add Lab
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={labs?.response?.labs || []}
        rowKey="id"
        pagination={{
          pageSizeOptions: ["25", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 15,
        }}
        scroll={{ x: 1200 }}
        loading={isLoading}
      />

      <Modal
        title={editingLab ? "Edit Lab" : "Add Lab"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSave}
        width={900}
        confirmLoading={loading}
        okText={editingLab ? "Update" : "Add"}
      >
        <Form form={form} layout="vertical" scrollToFirstError>
          <Row gutter={16}>
            <Col span={12}>
              <Item
                label="Lab Name"
                name="name"
                rules={[{ required: true, message: "Please input lab name" }]}
              >
                <Input placeholder="Lab Name" />
              </Item>
            </Col>

            <Col span={12}>
              <Item
                label="Address"
                name="address"
                rules={[{ message: "Please input address" }]}
              >
                <Input placeholder="Address" />
              </Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Item
                label="Contact Number"
                name="contactNumber"
                rules={[
                  { required: true, message: "Contact number is required" },
                  {
                    pattern: /^\d{10}$/,
                    message: "Contact number must be exactly 10 digits",
                  },
                ]}
              >
                <Input placeholder="+91-9998887776" />
              </Item>
            </Col>

            <Col span={12}>
              <Item label="Email" name="email" rules={[{ type: "email" }]}>
                <Input placeholder="Email" />
              </Item>
            </Col>
          </Row>

          <Item
            label="Sample Collection Type"
            name="sampleCollectionType"
            rules={[{ message: "Select a sample collection type" }]}
          >
            <Select placeholder="Select sample collection type">
              {sampleCollectionOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Item>

          <Item label="Contact Person Name" name="contactPersonName" rules={[]}>
            <Input placeholder="Contact Person Name" />
          </Item>

          <Item
            label="Date of Establishment"
            name="dateOfEstablishment"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) {
                    // no error if empty (not required)
                    return Promise.resolve();
                  }
                  // Example custom validation: ensure value is a valid moment date
                  if (value && !value.isValid()) {
                    return Promise.reject(
                      new Error("Please select a valid date")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Item>

          <Item label="Registration Certificate (PDF/Image)">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png"
              fileList={registrationCertificate}
              onChange={handleUploadChange}
              listType="picture"
            >
              <Button icon={<UploadCloud />}>Upload Certificate</Button>
            </Upload>
          </Item>

          {/* Operating Hours */}
          <div style={{ marginTop: 20 }}>
            <strong>Operating Hours</strong>
            <Row gutter={24} style={{ marginTop: 8 }}>
              {daysOfWeek.map((day) => (
                <Col key={day} span={24} style={{ marginBottom: 10 }}>
                  <Space align="center" size="large">
                    <span style={{ width: 100, fontWeight: 600 }}>{day}</span>
                    <Item
                      noStyle
                      name={`isOpen_${day}`}
                      valuePropName="checked"
                      initialValue={false}
                    >
                      <Switch
                        checkedChildren="Open"
                        unCheckedChildren="Closed"
                      />
                    </Item>

                    <Item
                      noStyle
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues[`isOpen_${day}`] !==
                        curValues[`isOpen_${day}`]
                      }
                    >
                      {({ getFieldValue }) =>
                        getFieldValue(`isOpen_${day}`) ? (
                          <>
                            <Item
                              noStyle
                              name={`openTime_${day}`}
                              rules={[
                                {
                                  required: true,
                                  message: `Please select open time for ${day}`,
                                },
                              ]}
                            >
                              <TimePicker format="hh:mm A" minuteStep={15} />
                            </Item>
                            <span>to</span>
                            <Item
                              noStyle
                              name={`closeTime_${day}`}
                              rules={[
                                {
                                  required: true,
                                  message: `Please select close time for ${day}`,
                                },
                              ]}
                            >
                              <TimePicker format="hh:mm A" minuteStep={15} />
                            </Item>
                          </>
                        ) : (
                          <span style={{ color: "gray" }}>Closed</span>
                        )
                      }
                    </Item>
                  </Space>
                </Col>
              ))}
            </Row>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default LabsTable;
