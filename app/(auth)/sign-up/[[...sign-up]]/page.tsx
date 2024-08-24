import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex w-full justify-center h-[calc(100vh-100px)] items-center">
      <SignUp
        appearance={{
          baseTheme: dark,
          elements: {
            formButtonPrimary:
              "bg-btn-primary !shadow-none transition hover:bg-yellow-400",
          },
        }}
      />
    </div>
  );
}