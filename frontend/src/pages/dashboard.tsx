// Barakah AI Agents - Enterprise Dashboard
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  Brain,
  Play,
  Pause,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  Settings,
  BarChart3,
  DollarSign,
  Globe,
  Mail,
  ShoppingCart,
  MessageSquare,
  Rocket,
  Activity,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  status: 'ready' | 'running' | 'completed';
  executions: number;
  successRate: number;
  lastRun?: string;
}

interface Execution {
  id: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  currentStep?: string;
  result?: any;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'executions' | 'analytics' | 'integrations'>('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize agents data
  useEffect(() => {
    const agentsData: Agent[] = [
      {
        id: 'blog-publisher',
        name: 'Blog Publisher Agent',
        description: 'Researches, writes, and publishes SEO-optimized blog posts across all platforms',
        icon: <Globe className="w-6 h-6" />,
        category: 'Content',
        status: 'ready',
        executions: 127,
        successRate: 96,
        lastRun: '2 hours ago'
      },
      {
        id: 'email-campaign',
        name: 'Email Campaign Agent',
        description: 'Creates personalized email campaigns and sends them to targeted lists',
        icon: <Mail className="w-6 h-6" />,
        category: 'Marketing',
        status: 'ready',
        executions: 89,
        successRate: 98,
        lastRun: '45 minutes ago'
      },
      {
        id: 'product-launch',
        name: 'Product Launch Agent',
        description: 'Creates product pages, sets up payments, and launches marketing campaigns',
        icon: <ShoppingCart className="w-6 h-6" />,
        category: 'Business',
        status: 'running',
        executions: 34,
        successRate: 94,
        lastRun: 'Running now'
      },
      {
        id: 'social-media',
        name: 'Social Media Agent',
        description: 'Creates and manages entire social media presence across platforms',
        icon: <MessageSquare className="w-6 h-6" />,
        category: 'Marketing',
        status: 'ready',
        executions: 156,
        successRate: 97,
        lastRun: '1 hour ago'
      },
      {
        id: 'lead-generation',
        name: 'Lead Generation Agent',
        description: 'Finds qualified prospects and nurtures them into paying customers',
        icon: <Users className="w-6 h-6" />,
        category: 'Sales',
        status: 'ready',
        executions: 78,
        successRate: 89,
        lastRun: '3 hours ago'
      },
      {
        id: 'content-empire',
        name: 'Content Empire Agent',
        description: 'Builds and executes comprehensive content strategies',
        icon: <Rocket className="w-6 h-6" />,
        category: 'Content',
        status: 'completed',
        executions: 45,
        successRate: 95,
        lastRun: '30 minutes ago'
      }
    ];

    setAgents(agentsData);
    setIsLoading(false);
  }, []);

  const executeAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    // Update agent status
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: 'running' } : a
    ));

    // Create new execution
    const newExecution: Execution = {
      id: `exec_${Date.now()}`,
      agentId,
      agentName: agent.name,
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      currentStep: 'Initializing agent workflow...'
    };

    setExecutions(prev => [newExecution, ...prev]);

    // Simulate execution progress
    simulateExecution(newExecution.id, agentId);
  };

  const simulateExecution = async (executionId: string, agentId: string) => {
    const steps = [
      'Analyzing task and gathering context...',
      'Creating detailed execution plan...',
      'Executing main workflow...',
      'Integrating with external services...',
      'Verifying workflow completion...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExecutions(prev => prev.map(exec => 
        exec.id === executionId ? {
          ...exec,
          progress: Math.round(((i + 1) / steps.length) * 100),
          currentStep: steps[i]
        } : exec
      ));
    }

    // Complete execution
    setTimeout(() => {
      setExecutions(prev => prev.map(exec => 
        exec.id === executionId ? {
          ...exec,
          status: 'completed',
          progress: 100,
          currentStep: 'Workflow completed successfully!',
          result: {
            summary: 'Agent executed complete workflow successfully',
            integrations: ['Gmail', 'LinkedIn', 'WordPress'],
            metrics: {
              time_saved: '45 minutes',
              cost_saved: '$75',
              tasks_completed: 7
            }
          }
        } : exec
      ));

      setAgents(prev => prev.map(a => 
        a.id === agentId ? { 
          ...a, 
          status: 'completed', 
          executions: a.executions + 1,
          lastRun: 'Just now'
        } : a
      ));
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-yellow-400 bg-yellow-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      default: return 'text-blue-400 bg-blue-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Barakah AI Agents...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Barakah AI Agents</title>
        <meta name="description" content="Manage and monitor your AI agents" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Barakah AI Agents</h1>
                  <p className="text-sm text-gray-300">Enterprise Dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
                  <span className="font-semibold">PRO</span>
                </div>
                <button className="text-white hover:text-emerald-400 transition-colors">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{agents.length}</div>
                <div className="text-sm text-gray-300">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{executions.filter(e => e.status === 'running').length}</div>
                <div className="text-sm text-gray-300">Running Now</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{executions.filter(e => e.status === 'completed').length}</div>
                <div className="text-sm text-gray-300">Completed Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">$2,840</div>
                <div className="text-sm text-gray-300">Monthly Savings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'agents', label: '🤖 AI Agents', icon: <Brain className="w-5 h-5" /> },
                { id: 'executions', label: '⚡ Executions', icon: <Activity className="w-5 h-5" /> },
                { id: 'analytics', label: '📊 Analytics', icon: <BarChart3 className="w-5 h-5" /> },
                { id: 'integrations', label: '🔗 Integrations', icon: <Zap className="w-5 h-5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-4 border-b-2 font-semibold text-base transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'agents' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">AI Agent Squad</h2>
                <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Run All Agents</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-emerald-500/50 transition-all"
                  >
                    {/* Agent Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
                        {agent.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                        <p className="text-sm text-gray-400">{agent.category} Agent</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(agent.status)}`}>
                        {getStatusIcon(agent.status)}
                        <span className="capitalize">{agent.status}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4">{agent.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-emerald-400">{agent.executions}</div>
                        <div className="text-xs text-gray-400">Executions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{agent.successRate}%</div>
                        <div className="text-xs text-gray-400">Success Rate</div>
                      </div>
                    </div>

                    {/* Last Run */}
                    <div className="text-center mb-4">
                      <div className="text-xs text-gray-400">Last run: {agent.lastRun}</div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => executeAgent(agent.id)}
                      disabled={agent.status === 'running'}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                        agent.status === 'running'
                          ? 'bg-yellow-500/20 text-yellow-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white transform hover:scale-105'
                      }`}
                    >
                      {agent.status === 'running' ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Agent Working...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Execute Agent</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'executions' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">Agent Executions</h2>
                <div className="text-sm text-gray-400">Real-time execution monitoring</div>
              </div>

              <div className="space-y-4">
                {executions.map((execution) => (
                  <motion.div
                    key={execution.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(execution.status)}`}>
                          {getStatusIcon(execution.status)}
                          <span className="capitalize">{execution.status}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">{execution.agentName}</h3>
                      </div>
                      <div className="text-sm text-gray-400">
                        Started: {new Date(execution.startTime).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">{execution.currentStep}</span>
                        <span className="text-sm text-emerald-400">{execution.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${execution.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Result */}
                    {execution.result && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-emerald-400 font-semibold mb-2">✅ Execution Results:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Time Saved:</span>
                            <span className="text-white ml-2">{execution.result.metrics.time_saved}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Cost Saved:</span>
                            <span className="text-emerald-400 ml-2">{execution.result.metrics.cost_saved}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Tasks Completed:</span>
                            <span className="text-blue-400 ml-2">{execution.result.metrics.tasks_completed}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {executions.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl text-white mb-2">No executions yet</h3>
                    <p className="text-gray-400">Execute an agent to see real-time monitoring here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Analytics & ROI</h2>
              
              {/* ROI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <DollarSign className="w-8 h-8 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">$2,840</div>
                      <div className="text-sm text-gray-400">Monthly Savings</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="w-8 h-8 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">160h</div>
                      <div className="text-sm text-gray-400">Time Saved/Month</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">1,420%</div>
                      <div className="text-sm text-gray-400">ROI</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                    <div>
                      <div className="text-2xl font-bold text-white">98.3%</div>
                      <div className="text-sm text-gray-400">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Agent Performance</h3>
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {agent.icon}
                          <span className="text-white">{agent.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-semibold">{agent.successRate}%</div>
                          <div className="text-xs text-gray-400">{agent.executions} runs</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">Cost Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { tool: 'Content Creation Tools', saved: '$497' },
                      { tool: 'Social Media Management', saved: '$299' },
                      { tool: 'Email Marketing Platform', saved: '$249' },
                      { tool: 'CRM System', saved: '$199' },
                      { tool: 'Analytics Tools', saved: '$149' },
                      { tool: 'Design Software', saved: '$99' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-300">{item.tool}</span>
                        <span className="text-emerald-400 font-semibold">{item.saved}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Integration Hub</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[
                  { name: 'Gmail', icon: '📧', status: 'connected', usage: '234 calls' },
                  { name: 'LinkedIn', icon: '💼', status: 'connected', usage: '156 calls' },
                  { name: 'Facebook', icon: '📘', status: 'connected', usage: '98 calls' },
                  { name: 'Stripe', icon: '💳', status: 'connected', usage: '67 calls' },
                  { name: 'HubSpot', icon: '🎯', status: 'setup', usage: 'Not configured' },
                  { name: 'WordPress', icon: '📝', status: 'connected', usage: '89 calls' },
                  { name: 'Twitter', icon: '🐦', status: 'connected', usage: '76 calls' },
                  { name: 'Zapier', icon: '⚡', status: 'setup', usage: 'Not configured' }
                ].map((integration, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-emerald-500/50 transition-all"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{integration.icon}</div>
                      <h3 className="text-lg font-semibold text-white mb-2">{integration.name}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                        integration.status === 'connected' 
                          ? 'bg-green-400/20 text-green-400' 
                          : 'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {integration.status === 'connected' ? '✅ Connected' : '⚙️ Setup Required'}
                      </div>
                      <div className="text-sm text-gray-400 mb-4">{integration.usage}</div>
                      <button className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                        integration.status === 'connected'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}>
                        {integration.status === 'connected' ? 'Manage' : 'Setup'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Dashboard;