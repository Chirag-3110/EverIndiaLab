import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Switch,
  InputNumber,
  Space,
  Popconfirm,
  Row,
  Col,
  message,
  Tag,
} from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import {
  PlusOutlined,
  MinusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useAddtestFormMutation,
  useGettestFormQuery,
  useUpdatetestFormMutation,
  useDeletetestFormMutation,
  useUnassignedTestformMutation,
} from "../../redux/api/testFormApi";
import { useSidebar } from "../../context/SidebarContext";
import { formatDate } from "../../utils/utils";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const categories = ["Blood Test", "Urine Test", "Imaging", "Others"];
const sampleTypes = ["Blood", "Urine", "Saliva", "Other"];
const genders = ["Male", "Female", "Both"];
const collectionTypes = ["Home Collection", "Lab Visit", "Both"];
const ageGroups = ["All ages", "Child", "Adult", "Senior"];

const TestFormManager = () => {
  const { user } = useAuth();
  const { isExpanded, isHovered } = useSidebar();
  const navigate = useNavigate();

  const { data, error, isLoading, refetch } = useGettestFormQuery({});
  const [addTestForm] = useAddtestFormMutation();
  const [updateTestForm] = useUpdatetestFormMutation();
  const [deleteTestForm] = useDeletetestFormMutation();
  const [unassignedTestform] = useUnassignedTestformMutation();

  const [testForms, setTestForms] = useState([]);
  console.log(testForms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestForm, setEditingTestForm] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (data?.response?.testForms) {
      setTestForms(data.response.testForms);
    }
  }, [data]);

  const openAddModal = () => {
    setEditingTestForm(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingTestForm(record);
    // Convert specifications [{key:value}] to { key, value } array for form list
    const specs =
      record.specifications?.map((obj) => ({
        key: Object.keys(obj)[0],
        value: Object.values(obj)[0],
      })) || [];

    form.setFieldsValue({ ...record, specifications: specs });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const payload = {
        testFormId: id,
        labId: user?._id,
      };
      await unassignedTestform(payload).unwrap();
      toast.success("Test form removed");
      refetch();
    } catch {
      message.error("Error removing test form");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingTestForm(null);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Convert specifications back to array of key-value objects
      const specs =
        values.specifications?.map((item) => ({ [item.key]: item.value })) ||
        [];

      const testFormData = {
        ...values,
        specifications: specs,
        status: values.status || false,
      };

      if (editingTestForm) {
        await updateTestForm({
          id: editingTestForm._id,
          body: testFormData,
        }).unwrap();
        toast.success("Test form updated");
      } else {
        await addTestForm(testFormData).unwrap();
        toast.success("Test form added");
      }
      refetch();
      setIsModalOpen(false);
      form.resetFields();
      setEditingTestForm(null);
    } catch (e) {
      message.error("Please fix the errors in the form or try again");
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      minWidth: 250,
      render: (value) => <span>{value || "--"}</span>,
    },
    {
      title: "Sample Types",
      dataIndex: "sampleType",
      key: "sampleType",
      minWidth: 180,
      render: (arr) =>
        Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "--",
    },
    {
      title: "Report Time",
      dataIndex: "reportTime",
      key: "reportTime",
      minWidth: 180,
    },
    {
      title: "Prescription Required",
      dataIndex: "prescriptionRequired",
      key: "prescriptionRequired",
      render: (val) => (val ? "Yes" : "No"),
      minWidth: 180,
    },
    {
      title: "Collection Type",
      dataIndex: "collectionType",
      key: "collectionType",
      minWidth: 180,
    },
    {
      title: "Price",
      key: "price",
      dataIndex: "price",
      render: (val) => (val === null || val === undefined ? "--" : `₹${val}`),
    },
    {
      title: "Discount Price",
      key: "discountPrice",
      dataIndex: "discountPrice",
      render: (val) => (val === null || val === undefined ? "--" : `₹${val}`),
      minWidth: 150,
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (val) => (
        <Tag color={val ? "green" : "red"}>{val ? "Active" : "Inactive"}</Tag>
      ),
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
        <Space size="middle">
          {/* <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          ></Button> */}
          <Popconfirm
            title="Are you sure delete this test form?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Remove</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
    // style={{
    //   marginLeft: isExpanded || isHovered ? 0 : 0,
    //   width: isExpanded || isHovered ? "1180px" : "1200px",
    // }}
    >
      <div>
        <PageBreadcrumb pageTitle="Test Forms" />
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button type="primary" onClick={() => navigate("/test-form/assign")}>
            + Assign Test Form
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={testForms}
          rowKey={(record) => record._id}
          pagination={{
            pageSizeOptions: ["25", "50", "100"],
            showSizeChanger: true,
            defaultPageSize: 15,
          }}
          scroll={{ x: 1200 }}
          loading={isLoading}
        />

        <Modal
          open={isModalOpen}
          onCancel={handleCancel}
          title={editingTestForm ? "Edit Test Form" : "Add Test Form"}
          onOk={handleSave}
          width={900}
          okText={editingTestForm ? "Update" : "Add"}
          destroyOnClose
        >
          <Form form={form} layout="vertical" autoComplete="off">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: "Please input Title" }]}
                >
                  <Input placeholder="Input test title" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[
                    { required: true, message: "Please select category" },
                  ]}
                >
                  <Select placeholder="Select category" allowClear>
                    {categories.map((cat) => (
                      <Option key={cat} value={cat}>
                        {cat}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea placeholder="Description" rows={3} />
            </Form.Item>

            <Form.List name="includes">
              {(fields, { add, remove }) => (
                <>
                  <label>Includes</label>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: "flex", marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "heading"]}
                        fieldKey={[fieldKey, "heading"]}
                        rules={[{ required: true, message: "Missing heading" }]}
                      >
                        <Input placeholder="Heading" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "details"]}
                        fieldKey={[fieldKey, "details"]}
                        rules={[{ required: true, message: "Missing details" }]}
                      >
                        <Input placeholder="Details" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Include
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item
              name="sampleType"
              label="Sample Type(s)"
              rules={[{ required: true, message: "Select sample type(s)" }]}
            >
              <Checkbox.Group options={sampleTypes} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="reportTime"
                  label="Report Time"
                  rules={[
                    { required: true, message: "Please input report time" },
                  ]}
                >
                  <Input placeholder="e.g. 24 hrs" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="testCriteria"
                  label="Test Criteria"
                  rules={[
                    { required: true, message: "Please input test criteria" },
                  ]}
                >
                  <Input placeholder="Test Criteria" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="age"
                  label="Age Group"
                  rules={[
                    { required: true, message: "Please select age group" },
                  ]}
                >
                  <Select placeholder="Select age group" allowClear>
                    {ageGroups.map((age) => (
                      <Option key={age} value={age}>
                        {age}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="recommendedGender"
                  label="Recommended Gender"
                  rules={[{ required: true, message: "Please select gender" }]}
                >
                  <Select placeholder="Select gender" allowClear>
                    {genders.map((g) => (
                      <Option key={g} value={g}>
                        {g}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.List name="specifications">
              {(fields, { add, remove }) => (
                <>
                  <label>Specifications</label>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: "flex", marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "key"]}
                        fieldKey={[fieldKey, "key"]}
                        rules={[{ required: true, message: "Missing key" }]}
                      >
                        <Input placeholder="Key (e.g. Preparation)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "value"]}
                        fieldKey={[fieldKey, "value"]}
                        rules={[{ required: true, message: "Missing value" }]}
                      >
                        <Input placeholder="Value (e.g. 8 hrs fasting)" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Specification
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item
              name="prescriptionRequired"
              label="Prescription Required"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="collectionType"
              label="Collection Type"
              rules={[
                { required: true, message: "Please select collection type" },
              ]}
            >
              <Select placeholder="Select collection type">
                {collectionTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[
                    { required: true, message: "Please input price" },
                    {
                      type: "number",
                      min: 0,
                      message: "Price must be at least 0",
                    },
                  ]}
                >
                  <InputNumber prefix="₹" min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountPrice"
                  label="Discount Price"
                  rules={[
                    { required: true, message: "Please input discount price" },
                    {
                      type: "number",
                      min: 0,
                      message: "Discount price must be at least 0",
                    },
                  ]}
                >
                  <InputNumber prefix="₹" min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="status"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default TestFormManager;
