import { absoluteUrl } from "@/lib/utils";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  render,
  Section,
  Text,
} from "@react-email/components";

type EmailTemplateProps = {
  otp: string;
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
  marginTop: "20px",
  maxWidth: "360px",
  margin: "0 auto",
  padding: "68px 0 130px",
};

const logo = {
  margin: "0 auto",
};

const tertiary = {
  color: "#0a85ea",
  fontSize: "11px",
  fontWeight: 700,
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  height: "16px",
  letterSpacing: "0",
  lineHeight: "16px",
  margin: "16px 8px 8px 8px",
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
};

const secondary = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
  fontSize: "20px",
  fontWeight: 500,
  lineHeight: "24px",
  marginBottom: "0",
  marginTop: "0",
  textAlign: "center" as const,
};

const codeContainer = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "4px",
  margin: "16px auto 14px",
  verticalAlign: "middle",
  width: "280px",
};

const code = {
  color: "#000",
  display: "inline-block",
  fontFamily: "HelveticaNeue-Bold",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  lineHeight: "40px",
  paddingBottom: "8px",
  paddingTop: "8px",
  margin: "0 auto",
  width: "100%",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#444",
  fontSize: "15px",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  letterSpacing: "0",
  lineHeight: "23px",
  padding: "0 40px",
  margin: "0",
  textAlign: "center" as const,
};

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  otp,
}) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${absoluteUrl}/logo.jpeg`}
          width="150"
          height="150"
          alt="Nexus"
          style={logo}
        />
        <Text style={tertiary}>Passkey reset OTP</Text>
        <Heading style={secondary}>
          Enter the following OTP to reset your Passkey.
        </Heading>
        <Section style={codeContainer}>
          <Text style={code}>{otp}</Text>
        </Section>
        <Text style={paragraph}>(This OTP is valid for 10 minutes)</Text>
      </Container>
    </Body>
  </Html>
);

export const getPlainTextEmail = async ({ otp }: EmailTemplateProps) => {
  return await render(<EmailTemplate otp={otp} />, {
    plainText: true,
  });
};
