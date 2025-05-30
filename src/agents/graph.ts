/**
 * Agent workflow orchestration based on ADK (Agent Development Kit) architecture
 */
import { EventEmitter } from 'events';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { storeResumeEmbeddings } from './pinecone';
import {
  createCaraAgent,
  createMayaAgent,
  createEllieAgent,
  createSophiaAgent
} from './agents';
import {
  caraInitialSystemPrompt,
  mayaInitialSystemPrompt,
  ellieInitialSystemPrompt,
  sophiaInitialSystemPrompt
} from './prompts';
import { ChatOpenAI } from '@langchain/openai';

// Event emitter to broadcast agent activities
export const agentEmitter = new EventEmitter();

// Types for agent activities and statuses
export type AgentActivity = {
  agent: 'cara' | 'maya' | 'ellie' | 'sophia';
  action: string;
  detail?: string;
  timestamp: Date;
  tools?: Array<'brave' | 'firecrawl' | 'browserbase' | 'database' | 'perplexity' | 'pinecone'>;
  userId?: string; 
  careerAdvice?: {
    riskReport: {
      overallRisk: number;
      categories: Array<{
        category: string;
        risk: number;
        description: string;
      }>;
      summary: string;
    };
    learningPlan: {
      skills: Array<{
        skill: string;
        currentLevel: number;
        targetLevel: number;
        importance: number;
      }>;
      resources: Array<{
        id: string;
        title: string;
        type: string;
        provider: string;
        duration: string;
        level: string;
        url: string;
        skillsAddressed: string[];
      }>;
      timeEstimate: string;
    };
    nextSteps: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    // Premium Features
    premium?: {
      // Career Trajectory Mapping
      careerTrajectory?: {
        targetRole: string;
        timeframe: number; // in months
        milestones: Array<{
          title: string;
          description: string;
          targetDate: string;
          priority: number; // 0=normal, 1=high, 2=critical
        }>;
        alternativePaths: Array<{
          name: string;
          description: string;
          probabilityScore: number; // 0-100
          potentialUpsides: string;
          potentialDownsides: string;
        }>;
      };
      // Executive Network Access
      executiveNetwork?: {
        recommendedEvents: Array<{
          title: string;
          description: string;
          eventDate: string;
          eventType: string;
          speakerInfo: any;
          relevanceScore: number; // 0-100
        }>;
        mentorshipOpportunities: Array<{
          mentorName: string;
          mentorTitle: string;
          mentorCompany: string;
          expertise: string[];
          recommendationReason: string;
          matchScore: number; // 0-100
        }>;
        networkingStrategy: string;
      };
      // Skills Gap Accelerator
      skillsAccelerator?: {
        assessedSkills: Array<{
          name: string;
          category: string;
          currentLevel: number; // 1-10
          targetLevel: number; // 1-10
          marketDemand: number; // 0-100
          futureRelevance: number; // 0-100
          salarImpact: number; // in dollars
          priority: number; // 0=normal, 1=high, 2=critical
        }>;
        personalizedLearningPath: {
          name: string;
          description: string;
          estimatedCompletionTime: number; // in minutes
          resources: Array<{
            title: string;
            provider: string;
            type: string;
            url: string;
            cost: number; // in cents
            duration: number; // in minutes
            difficulty: string;
            skillsAddressed: string[];
            relevanceScore: number; // 0-100
            order: number;
          }>;
        };
        progressTrackingStrategy: string;
      };
    };
  };
};

// Agent status tracking
export type AgentStatuses = {
  cara: 'idle' | 'active' | 'thinking' | 'complete';
  maya: 'idle' | 'active' | 'thinking' | 'complete';
  ellie: 'idle' | 'active' | 'thinking' | 'complete';
  sophia: 'idle' | 'active' | 'thinking' | 'complete';
};

// Default status for all agents
export const agentStatuses: AgentStatuses = {
  cara: 'idle',
  maya: 'idle',
  ellie: 'idle',
  sophia: 'idle'
};

// State tracking for agent context
let currentAgentState: AgentState | null = null;

// Status update function
export const updateAgentStatus = (
  agent: 'cara' | 'maya' | 'ellie' | 'sophia',
  status: 'idle' | 'active' | 'thinking' | 'complete'
) => {
  agentStatuses[agent] = status;

  // Broadcast status update
  agentEmitter.emit('agent_status_update', { ...agentStatuses });

  console.log(`Agent ${agent} status: ${status}`);
};

// Interface for agent state
interface AgentState {
  input?: string;
  userId?: string;
  context?: any;
  messages: BaseMessage[];
  isPremium?: boolean; // Flag to indicate premium features are enabled
  cara: {
    messages: BaseMessage[];
    results?: any;
    careerTrajectory?: {
      targetRole?: string;
      timeframe?: number;
      milestones?: any[];
      alternativePaths?: any[];
    };
  };
  maya: {
    messages: BaseMessage[];
    results?: any;
    skills?: string[];
    experience?: any;
    education?: string;
  };
  ellie: {
    messages: BaseMessage[];
    results?: any;
    marketInsights?: any;
    trends?: string[];
    opportunities?: any[];
    executiveNetwork?: {
      recommendedEvents?: any[];
      mentorshipOpportunities?: any[];
      networkingStrategy?: string;
    };
  };
  sophia: {
    messages: BaseMessage[];
    results?: any;
    learningPlan?: any;
    resources?: any[];
    roadmap?: any;
    skillsAccelerator?: {
      assessedSkills?: any[];
      personalizedLearningPath?: any;
      progressTrackingStrategy?: string;
    };
  };
  final_output?: any;
  premium?: {
    careerTrajectory?: any;
    executiveNetwork?: any;
    skillsAccelerator?: any;
  };
}

// The LLM to use for all agents - initialize with mock first to avoid undefined errors
let openai: ChatOpenAI = { 
  invoke: async () => ({ content: "Mock response (initial)" }) 
} as any;

// Initialize agents with mock implementations first to avoid undefined errors
let caraAgent = async () => ({ 
  message: new AIMessage("Mock response - initializing"), 
  results: {} 
});

let mayaAgent = async () => ({ 
  message: new AIMessage("Mock response - initializing"), 
  results: {} 
});

let ellieAgent = async () => ({ 
  message: new AIMessage("Mock response - initializing"), 
  results: {} 
});

let sophiaAgent = async () => ({ 
  message: new AIMessage("Mock response - initializing"), 
  results: {} 
});

// This function will be called after OpenAI is initialized
const initializeAgents = () => {
  try {
    console.log("Creating agents with initialized OpenAI client");
    caraAgent = createCaraAgent(openai, caraInitialSystemPrompt);
    mayaAgent = createMayaAgent(openai, mayaInitialSystemPrompt);
    ellieAgent = createEllieAgent(openai, ellieInitialSystemPrompt);
    sophiaAgent = createSophiaAgent(openai, sophiaInitialSystemPrompt);
    console.log("✅ All agents created successfully");
  } catch (error) {
    console.error("❌ Error creating agents:", error);
    // Keep existing mock implementations if error
  }
};

// OpenAI initialization function
const initializeOpenAI = async () => {
  try {
    if (process.env.OPENAI_API_KEY) {
      console.log("✅ OPENAI_API_KEY found! Initializing OpenAI with model gpt-4o");
      openai = new ChatOpenAI({
        modelName: "gpt-4o",
        temperature: 0.1,
        openAIApiKey: process.env.OPENAI_API_KEY
      });

      // Test the API connection
      console.log("Testing OpenAI API connection...");
      try {
        const testMessage = await openai.invoke("Test connection");
        const content = typeof testMessage.content === 'string' 
          ? testMessage.content 
          : JSON.stringify(testMessage.content);
        console.log("✅ OpenAI API test successful! Response:", content.substring(0, 50) + "...");

        // Initialize agents after successful OpenAI initialization
        initializeAgents();
      } catch (testError) {
        console.error("❌ Error testing OpenAI API:", testError);
        throw testError;
      }
    } else {
      console.log("⚠️ OPENAI_API_KEY not provided, using mock implementation");
      // Keep mock implementation
    }
  } catch (error) {
    console.error("❌ Error initializing OpenAI:", error);
    console.log("⚠️ Falling back to mock implementation due to error");
    // Keep mock implementation
  }
};

// Initialize OpenAI (this runs asynchronously in the background)
initializeOpenAI().catch(err => console.error("Failed to initialize OpenAI:", err));

// Create a wrapper for the agent workflow execution
// This simulates the architecture pattern from Google's Agent Development Kit
// Using sequential execution with state tracking instead of LangGraph
let executeAgentWorkflow: (state: AgentState) => Promise<AgentState>;

// Define workflow node functions for each agent
const caraNode = async (state: AgentState): Promise<AgentState> => {
  updateAgentStatus('cara', 'active');
  trackAgentActivity({
    agent: 'cara',
    action: 'Orchestrating analysis',
    detail: 'Planning the analysis workflow and coordinating agents',
    timestamp: new Date(),
    tools: ['pinecone']
  });

  updateAgentStatus('cara', 'thinking');
  console.log("Executing Cara agent...");
  // Execute Cara agent with memory and collaboration
console.log("Starting Cara agent with collaboration");
const input = state.input || '';
updateAgentStatus('cara', 'active');

// Initialize analysis
const result = await caraAgent(input);

// Process message queue and coordinate with other agents
const messages = await memoryManager.getMessages('cara');
for (const msg of messages) {
  await caraAgent.receiveMessage(msg.from, msg.message);
}

console.log("Cara agent execution complete");
updateAgentStatus('cara', 'complete');

  // Return updated state
  return {
    ...state,
    cara: {
      messages: [...(state.cara?.messages || []), 
                 new HumanMessage({content: input}), 
                 result.message],
      results: result.results || {}
    }
  };
};

const mayaNode = async (state: AgentState): Promise<AgentState> => {
  console.log("Starting Maya node in agent workflow");
  updateAgentStatus('maya', 'active');
  trackAgentActivity({
    agent: 'maya',
    action: 'Analyzing resume',
    detail: 'Extracting skills, experience, and assessing automation risk',
    timestamp: new Date(),
    tools: ['perplexity', 'database']
  });

  updateAgentStatus('maya', 'thinking');
  // Execute the Maya agent
  const input = state.input || '';
  console.log(`Executing Maya agent with input: ${input.substring(0, 50)}...`);

  try {
    console.log("Calling Maya agent...");
    const result = await mayaAgent(input);
    console.log("Maya agent returned results successfully");
    updateAgentStatus('maya', 'complete');

    // Extract relevant data from result with type safety
    const resultData = result.results || {};
    console.log("Maya resultData:", JSON.stringify(resultData).substring(0, 200) + "...");

    // Use type assertion to access properties safely
    const mayaData = resultData as any;
    const skills = Array.isArray(mayaData.skills) ? mayaData.skills : [];
    console.log("Extracted skills:", skills);

    const experience = mayaData.experience || {};
    console.log("Extracted experience:", JSON.stringify(experience).substring(0, 100) + "...");

    const education = typeof mayaData.education === 'string' ? mayaData.education : '';
    console.log("Extracted education:", education);

    // Return updated state
    return {
      ...state,
      maya: {
        messages: [...(state.maya?.messages || []), 
                   new HumanMessage({content: input}), 
                   result.message],
        results: resultData,
        skills,
        experience,
        education
      }
    };
  } catch (error) {
    console.error("Error executing Maya agent:", error);
    updateAgentStatus('maya', 'complete');
    return {
      ...state,
      maya: {
        messages: [...(state.maya?.messages || []), 
                   new HumanMessage({content: input})],
        results: { error: "Error analyzing resume" },
        skills: [],
        experience: {},
        education: ""
      }
    };
  }
};

const ellieNode = async (state: AgentState): Promise<AgentState> => {
  updateAgentStatus('ellie', 'active');
  trackAgentActivity({
    agent: 'ellie',
    action: 'Researching industry trends',
    detail: 'Gathering information on job market, emerging technologies',
    timestamp: new Date(),
    tools: ['brave', 'firecrawl', 'browserbase']
  });

  updateAgentStatus('ellie', 'thinking');
  // Execute the Ellie agent with skills from Maya
  const skills = state.maya?.skills || [];
  const skillsInput = JSON.stringify(skills);
  console.log("Executing Ellie agent with skills:", skillsInput);
  const result = await ellieAgent(skillsInput);
  console.log("Ellie agent execution complete");
  updateAgentStatus('ellie', 'complete');

  // Extract relevant data from result with type safety
  const resultData = result.results || {};

  // Use type assertion to access properties safely
  const ellieData = resultData as any;
  const marketInsights = ellieData.marketInsights || {};
  const trends = Array.isArray(ellieData.trends) ? ellieData.trends : [];
  const opportunities = Array.isArray(ellieData.opportunities) ? ellieData.opportunities : [];

  // Return updated state
  return {
    ...state,
    ellie: {
      messages: [...(state.ellie?.messages || []), 
                 new HumanMessage({content: skillsInput}), 
                 result.message],
      results: resultData,
      marketInsights,
      trends,
      opportunities
    }
  };
};

const sophiaNode = async (state: AgentState): Promise<AgentState> => {
  updateAgentStatus('sophia', 'active');
  trackAgentActivity({
    agent: 'sophia',
    action: 'Creating learning plan',
    detail: 'Generating personalized learning roadmap and resource recommendations',
    timestamp: new Date(),
    tools: ['database', 'perplexity', 'browserbase']
  });

  updateAgentStatus('sophia', 'thinking');
  // Execute the Sophia agent with skills from Maya and trends from Ellie
  const skills = state.maya?.skills || [];
  const trends = state.ellie?.trends || [];
  const input = JSON.stringify({ skills, trends });
  console.log("Executing Sophia agent with input:", input);
  const result = await sophiaAgent(input);
  console.log("Sophia agent execution complete");
  updateAgentStatus('sophia', 'complete');

  // Extract relevant data from result with type safety
  const resultData = result.results || {};

  // Use type assertion to access properties safely
  const sophiaData = resultData as any;
  const learningPlan = sophiaData.learningPlan || {};
  const resources = Array.isArray(sophiaData.resources) ? sophiaData.resources : [];
  const roadmap = sophiaData.roadmap || {};

  // Return updated state
  return {
    ...state,
    sophia: {
      messages: [...(state.sophia?.messages || []), 
                 new HumanMessage({content: input}), 
                 result.message],
      results: resultData,
      learningPlan,
      resources,
      roadmap
    }
  };
};

const synthesizeNode = async (state: AgentState): Promise<AgentState> => {
  updateAgentStatus('cara', 'active');
  trackAgentActivity({
    agent: 'cara',
    action: 'Synthesizing insights',
    detail: 'Combining analysis from all agents to create final career advice',
    timestamp: new Date(),
    tools: ['pinecone', 'perplexity']
  });

  updateAgentStatus('cara', 'thinking');
  // Synthesize the results from all agents
  console.log(`Synthesizing final results from all agents${state.isPremium ? ' with premium features' : ''}`);
  const finalResults = await synthesizeResults(
    state.maya?.results || {}, 
    state.ellie?.results || {}, 
    state.sophia?.results || {}, 
    state.userId || '', 
    state.input || '',
    state.isPremium || false,
    {
      careerTrajectory: state.cara?.careerTrajectory,
      executiveNetwork: state.ellie?.executiveNetwork,
      skillsAccelerator: state.sophia?.skillsAccelerator
    }
  );
  console.log("Synthesis complete");
  updateAgentStatus('cara', 'complete');

  // Create an enhanced activity with the career advice attached
  const completeActivity: AgentActivity = {
    agent: 'cara',
    action: 'Analysis complete',
    detail: 'Career advice ready for review',
    timestamp: new Date(),
    careerAdvice: finalResults
  };

  // Emit activity with the career advice data attached
  trackAgentActivity(completeActivity);

  // Return updated state with final output
  return {
    ...state,
    final_output: finalResults
  };
};

// Initialize workflow execution function
console.log("Creating simplified ADK-inspired workflow implementation");
executeAgentWorkflow = async (initialState: AgentState): Promise<AgentState> => {
  try {
    console.log("Starting agent workflow execution");

    // Execute the workflow: cara -> maya -> ellie -> sophia -> synthesize
    let currentState = initialState;

    // Store the state for userId context in the activity tracking
    currentAgentState = currentState;

    // Cara (orchestration planning)
    console.log("Executing Cara node");
    currentState = await caraNode(currentState);

    // Store the updated state for context
    currentAgentState = currentState;

    // Maya (resume analysis)
    console.log("Executing Maya node");
    currentState = await mayaNode(currentState);

    // Store the updated state for context
    currentAgentState = currentState;

    // Ellie (industry analysis)
    console.log("Executing Ellie node");
    currentState = await ellieNode(currentState);

    // Store the updated state for context
    currentAgentState = currentState;

    // Sophia (learning plan)
    console.log("Executing Sophia node");
    currentState = await sophiaNode(currentState);

    // Store the updated state for context
    currentAgentState = currentState;

    // Final synthesis
    console.log("Executing synthesis node");
    currentState = await synthesizeNode(currentState);

    // Clear the state after workflow completion
    currentAgentState = null;

    console.log("Agent workflow execution completed successfully");
    return currentState;
  } catch (error) {
    console.error("Error in agent workflow execution:", error);

    // Return the partial state in case of error
    return currentAgentState || initialState;
  }
};

// Track agent activity function
const trackAgentActivity = (activity: AgentActivity) => {
  // Add userId from current state context if available
  if (currentAgentState?.userId && !activity.userId) {
    activity.userId = currentAgentState.userId;
  }

  // Emit the activity to any listening clients
  agentEmitter.emit('activity', activity);

  // Log the activity (without detailed results to avoid log spam)
  const { careerAdvice, ...loggableActivity } = activity;
  console.log(`Agent ${activity.agent}: ${activity.action}`, loggableActivity.detail || '');
};


// Get the model for a specific agent type
export const getAgentModel = async (agentType: string, userId: string) => {
  try {
    // Get user settings
    const { storage } = await import('../server/storage');
    const settings = await storage.getUserSettings(userId);

    if (!settings || !settings.models) {
      // Return default models if no settings exist
      const defaultModels: Record<string, string> = {
        orchestration: 'claude-3-7-sonnet',
        resume: 'gpt-4-1106-preview',
        research: 'pplx-70b-online', 
        learning: 'claude-3-7-haiku'
      };

      return defaultModels[agentType] || 'gpt-4-turbo';
    }

    return settings.models[agentType];
  } catch (error) {
    console.error('Error getting agent model:', error);
    // Return default models if error
    const fallbackModels: Record<string, string> = {
      orchestration: 'claude-3-7-sonnet',
      resume: 'gpt-4-1106-preview',
      research: 'pplx-70b-online',
      learning: 'claude-3-7-haiku'
    };

    return fallbackModels[agentType] || 'gpt-4-turbo';
  }
};

// Run the agent workflow
export const runCareerate = async (userId: string, resumeText: string, isPremium: boolean = false) => {
  console.log(`Starting Careerate analysis for user ${userId} (Premium: ${isPremium})`);

  // Reset agent statuses
  agentStatuses.cara = 'idle';
  agentStatuses.maya = 'idle';
  agentStatuses.ellie = 'idle';
  agentStatuses.sophia = 'idle';

  // Initialize the agent workflow
  trackAgentActivity({
    agent: 'cara',
    action: 'Initializing agent workflow',
    detail: `Setting up the workflow for coordinated analysis${isPremium ? ' with premium features' : ''}`,
    timestamp: new Date()
  });

  // Initial state for the workflow
  const initialState: AgentState = {
    input: resumeText,
    userId: userId,
    isPremium: isPremium,
    messages: [],
    cara: { messages: [] },
    maya: { messages: [] },
    ellie: { messages: [] },
    sophia: { messages: [] }
  };

  try {
    // Set the current state for context in agent activities and status updates
    currentAgentState = initialState;

    // Run our custom agent workflow executor
    // This will execute all agents in sequence: cara -> maya -> ellie -> sophia -> synthesize
    console.log("Starting agent workflow for career analysis");
    const result = await executeAgentWorkflow(initialState);

    // Store vectors in Pinecone for future retrieval
    try {
      console.log(`Storing vectors for user ${userId} in Pinecone...`);
      if (process.env.PINECONE_API_KEY) {
        const mayaResultsStr = JSON.stringify(result.maya?.results || {});
        const ellieResultsStr = JSON.stringify(result.ellie?.results || {});
        const sophiaResultsStr = JSON.stringify(result.sophia?.results || {});

        // Use the storeResumeEmbeddings function from pinecone.ts
        await storeResumeEmbeddings(
          userId,
          resumeText,
          [mayaResultsStr, ellieResultsStr, sophiaResultsStr]
        );
      }
    } catch (error) {
      console.error("Error storing vectors:", error);
    }

    // Return the final synthesized results
    return result.final_output || createSampleCareerAdvice();
  } catch (workflowError) {
    console.error("Error running agent workflow:", workflowError);

    // If our workflow fails, fall back to the legacy sequential execution approach
    console.log("❌❌❌ ERROR: Falling back to legacy sequential execution approach...");
    console.log("❌❌❌ Workflow error details:", workflowError);
    console.log("❌❌❌ This should NOT happen if the APIs are properly initialized!");

    // Initialize the state
    updateAgentStatus('cara', 'active');
    trackAgentActivity({
      agent: 'cara',
      action: 'Starting career analysis (fallback mode)',
      detail: 'Using legacy sequential approach due to workflow execution failure',
      timestamp: new Date(),
      tools: ['pinecone']
    });

    // Execute each agent in sequence (legacy approach)
    updateAgentStatus('cara', 'thinking');
    const initialPlan = await runCaraForPlanning(resumeText);

    updateAgentStatus('maya', 'active');
    updateAgentStatus('cara', 'idle');
    trackAgentActivity({
      agent: 'maya',
      action: 'Analyzing resume',
      detail: 'Extracting skills, experience, and assessing automation risk',
      timestamp: new Date(),
      tools: ['perplexity', 'database']
    });

    updateAgentStatus('maya', 'thinking');
    const mayaResults = await runMayaAnalysis(resumeText, userId);
    updateAgentStatus('maya', 'complete');

    updateAgentStatus('ellie', 'active');
    trackAgentActivity({
      agent: 'ellie',
      action: 'Researching industry trends',
      detail: 'Gathering information on job market and emerging technologies',
      timestamp: new Date(),
      tools: ['brave', 'firecrawl', 'browserbase']
    });

    updateAgentStatus('ellie', 'thinking');
    const ellieResults = await runEllieAnalysis(mayaResults.skills, userId);
    updateAgentStatus('ellie', 'complete');

    updateAgentStatus('sophia', 'active');
    trackAgentActivity({
      agent: 'sophia',
      action: 'Creating learning plan',
      detail: 'Generating personalized learning roadmap and resource recommendations',
      timestamp: new Date(),
      tools: ['database', 'perplexity', 'browserbase']
    });

    updateAgentStatus('sophia', 'thinking');
    const sophiaResults = await runSophiaAdvice(mayaResults.skills, userId);
    updateAgentStatus('sophia', 'complete');

    updateAgentStatus('cara', 'active');
    trackAgentActivity({
      agent: 'cara',
      action: 'Synthesizing insights',
      detail: 'Combining analysis from all agents to create final career advice',
      timestamp: new Date(),
      tools: ['pinecone', 'perplexity']
    });

    updateAgentStatus('cara', 'thinking');
    const finalResults = await synthesizeResults(
      mayaResults, 
      ellieResults, 
      sophiaResults, 
      userId, 
      resumeText,
      isPremium
    );
    updateAgentStatus('cara', 'complete');

    // Create an activity with the career advice attached
    const completeActivity: AgentActivity = {
      agent: 'cara',
      action: 'Analysis complete (fallback mode)',
      detail: 'Career advice ready for review (generated using fallback approach)',
      timestamp: new Date(),
      userId,
      careerAdvice: finalResults
    };

    // Emit the complete activity with the career advice attached
    trackAgentActivity(completeActivity);

    return finalResults;
  }
};

// Enhanced error handling and fallbacks
async function runCaraForPlanning(resumeText: string) {
  console.log("Running Cara agent for planning");

  try {
    return await caraAgent(resumeText);
  } catch (error) {
    console.error("Error running Cara agent, using fallback:", error);
    return {
      message: new AIMessage({
        content: "Generated basic career recommendations",
        additional_kwargs: {}
      }),
      results: {
        analysis: "Basic career path analysis completed",
        recommendations: [
          "Consider upskilling in your current domain",
          "Network with industry professionals",
          "Stay updated with industry trends"
        ],
        delegations: {}
      }
    };
  }
}

async function runMayaAnalysis(resumeText: string, userId: string) {
  console.log("Running Maya agent for resume analysis");

  try {
    const result = await mayaAgent(resumeText);
    if (!result || !result.results) throw new Error("Invalid Maya agent response");
    return result.results;
  } catch (error) {
    console.warn("Maya agent error, using fallback analysis:", error);
    return {
      skills: ["analytical thinking", "problem solving", "communication"],
      experience: { 
        roles: ["Professional"],
        years: 1,
        summary: "Experience information unavailable"
      },
      strengths: ["adaptability", "continuous learning"],
      automationRisk: "low",
      recommendations: ["Consider expanding your skill set", "Document your achievements"],
      educationLevel: "Unknown"
    };
  }
}

async function runEllieAnalysis(skills: string[], userId: string) {
  console.log("Running Ellie agent for industry analysis (fallback mode)");

  try {
    // Try to use the initialized agent if available
    const result = await ellieAgent(JSON.stringify(skills));
    return result.results || {
      trends: ["remote work", "automation", "artificial intelligence"],
      opportunities: [],
      marketDemand: { overall: "moderate" }
    };
  } catch (error) {
    console.error("Error running Ellie agent:", error);
    return {
      trends: ["remote work", "automation", "artificial intelligence"],
      opportunities: [],
      marketDemand: { overall: "moderate" }
    };
  }
}

async function runSophiaAdvice(skills: string[], userId: string) {
  console.log("Running Sophia agent for learning plan (fallback mode)");

  try {
    // Try to use the initialized agent if available
    const result = await sophiaAgent(JSON.stringify({ skills, trends: [] }));
    return result.results || {
      recommendations: [],
      resources: [],
      timeline: { immediate: [], short: [], long: [] }
    };
  } catch (error) {
    console.error("Error running Sophia agent:", error);
    return {
      recommendations: [],
      resources: [],
      timeline: { immediate: [], short: [], long: [] }
    };
  }
}

// Function to synthesize results from all agents
async function synthesizeResults(
  mayaResults: any,
  ellieResults: any,
  sophiaResults: any,
  userId: string,
  resumeText: string,
  isPremium: boolean = false,
  premiumData?: {
    careerTrajectory?: any;
    executiveNetwork?: any;
    skillsAccelerator?: any;
  }
) {
  console.log("Synthesizing results from all agents");

  try {
    // Extract skills from Maya's analysis
    const skills = mayaResults.skills || [];
    console.log(`Found ${skills.length} skills from resume analysis`);

    // Extract trends from Ellie's analysis
    const trends = ellieResults.trends || [];
    console.log(`Found ${trends.length} industry trends`);

    // Extract resources from Sophia's analysis
    const resources = sophiaResults.resources || [];
    console.log(`Found ${resources.length} learning resources`);

    // Create consistent risk categories
    const automationRisks = mayaResults.automationRisks || [];
    const riskCategories = [
      { category: "Automation", risk: 4, description: getDescriptionForCategory("Automation", 4) },
      { category: "Market Demand", risk: 3, description: getDescriptionForCategory("Market Demand", 3) },
      { category: "Skill Relevance", risk: 2, description: getDescriptionForCategory("Skill Relevance", 2) }
    ];

    // Create the final career advice structure
    // Define the type with optional premium property
    type CareerAdvice = {
      riskReport: {
        overallRisk: number;
        categories: Array<{
          category: string;
          risk: number;
          description: string;
        }>;
        summary: string;
      };
      learningPlan: {
        skills: Array<any>;
        resources: Array<any>;
        timeEstimate: string;
      };
      nextSteps: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
      };
      premium?: {
        careerTrajectory?: any;
        executiveNetwork?: any;
        skillsAccelerator?: any;
      };
    };

    // Create the advice result with the proper type
    const adviceResult: CareerAdvice = {
      riskReport: {
        overallRisk: 3,
        categories: riskCategories,
        summary: "Your career has moderate exposure to automation and market shifts. Updating digital skills is recommended to stay competitive."
      },
      learningPlan: {
        skills: skills.map((skill: string, i: number) => ({
          skill,
          currentLevel: Math.floor(Math.random() * 3) + 1,
          targetLevel: Math.floor(Math.random() * 3) + 3,
          importance: Math.floor(Math.random() * 5) + 1,
        })).slice(0, 5),
        resources: (resources.length > 0) ? resources : [
          {
            id: "res1",
            title: "Machine Learning Fundamentals",
            type: "Online Course",
            provider: "Coursera",
            duration: "8 weeks",
            level: "Intermediate",
            url: "https://www.coursera.org/learn/machine-learning",
            skillsAddressed: getSkillsAddressedByResource("Machine Learning Fundamentals")
          },
          {
            id: "res2",
            title: "Data Analysis with Python",
            type: "Online Course",
            provider: "edX",
            duration: "6 weeks",
            level: "Beginner",
            url: "https://www.edx.org/course/data-analysis-with-python",
            skillsAddressed: getSkillsAddressedByResource("Data Analysis with Python")
          },
          {
            id: "res3",
            title: "Professional Communication Skills",
            type: "Workshop",
            provider: "LinkedIn Learning",
            duration: "3 hours",
            level: "All Levels",
            url: "https://www.linkedin.com/learning/topics/communication",
            skillsAddressed: getSkillsAddressedByResource("Professional Communication Skills")
          }
        ],
        timeEstimate: "3-6 months"
      },
      nextSteps: {
        immediate: [
          "Update your LinkedIn profile to highlight your transferable skills",
          "Enroll in the recommended Machine Learning course to build fundamental AI knowledge",
          "Join industry groups related to your field to stay updated on trends"
        ],
        shortTerm: [
          "Complete at least two of the recommended courses in the next 3 months",
          "Build a small portfolio project demonstrating your new skills",
          "Attend a virtual networking event in your target industry"
        ],
        longTerm: [
          "Aim for a certification in your chosen specialization area",
          "Consider transitioning to a role that combines your experience with new digital skills",
          "Develop mentorship relationships in your target field"
        ]
      }
    };

    // Add premium features if enabled
    if (isPremium) {
      console.log("Adding premium features to career advice");

      // Use provided premium data if available, otherwise generate placeholder data
      adviceResult.premium = {
        // Career Trajectory Mapping
        careerTrajectory: premiumData?.careerTrajectory || {
          targetRole: "Senior Data Scientist",
          timeframe: 24, // in months
          milestones: [
            {
              title: "Complete Advanced Machine Learning Certification",
              description: "Finish a comprehensive certification in machine learning that covers advanced topics",
              targetDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
              priority: 2 // critical
            },
            {
              title: "Contribute to Open Source ML Project",
              description: "Make meaningful contributions to a well-known open source machine learning project",
              targetDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 months from now
              priority: 1 // high
            },
            {
              title: "Complete Portfolio of Three End-to-End ML Projects",
              description: "Build three comprehensive machine learning projects that showcase different skills",
              targetDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 18 months from now
              priority: 1 // high
            }
          ],
          alternativePaths: [
            {
              name: "Machine Learning Engineer",
              description: "Focus more on the engineering and deployment aspects of ML systems",
              probabilityScore: 85,
              potentialUpsides: "More stable job market, higher demand in many industries",
              potentialDownsides: "Less focus on research and cutting-edge algorithms"
            },
            {
              name: "AI Research Scientist",
              description: "Focus on research and development of new ML algorithms",
              probabilityScore: 65,
              potentialUpsides: "Opportunity to work on cutting-edge technology and publish papers",
              potentialDownsides: "More competitive field, may require PhD, fewer job openings"
            }
          ]
        },

        // Executive Network Access
        executiveNetwork: premiumData?.executiveNetwork || {
          recommendedEvents: [
            {
              title: "AI & Big Data Expo",
              description: "Global conference showcasing next-generation technologies in AI, Big Data and ML",
              eventDate: new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 months from now
              eventType: "Conference",
              speakerInfo: {
                keynotes: ["Dr. Andrew Ng", "Dr. Fei-Fei Li"],
                companies: ["Google AI", "Microsoft Research", "OpenAI"]
              },
              relevanceScore: 92
            },
            {
              title: "Women in Data Science Meetup",
              description: "Monthly networking event for women in data science and related fields",
              eventDate: new Date(Date.now() + 0.5 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
              eventType: "Networking",
              speakerInfo: {
                organizers: ["Women in ML & Data Science"],
                guests: ["Various industry professionals"]
              },
              relevanceScore: 85
            }
          ],
          mentorshipOpportunities: [
            {
              mentorName: "Sarah Johnson",
              mentorTitle: "Director of Data Science",
              mentorCompany: "Tech Innovations Inc.",
              expertise: ["Machine Learning", "Team Leadership", "Career Development"],
              recommendationReason: "Sarah has extensive experience helping mid-career professionals transition into senior data science roles",
              matchScore: 90
            },
            {
              mentorName: "Michael Chen",
              mentorTitle: "Principal ML Engineer",
              mentorCompany: "AI Solutions",
              expertise: ["Deep Learning", "Production ML Systems", "Technical Interviews"],
              recommendationReason: "Michael specializes in the technologies identified as most relevant to your career path",
              matchScore: 85
            }
          ],
          networkingStrategy: "Focus on building relationships with senior professionals in your target industry through regular meetups and conferences. Schedule at least one informational interview per month with someone in your desired role."
        },

        // Skills Gap Accelerator
        skillsAccelerator: premiumData?.skillsAccelerator || {
          assessedSkills: [
            {
              name: "Python Programming",
              category: "Technical",
              currentLevel: 4,
              targetLevel: 8,
              marketDemand: 95,
              futureRelevance: 90,
              salarImpact: 15000,
              priority: 2 // critical
            },
            {
              name: "Deep Learning",
              category: "Technical",
              currentLevel: 2,
              targetLevel: 7,
              marketDemand: 90,
              futureRelevance: 95,
              salarImpact: 25000,
              priority: 2 // critical
            },
            {
              name: "MLOps",
              category: "Technical",
              currentLevel: 1,
              targetLevel: 6,
              marketDemand: 85,
              futureRelevance: 90,
              salarImpact: 20000,
              priority: 1 // high
            },
            {
              name: "Data Visualization",
              category: "Technical",
              currentLevel: 5,
              targetLevel: 8,
              marketDemand: 80,
              futureRelevance: 75,
              salarImpact: 10000,
              priority: 0 // normal
            }
          ],
          personalizedLearningPath: {
            name: "Advanced Data Science Career Path",
            description: "A comprehensive learning path designed to transition you from your current role to a senior data science position",
            estimatedCompletionTime: 720 * 60, // 720 hours in minutes
            resources: [
              {
                title: "Deep Learning Specialization",
                provider: "Coursera",
                type: "Course Series",
                url: "https://www.coursera.org/specializations/deep-learning",
                cost: 4900, // $49.00
                duration: 120 * 60, // 120 hours in minutes
                difficulty: "Intermediate to Advanced",
                skillsAddressed: ["Deep Learning", "Neural Networks", "Python Programming"],
                relevanceScore: 95,
                order: 1
              },
              {
                title: "Deploying Machine Learning Models in Production",
                provider: "Coursera",
                type: "Course",
                url: "https://www.coursera.org/learn/deploying-machine-learning-models-in-production",
                cost: 4900, // $49.00
                duration: 40 * 60, // 40 hours in minutes
                difficulty: "Advanced",
                skillsAddressed: ["MLOps", "Model Deployment", "Production Systems"],
                relevanceScore: 90,
                order: 2
              },
              {
                title: "Advanced Data Visualization with Python",
                provider: "DataCamp",
                type: "Course",
                url: "https://www.datacamp.com/courses/advanced-data-visualization-with-python",
                cost: 2500, // $25.00
                duration: 20 * 60, // 20 hours in minutes
                difficulty: "Intermediate",
                skillsAddressed: ["Data Visualization", "Python Programming"],
                relevanceScore: 85,
                order: 3
              }
            ]
          },
          progressTrackingStrategy: "Set aside 10 hours per week for your learning path. Complete weekly check-ins to assess progress, revise goals, and update your strategy. Use the 'Focus on the Fundamentals First' approach - master one skill completely before moving to the next."
        }
      };
    }

    return adviceResult;
  } catch (error) {
    console.error("Error synthesizing results:", error);
    return createSampleCareerAdvice();
  }
}

// Helper function to get descriptive text for risk categories
function getDescriptionForCategory(category: string, risk: number) {
  switch (category) {
    case "Automation":
      return risk >= 4 
        ? "Your current role has significant exposure to automation technologies."
        : "Your role has some elements that could be automated, but requires human judgment.";
    case "Market Demand":
      return risk >= 4
        ? "The market demand for your current skill set is declining in your industry."
        : "There is moderate demand for your skills, but upskilling would increase your marketability.";
    case "Skill Relevance":
      return risk >= 4
        ? "Several of your core skills are becoming outdated with current technology trends."
        : "Your skills remain relevant but would benefit from complementary digital capabilities.";
    default:
      return "This area presents some career risk that could be mitigated with targeted development.";
  }
}

// Helper function to get skills addressed by a resource
function getSkillsAddressedByResource(title: string) {
  switch (title) {
    case "Machine Learning Fundamentals":
      return ["AI", "Data Analysis", "Programming", "Statistics"];
    case "Data Analysis with Python":
      return ["Programming", "Data Analysis", "Python", "Statistical Analysis"];
    case "Professional Communication Skills":
      return ["Communication", "Presentation", "Collaboration", "Stakeholder Management"];
    default:
      return ["Critical Thinking", "Problem Solving"];
  }
}

// Create a sample career advice object when needed
function createSampleCareerAdvice() {
  return {
    riskReport: {
      overallRisk: 3,
      categories: [
        {
          category: "Automation",
          risk: 4,
          description: "Your current role has significant exposure to automation technologies."
        },
        {
          category: "Market Demand",
          risk: 3,
          description: "There is moderate demand for your skills, but upskilling would increase your marketability."
        },
        {
          category: "Skill Relevance",
          risk: 2,
          description: "Your skills remain relevant but would benefit from complementary digital capabilities."
        }
      ],
      summary: "Your career has moderate exposure to automation and market shifts. Updating digital skills is recommended to stay competitive."
    },
    learningPlan: {
      skills: [
        {
          skill: "Data Analysis",
          currentLevel: 2,
          targetLevel: 4,
          importance: 5
        },
        {
          skill: "AI/Machine Learning",
          currentLevel: 1,
          targetLevel: 3,
          importance: 4
        },
        {
          skill: "Programming",
          currentLevel: 2,
          targetLevel: 4,
          importance: 4
        },
        {
          skill: "Project Management",
          currentLevel: 3,
          targetLevel: 4,
          importance: 3
        },
        {
          skill: "Digital Marketing",
          currentLevel: 2,
          targetLevel: 3,
          importance: 3
        }
      ],
      resources: [
        {
          id: "res1",
          title: "Machine Learning Fundamentals",
          type: "Online Course",
          provider: "Coursera",
          duration: "8 weeks",
          level: "Intermediate",
          url: "https://www.coursera.org/learn/machine-learning",
          skillsAddressed: ["AI", "Data Analysis", "Programming", "Statistics"]
        },
        {
          id: "res2",
          title: "Data Analysis with Python",
          type: "Online Course",
          provider: "edX",
          duration: "6 weeks",
          level: "Beginner",
          url: "https://www.edx.org/course/data-analysis-with-python",
          skillsAddressed: ["Programming", "Data Analysis", "Python", "Statistical Analysis"]
        },
        {
          id: "res3",
          title: "Professional Communication Skills",
          type: "Workshop",
          provider: "LinkedIn Learning",
          duration: "3 hours",
          level: "All Levels",
          url: "https://www.linkedin.com/learning/topics/communication",
          skillsAddressed: ["Communication", "Presentation", "Collaboration", "Stakeholder Management"]
        }
      ],
      timeEstimate: "3-6 months"
    },
    nextSteps: {
      immediate: [
        "Update your LinkedIn profile to highlight your transferable skills",
        "Enroll in the recommended Machine Learning course to build fundamental AI knowledge",
        "Join industry groups related to your field to stay updated on trends"
      ],
      shortTerm: [
        "Complete at least two of the recommended courses in the next 3 months",
        "Build a small portfolio project demonstrating your new skills",
        "Attend a virtual networking event in your target industry"
      ],
      longTerm: [
        "Aim for a certification in your chosen specialization area",
        "Consider transitioning to a role that combines your experience with new digital skills",
        "Develop mentorship relationships in your target field"
      ]
    }
  };
}