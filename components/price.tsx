"use client";

import { useEffect } from "react";
import PricingCard from "./ui/pricing-card";
import { plans } from "@/lib/constants";

const Price = () => {
  useEffect(() => {
    const cards = document.querySelectorAll(".pricing-card");

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("stagger");
          observer.unobserve(entry.target);
        }
      });
    });

    cards.forEach((card) => observer.observe(card));
  }, []);

  return (
    <section
      id="pricing"
      className="px-10 my-32 flex flex-col gap-10 items-center"
    >
      <h1 className="sm:text-5xl text-4xl text">Pricing</h1>
      <p className="sm:text-base text-sm text">
        Choose the plan that best fits your needs
      </p>

      <div className="w-full flex gap-16 lg:flex-row flex-col justify-evenly items-center">
        {plans.map((plan) => (
          <PricingCard key={plan.price} options={plan} />
        ))}
      </div>
    </section>
  );
};

export default Price;
