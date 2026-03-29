import os
from flask import Blueprint, request, jsonify
from typing import Optional, Dict, Any
import requests

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

class AIModelManager:
    """Manage multiple AI provider integrations"""
    
    PROVIDERS = {
        'openai': {
            'name': 'OpenAI GPT-4',
            'endpoint': 'https://api.openai.com/v1/chat/completions',
            'model': 'gpt-4',
            'requires': ['api_key'],
        },
        'claude': {
            'name': 'Anthropic Claude',
            'endpoint': 'https://api.anthropic.com/v1/messages',
            'model': 'claude-3-opus-20240229',
            'requires': ['api_key'],
        },
        'gemini': {
            'name': 'Google Gemini',
            'endpoint': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            'model': 'gemini-pro',
            'requires': ['api_key'],
        },
        'ollama': {
            'name': 'Ollama (Local)',
            'endpoint': 'http://localhost:11434/api/generate',
            'model': 'llama2',
            'requires': ['base_url'],
        },
        'lmstudio': {
            'name': 'LM Studio (Local)',
            'endpoint': 'http://localhost:1234/v1/chat/completions',
            'model': 'local-model',
            'requires': ['base_url'],
        },
        'huggingface': {
            'name': 'Hugging Face',
            'endpoint': 'https://api-inference.huggingface.co/models',
            'model': 'meta-llama/Llama-2-7b-chat-hf',
            'requires': ['api_key'],
        },
        'custom': {
            'name': 'Custom API Endpoint',
            'endpoint': 'https://your-api.com/v1/chat/completions',
            'model': 'custom-model',
            'requires': ['base_url', 'api_key'],
        },
    }
    
    def __init__(self):
        self.config = {}
        self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """Load AI configuration from environment"""
        self.config = {
            'openai_api_key': os.getenv('OPENAI_API_KEY', ''),
            'claude_api_key': os.getenv('ANTHROPIC_API_KEY', ''),
            'gemini_api_key': os.getenv('GOOGLE_API_KEY', ''),
            'ollama_base_url': os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434'),
            'lmstudio_base_url': os.getenv('LMSTUDIO_BASE_URL', 'http://localhost:1234'),
            'huggingface_api_key': os.getenv('HUGGINGFACE_API_KEY', ''),
            'custom_base_url': os.getenv('CUSTOM_API_URL', ''),
            'custom_api_key': os.getenv('CUSTOM_API_KEY', ''),
            'active_provider': os.getenv('AI_PROVIDER', 'ollama'),
        }
        return self.config
    
    def update_config(self, provider: str, config: Dict[str, str]) -> bool:
        """Update AI provider configuration"""
        try:
            if provider not in self.PROVIDERS:
                return False
            
            if provider == 'openai':
                os.environ['OPENAI_API_KEY'] = config.get('api_key', '')
            elif provider == 'claude':
                os.environ['ANTHROPIC_API_KEY'] = config.get('api_key', '')
            elif provider == 'gemini':
                os.environ['GOOGLE_API_KEY'] = config.get('api_key', '')
            elif provider == 'ollama':
                os.environ['OLLAMA_BASE_URL'] = config.get('base_url', 'http://localhost:11434')
            elif provider == 'lmstudio':
                os.environ['LMSTUDIO_BASE_URL'] = config.get('base_url', 'http://localhost:1234')
            elif provider == 'huggingface':
                os.environ['HUGGINGFACE_API_KEY'] = config.get('api_key', '')
            elif provider == 'custom':
                os.environ['CUSTOM_API_URL'] = config.get('base_url', '')
                os.environ['CUSTOM_API_KEY'] = config.get('api_key', '')
            
            os.environ['AI_PROVIDER'] = provider
            self.load_config()
            return True
        except Exception as e:
            print(f"Error updating AI config: {e}")
            return False
    
    def analyze_threat(self, threat_data: Dict[str, Any]) -> Optional[str]:
        """Analyze threat using configured AI model"""
        provider = self.config.get('active_provider', 'ollama')
        
        prompt = self._build_analysis_prompt(threat_data)
        
        if provider == 'openai':
            return self._call_openai(prompt)
        elif provider == 'claude':
            return self._call_claude(prompt)
        elif provider == 'gemini':
            return self._call_gemini(prompt)
        elif provider == 'ollama':
            return self._call_ollama(prompt)
        elif provider == 'lmstudio':
            return self._call_lmstudio(prompt)
        elif provider == 'huggingface':
            return self._call_huggingface(prompt)
        elif provider == 'custom':
            return self._call_custom(prompt)
        
        return None
    
    def _build_analysis_prompt(self, threat_data: Dict[str, Any]) -> str:
        """Build threat analysis prompt"""
        return f"""Analyze this network threat and provide:
1. Threat Classification
2. Severity Assessment
3. Attack Pattern
4. Recommended Actions
5. IoCs (Indicators of Compromise)

Threat Data:
- Type: {threat_data.get('type', 'Unknown')}
- Source IP: {threat_data.get('source_ip', 'N/A')}
- Destination IP: {threat_data.get('dest_ip', 'N/A')}
- Protocol: {threat_data.get('protocol', 'N/A')}
- Severity: {threat_data.get('severity', 'Unknown')}
- Payload: {threat_data.get('payload', 'N/A')}

Be concise and technical."""
    
    def _call_openai(self, prompt: str) -> Optional[str]:
        """Call OpenAI API"""
        try:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                return None
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            }
            
            data = {
                'model': 'gpt-4',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.7,
                'max_tokens': 500,
            }
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=15
            )
            
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content']
            return None
        except Exception as e:
            print(f"OpenAI error: {e}")
            return None
    
    def _call_claude(self, prompt: str) -> Optional[str]:
        """Call Anthropic Claude API"""
        try:
            api_key = os.getenv('ANTHROPIC_API_KEY')
            if not api_key:
                return None
            
            headers = {
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            }
            
            data = {
                'model': 'claude-3-opus-20240229',
                'max_tokens': 500,
                'messages': [{'role': 'user', 'content': prompt}],
            }
            
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=data,
                timeout=15
            )
            
            if response.status_code == 200:
                return response.json()['content'][0]['text']
            return None
        except Exception as e:
            print(f"Claude error: {e}")
            return None
    
    def _call_gemini(self, prompt: str) -> Optional[str]:
        """Call Google Gemini API"""
        try:
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                return None
            
            url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}'
            
            data = {
                'contents': [{'parts': [{'text': prompt}]}],
                'generationConfig': {
                    'temperature': 0.7,
                    'maxOutputTokens': 500,
                },
            }
            
            response = requests.post(url, json=data, timeout=15)
            
            if response.status_code == 200:
                return response.json()['candidates'][0]['content']['parts'][0]['text']
            return None
        except Exception as e:
            print(f"Gemini error: {e}")
            return None
    
    def _call_ollama(self, prompt: str) -> Optional[str]:
        """Call Ollama (local) API"""
        try:
            base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
            
            data = {
                'model': 'llama2',
                'prompt': prompt,
                'stream': False,
                'temperature': 0.7,
            }
            
            response = requests.post(
                f'{base_url}/api/generate',
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json().get('response', '')
            return None
        except Exception as e:
            print(f"Ollama error: {e}")
            return None
    
    def _call_huggingface(self, prompt: str) -> Optional[str]:
        """Call Hugging Face API"""
        try:
            api_key = os.getenv('HUGGINGFACE_API_KEY')
            if not api_key:
                return None
            
            headers = {'Authorization': f'Bearer {api_key}'}
            
            data = {
                'inputs': prompt,
                'parameters': {
                    'max_length': 500,
                    'temperature': 0.7,
                },
            }
            
            response = requests.post(
                'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()[0].get('generated_text', '')
            return None
        except Exception as e:
            print(f"Hugging Face error: {e}")
            return None
    
    def _call_lmstudio(self, prompt: str) -> Optional[str]:
        """Call LM Studio API (local OpenAI-compatible endpoint)"""
        try:
            base_url = os.getenv('LMSTUDIO_BASE_URL', 'http://localhost:1234')
            
            headers = {'Content-Type': 'application/json'}
            
            data = {
                'model': 'local-model',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.7,
                'max_tokens': 500,
            }
            
            response = requests.post(
                f'{base_url}/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()['choices'][0]['message']['content']
            return None
        except Exception as e:
            print(f"LM Studio error: {e}")
            return None
    
    def _call_custom(self, prompt: str) -> Optional[str]:
        """Call custom API endpoint"""
        try:
            base_url = os.getenv('CUSTOM_API_URL', '')
            api_key = os.getenv('CUSTOM_API_KEY', '')
            
            if not base_url:
                return None
            
            headers = {
                'Content-Type': 'application/json',
            }
            
            if api_key:
                headers['Authorization'] = f'Bearer {api_key}'
            
            # Try OpenAI-compatible format first
            data = {
                'model': 'custom-model',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.7,
                'max_tokens': 500,
            }
            
            response = requests.post(
                base_url,
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                try:
                    # Try OpenAI format
                    return response.json()['choices'][0]['message']['content']
                except (KeyError, IndexError, TypeError):
                    try:
                        # Try direct text response
                        return response.json().get('response', response.text)
                    except:
                        return response.text
            return None
        except Exception as e:
            print(f"Custom API error: {e}")
            return None

# Initialize manager
ai_manager = AIModelManager()

# Routes

@ai_bp.route('/providers', methods=['GET'])
def get_providers():
    """Get available AI providers"""
    return jsonify({
        'status': 'success',
        'providers': ai_manager.PROVIDERS,
        'active_provider': ai_manager.config.get('active_provider', 'ollama'),
    })

@ai_bp.route('/config', methods=['GET'])
def get_config():
    """Get current AI configuration (without secrets)"""
    config = {
        'active_provider': ai_manager.config.get('active_provider', 'ollama'),
        'providers': {}
    }
    
    for provider in ai_manager.PROVIDERS.keys():
        has_config = False
        if provider == 'openai':
            has_config = bool(os.getenv('OPENAI_API_KEY'))
        elif provider == 'claude':
            has_config = bool(os.getenv('ANTHROPIC_API_KEY'))
        elif provider == 'gemini':
            has_config = bool(os.getenv('GOOGLE_API_KEY'))
        elif provider == 'ollama':
            has_config = True  # Always available locally
        elif provider == 'lmstudio':
            has_config = True  # Always available locally
        elif provider == 'huggingface':
            has_config = bool(os.getenv('HUGGINGFACE_API_KEY'))
        elif provider == 'custom':
            has_config = bool(os.getenv('CUSTOM_API_URL'))
        
        config['providers'][provider] = {
            'configured': has_config,
            'name': ai_manager.PROVIDERS[provider]['name'],
        }
    
    return jsonify(config)

@ai_bp.route('/config', methods=['POST'])
def set_config():
    """Update AI provider configuration"""
    try:
        data = request.get_json()
        provider = data.get('provider')
        config = data.get('config', {})
        
        if not provider or provider not in ai_manager.PROVIDERS:
            return jsonify({
                'status': 'error',
                'message': f'Invalid provider: {provider}'
            }), 400
        
        if ai_manager.update_config(provider, config):
            return jsonify({
                'status': 'success',
                'message': f'AI provider configured: {provider}',
                'active_provider': provider,
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to update AI configuration'
            }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@ai_bp.route('/analyze', methods=['POST'])
def analyze_threat():
    """Analyze threat using AI"""
    try:
        threat_data = request.get_json()
        
        analysis = ai_manager.analyze_threat(threat_data)
        
        if analysis:
            return jsonify({
                'status': 'success',
                'analysis': analysis,
                'provider': ai_manager.config.get('active_provider'),
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'AI analysis unavailable. Configure API key or check provider connection.',
            }), 503
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@ai_bp.route('/health', methods=['GET'])
def health_check():
    """Check AI provider connectivity"""
    try:
        provider = ai_manager.config.get('active_provider', 'ollama')
        
        if provider == 'ollama':
            base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
            response = requests.get(f'{base_url}/api/tags', timeout=5)
            available = response.status_code == 200
        elif provider == 'lmstudio':
            base_url = os.getenv('LMSTUDIO_BASE_URL', 'http://localhost:1234')
            response = requests.get(f'{base_url}/v1/models', timeout=5)
            available = response.status_code == 200
        elif provider == 'openai':
            available = bool(os.getenv('OPENAI_API_KEY'))
        elif provider == 'claude':
            available = bool(os.getenv('ANTHROPIC_API_KEY'))
        elif provider == 'gemini':
            available = bool(os.getenv('GOOGLE_API_KEY'))
        elif provider == 'huggingface':
            available = bool(os.getenv('HUGGINGFACE_API_KEY'))
        elif provider == 'custom':
            available = bool(os.getenv('CUSTOM_API_URL'))
        else:
            available = False
        
        return jsonify({
            'status': 'success',
            'provider': provider,
            'available': available,
            'message': 'AI provider is available' if available else 'AI provider not configured',
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
