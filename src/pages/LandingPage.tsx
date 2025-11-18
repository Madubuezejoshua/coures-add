import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, LogIn, UserPlus, CheckCircle, Lightbulb, Users, Zap, ArrowRight, Star, Award, TrendingUp, Shield, Globe } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Content Manager',
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
      quote: 'This platform transformed how we manage our document workflow. Our review process is now 60% faster!'
    },
    {
      name: 'Michael Chen',
      role: 'Academic Reviewer',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      quote: 'The collaboration features are outstanding. My team loves the intuitive interface and seamless communication.'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Publishing Director',
      image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=400',
      quote: 'Finally, a solution that handles all our publishing needs. Highly recommended for any organization.'
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Streamlined Workflow',
      description: 'Automate your document review process from submission to publication'
    },
    {
      icon: Lightbulb,
      title: 'Better Collaboration',
      description: 'Team members work seamlessly with clear roles and permissions'
    },
    {
      icon: Users,
      title: 'Multi-Role System',
      description: 'Support for contributors, reviewers, and publishers in one platform'
    },
    {
      icon: Zap,
      title: 'Quick & Reliable',
      description: 'Fast processing with comprehensive activity tracking and audit logs'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300 ${
        scrolled ? 'scale-98 opacity-95' : ''
      }`}>
        <div className="glass-card rounded-3xl px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">DocReview</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRoleSelector(true)}
              className="px-6 py-2 text-gray-700 font-medium hover:text-purple-600 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowRoleSelector(true)}
              className="group px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24">
        {/* Geometric Decorations */}
        <div className="absolute top-20 right-10 w-20 h-20 border-2 border-purple-500/20 rounded-full animate-float"></div>
        <div className="absolute top-40 left-10 w-16 h-16 border-2 border-purple-600/20 rotate-45 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-20 w-12 h-12 bg-gradient-to-br from-purple-500/10 to-transparent rounded-lg animate-float" style={{ animationDelay: '3s' }}></div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ teams worldwide</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Document Review
                </span>
                <br />
                <span className="text-gradient">Made Simple</span>
              </h1>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Streamline your entire document workflow with intelligent collaboration. Transform how your team reviews, approves, and publishes content.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setShowRoleSelector(true)}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-full transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowRoleSelector(true)}
                  className="px-8 py-4 glass-card hover:bg-white/80 text-gray-700 font-semibold rounded-full transition-all border-2 border-purple-500/20 hover:border-purple-500/40 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </button>
              </div>
            </div>

            <div className="relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Team collaboration"
                  className="rounded-3xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-3xl -z-10"></div>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Industry Leading</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Why Document Review
              </span>
              <br />
              <span className="text-gradient">Matters</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Quality documentation is the foundation of successful knowledge transfer. Industry experts agree that systematic review processes improve content quality by up to 85%.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="relative animate-fade-up">
              <img
                src="https://images.pexels.com/photos/3862630/pexels-photo-3862630.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Professional review"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-tl from-purple-500/20 to-transparent rounded-3xl -z-10"></div>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">The Power of Collaborative Review</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Expert review processes ensure consistency, accuracy, and quality across all content. By bringing multiple perspectives to the table, organizations can identify issues early and maintain professional standards.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg pt-2">Reduces errors and inconsistencies by 75%</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg pt-2">Improves content quality and professionalism</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg pt-2">Enables faster publication cycles</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">Smart Workflow Automation</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Our intelligent system intelligently routes documents through the review process, ensuring nothing falls through the cracks. Automated notifications keep everyone informed and engaged.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg pt-2">Automatic task assignment based on expertise</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg pt-2">Real-time progress tracking for all documents</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg pt-2">Deadline management and reminders</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative animate-fade-up">
              <img
                src="https://images.pexels.com/photos/3865857/pexels-photo-3865857.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Smart automation"
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-full h-full bg-gradient-to-tr from-purple-500/20 to-transparent rounded-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">Key</span>
              {' '}
              <span className="text-gradient">Benefits</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="group p-8 glass-card rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">Perfect for</span>
              {' '}
              <span className="text-gradient">Every Role</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Contributors',
                description: 'Create and submit documents for review',
                icon: FileText,
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                title: 'Reviewers',
                description: 'Evaluate and provide constructive feedback',
                icon: Shield,
                gradient: 'from-purple-600 to-purple-700'
              },
              {
                title: 'Publishers',
                description: 'Approve and publish finalized documents',
                icon: Globe,
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                title: 'Admins',
                description: 'Manage workflow, users, and permissions',
                icon: Users,
                gradient: 'from-purple-600 to-purple-700'
              }
            ].map((role, index) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="group p-8 glass-card rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-600">{role.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">What Our</span>
              {' '}
              <span className="text-gradient">Users Say</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of teams trusting our platform for their document management needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-500/20"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-blue-500 text-purple-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Active Users' },
              { number: '50,000+', label: 'Documents Reviewed' },
              { number: '95%', label: 'Satisfaction Rate' }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="p-10 glass-card rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-6xl font-bold text-gradient mb-3">{stat.number}</h3>
                <p className="text-gray-700 text-lg font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-purple-600 via-blue-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-purple-50 mb-10 leading-relaxed">
            Join thousands of teams already using our platform to streamline their document review process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowRoleSelector(true)}
              className="group px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold">DocReview</span>
          </div>
          <p className="text-gray-400 mb-6 text-lg">
            Streamline your document workflow with intelligent collaboration.
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-6"></div>
          <p className="text-gray-500 text-sm mb-8">
            2024 DocReview. All rights reserved.
          </p>
          <button
            onClick={() => navigate('/admin-login')}
            className="mx-auto block p-2 text-gray-500 hover:text-purple-400 transition-colors hover:scale-110 transform duration-200"
            aria-label="Admin Access"
            title="Admin Access"
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {showRoleSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-fade-up">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Your Role</h2>
              <p className="text-gray-600 mb-8">Choose your role to continue</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Contributor</h3>
                  <p className="text-gray-600 text-sm mb-6">Create and submit documents for review</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        navigate('/contributor/signup');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        navigate('/contributor/login');
                      }}
                      className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                  </div>
                </div>

                <div className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50/50 cursor-pointer transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Reviewer</h3>
                  <p className="text-gray-600 text-sm mb-6">Evaluate and provide constructive feedback</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        navigate('/reviewer/signup');
                      }}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        navigate('/reviewer/login');
                      }}
                      className="flex-1 px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                  </div>
                </div>

                <div className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Publisher</h3>
                  <p className="text-gray-600 text-sm mb-6">Approve and publish finalized documents</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        navigate('/publisher/signup');
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        setShowRoleSelector(false);
                        navigate('/publisher/login');
                      }}
                      className="flex-1 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRoleSelector(false)}
                className="mt-8 w-full px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
