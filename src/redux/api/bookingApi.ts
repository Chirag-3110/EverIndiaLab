import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const bookingApi = createApi({
  reducerPath: "bookingApi",
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
  tagTypes: ["Booking"],
  endpoints: (builder) => ({
    // ✅ Add New Booking
    addBooking: builder.mutation({
      query: (body) => ({
        url: "booking/add-new-booking",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),

    // ✅ Get Booking
    getBooking: builder.query({
      query: ({ searchText, page, pageSize, id }) => ({
        url: `booking/get-lab-bookings/${id}?searchText=${searchText}&page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      providesTags: ["Booking"],
    }),
    // ✅ Get Booking Details
    getBookingDetails: builder.query({
      query: (id) => ({
        url: `booking/booking-detail-by-id/${id}`,
        method: "GET",
      }),
      providesTags: ["Booking"],
    }),
    // ✅ Get all active Booking
    getAllActiveBooking: builder.query({
      query: () => ({
        url: `app/get-all-active-Bookings`,
        method: "GET",
      }),
      providesTags: ["Booking"],
    }),

    // ✅ Delete Booking
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `booking/cancel-booking/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useAddBookingMutation,
  useGetBookingQuery,
  useGetBookingDetailsQuery,
  useDeleteBookingMutation,
  useGetAllActiveBookingQuery,
} = bookingApi;
