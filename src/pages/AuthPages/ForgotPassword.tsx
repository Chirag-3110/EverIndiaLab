import ForgotPasswordFlow from "../../components/auth/ForgotPasswordFlow";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

const ForgotPassword = () => {
  return (
    <>
      <PageMeta
        title="EverIndia Path Lab Admin"
        description="This is EverIndia Path Lab Admin panel "
      />
      <AuthLayout>
        <ForgotPasswordFlow />
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;
