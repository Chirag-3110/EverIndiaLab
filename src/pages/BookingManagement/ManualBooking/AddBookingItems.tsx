import React, { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useGettestFormQuery } from "../../../redux/api/testFormApi";
import { useGetpackageQuery } from "../../../redux/api/packageApi";
import { useGetCouponQuery } from "../../../redux/api/couponApi";
import {
  useAddGetManualUserFinalBookingDetailsMutation,
  useAddGetManualUserPreBookingDetailsMutation,
} from "../../../redux/api/manualApi";
import { Tabs, Table, Input, Button } from "antd";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/utils";
type TabType = "test" | "package" | "coupon";

const AddBookingItems = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const userId = state?.userId;
  const familyMemberId = state?.familyMemberId;

  const USER_ID = userId;

  const [activeTab, setActiveTab] = useState("test");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);

  /* ---------------- APIs ---------------- */

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

  const [fetchPreBooking, { isLoading }] =
    useAddGetManualUserPreBookingDetailsMutation();

  const [finalBooking, { isLoading: finalLoading, error }] =
    useAddGetManualUserFinalBookingDetailsMutation();

  const sanitizeAmount = (amountRes: any) => {
    const { message, ...amount } = amountRes;
    return amount;
  };
  console.log(error);
  /* ---------------- Columns ---------------- */

  const testColumns: any = [
    { title: "Test Name", dataIndex: "title" },
    { title: "Price", dataIndex: "price" },
    { title: "Discount Price", dataIndex: "discountPrice" },
  ];

  const packageColumns: any = [
    { title: "Package Name", dataIndex: "title" },
    { title: "Price", dataIndex: "price" },
    { title: "DiscountPrice", dataIndex: "discountPrice" },
  ];

  const couponColumns: any = [
    { title: "Coupon Code", dataIndex: "code" },
    {
      title: "Discount",
      render: (_, r) =>
        r.discountType === "percentage"
          ? `${r.discountValue}%`
          : `₹${r.discountValue}`,
    },
    {
      title: "Valid from",
      dataIndex: "validFrom",
      render: (value: any) => formatDate(value),
    },
    {
      title: "Valid Till",
      dataIndex: "validTill",
      render: (value: any) => formatDate(value),
    },
  ];

  /* ---------------- Submit ---------------- */

  const buildFinalBookingFormData = ({
    userId,
    familyMemberId,
    paymentType,
    offerId,
    items,
    amount,
  }: any) => {
    const formData = new FormData();

    formData.append("userId", userId);
    formData.append("paymentType", paymentType);

    if (familyMemberId) formData.append("familyMemberId", familyMemberId);
    if (offerId) formData.append("offerId", offerId);

    // 🔹 items → array
    formData.append("items", JSON.stringify(items));

    // 🔹 amount → object
    formData.append(
      "amount",
      JSON.stringify({
        total: amount?.totalOriginalAmount || 0,
        collectiontype: "Lab Visit",
        discount: amount?.couponAppliedAmount || 0,
        everCash: amount?.walletUsed || 0,
        finalAmount: amount?.payableAmount || 0,
        platformFee: amount?.platformFee || 0,
        bannerAppliedAmount: amount?.bannerAppliedAmount,
      })
    );

    return formData;
  };

  const handleContinue = async () => {
    try {
      const items = [
        ...selectedTests.map((item) => ({
          type: "test",
          testId: item._id,
        })),
        ...selectedPackages.map((item) => ({
          type: "package",
          packageId: item._id,
        })),
      ];

      // 🔹 STEP 1: Pre Booking
      const preBookingRes = await fetchPreBooking({
        userId: USER_ID,
        items,
        couponId: selectedCoupon || undefined,
      }).unwrap();

      // Remove message
      const { message, ...amount } = preBookingRes?.response;

      const itemsFinal = [
        ...selectedTests.map((item) => ({
          itemType: "TestForm",
          itemId: item._id,
          price: item.price,
        })),
        ...selectedPackages.map((item) => ({
          itemType: "Package",
          itemId: item._id,
          price: item.price,
        })),
      ];

      // 🔹 STEP 2: Build FormData
      const formData = buildFinalBookingFormData({
        userId: USER_ID,
        familyMemberId: familyMemberId || undefined,
        paymentType: "cash",
        offerId: selectedCoupon || undefined,
        items: itemsFinal,
        amount,
      });

      // 🔹 STEP 3: Final Booking
      await finalBooking(formData).unwrap();

      toast.success("Booking completed successfully");
      navigate("/booking-list");
    } catch (error: any) {
      toast.error(error?.data?.message || "Booking failed");
    }
  };

  /* ---------------- Common Pagination ---------------- */

  const paginationConfig = (total: number) => ({
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    onChange: (p: number, ps: number) => {
      setPage(p);
      setPageSize(ps);
    },
  });

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white p-4 rounded-xl">
      <PageBreadcrumb pageTitle="Add Booking Items" />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setPage(1);
          setSearchText("");
        }}
        className="mt-4"
        items={[
          {
            key: "test",
            label: "Tests",
            children: (
              <>
                <Input.Search
                  placeholder="Search test"
                  allowClear
                  onSearch={(v) => {
                    setSearchText(v);
                    setPage(1);
                  }}
                  className="mb-3"
                />

                <Table
                  rowKey="_id"
                  loading={testLoading}
                  columns={testColumns}
                  dataSource={testRes?.response?.testForms ?? []}
                  rowSelection={{
                    selectedRowKeys: selectedTests.map((i) => i._id),
                    onChange: (keys, rows) => {
                      setSelectedTests(rows);
                    },
                  }}
                  pagination={{
                    current: testRes?.response?.pagination?.currentPage || page,
                    pageSize,
                    total: testRes?.response?.pagination?.totalCount || 0,
                    showSizeChanger: true,
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
                  allowClear
                  onSearch={(v) => {
                    setSearchText(v);
                    setPage(1);
                  }}
                  className="mb-3"
                />

                <Table
                  rowKey="_id"
                  loading={packageLoading}
                  columns={packageColumns}
                  dataSource={packageRes?.response?.packages ?? []}
                  rowSelection={{
                    selectedRowKeys: selectedPackages.map((i) => i._id),
                    onChange: (keys, rows) => {
                      setSelectedPackages(rows);
                    },
                  }}
                  pagination={paginationConfig(
                    packageRes?.response?.packages.length || 0
                  )}
                />
              </>
            ),
          },
          {
            key: "coupon",
            label: "Coupons",
            children: (
              <Table
                rowKey="_id"
                loading={couponLoading}
                columns={couponColumns}
                dataSource={couponRes?.message?.coupons ?? []}
                rowSelection={{
                  type: "radio",
                  selectedRowKeys: selectedCoupon ? [selectedCoupon] : [],
                  onChange: (keys) => setSelectedCoupon(keys[0] as string),
                }}
                pagination={paginationConfig(
                  couponRes?.message?.coupons?.length || 0
                )}
              />
            ),
          },
        ]}
      />

      {/* Footer */}
      <div className="flex justify-end mt-6">
        <Button
          type="primary"
          size="large"
          disabled={!selectedTests.length && !selectedPackages.length}
          loading={isLoading}
          onClick={handleContinue}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};

export default AddBookingItems;
