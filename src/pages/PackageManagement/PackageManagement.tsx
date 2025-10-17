import React, { useEffect, useRef, useState } from "react";
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
} from "../../redux/api/testFormApi";
import { useSidebar } from "../../context/SidebarContext";
import { useGetCategoryListQuery } from "../../redux/api/categoryApi";
import {
  useAddpackageMutation,
  useDeletepackageMutation,
  useGetpackageQuery,
  useUpdatepackageMutation,
  useUpdatePackageStatusMutation,
} from "../../redux/api/packageApi";

const { Option } = Select;

const categories = ["Blood Test", "Urine Test", "Imaging", "Others"];
const sampleTypes = [
  "Blood",
  "Urine",
  "Stool",
  "Sptuam",
  "Tissue's",
  "Swabs",
  "Body Fluids",
  "Seman",
  "Amniotic Fluid",
  "others",
];
const genders = ["Male", "Female", "Both"];
const collectionTypes = ["Home Collection", "Lab Visit", "Both"];
const ageGroups = ["All ages", "Child", "Adult", "Senior"];

const PackageManagement = () => {
  const { isExpanded, isHovered } = useSidebar();

  const [testSearch, setTestSearch] = useState("");
  const [testPage, setTestPage] = useState(1);
  const [testList, setTestList] = useState([]);
  const [hasMoreTests, setHasMoreTests] = useState(true);
  const debounceTimeout = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data, isLoading, refetch } = useGetpackageQuery({
    searchText,
    page,
    pageSize,
  });

  const { data: testData, isFetching } = useGettestFormQuery({
    searchText: testSearch,
    page: testPage,
    pageSize: 20,
  });
  const [tests, setTests] = useState([]);

  const [addpackage] = useAddpackageMutation();
  const [updatepackage] = useUpdatepackageMutation();
  const [deletepackage] = useDeletepackageMutation();
  const [updatePackageStatus] = useUpdatePackageStatusMutation();

  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestForm, setEditingTestForm] = useState(null);
  const [otherSampleType, setOtherSampleType] = useState("");

  const [form] = Form.useForm();

  useEffect(() => {
    if (data?.response?.packages) {
      setPackages(data.response.packages);
    }
  }, [data]);

  useEffect(() => {
    if (testData?.response?.testForms) {
      const newTests = testData.response.testForms;
      if (testPage === 1) {
        setTestList(newTests);
      } else {
        // Merge only unique tests to avoid duplicates
        setTestList((prev) => [
          ...prev,
          ...newTests.filter((t) => !prev.some((p) => p._id === t._id)),
        ]);
      }

      const total = testData.response.pagination?.totalCount ?? 0;
      const totalPages = testData.response.pagination?.totalPages ?? 1;
      const currentPage = testData.response.pagination?.currentPage ?? 1;

      setHasMoreTests(currentPage < totalPages);
    }
  }, [testData]);

  const total = data?.response?.pagination?.totalCount ?? 0;

  // Handle search typing
  const handleTestSearch = (value) => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setTestSearch(value);
      setTestPage(1);
      setHasMoreTests(true);
    }, 500); // waits 500ms before calling API
  };

  // Handle scroll to load more
  const handleTestScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (
      scrollTop + clientHeight >= scrollHeight - 50 &&
      hasMoreTests &&
      !isFetching
    ) {
      setTestPage((prev) => prev + 1);
    }
  };
  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const openAddModal = () => {
    setEditingTestForm(null);
    setOtherSampleType("");
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingTestForm(record);

    form.setFieldsValue({
      ...record,
      includedTests: record.includedTests || [],
    });

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletepackage(id).unwrap();
      toast.success("Test form deleted successfully");
      await refetch();
    } catch {
      message.error("Error deleting test form");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingTestForm(null);
    setOtherSampleType("");
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const testFormData = {
        ...values,
        status: editingTestForm?.status ?? true,
      };

      if (editingTestForm) {
        await updatepackage({
          id: editingTestForm._id,
          body: testFormData,
        }).unwrap();
        toast.success("Test form updated successfully");
      } else {
        await addpackage(testFormData).unwrap();
        toast.success("Test form added successfully");
      }

      await refetch();
      handleCancel();
    } catch (e) {
      console.error(e);
      message.error("Please check all fields and try again");
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (v) => v || "--",
    },
    {
      title: "Tests Includes ",
      dataIndex: "includedTests",
      key: "includedTests",
      render: (arr) =>
        Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "--",
    },
    {
      title: "Collection Type",
      dataIndex: "collectionType",
      key: "collectionType",
      render: (v) => v || "--",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (v) => (v != null ? `₹${v}` : "--"),
    },
    {
      title: "Discount Price",
      dataIndex: "discountPrice",
      key: "discountPrice",
      render: (v) => (v != null ? `₹${v}` : "--"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => (
        <Tag color={v ? "green" : "red"}>{v ? "Active" : "Inactive"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Are you sure to delete this test form?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
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
      <PageBreadcrumb pageTitle="Packages" />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <Input.Search
          placeholder="Search packages.."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          enterButton
          className="w-full sm:w-1/2 md:w-1/3"
        />
        <Button type="primary" onClick={openAddModal}>
          + Add Test Package
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={packages}
        rowKey={(r) => r._id}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "25", "50", "100"],
        }}
        scroll={{ x: 1200 }}
        onChange={(pagination) => {
          setPage(pagination.current);
          setPageSize(pagination.pageSize);
        }}
      />

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        title={editingTestForm ? "Edit Package" : "Add Test Package"}
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
                <Input placeholder="Test title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="includedTests"
                label="Select Tests"
                rules={[{ required: true, message: "Please select tests" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Search and select tests"
                  showSearch
                  allowClear
                  filterOption={false} // Disable client-side filter
                  onSearch={handleTestSearch}
                  onPopupScroll={handleTestScroll}
                  loading={isFetching}
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                >
                  {testList.map((test) => (
                    <Option key={test._id} value={test._id}>
                      {test.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Description" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            {/* <Col span={12}>
              <Form.Item
                name="recommendedGender"
                label="Recommended Gender"
                rules={[{ required: true, message: "Select gender" }]}
              >
                <Select placeholder="Select gender" allowClear>
                  {genders.map((g) => (
                    <Option key={g} value={g}>
                      {g}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col> */}
          </Row>

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
            rules={[{ required: true, message: "Select collection type" }]}
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
                rules={[{ required: true, message: "Enter price" }]}
              >
                <InputNumber
                  prefix="₹"
                  min={0}
                  style={{ width: "100%" }}
                  step={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discountPrice" label="Discount Price">
                <InputNumber
                  prefix="₹"
                  min={0}
                  style={{ width: "100%" }}
                  step={1}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default PackageManagement;
