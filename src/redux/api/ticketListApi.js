import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ticketListApi = createApi({
  reducerPath: "ticketListApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ticketList"],
  endpoints: (builder) => ({
    getTicketList: builder.query({
      query: () => "support/issues",
      providesTags: ["ticketList"],
    }),
    replyToTicket: builder.mutation({
      query: ({ id, formdata }) => ({
        url: `support/issues/${id}/status`,
        method: "POST",
        body: formdata,
      }),
      invalidatesTags: ["ticketList"],
    }),
  }),
});

export const { useGetTicketListQuery, useReplyToTicketMutation } =
  ticketListApi;
