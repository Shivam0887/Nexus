import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Refund Policy
          </h1>
          <p className="text-sm text-gray-700 mb-6">
            Last updated November 29, 2024
          </p>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Thank you for choosing our services. Please carefully review our
            policy regarding cancellations and refunds:
          </h2>
          <ol className="list-decimal list-inside text-gray-700  mb-6 pl-4">
            <li>
              <b>Non-Refundable Purchases:</b> All purchases are non-refundable.
              Once payment is made, it cannot be refunded.
            </li>
            <li>
              <b>Subscription Cancellation:</b> You may cancel your subscription
              at any time by logging into your account. Your cancellation will
              take effect at the end of the current paid term, and no further
              charges will be applied after that period.
            </li>
            <li>
              <b>Service Access After Cancellation:</b> After cancellation, you
              will continue to have access to your subscription until the end of
              the current billing cycle. No further payments will be taken once
              the subscription expires.
            </li>
            <li>
              <b>Changes to Policy:</b> We reserve the right to modify or update
              this policy at any time. Any changes will be reflected on this
              page, and you will be notified accordingly.
            </li>
          </ol>

          <p className="text-gray-700 mb-6">
            For any questions regarding our Refund policy, please feel free to
            contact us{" "}
            <Link
              id="contact-us"
              href="mailto:gguru3073@gmail.com"
              className="text-blue-600 hover:underline"
            >
              gguru3073@gmail.com
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
