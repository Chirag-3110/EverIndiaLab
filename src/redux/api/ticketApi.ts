import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("l_t_K");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ticketApi"],
  endpoints: (builder) => ({
    getInquiry: builder.query({
      query: () => "lab-inquiry/get-lab-inquiery",
      providesTags: ["ticketApi"],
    }),
    updateUserticket: builder.mutation({
      query: ({ id, formData }) => ({
        url: `lab-inquiry/update-inquiery-status/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["ticketApi"],
    }),
  }),
});

export const { useGetInquiryQuery, useUpdateUserticketMutation } = ticketApi;
