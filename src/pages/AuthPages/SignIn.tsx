import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="EverIndia Path Lab Admi"
        description="This is EverIndia Path Lab Admin panel "
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
