import axios from 'axios';

export class ElevenLabsClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.elevenlabs.io/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('ElevenLabs client initialized with base URL:', this.baseURL);
  }

  /**
   * Create a new conversation session with the ElevenLabs agent
   * Returns a signed URL for WebRTC connection
   * @param {string} agentId - The ElevenLabs agent ID
   * @returns {Promise<Object>} Session details including signed URL
   */
  async createConversation(agentId) {
    try {
      console.log('Creating ElevenLabs conversation...');
      console.log('Agent ID:', agentId);
      console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');
      
      // ElevenLabs Conversational AI v1 endpoint
      const url = `/convai/conversation/get_signed_url?agent_id=${agentId}`;
      console.log('Request URL:', this.baseURL + url);
      
      const response = await this.client.get(url);
      
      console.log('✅ Success! Signed URL received');
      console.log('Response data:', response.data);
      
      return {
        signed_url: response.data.signed_url,
        conversation_id: response.data.conversation_id || 'generated'
      };
      
    } catch (error) {
      console.error('❌ ElevenLabs API Error:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Request URL:', error.config?.url);
      
      throw new Error(`Failed to create conversation: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get agent details
   * @param {string} agentId - The ElevenLabs agent ID
   * @returns {Promise<Object>} Agent configuration
   */
  async getAgent(agentId) {
    try {
      const response = await this.client.get(`/convai/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error:', error.response?.data || error.message);
      throw new Error(`Failed to get agent: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * List available agents
   * @returns {Promise<Array>} List of agents
   */
  async listAgents() {
    try {
      const response = await this.client.get('/convai/agents');
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error:', error.response?.data || error.message);
      throw new Error(`Failed to list agents: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get conversation history
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object>} Conversation history
   */
  async getConversationHistory(conversationId) {
    try {
      const response = await this.client.get(`/convai/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('ElevenLabs API Error:', error.response?.data || error.message);
      throw new Error(`Failed to get conversation history: ${error.response?.data?.detail || error.message}`);
    }
  }
}
