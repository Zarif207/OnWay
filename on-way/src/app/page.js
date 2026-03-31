
"use client";

import { motion } from "framer-motion";
import HowItWorks from "./components/Home/HowItWorks";
import HomeLatestReviews from "./components/Home/LatestReviews";
import Contact from "./root-components/Home/Contact";
import Earn from "./root-components/Home/Earn";
import Hero from "./root-components/Home/Hero";
import HomeClientEffects from "./root-components/Home/HomeClientEffects";
import MainHero from "./root-components/Home/main-hero";
import Platform from "./root-components/Home/Platform";
import Safety from "./root-components/Home/Safety";
import Stats from "./root-components/Home/Stats";
import Transportation from "./root-components/Home/Transportation";

export default function Home() {
  return (
    <>
      <HomeClientEffects > </HomeClientEffects>
        <main className="bg-white">
          {/* <MainHero /> */}

          {/* Reveal Container */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.01 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative z-30 bg-white"
          >
            <Hero />
            <Transportation />
            <Platform />
            <div>
              <Stats />
            </div>
            <Safety />
            <HowItWorks />
            <Earn />
            <HomeLatestReviews />
            <Contact />
          </motion.div>
        </main>
     
    </>
  );
}
