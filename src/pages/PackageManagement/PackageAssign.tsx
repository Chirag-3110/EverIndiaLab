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
  useAssignpackageMutation,
  useGetActiveAdminPackageQuery,
  useUpdatepackageMutation,
} from "../../redux/api/packageApi";
import { useGettestFormQuery } from "../../redux/api/testFormApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { useGetCategoryListQuery } from "../../redux/api/categoryApi";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const PackageAssign = () => {
  const { user } = useAuth();
  console.log("ajksdk", user);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const editData = location.state || null;

  console.log(editData);

  const { data: category } = useGetCategoryListQuery("");
  const { data: AdminPackages } = useGetActiveAdminPackageQuery("");
  console.log(AdminPackages);

  const [form] = Form.useForm();
  const [selectedTests, setSelectedTests] = useState([]);
  const [includedTestsDetails, setIncludedTestsDetails] = useState([]);

  const [assignpackage] = useAssignpackageMutation();
  const [updatePackage] = useUpdatepackageMutation();

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const { data: testData, isFetching } = useGettestFormQuery({
    searchText,
    page,
    pageSize: 10,
  });

  const packageList = AdminPackages?.response?.packages ?? [];
  console.log(packageList);
  const total = packageList.length ?? 0;

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

  console.log("lab ID : ", user?._id);

  // console.log(selectedTests);
  // console.log(packageList)

  const allSelected =
    packageList.length > 0 &&
    packageList.every((test) => selectedTests.includes(test._id));

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      // Select all test IDs and objects
      const allTestIds = packageList.map((test) => test._id);
      setSelectedTests(allTestIds);
      setIncludedTestsDetails(packageList);
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
        labId: user?._id,
        // packageId: "68f27ae452211bb4fcdc872f",
        packageId: selectedTests.map((t) =>
          typeof t === "object" ? t._id : t
        ),
      };

      console.log(payload);

      await assignpackage(payload).unwrap();
      toast.success("Package added successfully");
      navigate("/packages");

      //   navigate("/packages");
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
    { title: "Package Title", dataIndex: "title", key: "title" },
    {
      title: "Category",
      dataIndex: ["category", "name"], // access category.name safely
      key: "category",
    },
    { title: "Price", dataIndex: "price", key: "price" },
    {
      title: "Discount Price",
      dataIndex: "discountPrice",
      key: "discountPrice",
    },
  ];

  // ✅ Columns for expanded "includedTests" view
  const includedTestsColumns = [
    {
      title: "Test Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Recommended Gender",
      dataIndex: "recommendedGender",
      key: "recommendedGender",
    },
    {
      title: "Report Time",
      dataIndex: "reportTime",
      key: "reportTime",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
  ];
  return (
    <div>
      <PageBreadcrumb pageTitle={"Assign Package"} />

      {/* 🔙 Back button */}
      <div className="mb-4">
        <Button onClick={() => navigate("/packages")}>
          ← Back to Packages
        </Button>
      </div>

      <Form form={form} layout="vertical">
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
          dataSource={[...packageList].reverse()}
          rowKey="_id"
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={includedTestsColumns}
                dataSource={record.includedTests}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            ),
            rowExpandable: (record) =>
              Array.isArray(record.includedTests) &&
              record.includedTests.length > 0,
          }}
          pagination={{ pageSize: 5 }}
          bordered
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={() => navigate("/packages")}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            {"Assign Package"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PackageAssign;
