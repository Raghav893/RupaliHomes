"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="pt-32 pb-24 px-6 flex-grow">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-4xl font-bold font-syne text-accent-dark mb-8">Privacy Policy</h1>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-6 leading-relaxed">
            <p>
              At Rupali Homes, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website and services.
            </p>
            <h2 className="text-2xl font-semibold text-accent-dark mt-8 mb-4">Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you submit a contact form, inquire about a property, or sign up for our newsletter. This may include your name, email address, phone number, and location preferences.
            </p>
            <h2 className="text-2xl font-semibold text-accent-dark mt-8 mb-4">How We Use Your Information</h2>
            <p>
              We use the information we collect to connect you with relevant properties, respond to your inquiries, improve our services, and communicate with you about updates and offers.
            </p>
            <h2 className="text-2xl font-semibold text-accent-dark mt-8 mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <h2 className="text-2xl font-semibold text-accent-dark mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at contact@rupalihomes.com.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
