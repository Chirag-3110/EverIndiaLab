import { Button, Form, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  useAddNewAddressMutation,
  useEditAddressMutation,
} from "../../../../redux/api/addressApi";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

type Libraries = ("places" | "drawing" | "geometry")[];
const libs: Libraries = ["places"];

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

  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libs,
  });

  /* ---------- Prefill form on edit ---------- */
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        houseNo: initialData.houseNo,
        apartmentName: initialData.streetName,
        landmark: initialData.landmark,
        postalCode: initialData.postalCode,
      });

      setLocation({
        lat: initialData.latitude,
        lng: initialData.longitude,
      });

      setDescription(initialData.description);
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

    setDescription(place.formatted_address);
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (values) => {
    if (!description) {
      toast.error("Please select a location from Google");
      return;
    }

    const payload = {
      userId,
      addressType: "normal",
      houseNo: values.houseNo,
      streetName: values.apartmentName,
      landmark: values.landmark,
      description,
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

    // onSaved(res.response);
    onCancel();
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      {/* -------- Google Location -------- */}
      {isLoaded && (
        <Form.Item label="Search Location" required>
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={onPlaceChanged}
          >
            <Input
              placeholder="Search location on Google Maps"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setLocation({ lat: 0, lng: 0 }); // invalidate until selected
              }}
            />
          </Autocomplete>
        </Form.Item>
      )}

      {/* -------- Address Fields -------- */}
      <Form.Item name="houseNo" label="House No" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="apartmentName"
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
