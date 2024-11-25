import { SignInButton } from "@clerk/nextjs";

const DeletedAccountPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-neutral-800 shadow-lg rounded-lg p-6 max-w-md text-center">
        <div className="mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Account Deleted</h1>
        <p className="text-neutral-300 mb-6">
          Your account has been successfully deleted. We&apos;re sad to see you
          go. If you ever want to return, feel free to log in or sign up again.
        </p>
        <SignInButton
          mode="modal"
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
  );
};

export default DeletedAccountPage;
