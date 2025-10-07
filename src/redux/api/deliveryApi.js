import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseUrl = import.meta.env.VITE_BASE_URL;

export const deliveryApi = createApi({
  reducerPath: "deliveryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  tagTypes: ["Delivery"],
  endpoints: (builder) => ({
    // Add Delivery
    addDelivery: builder.mutation({
      query: (deliveryData) => ({
        url: "admin/delivery-register",
        method: "POST",
        body: deliveryData,
      }),
      invalidatesTags: ["Delivery"],
    }),

    // Get All Deliveries
    getDeliveries: builder.query({
      query: (status) => {
        return status
          ? `admin/delivery-list?status=${status}`
          : "admin/delivery-list";
      },
      providesTags: ["Delivery"],
    }),

    // Delete Delivery
    deleteDelivery: builder.mutation({
      query: ({ id }) => ({
        url: `admin/delivery-delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Delivery"],
    }),

    // Update/Edit Delivery
    editDelivery: builder.mutation({
      query: ({ id, formData }) => ({
        url: `admin/delivery-update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Delivery"],
    }),

    // Update Delivery Status (block/unblock)
    updateDeliveryStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `admin/delivery-status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Delivery"],
    }),
  }),
});

export const {
  useAddDeliveryMutation,
  useGetDeliveriesQuery,
  useDeleteDeliveryMutation,
  useEditDeliveryMutation,
  useUpdateDeliveryStatusMutation,
} = deliveryApi;
