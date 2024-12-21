import Image from "next/image";
import IntegrationWrapper from "./_integration-wrapper";

const Page = async () => {
  return (
    <div className="relative select-none sm:mx-4 my-4 mx-0 h-[calc(100%-2rem)] flex lg:flex-row flex-col overflow-y-auto bg-neutral-900 rounded-2xl">
      <Image
        src="/pattern.svg"
        alt="pattern"
        fill
        priority
        className="object-cover md:inline hidden z-0 opacity-5"
      />

      <div className="relative z-50 sm:pl-20 sm:px-5 px-10 pr-5 py-14 flex-1 flex flex-col gap-5 justify-evenly">
        <div className="space-y-6">
          <p className="uppercase text-neutral-500">integration</p>
          <h1
            className="sm:text-5xl text-4xl font-semibold text-btn-secondary text-left max-w-96"
            style={{ lineHeight: "1.2" }}
          >
            Most <span className="text-[#7f6eff]">popular</span> integration
            apps
          </h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="sm:text-2xl text-xl font-semibold">
              Effortless Connectivity
            </h2>
            <p className="text-sm text-neutral-400">
              Securely connect and manage your go-to apps, ensuring smooth and
              efficient access to all your critical information.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="sm:text-2xl text-xl font-semibold">
              Instant Syncing
            </h2>
            <p className="text-sm text-neutral-400">
              Sync your favorite apps like Gmail, Slack, Notion, and Drive to
              quickly find answers and information in real-time. This
              integration streamlines your workflow and enhances productivity.
            </p>
          </div>
        </div>
      </div>

      <IntegrationWrapper />
    </div>
  );
};

export default Page;
