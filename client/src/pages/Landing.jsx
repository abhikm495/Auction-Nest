import { CTA } from "../components/Landing/CTA";
import { Features } from "../components/Landing/Features";
import { Hero } from "../components/Landing/Hero";
import { React } from "react";



export const Landing = () => {
  
  return (
    <div className="min-h-screen bg-white">
     
        <>
          <Hero />
          <Features />
          <CTA />
        </>
     
    </div>
  );
};
