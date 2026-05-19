"use client";
import { useState, useEffect, useRef } from "react";
import { MdEdit } from "react-icons/md";
import Button from "@/components/ui/Button";
import ProfileSection from "@/components/pages/account/ProfileSection";
import DetailsSection from "@/components/pages/account/DetailsSection";
import AccountFooter from "@/components/pages/account/AccountFooter";
import EditProfileModal from "@/components/pages/account/EditProfileModal";
import DeleteAccountModal from "@/components/pages/account/DeleteAccountModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { LuPencilLine } from "react-icons/lu";
import { ArrowUpRight } from "lucide-react";
import DeleteRoleModal from "@/components/pages/employees/DeleteRoleModal";
import { accountService } from "@/api/services/accountService";
import { showSuccess, showError } from "@/components/ui/toast";
import OtpVerifyModal from "@/components/pages/login/OtpVerifyModal";
import { usePermissions } from "@/context/PermissionContext";

export default function AccountPage() {
  // Combined state for better performance
  const [state, setState] = useState({
    userData: null,
    loading: true,
    editOpen: false,
    deleteOpen: false,
    deleteNotAllowedModal: false,
    otpModalOpen: false,
    otpError: false,
    fields: {
      name: "",
      email: "",
      contact: "",
      password: "**********",
      facility: "",
    }
  });

  // Separate states for frequently changing values
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpRefs] = useState([useRef(), useRef(), useRef(), useRef()]);
  const { can } = usePermissions();

  // Helper functions to update state
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        updateState({ loading: true });
        const response = await accountService.getProfile();

        if (response.success && response.code === 200) {
          const user = response.data?.user || response.data;

          // Validate user data exists
          if (!user) {
            showError("Invalid profile data received");
            updateState({ loading: false });
            return;
          }

          // Safe date parsing
          const formatDate = (dateString) => {
            if (!dateString) return "Not specified";
            try {
              return new Date(dateString).toLocaleDateString();
            } catch (e) {
              return "Not specified";
            }
          };

          // Combine first_name and last_name to create full name
          const firstName = user.first_name || "";
          const lastName = user.last_name || "";
          const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown";

          // Format contact with country code
          let formattedContact = "";
          if (user.mobile_number) {
            const countryCode = user.country_code || "+91";
            formattedContact = `${countryCode} ${user.mobile_number}`;
          }

          const userData = {
            name: fullName,
            id: user.id || "",
            basicDetails: {
              email: user.email || "Not provided",
              contact: formattedContact || user.mobile_number || "Not provided",
              password: "**********",
            },
            professionalDetails: {
              role: (
                <div className="flex items-center justify-between text-[var(--color-neutral-secondary)] w-[350px] text-base">
                  <span className="text-[var(--color-neutral-secondary)]">
                    {response.data?.role || user.role || "No role assigned"}
                  </span>
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              ),
              facility: user.location || "Not specified",
              joiningDate: formatDate(user.joining_date)
            },
            createdAt: formatDate(user.created_at),
          };

          const fields = {
            name: fullName,
            email: user.email || "",
            contact: formattedContact || user.mobile_number || "",
            password: "**********",
            facility: user.location || "",
            joiningDate: user.joining_date || "",
          };

          updateState({
            userData,
            fields,
            loading: false
          });
        } else {
          showError("Failed to load profile data");
          updateState({ loading: false });
        }
      } catch (error) {
        console.error("Profile fetch error:", error);

        // Handle different error formats
        let errorMessage = "Failed to load profile data";

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        showError(errorMessage);
        updateState({ loading: false });
      }
    };

    fetchProfile();
  }, []);

  const handleFieldChange = (field) => {
    const value = prompt(`Enter new value for ${field}:`, state.fields[field]);
    if (value !== null) {
      updateState({
        fields: { ...state.fields, [field]: value }
      });
    }
  };

  const handleEditSave = async () => {
    try {
      const response = await accountService.updateProfile({
        name: state.fields.name,
        email: state.fields.email,
        contact: state.fields.contact,
        location: state.fields.facility,
      });


      if (response.success && response.code === 200) {
        showSuccess("Profile updated successfully!");
        updateState({ editOpen: false });
        // Refresh profile data
        const profileResponse = await accountService.getProfile();
        if (profileResponse.success && profileResponse.code === 200) {
          const user = profileResponse.data?.user || profileResponse.data;
          if (user) {
            // Combine first_name and last_name
            const firstName = user.first_name || "";
            const lastName = user.last_name || "";
            const fullName = [firstName, lastName].filter(Boolean).join(" ") || state.userData.name;

            // Format contact with country code
            let formattedContact = state.userData.basicDetails.contact;
            if (user.mobile_number) {
              const countryCode = user.country_code || "+91";
              formattedContact = `${countryCode} ${user.mobile_number}`;
            }

            updateState({
              userData: {
                ...state.userData,
                name: fullName,
                basicDetails: {
                  ...state.userData.basicDetails,
                  email: user.email || state.userData.basicDetails.email,
                  contact: formattedContact || state.userData.basicDetails.contact,
                },
                professionalDetails: {
                  ...state.userData.professionalDetails,
                  facility: user.location || state.userData.professionalDetails.facility,
                },
              },
              fields: {
                ...state.fields,
                name: fullName,
                email: user.email || state.fields.email,
                contact: formattedContact || state.fields.contact,
                facility: user.location || state.fields.facility,
              }
            });
          }
        }
      } else {
        showError("Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);

      // Handle different error formats
      let errorMessage = "Failed to update profile";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    }
  };

  const handleDelete = () => {
    updateState({ deleteOpen: true });
  };

  const handleDeleteAccount = () => {
    updateState({
      deleteOpen: false,
      otpModalOpen: true,
      otpError: false
    });
    setOtp(["", "", "", ""]);
  };

  const handleOtpVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      showError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      // First check delete eligibility
      const email = state.userData?.basicDetails?.email;

      if (!email) {
        showError("Email not found. Cannot proceed with account deletion.");
        return;
      }

      // console.log("Calling deleteEligibility with:", { email, otp: enteredOtp });

      const eligibilityResponse = await accountService.deleteEligibility(email, enteredOtp);

      // console.log("Delete eligibility response:", eligibilityResponse);

      if (eligibilityResponse.success && eligibilityResponse.code === 200) {
        // If eligible, proceed with actual deletion
        const deleteResponse = await accountService.deleteAccount();

        // console.log("Delete account response:", deleteResponse);

        if (deleteResponse.success && deleteResponse.code === 200) {
          showSuccess("Account deleted successfully!");
          updateState({ otpModalOpen: false });
          // Clear auth cookie and redirect to login
          const { clearAuthCookie } = await import('@/utils/cookies');
          clearAuthCookie();
          window.location.href = '/login';
        } else {
          showError("Failed to delete account");
        }
      } else {
        // Not eligible for deletion
        updateState({
          otpModalOpen: false,
          deleteNotAllowedModal: true
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      // Handle different error formats
      let errorMessage = "Invalid OTP. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
      updateState({ otpError: true });
      setOtp(["", "", "", ""]);
      if (otpRefs.length > 0 && otpRefs[0].current) {
        otpRefs[0].current.focus();
      }
    }
  };

  const handleSupport = () => {
    alert("Contacting support...");
  };

  if (state.loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-lg text-[var(--color-neutral-secondary)]">Loading profile...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!state.userData) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-lg text-red-500">Failed to load profile data</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] !ml-[16px]">
            Your account
          </h1>
          {(can("edit profile details", "clients") || can("edit profile details", "account") || can("edit profile details")) && (
            <Button
              className="bg-white !border !border-[var(--info-panel-view-bg)] !text-[var(--info-panel-view-bg)] hover:bg-[var(--warning-light)] px-4 py-2 rounded-lg flex items-center gap-2 font-semibold"
              onClick={() => updateState({ editOpen: true })}
              variant="secondary"
            >
              <LuPencilLine className="w-4 h-4" />
              <span className="block font-medium">EDIT</span>
            </Button>
          )}
        </div>
        <div className="flex justify-center items-center w-full min-h-[60vh]">
          <div className="grid grid-cols-10 gap-20  w-full">
            <div className="col-span-4">
              <ProfileSection name={state.userData.name} id={state.userData.id} />
            </div>

            <div className="col-span-6">
              <DetailsSection
                basicDetails={state.userData.basicDetails}
                professionalDetails={state.userData.professionalDetails}
              />
            </div>
          </div>
        </div>
        <AccountFooter
          createdAt={state.userData.createdAt}
          onDelete={handleDelete}
          allowDelete={(can("delete entries", "clients") || can("delete account", "account") || can("delete account"))}
        />



        <EditProfileModal
          open={state.editOpen}
          onClose={() => updateState({ editOpen: false })}
          onSave={handleEditSave}
          fields={state.fields}
          onFieldChange={handleFieldChange}
        />
        <DeleteAccountModal
          open={state.deleteOpen}
          onClose={() => updateState({ deleteOpen: false })}
          onDelete={handleDeleteAccount}
          onSupport={handleSupport}
        />
        <DeleteRoleModal
          open={state.deleteNotAllowedModal}
          onClose={() => updateState({ deleteNotAllowedModal: false })}
          title="Deletion not allowed"
          deleteNotAllowed={true}
          description={`This is the only active Super admin account for managing the\nplatform.\nTo proceed, please assign the role to another employee, of edit your credentials to transfer ownership.`}
        />

        <OtpVerifyModal
          open={state.otpModalOpen}
          onClose={() => updateState({ otpModalOpen: false })}
          email={state.userData?.basicDetails?.email || ""}
          otp={otp}
          setOtp={setOtp}
          timer={0}
          onBack={() => {
            updateState({
              otpModalOpen: false,
              deleteOpen: true,
              otpError: false
            });
          }}
          onVerify={handleOtpVerify}
          otpRefs={otpRefs}
          otpError={state.otpError}
          onResend={() => {
            showError("Please contact support to resend OTP for account deletion");
          }}
          title="Verify Account Deletion"
          message="Enter the OTP sent to your email to confirm account deletion"
          showBackButton={true}
          buttonText="DELETE ACCOUNT"
        />
      </div>
    </ProtectedRoute>
  );
}
