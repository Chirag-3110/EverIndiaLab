import React, { useState } from "react";
import {
  Button,
  Table,
  Modal,
  Input,
  Select,
  DatePicker,
  Space,
  message,
} from "antd";
import moment from "moment";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useGetemailQuery } from "../../redux/api/emailApi";

const { Option } = Select;

const dummyUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com" },
  { id: 2, name: "Bob Smith", email: "bob@example.com" },
  { id: 3, name: "Charlie Davis", email: "charlie@example.com" },
  { id: 4, name: "Diana Evans", email: "diana@example.com" },
];

// Utility: strip html tags to plain text
function stripHtml(html = "") {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

const Mail = () => {
  // Email notifications sent history
  const { data, isLoading } = useGetemailQuery({});
  const [emailHistory, setEmailHistory] = useState([]);

  // Compose modal
  const [modalVisible, setModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    time: null,
    audienceType: "all",
    selectedUsers: [],
  });

  // View modal
  const [viewItem, setViewItem] = useState(null);

  const openModal = () => {
    setFormValues({
      title: "",
      description: "",
      time: null,
      audienceType: "all",
      selectedUsers: [],
    });
    setModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // Simulate send email function (replace with real email API)
  const sendEmail = async (email, subject, body) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Email sent to ${email} with subject "${subject}"`);
        resolve(true);
      }, 500);
    });
  };

  const submitEmailNotification = async () => {
    if (!formValues.title.trim() || !formValues.description.trim()) {
      message.error("Title and description are required.");
      return;
    }
    if (
      formValues.audienceType === "individual" &&
      formValues.selectedUsers.length === 0
    ) {
      message.error("Please select at least one user.");
      return;
    }

    // Determine recipient emails
    const recipients =
      formValues.audienceType === "all"
        ? dummyUsers.map((u) => u.email)
        : dummyUsers
            .filter((u) => formValues.selectedUsers.includes(u.id))
            .map((u) => u.email);

    try {
      // Immediate send simulation
      for (const email of recipients) {
        await sendEmail(email, formValues.title, formValues.description);
      }

      setEmailHistory((prev) => [
        {
          id: Date.now(),
          title: formValues.title,
          description: formValues.description,
          time: formValues.time || moment(),
          audience:
            formValues.audienceType === "all"
              ? "All Users"
              : dummyUsers
                  .filter((u) => formValues.selectedUsers.includes(u.id))
                  .map((u) => u.name)
                  .join(", "),
        },
        ...prev,
      ]);
      message.success("Email notification sent successfully.");
      setModalVisible(false);
    } catch (error) {
      message.error("Failed to send email notification.");
    }
  };

  const columns: any[] = [
    { title: "email", dataIndex: "email", key: "email", minWidth: 180 },
    { title: "Title", dataIndex: "title", key: "title", minWidth: 180 },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Sent Time",
      dataIndex: "time",
      key: "time",
      render: (time) => moment(time).format("YYYY-MM-DD HH:mm"),
      minWidth: 180,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_txt, record) => (
        <Button
          type="link"
          className="text-[#07868D] font-bold"
          onClick={() => setViewItem(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <PageBreadcrumb pageTitle="Mail History" />
      {/* <Button type="primary" style={{ marginBottom: 16 }} onClick={openModal}>
        Send New Email Notification
      </Button> */}

      <Table
        columns={columns}
        dataSource={data?.response?.logs}
        rowKey="id"
        pagination={{
          pageSizeOptions: ["25", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 15,
        }}
        scroll={{ x: 1000 }}
        loading={isLoading}
      />

      {/* Email Compose Modal */}
      <Modal
        title="Send Email Notification"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={submitEmailNotification}
        okText="Send Email"
      >
        <Input
          placeholder="Title"
          value={formValues.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Input.TextArea
          placeholder="Description"
          value={formValues.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
          style={{ marginBottom: 12 }}
        />
        <DatePicker
          showTime
          placeholder="Select time (optional, immediate send if not set)"
          value={formValues.time}
          onChange={(value) => handleInputChange("time", value)}
          style={{ width: "100%", marginBottom: 12 }}
        />

        <Select
          value={formValues.audienceType}
          onChange={(value) => handleInputChange("audienceType", value)}
          style={{ width: "100%", marginBottom: 12 }}
        >
          <Select.Option value="all">All Users</Select.Option>
          <Select.Option value="individual">Individual User(s)</Select.Option>
        </Select>
      </Modal>

      {/* View Email Modal */}
      <Modal
        title={`Email Details`}
        open={!!viewItem}
        footer={null}
        onCancel={() => setViewItem(null)}
      >
        {viewItem && (
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-600">Email:&nbsp;</span>
              <span>{viewItem.email}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Title:&nbsp;</span>
              <span>{viewItem.title}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Type:&nbsp;</span>
              <span>{viewItem.type}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">
                Sent Time:&nbsp;
              </span>
              <span>{moment(viewItem.time).format("YYYY-MM-DD HH:mm")}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Description:</span>
              <div>
                <span className="font-semibold text-gray-600">
                  Description:
                </span>
                <div
                  className="border rounded p-2 mt-1 bg-gray-50"
                  style={{ fontSize: 14 }}
                  dangerouslySetInnerHTML={{
                    __html: viewItem.content ?? viewItem.description,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Mail;
