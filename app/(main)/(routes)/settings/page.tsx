"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { Sparkles, IndianRupee } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Switch from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useUser from "@/hooks/useUser";
import { useModalSelection } from "@/hooks/useModalSelection";

import { sendOTP } from "@/actions/otp.actions";
import {
  AISearchPreference,
  createSubscription,
  updateUsername,
} from "@/actions/user.actions";

import { plans } from "@/lib/constants";
import { format } from "date-fns";

type TActiveTab = "account" | "billing" | "security";
const MAX_CREDITS = 50;

const Page = ({
  searchParams,
}: {
  searchParams: { [param: string]: string };
}) => {
  const router = useRouter();
  const { user, dispatch } = useUser();
  const { modalDispatch } = useModalSelection();
  const { user: clerkUser, isLoaded } = useClerkUser();

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TActiveTab>("account");

  const prevAISearchPreferenceRef = useRef(false);

  const curPlan = user.hasSubscription
    ? "Professional"
    : searchParams?.plan === "Starter" || searchParams.plan === "Professional"
    ? searchParams.plan
    : user.plan;

  useEffect(() => {
    const tab =
      searchParams?.tab === "account" ||
      searchParams.tab === "billing" ||
      searchParams.tab === "security"
        ? searchParams.tab
        : "account";

    setActiveTab(tab);
  }, [searchParams.tab]);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const { username, imageUrl } = clerkUser;
      setUsername(username!);
      dispatch({ type: "USERNAME_CHANGE", payload: username! });
      dispatch({ type: "PROFILE_IMAGE_CHANGE", payload: imageUrl });
    }
  }, [dispatch, isLoaded, clerkUser]);

  const handleResetPasskey = async () => {
    const response = await sendOTP();
    if (!response.success) {
      toast.error(response.error);
      return;
    }

    toast.success(response.data);
    router.replace("/reset-passkey");
  };

  const handleAISearchToggle = async () => {
    prevAISearchPreferenceRef.current = user.isAISearch;
    dispatch({
      type: "AI_SEARCH_CHANGE",
      payload: !user.isAISearch,
    });

    const response = await AISearchPreference(!user.isAISearch);
    if (!response.success) {
      dispatch({
        type: "AI_SEARCH_CHANGE",
        payload: prevAISearchPreferenceRef.current,
      });
      toast.error(response.error);
      return;
    }
    toast.success(response.data);
  };

  const handleUsernameChange = async () => {
    setIsLoading(true);

    const response = await updateUsername(username);
    if (response.success) {
      dispatch({ type: "USERNAME_CHANGE", payload: username! });
      toast.success(response.data);
    } else toast.error(response.error);

    setIsLoading(false);
  };

  const handlePurchase = async () => {
    try {
      const response = await createSubscription();
      if (!response.success) {
        toast.error(response.error);
        return;
      }

      // Open Razorpay Checkout
      const options = {
        key: process.env.RAZORPAY_CLIENT_ID!,
        subscription_id: response.data,
        name: "Nexus",
        currency: "INR",
        recurring: true,
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error("Something went wrong.");
    }
  };

  const handleManageSubscription = async () => {
    modalDispatch({
      type: "onOpen",
      payload: "CancelSubscription",
      data: { type: "CancelSubscription", data: {} },
    });
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="sm:mx-4 mx-0 my-4 h-[calc(100%-2rem)] rounded-2xl overflow-y-auto bg-neutral-900 select-none space-y-8 [scrollbar-width:none]">
        <Card className="border-none">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.imageUrl} alt="Profile image" />
                  <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h1 className="text-3xl font-bold capitalize">
                  {user.username}
                </h1>
                <p className="text-sm text-neutral-400">{user.email}</p>
                <Badge
                  variant="secondary"
                  className="border-none bg-neutral-950 px-4 py-1"
                >
                  {user.plan} Plan
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as TActiveTab)}
          className="space-y-4"
        >
          <TabsList className="ml-4 bg-neutral-950">
            <TabsTrigger
              value="account"
              className={`${activeTab === "account" ? "bg-neutral-900" : ""}`}
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className={`${activeTab === "billing" ? "bg-neutral-900" : ""}`}
            >
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className={`${activeTab === "security" ? "bg-neutral-900" : ""}`}
            >
              Security
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="space-y-4 pb-4">
            <Card className="border-none bg-neutral-950 mx-4">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Username</Label>
                    <Input
                      id="name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-neutral-950 border border-neutral-700 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:ring-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="john@example.com"
                      type="email"
                      defaultValue={user.email}
                      disabled
                      className="bg-neutral-950 border border-neutral-700"
                    />
                  </div>
                </div>
                {isLoading ? (
                  <div className="rounded-lg text-sm bg-neutral-900 max-w-max px-4 py-2">
                    <div className="dot-loading-container">
                      <div />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleUsernameChange}
                    type="button"
                    className="rounded-lg text-sm bg-neutral-950 border border-neutral-800 max-w-max px-4 py-2 font-medium hover:bg-neutral-800 transition-colors text-white"
                  >
                    Save Changes
                  </button>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-neutral-950 mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Search Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">AI-Search</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable context-based searching for more accurate results.
                    </p>
                  </div>
                  <Switch
                    value={user.isAISearch}
                    onValueChange={handleAISearchToggle}
                    label={null}
                    className="max-w-max"
                  />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">Visual Search</h4>
                    <p className="text-sm text-muted-foreground">
                      Use image recognition for enhanced search capabilities.
                    </p>
                  </div>
                  <button
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-80 disabled:cursor-not-allowed  h-10
                    rounded-lg text-sm bg-neutral-950 border border-neutral-800 max-w-max px-4 py-2 font-medium hover:bg-neutral-800 transition-colors text-white"
                    disabled
                  >
                    Coming Soon
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="billing" className="space-y-4 pb-4">
            <Card className="border-none bg-neutral-950 mx-4">
              <CardHeader className="grid md:grid-cols-[1fr_auto] items-start">
                <div className="space-y-4">
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing details.
                  </CardDescription>
                </div>
                <>
                  {user.hasSubscription ? (
                    <>
                      {
                        user.subscriptionStatus === "cancelled" 
                        ? <Badge>Subscription cancelled</Badge>
                        : (
                          <button
                            type="button"
                            onClick={handleManageSubscription}
                            className="rounded-lg text-sm bg-neutral-950 border border-neutral-800 px-4 py-2 font-medium hover:bg-neutral-800 transition-colors text-white disabled:cursor-not-allowed disabled:bg-neutral-800"
                          >
                            Cancel Subscription
                          </button>
                        )
                      }
                    </>
                  ) : (
                    <>
                      {curPlan === "Starter" ? (
                        <button
                          onClick={() => {
                            router.push(
                              "/settings?plan=Professional&tab=billing"
                            );
                          }}
                          type="button"
                          className="rounded-lg text-sm bg-neutral-950 border border-neutral-800 px-4 py-2 font-medium hover:bg-neutral-800 transition-colors text-white disabled:cursor-not-allowed disabled:bg-neutral-800"
                        >
                          Upgrade to Professional
                        </button>
                      ) : (
                        <button
                          onClick={handlePurchase}
                          type="button"
                          className="rounded-lg text-sm bg-neutral-950 border border-neutral-800 px-4 py-2 font-medium hover:bg-neutral-800 transition-colors text-white disabled:cursor-not-allowed disabled:bg-neutral-800"
                        >
                          Buy now
                        </button>
                      )}
                    </>
                  )}
                </>
              </CardHeader>
              <CardContent className="grid grid-cols-[1fr_auto] gap-4 items-start space-y-4">
                <div>
                  {plans.map(
                    ({ features, plan, price }) =>
                      plan === curPlan && (
                        <div key={plan} className="space-y-4">
                          <p className="text-3xl font-bold flex items-center gap-1">
                            <IndianRupee
                              className="inline-block"
                              style={{ strokeWidth: "2.5" }}
                            />{" "}
                            {price}{" "}
                            <span className="text-sm font-normal self-end">
                              / month
                            </span>
                          </p>
                          <>
                            {curPlan === "Starter" && (
                              <div className="flex sm:flex-row flex-col sm:items-center gap-2">
                                <div className="w-full space-y-2">
                                  <p className="text-sm">AI Search Credits</p>
                                  <Progress
                                    value={Math.round(
                                      ((MAX_CREDITS - user.credits.ai) /
                                        MAX_CREDITS) *
                                        100
                                    )}
                                    className="flex-1"
                                  >
                                    {user.credits.search + " / " + MAX_CREDITS}
                                  </Progress>
                                </div>
                                <div className="w-full space-y-2">
                                  <p className="text-sm">AI Chat Credits</p>
                                  <Progress
                                    value={Math.round(
                                      ((MAX_CREDITS - user.credits.ai) /
                                        MAX_CREDITS) *
                                        100
                                    )}
                                    className="flex-1"
                                  >
                                    {user.credits.search + " / " + MAX_CREDITS}
                                  </Progress>
                                </div>
                              </div>
                            )}
                          </>
                          <ul className="space-y-2">
                            {features.map(
                              ({
                                available,
                                content,
                                icon: Icon,
                                comingSoon,
                              }) => (
                                <li
                                  key={content}
                                  className={`flex items-center gap-2 ${
                                    available
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  <Icon className="h-4 w-4 flex-shrink-0" />
                                  <span className="text-sm">
                                    {content}{" "}
                                    {comingSoon && <span>(Coming Soon)</span>}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )
                  )}
                </div>
                {user.hasSubscription && (
                  <>
                    {user.isExpired ? (
                      <Badge>Subscription expired</Badge>
                    ) : (
                      <Badge>
                        {format(user.startDate!, "MM/dd/yyyy")} -{" "}
                        {format(user.endDate!, "MM/dd/yyyy")}
                      </Badge>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security" className="space-y-4 pb-4">
            <Card className="border-none bg-neutral-950 mx-4">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account&apos;s security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Reset Passkey</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    If you&apos;ve forgotten your passkey, you can reset it
                    here.
                  </p>
                  <button
                    disabled={!user.hasPasskey && !user.hasSubscription}
                    type="button"
                    onClick={handleResetPasskey}
                    className="rounded-lg text-sm bg-neutral-950 border border-neutral-800 max-w-max px-4 py-2 font-medium hover:bg-neutral-800 transition-colors text-white disabled:cursor-not-allowed disabled:bg-neutral-800"
                  >
                    Reset Passkey
                  </button>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-medium">Delete Account</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      modalDispatch({
                        type: "onOpen",
                        payload: "AccountDelete",
                        data: { type: "AccountDelete" },
                      });
                    }}
                    className="rounded-lg text-sm bg-red-800 max-w-max px-4 py-2 font-medium hover:bg-red-800/85 transition-colors text-white"
                  >
                    Delete Account
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Page;
