import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const couponApi = createApi({
  reducerPath: "couponApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("l_t_K");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["coupon"],
  endpoints: (builder) => ({
    getCoupon: builder.query({
      query: () => ({
        url: `coupon/get-all-coupons`,
        method: "GET",
      }),
      providesTags: ["coupon"],
    }),

    addCoupon: builder.mutation({
      query: (body) => ({
        url: `coupon/add-new-coupon`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["coupon"],
    }),
    updateCoupon: builder.mutation({
      query: ({ body, id }) => ({
        url: `coupon/edit-coupon/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["coupon"],
    }),

    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `coupon/remove-coupon/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: ["coupon"],
    }),
  }),
});

export const {
  useGetCouponQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
