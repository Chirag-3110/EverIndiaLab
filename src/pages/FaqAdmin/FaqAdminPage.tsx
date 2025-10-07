import React, { useState } from "react";
import { Table, Modal, Form, Input, Button, Switch, Popconfirm } from "antd";
import {
  useGetfaqQuery,
  useAddfaqMutation,
  useUpdatefaqMutation,
  useDeletefaqMutation,
  useUpdatefaqStatusMutation,
} from "../../redux/api/faqApi";
import { toast } from "react-toastify";

export default function FaqAdminPage() {
  // RTK API hooks
  const { data, isLoading, refetch } = useGetfaqQuery({});
  const [addFaq] = useAddfaqMutation();
  const [updateFaq] = useUpdatefaqMutation();
  const [deleteFaq] = useDeletefaqMutation();
  const [updateFaqStatus] = useUpdatefaqStatusMutation();

  // Modal logic
  const [modalOpen, setModalOpen] = useState(false);
  const [editFaq, setEditFaq] = useState(null);

  const [form] = Form.useForm();

  // Modal: open for adding or editing
  const openModal = (faq = null) => {
    setEditFaq(faq);
    setModalOpen(true);
    if (faq) {
      form.setFieldsValue({ question: faq.question, answer: faq.answer });
    } else {
      form.resetFields();
    }
  };

  // Modal: handle add or update
  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (editFaq) {
      await updateFaq({ body: { ...editFaq, ...values } });
      toast.success("FAQ updated");
    } else {
      await addFaq(values);
      toast.success("FAQ added");
    }
    setModalOpen(false);
    setEditFaq(null);
    refetch();
  };

  // Delete FAQ
  const handleDelete = async (id) => {
    await deleteFaq(id);
    toast.success("FAQ deleted");
    refetch();
  };

  // Change Status
  const handleStatusChange = async (faq) => {
    await updateFaqStatus({ body: { faqId: faq._id, status: !faq.status } });
    toast.success("Status updated");
    refetch();
  };

  // Table columns
  const columns: any[] = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      render: (txt) => <span className="text-gray-800">{txt}</span>,
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      render: (txt) => <span className="text-gray-600">{txt}</span>,
    },
    {
      title: "Active",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (val, faq) => (
        <Switch
          checked={val}
          onChange={() => handleStatusChange(faq)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          className="bg-[#07868D]"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, faq) => (
        <div className="flex gap-2 justify-center">
          <Button
            type="link"
            className="text-[#07868D]"
            onClick={() => openModal(faq)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete FAQ?"
            onConfirm={() => handleDelete(faq._id)}
            okButtonProps={{ className: "bg-green-600 text-white" }}
            cancelButtonProps={{ className: "bg-gray-300" }}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          FAQ Management
        </h1>
        <p className="text-gray-500">
          Add, update, enable/disable, or delete FAQs for your platform.
        </p>
        <Button
          className="bg-[#07868D] text-white font-semibold mt-4 max-w-xs"
          onClick={() => openModal()}
        >
          Add FAQ
        </Button>
      </div>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={data?.response || []}
        pagination={{ position: ["bottomCenter"], pageSize: 8 }}
        bordered
      />

      <Modal
        open={modalOpen}
        title={editFaq ? "Edit FAQ" : "Add FAQ"}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        okButtonProps={{
          className: "bg-[#07868D] text-white font-semibold hover:bg-[#079999]",
        }}
        cancelButtonProps={{ className: "bg-gray-300" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Question"
            name="question"
            rules={[{ required: true, message: "Enter FAQ question" }]}
          >
            <Input placeholder="FAQ Question" autoFocus />
          </Form.Item>
          <Form.Item
            label="Answer"
            name="answer"
            rules={[{ required: true, message: "Enter FAQ answer" }]}
          >
            <Input.TextArea rows={3} placeholder="FAQ Answer" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
