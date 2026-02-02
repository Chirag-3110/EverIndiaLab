import React, { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useGettestFormQuery } from "../../../redux/api/testFormApi";
import { useGetpackageQuery } from "../../../redux/api/packageApi";
import { useGetCouponQuery } from "../../../redux/api/couponApi";
import {
  useAddGetManualUserFinalBookingDetailsMutation,
  useAddGetManualUserPreBookingDetailsMutation,
} from "../../../redux/api/manualApi";
import {
  Tabs,
  Table,
  Input,
  Button,
  Modal,
  Select,
  Upload,
  DatePicker,
  Tag,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/utils";
import { useGetlabsQuery } from "../../../redux/api/labsApi";
import { useGetmasterPanelApiQuery } from "../../../redux/api/masterPanelApi";
import { AddressManager } from "./AddressManager/AddressManager";
import dayjs from "dayjs";
import { useGetdrQuery } from "../../../redux/api/drApi";
import { useAuth } from "../../../context/AuthContext";

const { Option } = Select;

/* ================= COMPONENT ================= */

const disablePastDates = (current) => {
  return current && current < dayjs().startOf("day");
};

const AddBookingItems = () => {
  const { user } = useAuth();
  console.log(user);
  const navigate = useNavigate();
  const { state } = useLocation();

  const USER_ID = state?.userId;
  const familyMemberId = state?.familyMemberId;
  const familyMember = state?.familyMember;

  /* ---------------- STATES ---------------- */
  const [activeTab, setActiveTab] = useState("test");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  const [bookingItems, setBookingItems] = useState<any[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [selectedDRId, setSelectedDRId] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<"normal" | "walkin" | null>(
    null
  );

  const [transactionId, setTransactionId] = useState("");
  const [transactionImage, setTransactionImage] = useState<File | null>(null);
  const [paymentMode, setPaymentMode] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [manualCoupon, setManualCoupon] = useState("");
  const [couponSearch, setCouponSearch] = useState("");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [preBookingAmount, setPreBookingAmount] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<any>(null);

  /* ---------------- API ---------------- */

  const { data: testRes, isFetching: testLoading } = useGettestFormQuery({
    searchText,
    page,
    pageSize,
  });

  const { data: packageRes, isFetching: packageLoading } = useGetpackageQuery({
    searchText,
    page,
    pageSize,
  });

  const { data: couponRes, isFetching: couponLoading } = useGetCouponQuery("");

  const {
    data: LabList,
    isFetching: labLoading,
    isFetching,
  } = useGetlabsQuery("");
  const { data: drList, isFetching: drLoading } = useGetdrQuery({});

  const { data: TimeSlotList, refetch } =
    useGetmasterPanelApiQuery("time_slots");

  const timeToMinutes = (timeStr) => {
    const date = new Date(`1970-01-01 ${timeStr}`);
    return date.getHours() * 60 + date.getMinutes();
  };
  const now = new Date();
  const bufferMinutes = 60;
  const currentWithBuffer =
    now.getHours() * 60 + now.getMinutes() + bufferMinutes;
  const futureSlots =
    TimeSlotList?.response?.setting?.timeSlots?.filter((slot) => {
      return timeToMinutes(slot.startTime) > currentWithBuffer;
    }) || [];

  const isTodaySelected = selectedDate
    ? dayjs(selectedDate).isSame(dayjs(), "day")
    : false;

  const allSlots = TimeSlotList?.response?.setting?.timeSlots || [];

  const visibleSlots = isTodaySelected ? futureSlots : allSlots;

  const [fetchPreBooking, { isLoading: preLoading }] =
    useAddGetManualUserPreBookingDetailsMutation();

  const [finalBooking, { isLoading: finalLoading }] =
    useAddGetManualUserFinalBookingDetailsMutation();

  /* ---------------- TABLE COLUMNS ---------------- */

  const testColumns = [
    { title: "Test Name", dataIndex: "title" },
    { title: "Price", dataIndex: "price" },
    { title: "Discount Price", dataIndex: "discountPrice" },
  ];

  const packageColumns = [
    { title: "Package Name", dataIndex: "title" },
    { title: "Price", dataIndex: "price" },
    { title: "Discount Price", dataIndex: "discountPrice" },
  ];

  const couponColumns = [
    { title: "Coupon Code", dataIndex: "code" },
    {
      title: "Discount",
      render: (_: any, r: any) =>
        r.discountType === "percentage"
          ? `${r.discountValue}%`
          : `₹${r.discountValue}`,
    },
    {
      title: "Valid From",
      dataIndex: "validFrom",
      render: formatDate,
    },
    {
      title: "Valid Till",
      dataIndex: "validTill",
      render: formatDate,
    },
  ];

  /* ================= HANDLERS ================= */

  /* ---- Step 1: Pre Booking WITHOUT coupon ---- */
  const handleContinue = async () => {
    try {
      const items = [
        ...selectedTests.map((t) => ({ type: "test", testId: t._id })),
        ...selectedPackages.map((p) => ({
          type: "package",
          packageId: p._id,
        })),
      ];

      setBookingItems(items);
      setSelectedCoupon(null);

      const res = await fetchPreBooking({
        userId: USER_ID,
        items,
      }).unwrap();

      const { message, ...amount } = res.response;
      setPreBookingAmount(amount);
      setSummaryModalOpen(true);
    } catch (err: any) {
      toast.error(err?.data?.message || "Pre booking failed");
    }
  };

  /* ---- Step 2: Apply Coupon (Re-call Pre Booking) ---- */
  const handleApplyCoupon = async () => {
    try {
      const couponCodeToUse = selectedCoupon;
      const ManualCouponCodeToUse = manualCoupon;
      if (!couponCodeToUse) {
        toast.error("Please enter or select a coupon");
        return;
      }

      const res = await fetchPreBooking({
        userId: USER_ID,
        items: bookingItems,
        couponId: couponCodeToUse,
        // otherDiscount: ManualCouponCodeToUse,
      }).unwrap();

      const { message, ...amount } = res.response;
      setPreBookingAmount(amount);
      toast.success("Coupon applied successfully");
      setCouponModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Coupon apply failed");
    }
  };

  /* ---- Step 3: Final Booking ---- */
  const handleFinalBooking = async () => {
    try {
      if (!selectedLabId) {
        toast.info("Please select the lab first.");
        return;
      }
      // if (!selectedDRId) {
      //   toast.info("Please select the Doctor first.");
      //   return;
      // }
      if (!bookingType) {
        toast.info("Please select the booking type.");
        return;
      }
      if (!paymentMode) {
        toast.info("Please select the payment mode.");
        return;
      }

      if (bookingType === "normal") {
        if (!selectedSlot) {
          toast.info("Please select a time slot");
          return;
        }
        if (!selectedAddressId) {
          toast.info("Please select address");
          return;
        }
        if (!selectedDate) {
          toast.info("Please select date");
          return;
        }
      }

      const parsedSlot = selectedSlot ? JSON.parse(selectedSlot) : null;

      const itemsFinal = [
        ...selectedTests.map((t) => ({
          itemType: "TestForm",
          itemId: t._id,
          price: t.price,
        })),
        ...selectedPackages.map((p) => ({
          itemType: "Package",
          itemId: p._id,
          price: p.price,
        })),
      ];

      const formData = new FormData();
      formData.append("userId", USER_ID);
      formData.append("labId", user?._id);
      formData.append("doctorId", selectedDRId);
      formData.append(
        "paymentType",
        paymentMode === "cash" ? "cash" : "online"
      );
      formData.append("paymentTypeMethod", paymentMode);
      formData.append("type", bookingType);
      if (transactionId) {
        formData.append("qrCodeId", transactionId);
      }

      if (transactionImage) {
        formData.append("qrImage", transactionImage);
      }
      if (familyMemberId) formData.append("familyMemberId", familyMemberId);
      if (selectedCoupon) formData.append("offerId", selectedCoupon);

      formData.append("items", JSON.stringify(itemsFinal));
      formData.append(
        "amount",
        JSON.stringify({
          total: preBookingAmount?.totalOriginalAmount,
          discount: preBookingAmount?.couponAppliedAmount || 0,
          otherDiscount: manualCoupon || 0,
          finalAmount: Math.max(
            0,
            (preBookingAmount?.payableAmount || 0) - (Number(manualCoupon) || 0)
          ),
          platformFee: preBookingAmount?.platformFee || 0,
          collectiontype:
            bookingType === "normal" ? "Home Collection" : "Lab Visit",
        })
      );

      if (bookingType === "normal") {
        formData.append(
          "slot",
          JSON.stringify({
            startTime: parsedSlot.startTime,
            endTime: parsedSlot.endTime,
          })
        );
        formData.append("bookingDate", selectedDate);
        formData.append("addressId", selectedAddressId);

        formData.append(
          "userAddress",
          JSON.stringify({
            addressLine1: selectedAddress.houseNo,
            addressLine2: selectedAddress.landmark,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            coordinates: {
              lat: selectedAddress.latitude,
              lng: selectedAddress.longitude,
            },
          })
        );
      }

      const res = await finalBooking(formData).unwrap();
      toast.success("Booking completed successfully");
      navigate(`/booking-list/booking-details/${res.response?.id}`);
      // navigate("/booking-list");
    } catch (err: any) {
      toast.error(err?.data?.message || "Final booking failed");
    }
  };

  /* ---------------- COUPON FILTER ---------------- */

  const filteredCoupons =
    couponRes?.message?.coupons?.filter((c: any) =>
      c.code.toLowerCase().includes(couponSearch.toLowerCase())
    ) || [];

  /* ================= UI ================= */

  return (
    <div className="bg-white p-4 rounded-xl">
      <PageBreadcrumb pageTitle="Add Booking Items" />

      {/* ================= TABS ================= */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setPage(1);
          setSearchText("");
        }}
        items={[
          {
            key: "test",
            label: "Tests",
            children: (
              <>
                <Input
                  placeholder="Search test"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={() => {
                    setSearchText(searchText);
                    setPage(1);
                  }}
                  allowClear
                  className="mb-3"
                />

                {/* Selected Tests Preview */}
                {selectedTests.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-800">
                        Selected Tests ({selectedTests.length})
                      </span>
                      <Button
                        size="small"
                        danger
                        onClick={() => setSelectedTests([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTests.map((test) => (
                        <Tag
                          key={test._id}
                          closable
                          onClose={() => {
                            setSelectedTests((prev) =>
                              prev.filter((item) => item._id !== test._id)
                            );
                          }}
                          className="bg-blue-100 text-blue-800 border-blue-300"
                        >
                          {test.name || test.title || "Test"}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                <Table
                  rowKey="_id"
                  loading={testLoading}
                  columns={testColumns}
                  dataSource={testRes?.response?.testForms || []}
                  rowSelection={{
                    preserveSelectedRowKeys: true,
                    selectedRowKeys: selectedTests.map((i) => i._id),
                    onChange: (selectedRowKeys, selectedRows) => {
                      setSelectedTests((prev) => {
                        const map = new Map(
                          prev.map((item) => [item._id, item])
                        );
                        selectedRows.forEach((row: any) => {
                          map.set(row._id, row);
                        });
                        return Array.from(map.values()).filter((item) =>
                          selectedRowKeys.includes(item._id)
                        );
                      });
                    },
                  }}
                  pagination={{
                    current: testRes?.response?.pagination?.currentPage || page,
                    pageSize,
                    total: testRes?.response?.pagination?.totalCount || 0,
                    onChange: (p, ps) => {
                      setPage(p);
                      setPageSize(ps);
                    },
                  }}
                />
              </>
            ),
          },
          {
            key: "package",
            label: "Packages",
            children: (
              <>
                <Input.Search
                  placeholder="Search package"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={() => {
                    setSearchText(searchText);
                    setPage(1);
                  }}
                  allowClear
                  className="mb-3"
                />

                {/* Selected Packages Preview */}
                {selectedPackages.length > 0 && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-800">
                        Selected Packages ({selectedPackages.length})
                      </span>
                      <Button
                        size="small"
                        danger
                        onClick={() => setSelectedPackages([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackages.map((pkg) => (
                        <Tag
                          key={pkg._id}
                          closable
                          onClose={() => {
                            setSelectedPackages((prev) =>
                              prev.filter((item) => item._id !== pkg._id)
                            );
                          }}
                          className="bg-green-100 text-green-800 border-green-300"
                        >
                          {pkg.name || pkg.title || "Package"}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                <Table
                  rowKey="_id"
                  loading={packageLoading}
                  columns={packageColumns}
                  dataSource={packageRes?.response?.packages || []}
                  rowSelection={{
                    preserveSelectedRowKeys: true,
                    selectedRowKeys: selectedPackages.map((i) => i._id),
                    onChange: (selectedRowKeys, selectedRows) => {
                      setSelectedPackages((prev) => {
                        const map = new Map(
                          prev.map((item) => [item._id, item])
                        );
                        selectedRows.forEach((row: any) => {
                          map.set(row._id, row);
                        });
                        return Array.from(map.values()).filter((item) =>
                          selectedRowKeys.includes(item._id)
                        );
                      });
                    },
                  }}
                  pagination={{
                    current: page,
                    pageSize,
                    total: packageRes?.response?.pagination?.totalCount || 0,
                    onChange: (p, ps) => {
                      setPage(p);
                      setPageSize(ps);
                    },
                  }}
                />
              </>
            ),
          },
        ]}
      />

      <div className="flex justify-end mt-6">
        <Button
          type="primary"
          size="large"
          disabled={!selectedTests.length && !selectedPackages.length}
          loading={preLoading}
          onClick={handleContinue}
        >
          Next
        </Button>
      </div>

      {/* ================= SUMMARY MODAL ================= */}
      <Modal
        title="Booking Summary"
        open={summaryModalOpen}
        onCancel={() => setSummaryModalOpen(false)}
        footer={null}
        width={600}
      >
        {/* Header */}{" "}
        <div className="flex justify-between items-center mb-4">
          {" "}
          <div>
            {" "}
            <h3 className="text-lg font-semibold">EverIndia Path Lab</h3>{" "}
            <p className="text-sm text-gray-500">Manual Booking Invoice</p>{" "}
          </div>{" "}
          <div className="text-right text-sm text-gray-500">
            {" "}
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>{" "}
        </div>
        {/* Selected Member Details */}
        <h3 className="text-md font-semibold">Selected Member</h3>{" "}
        <div className="flex gap-8  mb-4">
          <p>
            <strong>Name:</strong> {familyMember?.name}
          </p>
          <p>
            <strong>Age:</strong> {familyMember?.age}
          </p>
          <p>
            <strong>Name:</strong> {familyMember?.relation}
          </p>
        </div>
        {/* Items Table */}{" "}
        <div className="bg-white rounded-md border mb-4">
          {" "}
          <table className="w-full text-sm">
            {" "}
            <thead className="bg-gray-100">
              {" "}
              <tr>
                {" "}
                <th className="text-left p-2">Item</th>{" "}
                <th className="text-right p-2">Price</th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody>
              {" "}
              {selectedTests.map((t) => (
                <tr key={t._id} className="border-t">
                  {" "}
                  <td className="p-2">{t.title}</td>{" "}
                  <td className="p-2 text-right">
                    ₹{`${t.discountPrice}` || `${t.price}`}
                  </td>{" "}
                </tr>
              ))}{" "}
              {selectedPackages.map((p) => (
                <tr key={p._id} className="border-t">
                  {" "}
                  <td className="p-2">{p.title}</td>{" "}
                  <td className="p-2 text-right">
                    ₹{`${p.discountPrice}` || `${p.price}`}
                  </td>{" "}
                </tr>
              ))}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>
        {/* LAB Selection */}
        {/* <div className="w-full mb-2">
          <Select
            className="w-full"
            placeholder="Select Lab"
            optionFilterProp="children"
            showSearch
            disabled={isFetching}
            loading={isFetching}
            value={selectedLabId}
            onChange={(value) => setSelectedLabId(value)}
          >
            {LabList?.response?.labs?.map((lab) => (
              <Option key={lab._id} value={lab._id}>
                {lab.name}
              </Option>
            ))}
          </Select>
        </div> */}
        {/* DR Selection */}
        <div className="w-full mb-2">
          <Select
            className="w-full"
            placeholder="Referred By Doctor"
            optionFilterProp="children"
            showSearch
            allowClear
            disabled={drLoading}
            loading={drLoading}
            value={selectedDRId}
            onChange={(value) => {
              setSelectedDRId(value);
              if (!value) {
                // Reset related fields here
                // setOtherField1("");
                // setOtherField2(null);
                setSelectedDRId(null);
              }
            }}
          >
            {drList?.response?.data?.map((dr) => (
              <Option key={dr._id} value={dr._id}>
                {dr.name}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <p className="text-red-600 italic mb-4">
            <span className="text-red-600 italic font-semibold">Note:</span>{" "}
            Either enter manual discount amount, select coupon code from the
            list, <strong>or use both together</strong>.
          </p>
          <Input
            className="uppercase"
            placeholder="Enter manual discount amount"
            value={manualCoupon}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setManualCoupon(value);
            }}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pastedData = e.clipboardData
                .getData("text")
                .replace(/[^0-9]/g, "");
              setManualCoupon(pastedData);
            }}
            maxLength={10}
          />

          <p className="text-center p-1 font-bold">OR</p>
          <div className="flex flex-col gap-2 justify-start mb-3">
            <button
              className="bg-green-600 hover:bg-green-700 px-2 py-1.5 rounded-md text-white text-xs"
              onClick={() => setCouponModalOpen(true)}
            >
              Apply Coupon
            </button>
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="bg-white rounded-md border p-3">
            <div className="flex justify-between mb-2">
              <span>Total Amount</span>
              <span>₹{preBookingAmount?.totalOriginalAmount}</span>
            </div>

            {preBookingAmount?.couponAppliedAmount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Coupon Discount</span>
                <span>- ₹{preBookingAmount?.couponAppliedAmount}</span>
              </div>
            )}

            {manualCoupon && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Manual Discount</span>
                <span>- ₹{manualCoupon || 0}</span>
              </div>
            )}

            <div className="flex justify-between mb-2">
              <span>Platform Fee</span>
              <span>₹{preBookingAmount?.platformFee || 0}</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Payable Amount</span>
              <span>
                ₹
                {manualCoupon
                  ? (preBookingAmount?.payableAmount || 0) -
                    (Number(manualCoupon) || 0)
                  : preBookingAmount?.payableAmount || 0}
              </span>
            </div>
          </div>

          <div className="w-full mb-4 mt-4">
            <Select
              className="w-full"
              placeholder="Select Payment Mode"
              value={paymentMode}
              onChange={(value) => setPaymentMode(value)}
            >
              <Option value="cash">Cash</Option>
              <Option value="phonepe">PhonePe</Option>
              <Option value="googlepay">Google Pay</Option>
              <Option value="paytm">Paytm</Option>
              <Option value="card">Card</Option>
            </Select>
          </div>

          <div className="w-full mb-4 mt-2">
            <Select
              className="w-full"
              placeholder="Select Booking Type"
              value={bookingType}
              onChange={(value) => {
                setBookingType(value);
                setTransactionId("");
                setTransactionImage(null);
              }}
            >
              <Option value="normal">Normal</Option>
              <Option value="walkin">Walk-in</Option>
            </Select>
          </div>

          {bookingType === "normal" && (
            <div className="mb-4">
              <DatePicker
                className="w-full"
                placeholder="Select Date"
                disabledDate={disablePastDates}
                onChange={(date) => {
                  setSelectedDate(date?.format("YYYY-MM-DD"));
                  setSelectedSlot(null);
                }}
              />
            </div>
          )}

          {bookingType === "normal" && (
            <div className="mb-4">
              <Select
                className="w-full"
                placeholder="Select Time Slot"
                value={selectedSlot}
                onChange={(val) => setSelectedSlot(val)}
                disabled={!selectedDate}
              >
                {visibleSlots.map((slot, idx) => (
                  <Select.Option key={idx} value={JSON.stringify(slot)}>
                    {slot.startTime} - {slot.endTime}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}

          {bookingType === "normal" && (
            <div className="mb-4">
              <span className="font-medium">Selected Address: </span>{" "}
              {selectedAddress &&
                `  ${selectedAddress.houseNo}, ${selectedAddress.streetName}, ${selectedAddress.description}`}
            </div>
          )}
          {bookingType === "normal" && (
            <div className="mb-4">
              <Button
                type="primary"
                onClick={() => {
                  setAddressModalOpen(true), setSelectedAddress(null);
                }}
              >
                {selectedAddress ? "Change Address" : "Select Address"}
              </Button>
            </div>
          )}

          {bookingType === "walkin" && (
            <div className="space-y-4">
              {/* Transaction ID */}
              <Input
                placeholder="Enter QR ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />

              <div className="text-center text-gray-400 text-sm">OR</div>

              {/* Upload Image */}
              <Upload
                beforeUpload={(file) => {
                  setTransactionImage(file);
                  return false;
                }}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Upload QR Image</Button>
              </Upload>

              {transactionImage && (
                <p className="text-sm text-green-600">
                  Selected file: {transactionImage.name}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end mt-5">
            <Button
              type="primary"
              size="large"
              loading={finalLoading}
              onClick={handleFinalBooking}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= COUPON MODAL ================= */}
      <Modal
        title="Select Coupon"
        open={couponModalOpen}
        onCancel={() => setCouponModalOpen(false)}
        footer={null}
      >
        <Input.Search
          placeholder="Search coupon code"
          value={couponSearch}
          onChange={(e) => setCouponSearch(e.target.value)}
          className="mb-3"
          allowClear
        />

        <Table
          rowKey="code"
          loading={couponLoading}
          columns={couponColumns}
          dataSource={filteredCoupons}
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedCoupon ? [selectedCoupon] : [],
            onSelect: (record) => {
              if (selectedCoupon === record.code) {
                setSelectedCoupon(null);
              } else {
                setSelectedCoupon(record.code);
              }
            },
          }}
          pagination={false}
        />

        <div className="flex justify-end items-center mt-4 gap-2">
          <Button
            type="primary"
            loading={preLoading}
            disabled={!manualCoupon?.trim() && !selectedCoupon}
            onClick={handleApplyCoupon}
          >
            Apply Coupon
          </Button>
          {selectedCoupon && (
            <p
              className="text-sm text-center bg-red-50 w-[200px] px-4 py-2 rounded-md text-red-500 cursor-pointer"
              onClick={() => {
                setSelectedCoupon(null);
                setManualCoupon("");
              }}
            >
              Remove applied coupon
            </p>
          )}
        </div>
      </Modal>

      {/* ================ ADDRESS MANAGER MODAL ================= */}

      <Modal
        title="Manage Address"
        open={addressModalOpen}
        onCancel={() => setAddressModalOpen(false)}
        footer={null}
        width={700}
      >
        <AddressManager
          userId={USER_ID}
          selectedAddressId={selectedAddressId}
          onSelect={(addr) => {
            setSelectedAddressId(addr._id);
            setSelectedAddress(addr);
            setAddressModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default AddBookingItems;
