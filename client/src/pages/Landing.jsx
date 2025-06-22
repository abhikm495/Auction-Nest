import {  useSelector } from "react-redux";
import { CTA } from "../components/Landing/CTA";
import { Features } from "../components/Landing/Features";
import { Hero } from "../components/Landing/Hero";
import LoadingScreen from "../components/LoadingScreen";
import { React } from "react";


export const Landing = () => {
  const { user, loading } = useSelector((state) => state.auth);
  
  // useEffect(() => {
  //   if (!user) {
  //     dispatch(checkAuth());
  //   }
  // }, [dispatch, user]);
  
  if(loading) return <LoadingScreen/>
  
  return (
    <div className="min-h-screen bg-white">
      {!user && (
        <>
          <Hero />
          <Features />
          <CTA />
        </>
      )}
    </div>
  );
};
