import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar, CheckCircle, Users, Shield, BarChart, Zap, TrendingUp, Globe } from "lucide-react";

export default function LandingPage() {
  const [stats, setStats] = useState([
    { value: 0, label: "Companies Using", suffix: "+", duration: 2000 },
    { value: 0, label: "Leaves Processed", suffix: "K+", duration: 1500 },
    { value: 0, label: "Approval Rate", suffix: "%", duration: 1000 },
    { value: 0, label: "Time Saved", suffix: "%", duration: 1200 },
  ]);

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Intuitive Leave Calendar",
      description: "Visual calendar view for easy scheduling and tracking",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "One-Click Approvals",
      description: "Streamlined approval process for managers",
      color: "from-green-500 to-emerald-400"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Real-time visibility across departments",
      color: "from-purple-500 to-pink-400"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with audit trails",
      color: "from-amber-500 to-orange-400"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Smart Analytics",
      description: "Insights into team availability and trends",
      color: "from-red-500 to-rose-400"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Implementation",
      description: "Get started in minutes, not weeks",
      color: "from-indigo-500 to-violet-400"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "HR Director",
      company: "TechCorp Inc.",
      quote: "Reduced our leave processing time by 80%",
      avatar: "SC"
    },
    {
      name: "Raj Patel",
      role: "Operations Manager",
      company: "GrowthStartups",
      quote: "The analytics dashboard transformed our planning",
      avatar: "RP"
    },
    {
      name: "Maria Garcia",
      role: "Team Lead",
      company: "FinSecure Ltd.",
      quote: "Simple interface, powerful features",
      avatar: "MG"
    }
  ];

  // Animated counter effect
  useEffect(() => {
    stats.forEach((stat, index) => {
      const targetValues = [500, 25, 99, 70];
      const increment = targetValues[index] / (stat.duration / 30);
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValues[index]) {
          current = targetValues[index];
          clearInterval(timer);
        }
        setStats(prev => prev.map((s, i) => 
          i === index ? { ...s, value: Math.floor(current) } : s
        ));
      }, 30);
      
      return () => clearInterval(timer);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Leave<span className="text-blue-600">MS</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-full px-4 py-2 mb-8"
            >
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trusted by 500+ companies worldwide
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="block text-gray-900 dark:text-white">Modern Leave</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Management Made Simple
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10"
            >
              Streamline leave requests, approvals, and tracking with our intuitive platform designed for modern teams. 
              Save time, reduce errors, and boost productivity.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link
                to="/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Start Free Trial →</span>
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold text-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
                View Live Demo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                    <span className="text-blue-600">{stat.suffix}</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
              {/* Mock Dashboard */}
              <div className="bg-gray-900 p-2">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-gray-400 text-sm">Leave Management Dashboard</div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Stats Cards */}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-2">Available Leaves</div>
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-2">Pending Approvals</div>
                      <div className="text-2xl font-bold text-white">3</div>
                      <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full w-2/4"></div>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-2">Team Availability</div>
                      <div className="text-2xl font-bold text-white">85%</div>
                      <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-4/5"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Calendar Preview */}
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-4">Team Calendar</div>
                    <div className="grid grid-cols-7 gap-2">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                        <div key={i} className="text-center text-gray-500 text-sm">{day}</div>
                      ))}
                      {[...Array(35)].map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                            i >= 14 && i <= 16
                              ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white"
                              : "bg-gray-900 text-gray-500"
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Powerful features designed for modern workplaces
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              See what our customers have to say
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <Globe className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Leave Management?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of companies who trust our platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300"
              >
                Start Free 14-Day Trial
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Request Enterprise Demo
              </Link>
            </div>
            
            <p className="text-blue-200 text-sm mt-8">
              No credit card required • Full features included • 24/7 support
            </p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Leave<span className="text-blue-400">MS</span>
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              ©2025 Leave Management System. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}