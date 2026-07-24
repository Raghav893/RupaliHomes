import Navbar from "../components/Navbar";
import HeroV2 from "../components/HeroV2";
import About from "../components/About";
import Projects from "../components/Projects";
import WhyChooseUs from "../components/WhyChooseUs";
import ProcessFlow from "../components/ProcessFlow";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import InstagramReels from "@/components/InstagramReels";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <HeroV2 />
      <Projects />
      <About />
      <WhyChooseUs />
      <ProcessFlow />
      <Services />
      <Testimonials />
      <InstagramReels />
      <Contact />
      <Footer />
    </main>
  );
}
