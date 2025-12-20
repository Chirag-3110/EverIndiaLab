import { Button, Form, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  useAddNewAddressMutation,
  useEditAddressMutation,
} from "../../../../redux/api/addressApi";
import { Autocomplete } from "@react-google-maps/api";

export const AddEditAddressForm = ({
  userId,
  initialData,
  onCancel,
  onSaved,
}) => {
  const [form] = Form.useForm();
  const [addNewAddress] = useAddNewAddressMutation();
  const [editAddress] = useEditAddressMutation();

  const autocompleteRef = useRef<any>(null);

  const [location, setLocation] = useState({
    lat: initialData?.latitude || 0,
    lng: initialData?.longitude || 0,
  });

  const [locationText, setLocationText] = useState(
    initialData?.description || ""
  );

  /* ---------- Prefill on Edit ---------- */
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        houseNo: initialData.houseNo,
        streetName: initialData.streetName,
        landmark: initialData.landmark,
        postalCode: initialData.postalCode,
      });

      setLocation({
        lat: initialData.latitude,
        lng: initialData.longitude,
      });

      setLocationText(initialData.description);
    }
  }, [initialData]);

  /* ---------- When place selected ---------- */
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry) return;

    setLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });

    setLocationText(place.formatted_address);
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (values) => {
    if (!locationText || !location.lat || !location.lng) {
      toast.error("Please select address from Google suggestions");
      return;
    }

    const payload = {
      userId,
      addressType: "normal",
      houseNo: values.houseNo,
      streetName: values.streetName,
      landmark: values.landmark,
      description: locationText,
      latitude: location.lat,
      longitude: location.lng,
      postalCode: values.postalCode || "",
      ...(initialData && { id: initialData._id }),
    };

    const res = initialData
      ? await editAddress(payload).unwrap()
      : await addNewAddress(payload).unwrap();

    toast.success(
      initialData
        ? "Address updated successfully"
        : "Address added successfully"
    );

    // onSaved?.(res.response);
    onCancel();
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      {/* -------- Google Location -------- */}
      <Form.Item label="Search Location" required>
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={onPlaceChanged}
        >
          <Input
            placeholder="Search location on Google"
            value={locationText}
            onChange={(e) => {
              setLocationText(e.target.value);
              setLocation({ lat: 0, lng: 0 }); // invalidate until selected
            }}
          />
        </Autocomplete>
      </Form.Item>

      {/* -------- Address Fields -------- */}
      <Form.Item name="houseNo" label="House No" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="streetName"
        label="Street / Apartment"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="landmark" label="Landmark">
        <Input />
      </Form.Item>

      <Form.Item name="postalCode" label="Postal Code">
        <Input />
      </Form.Item>

      {/* -------- Buttons -------- */}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Save Address
        </Button>
      </div>
    </Form>
  );
};
