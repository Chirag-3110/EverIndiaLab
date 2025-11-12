import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Table,
  message,
  Row,
  Col,
} from "antd";
import {
  useAddpackageMutation,
  useUpdatepackageMutation,
} from "../../redux/api/packageApi";
import {
  useGetAdminTestFormQuery,
  useGettestFormQuery,
} from "../../redux/api/testFormApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { useGetCategoryListQuery } from "../../redux/api/categoryApi";
import { useAuth } from "../../context/AuthContext";
import { useGetmasterPanelApiQuery } from "../../redux/api/masterPanelApi";

const { Option } = Select;

const PackageForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const editData = location.state || null;

  console.log(editData);

  const { data: category } = useGetCategoryListQuery("");
  const { data: age, isFetching: isLoadingAge } =
    useGetmasterPanelApiQuery("age_data");

  const [form] = Form.useForm();
  const [selectedTests, setSelectedTests] = useState([]);
  const [includedTestsDetails, setIncludedTestsDetails] = useState([]);

  const [addPackage] = useAddpackageMutation();
  const [updatePackage] = useUpdatepackageMutation();

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const { data: testData, isFetching } = useGettestFormQuery({
    searchText,
    page,
    pageSize: 10,
  });

  const { data: adminPackages } = useGetAdminTestFormQuery({
    searchText,
    page,
    pageSize: 10,
  });
  console.log(adminPackages);
  const testList = adminPackages?.response?.testForms ?? [];
  console.log(testList);
  const total = adminPackages?.response?.pagination?.totalCount ?? 0;

  // 🧩 When editing — prefill form and only keep test IDs
  useEffect(() => {
    if (editData) {
      console.log(editData);

      const includedTestIds = editData.includedTests?.map((t) =>
        typeof t === "object" ? t._id : t
      );
      setSelectedTests(includedTestIds || []);

      setIncludedTestsDetails(editData.includedTests || []);

      form.setFieldsValue({
        ...editData,
        includedTests: includedTestIds,
        category: editData?.category?._id || undefined,
      });
    }
  }, [editData]);

  console.log(selectedTests);
  // console.log(packageList)

  const allSelected =
    testList.length > 0 &&
    testList.every((test) => selectedTests.includes(test._id));

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      // Select all test IDs and objects
      const allTestIds = testList.map((test) => test._id);
      setSelectedTests(allTestIds);
      setIncludedTestsDetails(testList);
    } else {
      // Deselect all
      setSelectedTests([]);
      setIncludedTestsDetails([]);
    }
  };

  // 💾 Save handler
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Always send only IDs
      const payload = {
        ...values,
        includedTests: selectedTests.map((t) =>
          typeof t === "object" ? t._id : t
        ),
        labId: user?._id,
      };

      if (editData) {
        await updatePackage({ id: editData._id, body: payload }).unwrap();
        toast.success("Package updated successfully");
      } else {
        await addPackage(payload).unwrap();
        toast.success("Package added successfully");
      }

      navigate("/packages");
    } catch (err) {
      console.error("Save error:", err);

      // Handle validation or custom API error response
      if (err?.data?.message) {
        // Case 1: Message is an array of validation errors
        if (Array.isArray(err.data.message)) {
          err.data.message.forEach((msg) => {
            toast.error(`${msg.field ? msg.field + ": " : ""}${msg.message}`);
          });
        }
        // Case 2: Message is a string
        else if (typeof err.data.message === "string") {
          toast.error(err.data.message);
        }
        // Case 3: Fallback message
        else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        // Handle client-side or network error
        toast.error("Failed to save. Check all fields or your connection.");
      }
    }
  };

  const handleRemoveSelectedTest = (id) => {
    setSelectedTests((prev) => prev.filter((t) => t !== id));
    setIncludedTestsDetails((prev) => prev.filter((t) => t._id !== id));
  };

  const handleCheckboxChange = (checked, test) => {
    if (checked) {
      if (!selectedTests.includes(test._id)) {
        setSelectedTests((prev) => [...prev, test._id]);
        setIncludedTestsDetails((prev) => [...prev, test]);
      }
    } else {
      handleRemoveSelectedTest(test._id);
    }
  };

  // 🧮 Table Columns
  const columns = [
    {
      title: "Select",
      dataIndex: "_id",
      render: (id, record) => (
        <input
          type="checkbox"
          checked={selectedTests.includes(id)}
          onChange={(e) => handleCheckboxChange(e.target.checked, record)}
        />
      ),
    },

    { title: "Test Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={editData ? "Edit Package" : "Add Package"} />

      {/* 🔙 Back button */}
      <div className="mb-4">
        <Button onClick={() => navigate("/packages")}>
          ← Back to Packages
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ prescriptionRequired: false }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="Package Title"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter package name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select placeholder="Select category" allowClear>
                {category?.response?.map((cat) => (
                  <Option key={cat} value={cat?._id}>
                    {cat?.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            {" "}
            <Form.Item
              name="collectionType"
              label="Collection Type"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select collection type">
                <Option value="Home Collection">Home Collection</Option>
                <Option value="Lab Visit">Lab Visit</Option>
                <Option value="Both">Both</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="reportTime"
              label="Report Time"
              rules={[{ message: "Please input report time" }]}
            >
              <Input placeholder="e.g. 24 hrs" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="description" />
            </Form.Item>
          </Col>
          <Col span={12}>
            {" "}
            <Form.Item
              name="age"
              label="Age Group"
              rules={[{ required: true, message: "Select age group" }]}
            >
              <Select placeholder="Select age group" allowClear>
                {age?.response?.setting?.ageRelatedData.map((age) => (
                  <Option key={age.id} value={age.title}>
                    {age.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <InputNumber prefix="₹" style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="discountPrice" label="Discount Price">
              <InputNumber prefix="₹" style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="searchparams"
          label="Search (Tags)"
          rules={[{ required: false }]}
        >
          <Select
            mode="tags"
            placeholder="Add tags"
            style={{ width: "100%" }}
            tokenSeparators={[","]}
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="prescriptionRequired"
          label="Prescription Required"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* Slected Tests */}
        <h3 className="font-semibold mb-2">Selected Tests</h3>

        {includedTestsDetails.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {includedTestsDetails.map((test) => (
              <div
                key={test._id}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full border"
              >
                <span>{test.title}</span>
                <Button
                  size="small"
                  danger
                  onClick={() => handleRemoveSelectedTest(test._id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No tests selected yet</p>
        )}

        <h3 className="font-semibold mb-2">Select Tests</h3>

        <Input.Search
          placeholder="Search tests..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="mb-3"
        />

        {/* Select All Checkbox */}
        <div style={{ marginBottom: 8 }}>
          <input
            type="checkbox"
            id="selectAll"
            checked={allSelected}
            onChange={handleSelectAllChange}
          />
          <label
            htmlFor="selectAll"
            style={{ marginLeft: 8, userSelect: "none" }}
          >
            Select All
          </label>
        </div>

        <Table
          columns={columns}
          dataSource={testList}
          loading={isFetching}
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: (p) => setPage(p),
          }}
          rowKey="_id"
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={() => navigate("/packages")}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            {editData ? "Update Package" : "Add Package"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PackageForm;
