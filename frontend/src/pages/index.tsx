// Barakah AI Agents - Professional Landing Page
import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Rocket, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Globe
} from 'lucide-react';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  const agents = [
    {
      icon: <Globe className="w-8 h-8" />,
      name: 'Blog Publisher Agent',
      description: 'Researches, writes, and publishes SEO-optimized blog posts across all your platforms automatically.',
      workflow: ['Research topic', 'Write content', 'Optimize SEO', 'Publish everywhere', 'Track performance']
    },
    {
      icon: <Users className="w-8 h-8" />,
      name: 'Lead Generation Agent',
      description: 'Finds qualified prospects, personalizes outreach, and nurtures them into paying customers.',
      workflow: ['Find prospects', 'Personalize outreach', 'Send messages', 'Follow up', 'Convert to customers']
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      name: 'Product Launch Agent',
      description: 'Creates product pages, sets up payments, and launches complete marketing campaigns.',
      workflow: ['Market research', 'Create pages', 'Setup payments', 'Launch campaign', 'Track sales']
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      name: 'Social Media Agent',
      description: 'Creates platform-specific content and manages your entire social media presence.',
      workflow: ['Content planning', 'Create posts', 'Schedule publishing', 'Engage audience', 'Analyze results']
    }
  ];

  const integrations = [
    { name: 'Gmail', icon: '📧' },
    { name: 'LinkedIn', icon: '💼' },
    { name: 'Facebook', icon: '📘' },
    { name: 'Stripe', icon: '💳' },
    { name: 'HubSpot', icon: '🎯' },
    { name: 'WordPress', icon: '📝' },
    { name: 'Twitter', icon: '🐦' },
    { name: 'Zapier', icon: '⚡' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      content: 'Barakah AI Agents transformed our content strategy. What used to take our team 40 hours per week now runs automatically.',
      rating: 5
    },
    {
      name: 'Ahmed Hassan',
      role: 'Business Owner',
      company: 'Digital Solutions LLC',
      content: 'The ROI is incredible. We save $3,000+ monthly while our lead generation increased by 400%.',
      rating: 5
    },
    {
      name: 'Maria Rodriguez',
      role: 'E-commerce Manager',
      company: 'GrowthCo',
      content: 'These agents actually execute complete workflows. It\\'s like having a full marketing team working 24/7.',
      rating: 5
    }
  ];

  return (
    <>
      <Head>
        <title>Barakah AI Agents - Enterprise AI Automation Platform</title>
        <meta name=\"description\" content=\"Revolutionary AI agents that think, plan, and execute complete business workflows. Transform your business with intelligent automation.\" />
        <meta name=\"keywords\" content=\"AI agents, business automation, intelligent workflows, enterprise AI, marketing automation\" />
      </Head>

      <div className=\"min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900\">
        {/* Navigation */}
        <nav className=\"relative z-50 bg-white/10 backdrop-blur-sm border-b border-white/20\">
          <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
            <div className=\"flex items-center justify-between h-16\">
              <div className=\"flex items-center space-x-3\">
                <div className=\"w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-xl flex items-center justify-center\">
                  <Brain className=\"w-6 h-6 text-white\" />
                </div>
                <span className=\"text-2xl font-bold text-white\">Barakah AI Agents</span>
              </div>
              <div className=\"hidden md:flex items-center space-x-8\">
                <a href=\"#features\" className=\"text-white/80 hover:text-white transition-colors\">Features</a>
                <a href=\"#agents\" className=\"text-white/80 hover:text-white transition-colors\">Agents</a>
                <a href=\"#pricing\" className=\"text-white/80 hover:text-white transition-colors\">Pricing</a>
                <Link href=\"/dashboard\" className=\"bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors\">
                  Launch Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className=\"relative overflow-hidden pt-20 pb-32\">
          <div className=\"absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-blue-600/20\"></div>
          <div className=\"relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
            <div className=\"text-center\">
              {/* Revolutionary Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className=\"inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 font-bold text-sm mb-8\"
              >
                <Zap className=\"w-4 h-4 mr-2\" />
                🚫 THE ERA OF BASIC AI TOOLS IS OVER
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className=\"text-5xl lg:text-7xl font-black text-white mb-8 leading-tight\"
              >
                <span className=\"text-red-400\">Stop Generating.</span><br />
                <span className=\"bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent\">
                  Start Executing.
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className=\"text-2xl lg:text-3xl text-gray-200 mb-12 max-w-4xl mx-auto\"
              >
                <p className=\"mb-4\">AI Agents that <span className=\"text-emerald-400 font-bold\">think, plan, and execute</span> complete workflows.</p>
                <p>No more prompts. No more copy-paste. Just <span className=\"text-yellow-400 font-bold\">intelligent action</span>.</p>
              </motion.div>

              {/* Value Proposition Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto\"
              >
                <div className=\"bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20\">
                  <div className=\"text-emerald-400 font-bold text-lg mb-2\">❌ Traditional AI:</div>
                  <div className=\"text-gray-300 text-sm mb-4\">\"Generate a blog post\"</div>
                  <div className=\"text-red-400 font-bold text-lg mb-2\">✅ Barakah Agents:</div>
                  <div className=\"text-emerald-300 text-sm font-semibold\">\"Research, write, publish, and promote across 5 platforms\"</div>
                </div>
                <div className=\"bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20\">
                  <div className=\"text-emerald-400 font-bold text-lg mb-2\">❌ Traditional AI:</div>
                  <div className=\"text-gray-300 text-sm mb-4\">\"Draft an email\"</div>
                  <div className=\"text-red-400 font-bold text-lg mb-2\">✅ Barakah Agents:</div>
                  <div className=\"text-emerald-300 text-sm font-semibold\">\"Create, personalize, send, and track email campaigns\"</div>
                </div>
                <div className=\"bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20\">
                  <div className=\"text-emerald-400 font-bold text-lg mb-2\">❌ Traditional AI:</div>
                  <div className=\"text-gray-300 text-sm mb-4\">\"Find some leads\"</div>
                  <div className=\"text-red-400 font-bold text-lg mb-2\">✅ Barakah Agents:</div>
                  <div className=\"text-emerald-300 text-sm font-semibold\">\"Research, contact, nurture, and convert prospects\"</div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className=\"flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6\"
              >
                <Link href=\"/dashboard\" className=\"bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 inline-flex items-center\">
                  <Brain className=\"w-6 h-6 mr-2\" />
                  Launch AI Agents
                  <ArrowRight className=\"w-6 h-6 ml-2\" />
                </Link>
                <a href=\"#demo\" className=\"border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors\">
                  Watch Demo
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className=\"grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto\"
              >
                <div className=\"text-center\">
                  <div className=\"text-3xl font-bold text-emerald-400\">$2,840+</div>
                  <div className=\"text-gray-300\">Monthly Savings</div>
                </div>
                <div className=\"text-center\">
                  <div className=\"text-3xl font-bold text-blue-400\">98.3%</div>
                  <div className=\"text-gray-300\">Success Rate</div>
                </div>
                <div className=\"text-center\">
                  <div className=\"text-3xl font-bold text-purple-400\">160+</div>
                  <div className=\"text-gray-300\">Hours Saved/Month</div>
                </div>
                <div className=\"text-center\">
                  <div className=\"text-3xl font-bold text-yellow-400\">24/7</div>
                  <div className=\"text-gray-300\">Automated</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id=\"features\" className=\"py-20 bg-white/5 backdrop-blur-sm\">
          <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
            <div className=\"text-center mb-16\">
              <h2 className=\"text-4xl font-bold text-white mb-4\">Why Choose Barakah AI Agents?</h2>
              <p className=\"text-xl text-gray-300\">The difference between automation and intelligent action</p>
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">
              {[
                {
                  icon: <Brain className=\"w-8 h-8\" />,
                  title: 'Intelligent Decision Making',
                  description: 'Our agents don\\'t just follow scripts - they analyze, adapt, and optimize their approach based on real-time data.'
                },
                {
                  icon: <Zap className=\"w-8 h-8\" />,
                  title: 'Complete Workflow Execution',
                  description: 'From research to publication, our agents handle entire processes end-to-end without human intervention.'
                },
                {
                  icon: <Shield className=\"w-8 h-8\" />,
                  title: 'Enterprise Security',
                  description: 'Your API keys stay with you. We never store sensitive credentials or access your accounts directly.'
                },
                {
                  icon: <Clock className=\"w-8 h-8\" />,
                  title: '24/7 Automation',
                  description: 'Your agents work around the clock, executing tasks and workflows even while you sleep.'
                },
                {
                  icon: <TrendingUp className=\"w-8 h-8\" />,
                  title: 'Continuous Learning',
                  description: 'Agents learn from each execution, improving performance and adapting to your business needs.'
                },
                {
                  icon: <DollarSign className=\"w-8 h-8\" />,
                  title: 'Massive ROI',
                  description: 'Replace $2,840+ worth of tools and save 160+ hours monthly for just $19.99/month.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className=\"bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-emerald-500/50 transition-all\"
                >
                  <div className=\"w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center text-white mb-4\">
                    {feature.icon}
                  </div>
                  <h3 className=\"text-xl font-bold text-white mb-3\">{feature.title}</h3>
                  <p className=\"text-gray-300\">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Agents Section */}
        <section id=\"agents\" className=\"py-20\">
          <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
            <div className=\"text-center mb-16\">
              <h2 className=\"text-4xl font-bold text-white mb-4\">🤖 Meet Your AI Agent Squad</h2>
              <p className=\"text-xl text-gray-300\">Each agent is designed to execute complete business workflows</p>
            </div>

            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
              {agents.map((agent, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className=\"bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-emerald-500/50 transition-all\"
                >
                  <div className=\"flex items-center space-x-4 mb-6\">
                    <div className=\"w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center text-white\">
                      {agent.icon}
                    </div>
                    <div>
                      <h3 className=\"text-2xl font-bold text-white\">{agent.name}</h3>
                      <p className=\"text-gray-400\">Intelligent Workflow Agent</p>
                    </div>
                  </div>
                  
                  <p className=\"text-gray-300 mb-6\">{agent.description}</p>
                  
                  <div className=\"space-y-3\">
                    <h4 className=\"text-emerald-400 font-semibold\">🔄 Complete Workflow:</h4>
                    {agent.workflow.map((step, stepIndex) => (
                      <div key={stepIndex} className=\"flex items-center space-x-3\">
                        <CheckCircle className=\"w-4 h-4 text-emerald-500 flex-shrink-0\" />
                        <span className=\"text-gray-300\">{step}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className=\"py-20 bg-white/5 backdrop-blur-sm\">
          <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center\">
            <h2 className=\"text-4xl font-bold text-white mb-4\">🔗 Seamless Integrations</h2>
            <p className=\"text-xl text-gray-300 mb-12\">Connect to the tools you already use</p>
            
            <div className=\"grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6\">
              {integrations.map((integration, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className=\"bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-emerald-500/50 transition-all text-center\"
                >
                  <div className=\"text-3xl mb-2\">{integration.icon}</div>
                  <div className=\"text-white font-semibold text-sm\">{integration.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className=\"py-20\">
          <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
            <div className=\"text-center mb-16\">
              <h2 className=\"text-4xl font-bold text-white mb-4\">What Our Customers Say</h2>
              <p className=\"text-xl text-gray-300\">Real results from real businesses</p>
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className=\"bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20\"
                >
                  <div className=\"flex items-center space-x-1 mb-4\">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className=\"w-5 h-5 text-yellow-400 fill-current\" />
                    ))}
                  </div>
                  <p className=\"text-gray-300 mb-6 italic\">\"{testimonial.content}\"</p>
                  <div>
                    <div className=\"text-white font-semibold\">{testimonial.name}</div>
                    <div className=\"text-gray-400 text-sm\">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id=\"pricing\" className=\"py-20 bg-gradient-to-r from-emerald-600/20 to-blue-600/20\">
          <div className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center\">
            <h2 className=\"text-4xl font-bold text-white mb-4\">Simple, Transparent Pricing</h2>
            <p className=\"text-xl text-gray-300 mb-12\">One price. Unlimited agents. Unlimited executions.</p>

            <div className=\"bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20\">
              <div className=\"text-center mb-8\">
                <div className=\"text-6xl font-bold text-white mb-2\">$19.99</div>
                <div className=\"text-gray-300 text-xl\">per month</div>
                <div className=\"text-emerald-400 font-semibold mt-2\">Save $2,820+ monthly</div>
              </div>

              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 mb-8\">
                <div className=\"space-y-3\">
                  {[
                    'All 6 AI Agents included',
                    'Unlimited workflow executions',
                    'All integrations available',
                    '24/7 automated operation'
                  ].map((feature, index) => (
                    <div key={index} className=\"flex items-center space-x-3\">
                      <CheckCircle className=\"w-5 h-5 text-emerald-500\" />
                      <span className=\"text-white\">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className=\"space-y-3\">
                  {[
                    'Enterprise-grade security',
                    'Real-time analytics',
                    'Priority support',
                    '30-day money-back guarantee'
                  ].map((feature, index) => (
                    <div key={index} className=\"flex items-center space-x-3\">
                      <CheckCircle className=\"w-5 h-5 text-emerald-500\" />
                      <span className=\"text-white\">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href=\"/dashboard\" className=\"bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 inline-flex items-center\">
                <Rocket className=\"w-6 h-6 mr-2\" />
                Start Your AI Revolution
                <ArrowRight className=\"w-6 h-6 ml-2\" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className=\"bg-black/50 backdrop-blur-sm border-t border-white/20 py-12\">
          <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
            <div className=\"text-center\">
              <div className=\"flex items-center justify-center space-x-3 mb-4\">
                <div className=\"w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-xl flex items-center justify-center\">
                  <Brain className=\"w-6 h-6 text-white\" />
                </div>
                <span className=\"text-2xl font-bold text-white\">Barakah AI Agents</span>
              </div>
              <p className=\"text-gray-400 mb-6\">Automate barakah, not just content.</p>
              <div className=\"text-gray-500 text-sm\">
                © 2024 Barakah AI Agents. Built with ❤️ for intelligent action.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;