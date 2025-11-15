import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const notificationApi = createApi({
  reducerPath: "notificationApi",
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
  tagTypes: ["notification"],
  endpoints: (builder) => ({
    // ✅ Get notification Page by slug
    getnotification: builder.query({
      query: () => ({
        url: `notification/get-all-user-notification`,
        method: "GET",
      }),
      providesTags: ["notification"],
    }),

    // ✅ Update notification Page by ID
    markAsSeenNotification: builder.mutation({
      query: () => ({
        url: `notification/mark-as-seen`,
        method: "PUT",
        body: {},
      }),
      invalidatesTags: ["notification"],
    }),

    // ✅ Delete notification Page by ID
    deleteNotificationById: builder.mutation({
      query: (id) => ({
        url: `notification/delete-notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["notification"],
    }),
    // ✅ Delete notification Page by ID
    deleteAllNotification: builder.mutation({
      query: () => ({
        url: `notification/delete-all-notification`,
        method: "DELETE",
      }),
      invalidatesTags: ["notification"],
    }),
  }),
});

export const {
  useGetnotificationQuery,
  useMarkAsSeenNotificationMutation,
  useDeleteNotificationByIdMutation,
  useDeleteAllNotificationMutation,
} = notificationApi;
