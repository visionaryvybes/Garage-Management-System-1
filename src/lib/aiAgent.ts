import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface DashboardConfig {
  layout: string[];
  metrics: string[];
  charts: {
    type: 'pie' | 'line' | 'bar' | 'area';
    data: string;
    title: string;
  }[];
}

export class AIAgent {
  private static instance: AIAgent;
  private context: string[] = [];

  private constructor() {}

  public static getInstance(): AIAgent {
    if (!AIAgent.instance) {
      AIAgent.instance = new AIAgent();
    }
    return AIAgent.instance;
  }

  public async processRequest(request: string): Promise<DashboardConfig> {
    try {
      // Add request to context
      this.context.push(`User request: ${request}`);

      // Get data about current services and vehicles
      const { data: services } = await supabase.from('services').select('*');
      const { data: vehicles } = await supabase.from('vehicles').select('*');

      // Create system message with current state
      const systemMessage = `You are an AI assistant helping to configure a garage management dashboard.
Current state:
- ${vehicles?.length || 0} vehicles in system
- ${services?.length || 0} services recorded
- Available metrics: service types, costs, schedules, vehicle status
- Available charts: pie, bar, line, area

Please analyze the user's request and suggest dashboard configurations.`;

      // Get AI suggestion
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          ...this.context.map(msg => ({ role: "user" as const, content: msg }))
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      // Parse AI response
      const suggestion = completion.choices[0].message.content;
      console.log('AI Suggestion:', suggestion);

      // Convert suggestion to configuration
      const config = this.parseAISuggestion(suggestion || '');
      return config;
    } catch (error) {
      console.error('AI Agent error:', error);
      return this.getDefaultConfig();
    }
  }

  private parseAISuggestion(suggestion: string): DashboardConfig {
    try {
      // Default configuration
      const config: DashboardConfig = {
        layout: ['metrics', 'charts', 'tables'],
        metrics: ['total_vehicles', 'active_services', 'upcoming_services'],
        charts: [
          {
            type: 'pie',
            data: 'service_distribution',
            title: 'Service Types Distribution'
          },
          {
            type: 'line',
            data: 'service_costs',
            title: 'Service Costs Trend'
          }
        ]
      };

      // Parse AI suggestion to modify config
      if (suggestion.includes('cost')) {
        config.metrics.push('total_revenue');
        config.charts.push({
          type: 'bar',
          data: 'monthly_revenue',
          title: 'Monthly Revenue'
        });
      }

      if (suggestion.includes('mechanic')) {
        config.metrics.push('active_mechanics');
        config.charts.push({
          type: 'pie',
          data: 'mechanic_workload',
          title: 'Mechanic Workload'
        });
      }

      if (suggestion.includes('schedule')) {
        config.metrics.push('completion_rate');
        config.charts.push({
          type: 'area',
          data: 'service_timeline',
          title: 'Service Timeline'
        });
      }

      return config;
    } catch (error) {
      console.error('Error parsing AI suggestion:', error);
      return this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): DashboardConfig {
    return {
      layout: ['metrics', 'charts'],
      metrics: ['total_vehicles', 'active_services'],
      charts: [
        {
          type: 'pie',
          data: 'service_distribution',
          title: 'Service Distribution'
        }
      ]
    };
  }

  public clearContext() {
    this.context = [];
  }
} 