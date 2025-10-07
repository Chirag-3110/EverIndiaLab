import { Modal, Form, Input, Switch, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const AddPropertyModal = ({ open, onCancel, onAdd }: any) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onAdd({ ...values, image: imageUrl || "" });
        form.resetFields();
        setImageUrl("");
        onCancel();
      })
      .catch(() => {});
  };

  return (
    <Modal
      title="Add New Property"
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Property Name"
          rules={[{ required: true, message: "Please enter property name" }]}
        >
          <Input placeholder="Enter property name" />
        </Form.Item>

        <Form.Item
          name="owner"
          label="Owner Name"
          rules={[{ required: true, message: "Please enter owner name" }]}
        >
          <Input placeholder="Enter owner name" />
        </Form.Item>

        <Form.Item name="location" label="Location">
          <Input placeholder="Enter city" />
        </Form.Item>

        <Form.Item name="address" label="Address">
          <Input.TextArea placeholder="Enter full address" rows={3} />
        </Form.Item>

        <div className="flex items-center gap-4">
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="highlighted"
            label="Highlighted"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <Form.Item label="Upload Image">
          <Upload
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => setImageUrl(e.target?.result as string);
              reader.readAsDataURL(file);
              return false; // prevent auto upload
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
            Add Property
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddPropertyModal;
