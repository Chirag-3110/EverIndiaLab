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
  useGettestFormQuery,
  useUnassignedTestformMutation,
} from "../../redux/api/testFormApi";
import { useSidebar } from "../../context/SidebarContext";
import { formatDate } from "../../utils/utils";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const TestFormManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, error, isLoading, refetch } = useGettestFormQuery({
    searchText,
    page,
    pageSize,
  });
  const [unassignedTestform] = useUnassignedTestformMutation();

  const [testForms, setTestForms] = useState([]);
  const total = data?.response?.pagination?.totalCount ?? 0;

  useEffect(() => {
    if (data?.response?.testForms) {
      setTestForms(data.response.testForms);
    }
  }, [data]);

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

  const columns = [
    { title: "Tests", dataIndex: "title", key: "title", minWidth: 150 },
    { title: "Category", dataIndex: "category", key: "category" },

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
          <Popconfirm
            title="Are you sure delete this test form?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Test" />
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button type="primary" onClick={() => navigate("/test-form/assign")}>
            + Assign Test
          </Button>
         
        </div>
        <Table
          columns={columns}
          dataSource={testForms}
          rowKey={(record) => record._id}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "25", "50", "100"],
          }}
          scroll={{ x: 1000 }}
          loading={isLoading}
          onChange={(pagination) => {
            setPage(pagination.current);
            setPageSize(pagination.pageSize);
          }}
        />
      </div>
    </div>
  );
};

export default TestFormManager;
