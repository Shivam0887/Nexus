import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-700 mb-6">
            Last updated November 29, 2024
          </p>

          <p className="text-gray-700 mb-6">
            This Privacy Policy for Nexus (<q>we,</q> <q>us,</q>, <q>our</q>, or{" "}
            <q>Nexus</q>), describes how and why we might access, collect,
            store, use, and/or share your personal information when you use our
            services (collectively, referred as <q>Services</q>), including when
            you:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              Visit our website at{" "}
              <Link
                href="https://qflbv4c3-3001.inc1.devtunnels.ms"
                className="text-blue-600 hover:underline"
              >
                https://qflbv4c3-3001.inc1.devtunnels.ms
              </Link>{" "}
              , or any website of ours that links to this Privacy Notice.
            </li>
          </ul>
          <p className="text-gray-700 mb-6">
            Questions or concerns? Reading this Privacy Policy will help you
            understand your privacy rights and choices. We are responsible for
            making decisions about how your personal information is processed.
            If you do not agree with our policies and practices, please do not
            use our Services. If you still have any questions or concerns,
            please{" "}
            <Link
              href="/privacy-policy/#contact-us"
              className="text-blue-600 hover:underline"
            >
              contact us
            </Link>{" "}
            at .
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            1. WHAT INFORMATION DO WE COLLECT?
          </h2>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Personal information you disclose to us:
          </h3>
          <p className="text-gray-700 mb-4">
            <em>
              In Short: We collect personal information that you provide to us.
            </em>
          </p>
          <p className="text-gray-700 mb-4">
            We collect personal information that you voluntarily provide to us
            when you register or connect to our Service.
          </p>
          <p className="text-gray-700 mb-4">
            The personal information that we collect depends on the context of
            your interactions with us and the Services, the choices you make,
            and the products and features you use. The personal information we
            collect may include the following:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              Name (First name and/or Last name), Email Id, Username, Profile
              Picture (if available) when signing up for or using our Service.
            </li>
            <li>
              Access and refresh tokens (<q>Tokens</q>) provided by different
              Platforms.
            </li>
            <li>
              Platform specific information like Notion (Workspace Id, Bot Id),
              Slack (Team Id, Team Name), GitHub (Installation Id), and Billing
              Informations.
            </li>
            <li>
              Passkey (to protect against unauthorized integration of the
              Platform).
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Sensitive Information:
          </h3>
          <p className="text-gray-700 mb-4">
            We do not process sensitive information. In case, sensitive
            information is required to provide services, we will obtain consent
            or provide notification to the user before collection.
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Payment Data:
          </h3>
          <p className="text-gray-700 mb-4">
            We may collect data necessary to process your payment if you choose
            to make purchases, such as your payment instrument number, and the
            security code associated with your payment instrument.
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Social Media Login Data:
          </h3>
          <p className="text-gray-700 mb-4">
            We may provide you with the option to register with us using your
            existing social media account details, like your Google, and other
            social media accounts, if available. If you choose to register in
            this way, we will collect certain profile information about you from
            the social media provider, as described above.
          </p>

          <p className="text-gray-700 mb-6">
            All personal information that you provide to us must be true,
            complete, and accurate, and you must notify us of any changes to
            such personal information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            2. Why are we collecting or processing your personal data?
          </h2>
          <p className="text-gray-700 mb-4">
            <em>
              In Short: We process your information to provide, improve, and
              administer our Services, communicate with you, for security and
              fraud prevention, and to comply with law. We may also process your
              information for other purposes with your consent.
            </em>
          </p>

          <p className="text-gray-700 mb-4">
            We process your personal data to provide seamless, secure, and
            personalized access to its services. Below, we outline the purposes
            for data collection and how specific types of information are used.
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            1. Service Provision and Optimization
          </h3>
          <p className="text-gray-700 mb-4">
            We use the following information to deliver and enhance our
            services:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              <b>
                Name, Email ID, Username, and Profile Picture (if available):
              </b>
              <ol className="list-decimal list-inside pl-5 mt-1">
                <li>
                  To facilitate account creation and authentication and
                  otherwise manage user accounts. We may process your
                  information so you can create and log in to your account, as
                  well as keep your account in working order.
                </li>
                <li>
                  To send email notifications when we update our policies.
                </li>
              </ol>
            </li>
            <li>
              <b>Platform-Specific Information:</b> Workspace IDs, Bot IDs, Team
              IDs, Installation IDs, and Team Names, which are necessary to
              connect and retrieve data from different platforms.
            </li>
            <li>
              <b>Tokens:</b> To authenticate users and facilitate secure
              integration with third-party platforms.
            </li>
            <li>
              <b>Passkeys:</b> To ensure the security of third-party
              integrations and prevent unauthorized access.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            2. Billing and Payment Processing
          </h3>
          <p className="text-gray-700 mb-4">
            We collect and process the following data to manage financial
            transactions:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              <b>Billing Information:</b> To issue invoices and process
              subscription payments.
            </li>
            <li>
              <b>Payment Data:</b> To securely complete financial transactions
              related to our services.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            3. Security and Fraud Prevention
          </h3>
          <p className="text-gray-700 mb-4">
            To protect user data and ensure platform integrity, we process:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              <b>Tokens and Passkeys:</b> To detect and prevent unauthorized
              access to our Serviced and its connected platforms.
            </li>
            <li>
              <b>Platform-Specific Information:</b> To validate the authenticity
              of third-party integrations.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            4. Legal Compliance
          </h3>
          <p className="text-gray-700 mb-4">
            To respond to legal requests or comply with applicable laws, such as
            privacy regulations. To protect our Services. We may process your
            information as part of our efforts to keep our Services safe and
            secure, including fraud monitoring and prevention.
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            5. Consent-Based Actions
          </h3>
          <p className="text-gray-700 mb-4">
            We process the following information only with explicit user
            consent:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              For features requiring additional permissions, such as accessing
              sensitive Data (if applicable) from third-party services.
            </li>
            <li>
              If users opt to sign in using accounts like Google, certain
              profile information will be collected for authentication.
            </li>
            <li>
              To identify the user. We are collecting the user information only
              to identify the user who they claim to be.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            3. With whom does your data share with?
          </h2>
          <p className="text-gray-700 mb-6">
            Data such as your input, and respective output will be used by
            third-party vendors (till our Service is in Beta) as reasonably
            necessary for the purposes of enhancing and supporting their
            services and for the purpose of providing services to you. These
            vendors include Google&apos;s Gemini AI. Although these vendors
            provide high security and privacy, still you must not send any
            sensitive information when using our Service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            4. AI-BASED PRODUCTS
          </h2>
          <p className="text-gray-700 mb-4">
            <em>
              In Short: We offer products, features, or tools powered by
              artificial intelligence, machine learning, or similar
              technologies.
            </em>
          </p>

          <p className="text-gray-700 mb-4">
            As part of our Services, we offer products, features, or tools
            powered by artificial intelligence, machine learning, or similar
            technologies (collectively, <q>AI Products</q>). These tools are
            designed to enhance your experience and provide you with innovative
            solutions. The terms in this Privacy Policy govern your use of the
            AI Products within our Services.
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Use of AI Technologies
          </h3>
          <p className="text-gray-700 mb-4">
            We provide the AI Products through third-party service providers (
            <q>AI Service Providers</q>), including Google&apos;s Gemini AI. As
            outlined in this Privacy Policy, your input, and respective output
            will be shared with and processed by these AI Service Providers to
            enable your use of our AI Products for purposes outlined above.
          </p>
          <p className="text-gray-700 mb-6">
            Keep in mind you must not send any sensitive information when using
            AI Products. You must not use the AI Products in any way that
            violates the terms or policies of any AI Service Provider.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            5. How do we handle your Social Logins?
          </h2>
          <p className="text-gray-700 mb-4">
            <em>
              In Short: If you choose to register or log in to our Services
              using a social media account, we may have access to certain
              information about you.
            </em>
          </p>

          <p className="text-gray-700 mb-4">
            Our Services offer you the ability to register and log in using your
            third-party social media account like Google. Where you choose to do
            this, we will receive certain profile information about you from
            your social media provider. The profile information we receive may
            vary depending on the social media provider concerned, but will
            often include your name, email id, username and profile picture.
          </p>

          <p className="text-gray-700 mb-6">
            We will use the information we receive only for the purposes that
            are described in this Privacy Policy or that are otherwise made
            clear to you on the relevant Services. Please note that we do not
            control, and are not responsible for, other uses of your personal
            information by your third-party social media provider. We recommend
            that you review their privacy policies to understand how they
            collect, use, and share your personal information, and how you can
            set your privacy preferences on their sites and apps.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            6. HOW LONG DO WE KEEP YOUR INFORMATION?
          </h2>
          <p className="text-gray-700 mb-4">
            <em>
              In Short: We keep your information for as long as necessary to
              fulfill the purposes outlined in this Privacy Policy unless
              otherwise required by law.
            </em>
          </p>

          <p className="text-gray-700 mb-6">
            We will only keep your search history for as long as it is necessary
            for the purposes set out in this Privacy Notice, unless a longer
            retention period is required or permitted by law (such as tax,
            accounting, or other legal requirements). No purpose in this notice
            will require us to keep your personal information for longer than
            the period of time in which users have an account with us.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            7. Data Security
          </h2>
          <p className="text-gray-700 mb-4">
            Safeguarding user data is our top priority. We implement stringent
            security measures to ensure that your personal information and
            connected platform data are protected. Below are the measures we
            take to maintain data security:
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            1. Data Encryption
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              <b>At Rest:</b> Data stored by us is encrypted using AES-256,
              ensuring it remains secure even if accessed unlawfully.
            </li>
            <li>
              <b>In Transit:</b> Data exchanged between us and connected
              platforms is encrypted using TLS (Transport Layer Security)
              protocols with AES-256 encryption to protect it from interception
              or tampering.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            2. Data Redaction
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              We utilize advanced data redaction techniques to ensure that
              sensitive or irrelevant information from processed data is masked
              or excluded when it is not required for the service, reducing the
              risk of exposure.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            3. Secure API Development
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              All APIs used by us are developed with security as a core
              principle, incorporating best practices such as input validation,
              secure authentication mechanisms, and regular vulnerability
              assessments to prevent unauthorized access or exploitation.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            4. Multi-Factor Authentication (MFA)
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              Our Service employs Passkey mechanisms to restrict unauthorized
              integration of connected platforms. Passkeys ensure that only
              verified and authenticated users can link their accounts,
              providing an additional layer of security.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            5. Access Token Revocation
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              When a user deletes or disconnects their account, we immediately
              revoke all associated access tokens. This ensures we no longer
              have access to any permissions or data from third-party platforms,
              maintaining user privacy and control.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            6. Access Control
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4">
            <li>
              We implement strict role-based access control (RBAC) to ensure
              that only authorized users and system components have access to
              sensitive information. Access permissions are regularly reviewed
              and updated to prevent unauthorized use or disclosure.
            </li>
          </ul>

          <p className="text-gray-700 mb-6">
            By incorporating these robust security measures, our Service ensures
            that your data is managed with the highest standards of privacy and
            protection.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            8. Data Retention
          </h2>
          <p className="text-gray-700 mb-4">
            We retain your data only as long as it is necessary to fulfill the
            purposes for which it was collected, including meeting legal,
            accounting, or reporting requirements. All data is securely stored
            on our servers, adhering to strict security protocols.
          </p>

          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Retention Periods by Data Category
          </h3>
          <ol className="list-decimal list-inside text-gray-700 mb-6 pl-4">
            <li>
              <b>User Credentials Data</b>
              <ul className="list-disc list-inside pl-5 mt-1">
                <li>
                  User credentials such as usernames, email addresses, and
                  encrypted passwords are retained for as long as the user
                  maintains an active account with Nexus.
                </li>
                <li>
                  Upon account deactivation or deletion, all user credentials
                  data will be permanently deleted from our systems.
                </li>
              </ul>
            </li>
            <li>
              <b>Search Query Data</b>
              <ul className="list-disc list-inside pl-5 mt-1">
                <li>
                  Search queries entered by users are retained for a maximum of
                  <strong> 3 months</strong> to enhance the user experience and
                  provide better services.
                </li>
                <li>
                  Users have the right to request deletion of their search query
                  data, and we will promptly honor such requests.
                </li>
              </ul>
            </li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            9. User Privacy Rights
          </h2>
          <p className="text-gray-700 mb-4">
            The Digital Personal Data Protection (DPDP) Act, 2023 outlines the
            rights and duties of the Data Principal, which refers to the
            individual whose personal data is being processed. It is crucial as
            it empowers individuals by granting them specific rights regarding
            their personal data and also outlines their responsibilities when
            exercising these rights.
          </p>

          <ol className="list-decimal list-inside text-gray-700 mb-6 pl-4">
            <li>
              <b>Right to Access Information About Personal Data</b>
              <ul className="list-disc list-inside pl-5 mt-1">
                <li>
                  <b> Summary of Personal Data:</b> The Data Principal has the
                  right to request a summary of the personal data being
                  processed by the Data Fiduciary (the entity processing the
                  data) and the activities related to that data.
                </li>
                <li>
                  <b>Identities of Other Data Fiduciaries:</b> The Data
                  Principal can also request information about all other Data
                  Fiduciaries and Data Processors with whom their personal data
                  has been shared, along with a description of the data shared.
                </li>
                <li>
                  <b>Additional Information:</b> The Data Principal may seek any
                  other information related to their personal data and its
                  processing as prescribed by the rules.
                </li>
              </ul>
            </li>
            <li>
              <b>Right to Correction and Erasure of Personal Data</b>
              <ul className="list-disc list-inside pl-5 mt-1">
                <li>
                  <b>Correction and Completion:</b> The Data Principal has the
                  right to request the correction of inaccurate or misleading
                  personal data, as well as the completion of incomplete data.
                </li>
                <li>
                  <b>Erasure of Personal Data:</b> The Data Principal can
                  request the erasure of their personal data. The Data Fiduciary
                  must comply unless retention is necessary for a specified
                  purpose or for compliance with any applicable law.
                </li>
              </ul>
            </li>
            <li>
              <b>Right to Grievance Redressal</b>
              <ul className="list-disc list-inside pl-5 mt-1">
                <li>
                  <b>Grievance Mechanism:</b> The Data Principal has the right
                  to have readily available means of grievance redressal
                  provided by the Data Fiduciary regarding any act or omission
                  related to their personal data.
                </li>
                <li>
                  <b>Response Time:</b> The Data Fiduciary is required to
                  respond to grievances within a prescribed period from the date
                  of receipt.
                </li>
              </ul>
            </li>
            <li>
              <b>Right to Nominate</b>
              <ul className="list-disc list-inside pl-5 mt-1">
                <li>
                  <b>Nomination of Another Individual:</b> The Data Principal
                  can nominate another individual to exercise their rights in
                  the event of their death or incapacity. This ensures that the
                  rights of the Data Principal can still be exercised even if
                  they are unable to do so themselves.
                </li>
              </ul>
            </li>
            <li>
              <b>Duties of Data Principal</b>
              <ul className="list-disc list-inside pl-5 mt-1">
                <li>
                  <b>Compliance with Laws:</b> The Data Principal must comply
                  with all applicable laws while exercising their rights under
                  this Act.
                </li>
                <li>
                  <b>Authenticity of Information:</b> The Data Principal should
                  not impersonate another person while providing personal data
                  and must ensure that they do not suppress any material
                  information.
                </li>
                <li>
                  <b>No False Grievances:</b> The Data Principal is required to
                  avoid registering false or frivolous grievances or complaints
                  with the Data Fiduciary or the Board.
                </li>
                <li>
                  <b>Authentic Information:</b> When exercising the right to
                  correction or erasure, the Data Principal must furnish only
                  verifiably authentic information.
                </li>
              </ul>
            </li>
          </ol>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            10. Do we collect information from minors?
          </h2>
          <p className="text-gray-700 mb-4">
            <em>
              In Short: We do not knowingly collect data from children under 18
              years of age.
            </em>
          </p>

          <p className="text-gray-700 mb-6">
            We do not knowingly collect or ask for data from children under 18
            years of age. By using the Services, you represent that you are at
            least 18 or that you are the parent or guardian of such a minor and
            consent to such minor dependent&apos;s use of the Services. If you
            are a parent or guardian and believe that your child has provided us
            with personal information without your consent, please contact us at
            example@gmail.com, and If we learn that personal information from
            users less than 18 years of age has been collected, we will
            deactivate the account and take reasonable measures to promptly
            delete such data from our records
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            11. DO WE MAKE UPDATES TO THIS POLICY?
          </h2>
          <p className="text-gray-700 mb-4">
            <em>
              In Short: Yes, we will update this notice as necessary to stay
              compliant with relevant laws.
            </em>
          </p>

          <p className="text-gray-700 mb-6">
            We may update this Privacy Policy from time to time. The updated
            version will be indicated by an updated <q>Revised</q> date at the
            top of this Privacy Policy. If we make material changes to this
            Privacy Policy, we may notify you either by prominently posting a
            notice of such changes or by directly sending you an email
            notification. We encourage you to review this Privacy Policy
            frequently to be informed of how we are protecting your information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
          </h2>
          <p className="text-gray-700 mb-6">
            If you have questions or comments about this notice, you may email
            us at{" "}
            <Link
              id="contact-us"
              href="mailto:gguru3073@gmail.com"
              className="text-blue-600 hover:underline"
            >
              gguru3073@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
