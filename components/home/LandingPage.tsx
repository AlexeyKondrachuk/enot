"use client";

import { landingData } from "@/Redux/api";
import { useGetLandingQuery } from "@/hooks/useLanding";
import styles from "@/app/page.module.scss";
import Approach from "./Approach";
import Capabilities from "./Capabilities";
import Contact from "./Contact";
import Hero from "./Hero";
import Projects from "./Projects";
import Services from "./Services";

export default function LandingPage() {
  const { data } = useGetLandingQuery();
  const content = data ?? landingData;

  return <main className={styles.main}>
    <Hero/>
    <div className={styles.container}>
      <Capabilities items={content.capabilities}/>
      <Services items={content.services}/>
      <Projects/>
      <Approach stack={content.stack} steps={content.steps}/>
      <Contact/>
    </div>
  </main>;
}
