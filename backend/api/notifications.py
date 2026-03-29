"""
Alert Notification Service - Email, Discord, Slack, SMS
"""

import os
import json
import smtplib
from typing import Dict, Any, Optional, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

class NotificationService:
    """Handle multi-channel alert notifications"""
    
    def __init__(self):
        self.email_enabled = bool(os.getenv('SMTP_SERVER'))
        self.discord_enabled = bool(os.getenv('DISCORD_WEBHOOK_URL'))
        self.slack_enabled = bool(os.getenv('SLACK_WEBHOOK_URL'))
        self.twilio_enabled = bool(os.getenv('TWILIO_ACCOUNT_SID'))
    
    def notify_threat(self, threat_data: Dict[str, Any], channels: Optional[List[str]] = None) -> Dict[str, bool]:
        """Send threat alert through configured channels"""
        results = {}
        
        if channels is None:
            channels = ['email', 'discord', 'slack']
        
        if 'email' in channels and self.email_enabled:
            results['email'] = self.send_email(threat_data)
        
        if 'discord' in channels and self.discord_enabled:
            results['discord'] = self.send_discord(threat_data)
        
        if 'slack' in channels and self.slack_enabled:
            results['slack'] = self.send_slack(threat_data)
        
        if 'sms' in channels and self.twilio_enabled:
            results['sms'] = self.send_sms(threat_data)
        
        return results
    
    def send_email(self, threat_data: Dict[str, Any]) -> bool:
        """Send email notification"""
        try:
            smtp_server = os.getenv('SMTP_SERVER')
            smtp_port = int(os.getenv('SMTP_PORT', 587))
            sender_email = os.getenv('SMTP_EMAIL')
            sender_password = os.getenv('SMTP_PASSWORD')
            recipient_emails = os.getenv('ALERT_EMAIL_TO', '').split(',')
            
            if not all([smtp_server, sender_email, sender_password, recipient_emails]):
                return False
            
            subject = f"NIDS ALERT: {threat_data.get('threat_type', 'Unknown')} - {threat_data.get('severity', 'Unknown')}"
            
            body = self._format_threat_email(threat_data)
            
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = ', '.join(recipient_emails)
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Email notification failed: {e}")
            return False
    
    def send_discord(self, threat_data: Dict[str, Any]) -> bool:
        """Send Discord webhook notification"""
        try:
            webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
            if not webhook_url:
                return False
            
            severity_colors = {
                'critical': 0xFF0000,  # Red
                'high': 0xFF6600,      # Orange
                'medium': 0xFFCC00,    # Yellow
                'low': 0x00FF00,       # Green
            }
            
            color = severity_colors.get(threat_data.get('severity', 'low').lower(), 0x808080)
            
            embed = {
                'title': f"🚨 NIDS Alert: {threat_data.get('threat_type', 'Unknown')}",
                'color': color,
                'fields': [
                    {'name': 'Severity', 'value': threat_data.get('severity', 'Unknown').upper(), 'inline': True},
                    {'name': 'Type', 'value': threat_data.get('threat_type', 'Unknown'), 'inline': True},
                    {'name': 'Source IP', 'value': threat_data.get('source_ip', 'N/A'), 'inline': True},
                    {'name': 'Dest IP', 'value': threat_data.get('dest_ip', 'N/A'), 'inline': True},
                    {'name': 'Protocol', 'value': threat_data.get('protocol', 'N/A'), 'inline': True},
                    {'name': 'Confidence', 'value': f"{threat_data.get('confidence', 0):.1%}", 'inline': True},
                    {'name': 'Payload', 'value': f"```{threat_data.get('payload', 'N/A')[:200]}```", 'inline': False},
                ],
                'footer': {'text': 'Network Intrusion Detection System'},
            }
            
            payload = {'embeds': [embed]}
            response = requests.post(webhook_url, json=payload, timeout=10)
            return response.status_code == 204
        except Exception as e:
            print(f"Discord notification failed: {e}")
            return False
    
    def send_slack(self, threat_data: Dict[str, Any]) -> bool:
        """Send Slack webhook notification"""
        try:
            webhook_url = os.getenv('SLACK_WEBHOOK_URL')
            if not webhook_url:
                return False
            
            severity_emoji = {
                'critical': '🔴',
                'high': '🟠',
                'medium': '🟡',
                'low': '🟢',
            }
            
            emoji = severity_emoji.get(threat_data.get('severity', 'low').lower(), '⚫')
            
            payload = {
                'text': f"{emoji} NIDS Alert: {threat_data.get('threat_type', 'Unknown')}",
                'blocks': [
                    {
                        'type': 'header',
                        'text': {
                            'type': 'plain_text',
                            'text': f"{emoji} Network Threat Detected",
                        }
                    },
                    {
                        'type': 'section',
                        'fields': [
                            {'type': 'mrkdwn', 'text': f"*Severity:*\n{threat_data.get('severity', 'Unknown').upper()}"},
                            {'type': 'mrkdwn', 'text': f"*Type:*\n{threat_data.get('threat_type', 'Unknown')}"},
                            {'type': 'mrkdwn', 'text': f"*Source IP:*\n{threat_data.get('source_ip', 'N/A')}"},
                            {'type': 'mrkdwn', 'text': f"*Dest IP:*\n{threat_data.get('dest_ip', 'N/A')}"},
                            {'type': 'mrkdwn', 'text': f"*Protocol:*\n{threat_data.get('protocol', 'N/A')}"},
                            {'type': 'mrkdwn', 'text': f"*Confidence:*\n{threat_data.get('confidence', 0):.1%}"},
                        ]
                    }
                ]
            }
            
            response = requests.post(webhook_url, json=payload, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"Slack notification failed: {e}")
            return False
    
    def send_sms(self, threat_data: Dict[str, Any]) -> bool:
        """Send SMS via Twilio"""
        try:
            from twilio.rest import Client
            
            account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            from_number = os.getenv('TWILIO_PHONE_FROM')
            to_numbers = os.getenv('TWILIO_PHONE_TO', '').split(',')
            
            if not all([account_sid, auth_token, from_number, to_numbers]):
                return False
            
            client = Client(account_sid, auth_token)
            
            message_text = (
                f"NIDS ALERT: {threat_data.get('threat_type')} ({threat_data.get('severity')})\n"
                f"Source: {threat_data.get('source_ip')}\n"
                f"Dest: {threat_data.get('dest_ip')}\n"
                f"Protocol: {threat_data.get('protocol')}"
            )
            
            for to_number in to_numbers:
                client.messages.create(
                    body=message_text,
                    from_=from_number,
                    to=to_number.strip()
                )
            
            return True
        except Exception as e:
            print(f"SMS notification failed: {e}")
            return False
    
    def _format_threat_email(self, threat_data: Dict[str, Any]) -> str:
        """Format threat data as HTML email"""
        severity_color = {
            'critical': '#FF0000',
            'high': '#FF6600',
            'medium': '#FFD700',
            'low': '#00AA00',
        }
        
        color = severity_color.get(threat_data.get('severity', 'low').lower(), '#808080')
        
        html = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; }}
                    .header {{ background-color: {color}; color: white; padding: 20px; border-radius: 5px; }}
                    .section {{ margin: 15px 0; padding: 10px; background-color: #f5f5f5; border-radius: 3px; }}
                    .label {{ font-weight: bold; color: #333; }}
                    .value {{ color: #666; }}
                    .critical {{ color: #FF0000; font-weight: bold; }}
                    .high {{ color: #FF6600; font-weight: bold; }}
                    .medium {{ color: #FFD700; font-weight: bold; }}
                    .low {{ color: #00AA00; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🛡️ Network Intrusion Detection System Alert</h2>
                    </div>
                    
                    <div class="section">
                        <p><span class="label">Threat Type:</span> <span class="value">{threat_data.get('threat_type', 'Unknown')}</span></p>
                        <p><span class="label">Severity:</span> <span class="{threat_data.get('severity', 'low').lower()}">{threat_data.get('severity', 'Unknown').upper()}</span></p>
                        <p><span class="label">Confidence:</span> <span class="value">{threat_data.get('confidence', 0):.1%}</span></p>
                    </div>
                    
                    <div class="section">
                        <h3>Network Information</h3>
                        <p><span class="label">Source IP:</span> <span class="value">{threat_data.get('source_ip', 'N/A')}</span></p>
                        <p><span class="label">Source Port:</span> <span class="value">{threat_data.get('source_port', 'N/A')}</span></p>
                        <p><span class="label">Destination IP:</span> <span class="value">{threat_data.get('dest_ip', 'N/A')}</span></p>
                        <p><span class="label">Destination Port:</span> <span class="value">{threat_data.get('dest_port', 'N/A')}</span></p>
                        <p><span class="label">Protocol:</span> <span class="value">{threat_data.get('protocol', 'N/A')}</span></p>
                    </div>
                    
                    <div class="section">
                        <h3>Payload</h3>
                        <p><code>{threat_data.get('payload', 'N/A')[:500]}</code></p>
                    </div>
                    
                    <div class="section">
                        <p style="color: #999; font-size: 12px;">
                            This is an automated alert from NIDS. Please investigate and take appropriate action.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        return html

# Initialize global notification service
notification_service = NotificationService()
