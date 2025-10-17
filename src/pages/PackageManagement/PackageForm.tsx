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
import { useGettestFormQuery } from "../../redux/api/testFormApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { useGetCategoryListQuery } from "../../redux/api/categoryApi";

const { Option } = Select;

const PackageForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const editData = location.state || null;

  console.log(editData);

  const { data: category } = useGetCategoryListQuery("");
  // console.log(category?.response);

  const [form] = Form.useForm();
  const [selectedTests, setSelectedTests] = useState([]);

  const [addPackage] = useAddpackageMutation();
  const [updatePackage] = useUpdatepackageMutation();

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const { data: testData, isFetching } = useGettestFormQuery({
    searchText,
    page,
    pageSize: 10,
  });

  const testList = testData?.response?.testForms ?? [];
  const total = testData?.response?.pagination?.totalCount ?? 0;

  // 🧩 When editing — prefill form and only keep test IDs
  useEffect(() => {
    if (editData) {
      const includedTestIds = editData.includedTests?.map((t) =>
        typeof t === "object" ? t._id : t
      );

      form.setFieldsValue({
        ...editData,
        includedTests: includedTestIds,
        category: editData?.category?._id || undefined,
      });

      setSelectedTests(includedTestIds || []);
    }
  }, [editData]);

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

  // 🧮 Table Columns
  const columns = [
    {
      title: "Select",
      dataIndex: "_id",
      render: (id) => (
        <input
          type="checkbox"
          checked={selectedTests.includes(id)}
          onChange={(e) =>
            setSelectedTests((prev) =>
              e.target.checked ? [...prev, id] : prev.filter((t) => t !== id)
            )
          }
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

      <Form form={form} layout="vertical">
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

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

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
          name="prescriptionRequired"
          label="Prescription Required"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <h3 className="font-semibold mb-2">Select Tests</h3>

        <Input.Search
          placeholder="Search tests..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="mb-3"
        />

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
