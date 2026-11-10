import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { FeaturedCourses } from "@/components/sections/FeaturedCourses";
import { WhyUs } from "@/components/sections/WhyUs";
import { Instructors } from "@/components/sections/Instructors";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrustBar />
      <FeaturedCourses />
      <WhyUs />
      <Instructors />
      <Testimonials />
      <FinalCTA />
    </div>
  );
}
