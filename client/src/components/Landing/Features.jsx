import React, { useState, useEffect, useRef } from 'react';
import { Gavel, Shield, Clock, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export const Features = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const features = [
    {
      id: 1,
      icon: Gavel,
      title: "Smart Bidding",
      description: "AI-powered bidding recommendations and real-time market insights help you make informed decisions.",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      benefits: ["Real-time updates", "Smart recommendations", "Bid history tracking"]
    },
    {
      id: 2,
      icon: Shield,
      title: "Bank-Level Security",
      description: "Military-grade encryption and fraud protection ensure your transactions are completely secure.",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      benefits: ["256-bit encryption", "Fraud protection", "Secure payments"]
    },
    {
      id: 3,
      icon: Clock,
      title: "Global Marketplace",
      description: "Access auctions worldwide, 24/7. Never miss out on unique items from international sellers.",
      color: "orange",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      benefits: ["24/7 availability", "Global reach", "Multiple time zones"]
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Header Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-semibold mb-4">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>Premium Features</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Why Choose Our
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Auction Platform?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of online auctions with cutting-edge technology, 
            unparalleled security, and a global community of collectors.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredFeature === feature.id;
            
            return (
                              <div
                key={feature.id}
                className={`group relative transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Main Card */}
                <div className="relative p-8 bg-white rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700">
                      {feature.description}
                    </p>

                    {/* Benefits List */}
                    <ul className="space-y-3 mb-6">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-700">
                          <CheckCircle className={`w-4 h-4 text-${feature.color}-500`} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Learn More Button */}
                    <button className={`group/btn inline-flex items-center gap-2 text-${feature.color}-600 font-semibold transition-all duration-200 hover:gap-3`}>
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className={`text-center mt-20 transition-all duration-500 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">B</div>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">C</div>
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">+</div>
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Join 100,000+ satisfied users</p>
              <p className="text-gray-600 text-sm">Start your auction journey today</p>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};