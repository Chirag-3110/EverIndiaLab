import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const manualApi = createApi({
  reducerPath: "manualApi",
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
  tagTypes: ["manual"],
  endpoints: (builder) => ({
    addManualUser: builder.mutation({
      query: (body) => ({
        url: "user/add-manualy-booking-user",
        method: "POST",
        body,
      }),
      invalidatesTags: ["manual"],
    }),

    addManualUserFamilyMember: builder.mutation({
      query: (body) => ({
        url: "relation/add-new-relation",
        method: "POST",
        body,
      }),
      invalidatesTags: ["manual"],
    }),

    editUserFamilyMemberRelation: builder.mutation({
      query: (body) => ({
        url: "relation/edit-relation",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["manual"],
    }),

    addGetManualUserPreBookingDetails: builder.mutation({
      query: (body) => ({
        url: "booking/fetch-manual-booking-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["manual"],
    }),
    addGetManualUserFinalBookingDetails: builder.mutation({
      query: (formData) => ({
        url: "booking/add-manual-booking",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["manual"],
    }),

    getManualUser: builder.query({
      query: (phn) => ({
        url: `user/fetch-user-using-phone?phoneNumber=${phn}`,
        method: "GET",
      }),
      providesTags: ["manual"],
    }),
    getManualUserFamilyMembers: builder.query({
      query: (userId) => ({
        url: `relation/list/${userId}`,
        method: "GET",
      }),
      providesTags: ["manual"],
    }),
  }),
});

export const {
  useAddManualUserMutation,
  useGetManualUserQuery,
  useAddManualUserFamilyMemberMutation,
  useAddGetManualUserPreBookingDetailsMutation,
  useAddGetManualUserFinalBookingDetailsMutation,
  useGetManualUserFamilyMembersQuery,
  useEditUserFamilyMemberRelationMutation,
} = manualApi;
