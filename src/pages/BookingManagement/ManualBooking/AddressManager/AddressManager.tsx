import { useState } from "react";
import {
  useDeleteAddressMutation,
  useGetAddressListQuery,
} from "../../../../redux/api/addressApi";
import { Button, Radio, Space } from "antd";
import { AddEditAddressForm } from "./AddEditAddressForm";

export const AddressManager = ({ userId, selectedAddressId, onSelect }) => {
  const { data, isLoading } = useGetAddressListQuery(userId);
  const [deleteAddress] = useDeleteAddressMutation();

  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [selectedId, setSelectedId] = useState(selectedAddressId);

  const addresses = data?.response?.addresses || [];

  return (
    <>
      {!showForm ? (
        <>
          {/* Address List */}
          <Radio.Group
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="border rounded-md p-3 flex justify-between"
                >
                  <Radio value={addr._id}>
                    {addr.houseNo}, {addr.streetName}
                    <div className="text-xs text-gray-500">
                      {addr.description}
                    </div>
                  </Radio>

                  <div className="flex gap-2">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditAddress(addr);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => deleteAddress(addr._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </Space>
          </Radio.Group>

          <div className="flex justify-between mt-4">
            <Button type="dashed" onClick={() => setShowForm(true)}>
              + Add New Address
            </Button>

            <Button
              type="primary"
              disabled={!selectedId}
              onClick={() =>
                onSelect(addresses.find((a) => a._id === selectedId))
              }
            >
              Confirm Address
            </Button>
          </div>
        </>
      ) : (
        <AddEditAddressForm
          userId={userId}
          initialData={editAddress}
          onCancel={() => {
            setShowForm(false);
            setEditAddress(null);
          }}
          onSaved={(addr) => {
            setSelectedId(addr._id);
            onSelect(addr); // auto select newly added/edited
          }}
        />
      )}
    </>
  );
};
