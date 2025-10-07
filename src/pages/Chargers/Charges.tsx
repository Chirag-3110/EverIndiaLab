import React, { useEffect, useState } from "react";
import { Modal, Button, Input, Form, message, Spin } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  useGetChargesQuery,
  useAddChargesMutation,
} from "../../redux/api/chargeApi";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const Charges = () => {
  const { data: apiCharges, isLoading } = useGetChargesQuery();
  const [addCharges, { isLoading: isSaving }] = useAddChargesMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Modal open: set values from API
  const showModal = () => {
    form.setFieldsValue({
      commission_charge: apiCharges?.data?.commission_charge ?? "",
      farmhouse_charge: apiCharges?.data?.farmhouse_charge ?? "",
    });
    setIsModalOpen(true);
  };

  // Submit handler: send as FormData
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("commission_charge", values.commission_charge);
      formData.append("farmhouse_charge", values.farmhouse_charge);

      await addCharges(formData).unwrap();
      toast.success("Charges updated successfully");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Update failed! Please check values.");
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="p-4">
          <PageBreadcrumb pageTitle="Set Charges" />
          <h1 className="text-xl sm:text-2xl font-semibold my-6">
            Daily Charges Overview
          </h1>

          <div className="flex flex-col sm:flex-row sm:space-x-8 bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <div className="flex flex-col mb-4 sm:mb-0">
              <span className="text-sm font-medium text-gray-600">
                Commission Charge
              </span>
              <span className="mt-1 text-xl sm:text-2xl font-bold text-blue-600">
                ₹ {apiCharges?.data?.commission_charge ?? "—"}
                <span className="text-sm sm:text-base font-normal text-gray-500">
                  / day
                </span>
              </span>
            </div>
            <div className="flex flex-col mb-4 sm:mb-0">
              <span className="text-sm font-medium text-gray-600">
                Farm House Charge
              </span>
              <span className="mt-1 text-xl sm:text-2xl font-bold text-blue-600">
                ₹ {apiCharges?.data?.farmhouse_charge ?? "—"}
                <span className="text-sm sm:text-base font-normal text-gray-500">
                  / day
                </span>
              </span>
            </div>
            <div className="sm:ml-auto self-center">
              <Button
                type="primary"
                size="middle"
                onClick={showModal}
                className="w-full sm:w-auto"
              >
                Edit Charges
              </Button>
            </div>
          </div>

          <Modal
            title="Set Charges"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={() => setIsModalOpen(false)}
            okText={isSaving ? <Spin /> : "Save"}
            cancelText="Cancel"
            centered
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                commission_charge: "",
                farmhouse_charge: "",
              }}
            >
              <Form.Item
                label="Set Commission Charges (₹/day)"
                name="commission_charge"
                rules={[
                  { required: true, message: "Please enter commission charge" },
                  {
                    type: "number",
                    min: 0,
                    message: "Charge must be a positive number",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" placeholder="Enter commission charge" />
              </Form.Item>
              <Form.Item
                label="Set Farm House Charge (₹/day)"
                name="farmhouse_charge"
                rules={[
                  { required: true, message: "Please enter farm house charge" },
                  {
                    type: "number",
                    min: 0,
                    message: "Charge must be a positive number",
                    transform: (value) => Number(value),
                  },
                ]}
              >
                <Input type="number" placeholder="Enter farm house charge" />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default Charges;
