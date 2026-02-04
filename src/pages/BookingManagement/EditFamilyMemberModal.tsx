import { Modal, Form, Input, Select } from "antd";
import React, { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  member: any | null;
  onSubmit: (values: any) => void;
  loading: boolean;
}

const EditFamilyMemberModal: React.FC<Props> = ({
  open,
  onClose,
  member,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  // 🔁 Prefill form when member changes
  useEffect(() => {
    if (member) {
      form.setFieldsValue({
        name: member.name,
        age: member.age,
        gender: member.gender,
        relation: member.relation,
        phoneNumber: member.phoneNumber?.replace("+91 ", "") || "",
        email: member.email,
      });
    }
  }, [member, form]);

  return (
    <Modal
      title="Edit Family Member"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Update Member"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="age"
          label="Age"
          rules={[{ required: true, message: "Age is required" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="male">Male</Select.Option>
            <Select.Option value="female">Female</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="relation"
          label="Relation"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="self">Self</Select.Option>
            <Select.Option value="father">Father</Select.Option>
            <Select.Option value="mother">Mother</Select.Option>
            <Select.Option value="brother">Brother</Select.Option>
            <Select.Option value="sister">Sister</Select.Option>
            <Select.Option value="spouse">Spouse</Select.Option>
            <Select.Option value="son">Son</Select.Option>
            <Select.Option value="daughter">Daughter</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[
            { pattern: /^[6-9]\d{9}$/, message: "Enter valid phone number" },
          ]}
        >
          <Input maxLength={10} />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFamilyMemberModal;
