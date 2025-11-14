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
  useGetActiveAdminPackageQuery,
  useUpdatepackageMutation,
} from "../../redux/api/packageApi";
import {
  useAddtestFormMutation,
  useGetAdminTestFormQuery,
  useGettestFormQuery,
} from "../../redux/api/testFormApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import { useGetCategoryListQuery } from "../../redux/api/categoryApi";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";

const { Option } = Select;

const AssignTestForm = () => {
  const { isExpanded, isHovered } = useSidebar();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [selectedTests, setSelectedTests] = useState([]);
  const [includedTestsDetails, setIncludedTestsDetails] = useState([]);

  console.log(selectedTests);

  const [addtestForm] = useAddtestFormMutation();
  const [updatePackage] = useUpdatepackageMutation();

  const [searchText, setSearchText] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: AdminTestForm, isFetching } = useGetAdminTestFormQuery({
    searchText,
    page,
    pageSize,
  });
  // console.log(AdminTestForm);

  const packageList = AdminTestForm?.response?.testForms ?? [];

  // console.log(packageList.length);
  const total = AdminTestForm?.response?.pagination?.totalCount ?? 0;

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

      const payload = {
        labId: user?._id,
        // packageId: "68f27ae452211bb4fcdc872f",
        testId: selectedTests.map((t) => (typeof t === "object" ? t._id : t)),
      };

      console.log(payload);

      await addtestForm(payload).unwrap();
      toast.success("Test added successfully");
      navigate("/test-form");
      //   navigate("/packages");
    } catch (err) {
      console.error("Save error:", err);

      if (err?.data?.message) {
        if (Array.isArray(err.data.message)) {
          err.data.message.forEach((msg) => {
            toast.error(`${msg.field ? msg.field + ": " : ""}${msg.message}`);
          });
        } else if (typeof err.data.message === "string") {
          toast.error(err.data.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
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
    {
      title: "Test Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Category",
      dataIndex: ["categoryId", "name"],
      key: "category",
    },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",
    //   render: (text) => text || "-",
    // },
    {
      title: "Recommended Gender",
      dataIndex: "recommendedGender",
      key: "recommendedGender",
    },
    {
      title: "Collection Type",
      dataIndex: "collectionType",
      key: "collectionType",
    },
    {
      title: "Prescription Required",
      dataIndex: "prescriptionRequired",
      key: "prescriptionRequired",
      render: (val) => (val ? "Yes" : "No"),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Discount Price",
      dataIndex: "discountPrice",
      key: "discountPrice",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val) => (val ? "Active" : "Inactive"),
    },
  ];

  return (
    <div
      style={{
        marginLeft: isExpanded || isHovered ? 0 : 0,
        width: isExpanded || isHovered ? "1180px" : "",
      }}
    >
      <PageBreadcrumb pageTitle={"Assign Tests"} />

      {/* 🔙 Back button */}
      <div className="mb-4 gap-4 flex justify-between">
        <Button onClick={() => navigate("/test-form")}>← Back to Test</Button>
        <Button
          type="primary"
          danger
          onClick={() => alert("Still to implementd")}
        >
          + Assign All Tests ({total})
        </Button>
      </div>

      <Form form={form} layout="vertical">
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
            Select All Given Below
          </label>
        </div>

        <Table
          columns={columns}
          dataSource={packageList}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "25", "50", "100"],
          }}
          scroll={{ x: 1000 }}
          loading={isFetching}
          onChange={(pagination) => {
            setPage(pagination.current);
            setPageSize(pagination.pageSize);
          }}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={() => navigate("/packages")}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            {"Assign Tests"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AssignTestForm;
