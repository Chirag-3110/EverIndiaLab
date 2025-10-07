import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileApi = createApi({
  reducerPath: "profileApi",
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
  tagTypes: ["profileApi"],
  endpoints: (builder) => ({
    updateUserProfile: builder.mutation({
      query: ({ id, formData }) => ({
        url: `lab/update-lab/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["profileApi"],
    }),
    // Forgot password: send OTP
    sendForgotPasswordOtp: builder.mutation({
      query: (payload) => ({
        url: `user/admin/forgot-password-otp`,
        method: "POST",
        body: payload,
      }),
    }),
    // Forgot password: verify OTP
    verifyForgotPasswordOtp: builder.mutation({
      query: (payload) => ({
        url: `user/admin/verify-otp`,
        method: "POST",
        body: payload,
      }),
    }),
    // Forgot password: change password
    changeForgotPassword: builder.mutation({
      query: (payload) => ({
        url: `user/admin/change-pass`,
        method: "POST",
        body: payload,
      }),
    }),

    // Forgot password: change password
    changePassword: builder.mutation({
      query: ({ id, payload }) => ({
        url: `user/app/change-password/${id}`,
        method: "PUT",
        body: payload,
      }),
    }),
  }),
});

export const {
  useUpdateUserProfileMutation,
  useSendForgotPasswordOtpMutation,
  useVerifyForgotPasswordOtpMutation,
  useChangeForgotPasswordMutation,
  useChangePasswordMutation,
} = profileApi;
