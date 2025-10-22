import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Select,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "react-toastify";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryListQuery,
  useGetlabDetailsQuery,
  useUpdateCategoryMutation,
} from "../../redux/api/categoryApi";

const CategoryManagement = () => {
  // Get list of categories
  const { data, isLoading } = useGetCategoryListQuery({});
  const { data: labDetail, isLoading: labLoading } = useGetlabDetailsQuery({});
  // console.log(labDetail?.response?.lab?.category);

  const [category, setCategory] = useState([]);
  console.log(category);

  useEffect(() => {
    if (data?.response && labDetail?.response?.lab?.category) {
      const labCategoryIds = labDetail.response.lab.category.map(
        (cat) => cat._id
      );

      const filteredCategories = data.response.filter(
        (cat) => !labCategoryIds.includes(cat._id)
      );

      setCategory(filteredCategories);
    } else if (data?.response) {
      setCategory(data.response);
    }
  }, [data, labDetail]);

  // Mutations
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // State and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form] = Form.useForm();

  // Open modal and load selected categories for editing
  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    form.setFieldsValue({
      selectedCategories: category.categoryIds || [],
      categoryImage: null,
    });
  };

  // Close modal and reset form
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleAddOrUpdate = async () => {
    try {
      const values = await form.validateFields();

      const labCategoryIds =
        labDetail?.response?.lab?.category?.map((cat) => cat._id) || [];

      const combinedCategoryIds = [
        ...new Set([...(values.selectedCategories || []), ...labCategoryIds]),
      ];

      const payload = {
        category: combinedCategoryIds,
      };

      if (values.categoryImage?.file) {
        const formData = new FormData();
        formData.append("category", JSON.stringify(values.selectedCategories));
        formData.append("categoryImage", values.categoryImage.file);

        if (editingCategory) {
          formData.append("id", editingCategory._id);
          await updateCategory(formData).unwrap();
          toast.success("Category Updated Successfully!");
        } else {
          await createCategory(formData).unwrap();
          toast.success("Category Added Successfully!");
        }
      } else {
        if (editingCategory) {
          const updatePayload = { id: editingCategory._id, ...payload };
          await updateCategory(updatePayload).unwrap();
          toast.success("Category Updated Successfully!");
        } else {
          await createCategory(payload).unwrap();
          toast.success("Category Added Successfully!");
        }
      }

      handleCancel();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  // Delete category
  const handleDelete = async (idToExclude: string) => {
    const categories = labDetail?.response?.lab?.category;

    if (!categories || !Array.isArray(categories)) {
      console.log("No categories found or invalid format");
      return;
    }

    const remainingIdsArray = categories
      .map((cat: any) => (typeof cat === "object" ? cat.id || cat._id : cat))
      .filter((id: string) => id && id !== idToExclude);

    const payload = {
      category: remainingIdsArray,
    };
    await updateCategory(payload).unwrap();
    console.log("Payload for API:", payload);
    toast.success("Category Deleted Successfully!");
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <div>
          <strong>{text}</strong>
        </div>
      ),
      width:400
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (img: string) =>
        img ? (
          <img
            src={img}
            alt="category"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", gap: 8 }}>
          {/* <Button
            style={{ backgroundColor: "#07868D", color: "white" }}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button> */}
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleDelete(record._id || record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button style={{ backgroundColor: "#07868D", color: "white" }}>
              Remove
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Category Management" />

      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          style={{ backgroundColor: "#07868D", borderColor: "#07868D" }}
          onClick={() => setIsModalOpen(true)}
        >
          Choose Categories
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={labDetail?.response?.lab?.category || []}
        rowKey={(record: any) => record._id || record.id}
        pagination={{
          pageSizeOptions: ["25", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 15,
        }}
        scroll={{ x: 1000 }}
        loading={isLoading}
      />

      <Modal
        title={
          editingCategory ? "Edit Category Selection" : "Choose Categories"
        }
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleAddOrUpdate}
        okText={editingCategory ? "Update" : "Save"}
        okButtonProps={{
          style: {
            backgroundColor: "#07868D",
            borderColor: "#07868D",
            color: "white",
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="selectedCategories"
            label="Select Categories"
            rules={[
              {
                required: true,
                message: "Please select at least one category",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select categories"
              options={(category || []).map((cat: any) => ({
                label: cat.name,
                value: cat._id,
              }))}
              allowClear
            />
          </Form.Item>

          {/* <Form.Item
            name="categoryImage"
            label="Category Image"
            valuePropName="file"
            getValueFromEvent={(e) => e}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button
                icon={<UploadOutlined />}
                style={{ backgroundColor: "#07868D", color: "white" }}
              >
                Upload Image
              </Button>
            </Upload>
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
