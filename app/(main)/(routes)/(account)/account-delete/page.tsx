import { SignInButton } from "@clerk/nextjs";

const DeletedAccountPage = () => {
  return (
    <div className="h-full bg-black bg-dot-white/[0.2] relative flex items-center justify-center">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_50%,black)]"></div>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="shadow-xl bg-gradient-to-bl from-neutral-900 to-neutral-950 rounded-lg p-6 max-w-md text-center">
          <div className="mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Account Deleted</h1>
          <p className="text-neutral-300 mb-6">
            Your account has been successfully deleted. We&apos;re sad to see
            you go. If you ever want to return, feel free to sign in or sign up
            again.
          </p>
          <SignInButton
            mode="redirect"
            signUpFallbackRedirectUrl={"/search"}
            fallbackRedirectUrl={"/search"}
          >
            <button
              type="button"
              className="text-sm text-black bg-btn-primary py-2 px-4 rounded-2xl font-medium"
            >
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
};

export default DeletedAccountPage;
