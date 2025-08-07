import React, { useState, useEffect } from "react";
import {
  Linkedin,
  Github,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  ChevronUp,
} from "lucide-react";

export default function Footer() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const footerLinks = {
    Company: [
      { label: "About Us", path: "/about" },
      { label: "How It Works", path: "/how-it-works" },
      { label: "Safety", path: "/safety" },
    ],
    Support: [
      { label: "Help Center", path: "/help" },
      { label: "FAQs", path: "/faqs" },
      { label: "Report an Issue", path: "/report" },
    ],
  };

  const socialLinks = [
    {
      icon: <Linkedin className="w-5 h-5" />,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-400",
    },
    {
      icon: <Github className="w-5 h-5" />,
      href: "#",
      label: "Github",
      color: "hover:text-purple-400",
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-400",
    },
  ];

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      text: "hello@rideshare.com",
      href: "mailto:hello@rideshare.com",
      label: "Email",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      text: "+91 9156613991",
      href: "tel:9156613991",
      label: "Phone",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      href: "https://www.google.com/maps/place/IIT+Indore/@22.5318925,75.8963382,14z/data=!4m10!1m2!2m1!1siit+indore+map!3m6!1s0x3962ef0019278143:0x4a3b625343431c8a!8m2!3d22.5316879!4d75.9250033!15sCg5paXQgaW5kb3JlIG1hcCIDiAEBkgEHY29sbGVnZaoBTQoNL2cvMTFjM3d0Zm0ybQoKL20vMDR5ZjZ2eRABMh4QASIavrbkOTA1Rv9UkQ12fiY8HeNxR_OFZMNtRhUyDhACIgppaXQgaW5kb3Jl4AEA!16s%2Fg%2F11y73l4200?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D",
      text: "IIT Indore, Madhya Pradesh",
      label: "Location",
    },
  ];

  const BackToTop = () => (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:scale-110"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <ChevronUp className="w-5 h-5 relative z-10 group-hover:animate-bounce" />
    </button>
  );

  return (
    <footer className="relative bg-gradient-to-br from-blue-800 via-blue-600 to-blue-800 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div> */}

      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        {/* Main Content */}
        <div className="pt-20 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Brand Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                <div className="relative group">
                  <h2 className="text-4xl lg:text-5xl font-bold text-blue-200 transition-all duration-300">
                    RideShare
                  </h2>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg blur opacity-25 transition duration-1000 group-hover:duration-200"></div>
                </div>

                <p className="text-slate-300 leading-relaxed text-lg max-w-md">
                  Share Rides, Share Stories
                </p>

                {/* Newsletter Signup */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    Stay in the loop
                  </h4>
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    />
                    <button className="px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
                      <ArrowRight className="w-8 h-8 hover:rotate-45 transition-all duration-100" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="space-y-6">
                <h3 className="text-xl font-semibold text-white relative">
                  {title}
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-violet-400 to-transparent"></div>
                </h3>
                <ul className="space-y-3">
                  {links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.path}
                        className="text-slate-300 hover:text-white transition-all duration-300 group flex items-center gap-2 w-fit"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white relative">
                Get in Touch
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-violet-400 to-transparent"></div>
              </h3>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="group">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="flex items-center gap-3 text-slate-300 hover:text-white transition-all duration-300 group-hover:translate-x-1"
                      >
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-violet-500/20 transition-all duration-300">
                          {item.icon}
                        </div>
                        <span>{item.text}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="p-2 bg-white/5 rounded-lg">
                          {item.icon}
                        </div>
                        <span>{item.text}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Back to Top */}
        <div className="border-t border-white/10 pt-8 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm font-medium">
                Follow us
              </span>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12 ${social.color} group relative overflow-hidden`}
                    aria-label={social.label}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 to-indigo-600/0 group-hover:from-violet-600/20 group-hover:to-indigo-600/20 transition-all duration-300"></div>
                    <div className="relative z-10">{social.icon}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Back to Top */}
            <BackToTop />
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
            <p>© {currentYear} RideShare. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cursor Effect */}
      <div
        className="fixed pointer-events-none z-50 w-6 h-6 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 opacity-0 transition-opacity duration-300 mix-blend-difference"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          opacity: isHovered ? 0.6 : 0,
        }}
      ></div>
    </footer>
  );
}
