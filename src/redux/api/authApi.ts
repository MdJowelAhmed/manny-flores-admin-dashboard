import { baseApi } from "../baseApi";
import { loginSuccess } from "../slices/authSlice";

interface LoginResponse {
    success: boolean;
    statusCode?: number;
    message: string;
    data?: {
        accessToken: string;
        refreshToken?: string;
        role?: string;
    };
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

interface VerifyEmailPayload {
    email: string;
    oneTimeCode: number;
}

interface VerifyEmailResponse {
    success: boolean;
    message: string;
    // Backend returns the reset token in the "data" field
    data: string;
}

interface ResetPasswordPayload {
    newPassword: string;
    confirmPassword: string;
}

interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

interface GetMyProfileResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        role: string;
        profile?: string;
        status: string;
        isVerified: boolean;
        isPhoneVerified: boolean;
        isEmailVerified: boolean;
        isDeleted: boolean;
        authProviders: string[];
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
}

interface UpdateMyProfileResponse {
    success: boolean;
    message: string;
    data: GetMyProfileResponse['data'];
}

export interface UpdateMyProfilePayload {
    name?: string;
    profileImage?: File | null;
}

export function buildProfileFormData(
    data: {
        name: string;
        email: string;
        contact: string;
        address?: string;
        city?: string;
        country?: string;
    },
    profileFile?: File | null
): FormData {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('contact', data.contact);
    formData.append('address', data.address ?? '');
    formData.append('city', data.city ?? '');
    formData.append('country', data.country ?? '');

    if (profileFile instanceof File) {
        formData.append('profile', profileFile, profileFile.name);
    }

    return formData;
}

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(credentials, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    const accessToken = data?.data?.accessToken;
                    if (!data?.success || !accessToken) return;

                    if (typeof localStorage !== "undefined") {
                        localStorage.setItem("token", accessToken);
                        if (data.data?.refreshToken) {
                            localStorage.setItem("refreshToken", data.data.refreshToken);
                        }
                    }

                    dispatch(
                        loginSuccess({
                            token: accessToken,
                            email: credentials.email,
                        })
                    );
                } catch {
                    // RTK Query handles mutation errors
                }
            },
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch {
                    // still clear local session on logout failure
                } finally {
                    if (typeof localStorage !== "undefined") {
                        localStorage.removeItem("token");
                        localStorage.removeItem("refreshToken");
                    }
                }
            },
            invalidatesTags: ['Auth'],
        }),
        getCurrentUser: builder.query({
            query: () => ({
                url: '/auth/current-user',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordPayload>({
            query: (credentials) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        forgotPassword: builder.mutation({
            query: (credentials) => ({
                url: '/auth/forget-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        resentOtp: builder.mutation({
            query: (credentials) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailPayload>({
            query: (credentials) => ({
                url: '/auth/verify-email',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Safely store the reset token from response.data into localStorage
                    if (data?.data) {
                        try {
                            if (typeof localStorage !== 'undefined') {
                                localStorage.setItem('resetPasswordToken', data.data);
                            }
                        } catch {
                            // ignore storage errors
                        }
                    }
                } catch {
                    // ignore errors; normal RTK Query error handling will apply
                }
            },
            invalidatesTags: ['Auth'],
        }),
        resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
            query: (credentials) => {
                // Read the reset token that was returned from verify-email
                let resetToken: string | null = null;
                try {
                    resetToken = typeof localStorage !== 'undefined'
                        ? localStorage.getItem('resetPasswordToken')
                        : null;
                } catch {
                    resetToken = null;
                }

                const headers: Record<string, string> = {};
                if (resetToken) {
                    // Backend expects this token in the Authorization header
                    headers.Authorization = resetToken;
                }

                return {
                    url: '/auth/reset-password',
                    method: 'POST',
                    body: credentials,
                    headers,
                };
            },
            invalidatesTags: ['Auth'],
        }),

        getMyProfile: builder.query<GetMyProfileResponse, void>({
            query: () => ({
                url: '/user/profile',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),

        updateMyProfile: builder.mutation<UpdateMyProfileResponse, FormData>({
            query: (formData) => ({
                url: '/user/profile',
                method: 'PATCH',
                body: formData,
            }),
            invalidatesTags: ['Auth'],
        }), Profile: builder.mutation<UpdateMyProfileResponse, UpdateMyProfilePayload>({
            query: ({ name, profileImage }) => {
                const formData = new FormData();

                if (name) {
                    formData.append('name', name);
                }

                if (profileImage) {
                    formData.append('profileImage', profileImage);
                }

                return {
                    url: '/user/profile',
                    method: 'PATCH',
                    body: formData,
                };
            },
            invalidatesTags: ['Auth'],
        }),


    }),

})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useVerifyEmailMutation,
    useResetPasswordMutation,
    useResentOtpMutation,
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
} =
    authApi