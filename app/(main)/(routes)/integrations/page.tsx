import { Inter } from "next/font/google";
import { images } from "@/lib/constants";
import IntegrationCard from "@/components/integration-card";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

const Page = () => {
  return (
    <div
      className={`relative m-4 h-[calc(100%-2rem)] overflow-auto flex md:flex-row flex-col bg-neutral-900 rounded-2xl ${inter.className}`}
    >
      <Image
        src="/pattern.svg"
        alt="pattern"
        fill
        priority
        className="object-cover md:inline hidden z-0 opacity-5"
      />
      <div className="relative z-50 md:px-20 py-14 px-10 flex-1 flex flex-col gap-5 justify-evenly">
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

      <div className="relative z-50 flex flex-col items-center my-10 md:overflow-auto gap-10 flex-1">
        {images.map(({ alt, desc, src, key }) => (
          <IntegrationCard alt={alt} src={src} desc={desc} key={key} />
        ))}
      </div>
    </div>
  );
};

export default Page;
