"""
Export & Reporting API
Generate and export reports in multiple formats (CSV, JSON, PDF)
"""

from flask import Blueprint, request, jsonify, send_file
from datetime import datetime, timedelta
import logging
import sqlite3
import csv
import json
import io
import threading
from typing import Dict, List, Any, Optional

export_bp = Blueprint('export', __name__, url_prefix='/api/export')
logger = logging.getLogger(__name__)

DB_PATH = 'backend/database/nids.db'
_db_lock = threading.Lock()


def _get_db():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)


@export_bp.route('/alerts/csv', methods=['GET'])
def export_alerts_csv():
    """
    Export alerts as CSV
    Query params:
      - start_time: ISO format datetime
      - end_time: ISO format datetime
      - severity: critical, high, medium, low
      - limit: Maximum records
    """
    try:
        start_time = request.args.get('start_time', 
                                     (datetime.utcnow() - timedelta(days=7)).isoformat())
        end_time = request.args.get('end_time', datetime.utcnow().isoformat())
        severity = request.args.get('severity', None)
        limit = int(request.args.get('limit', 10000))
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            query = '''
                SELECT id, timestamp, alert_type, severity, threat_type, 
                       src_ip, dst_ip, src_port, dst_port, protocol, message
                FROM alerts
                WHERE timestamp BETWEEN ? AND ?
            '''
            params = [start_time, end_time]
            
            if severity:
                query += ' AND severity = ?'
                params.append(severity)
            
            query += ' ORDER BY timestamp DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            conn.close()
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Headers
        writer.writerow([
            'Alert ID', 'Timestamp', 'Type', 'Severity', 'Threat Type',
            'Source IP', 'Dest IP', 'Source Port', 'Dest Port', 'Protocol', 'Message'
        ])
        
        # Rows
        for row in rows:
            writer.writerow(row)
        
        output.seek(0)
        
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'alerts_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
    except Exception as e:
        logger.error(f"Error exporting alerts as CSV: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@export_bp.route('/alerts/json', methods=['GET'])
def export_alerts_json():
    """
    Export alerts as JSON
    Query params: same as CSV export
    """
    try:
        start_time = request.args.get('start_time',
                                     (datetime.utcnow() - timedelta(days=7)).isoformat())
        end_time = request.args.get('end_time', datetime.utcnow().isoformat())
        severity = request.args.get('severity', None)
        limit = int(request.args.get('limit', 10000))
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = '''
                SELECT id, timestamp, alert_type, severity, threat_type,
                       src_ip, dst_ip, src_port, dst_port, protocol, message
                FROM alerts
                WHERE timestamp BETWEEN ? AND ?
            '''
            params = [start_time, end_time]
            
            if severity:
                query += ' AND severity = ?'
                params.append(severity)
            
            query += ' ORDER BY timestamp DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            conn.close()
        
        # Convert to JSON
        alerts = [dict(row) for row in rows]
        
        return jsonify({
            'status': 'success',
            'count': len(alerts),
            'alerts': alerts,
            'export_time': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error exporting alerts as JSON: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@export_bp.route('/report/summary', methods=['GET'])
def export_report_summary():
    """
    Generate summary report
    Query params:
      - time_range: 24h, 7d, 30d (default: 24h)
    """
    try:
        time_range = request.args.get('time_range', '24h')
        
        # Parse time range
        hours_map = {'24h': 24, '7d': 168, '30d': 720}
        hours = hours_map.get(time_range, 24)
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Total alerts
            cursor.execute(f'''
                SELECT COUNT(*) FROM alerts
                WHERE timestamp > datetime('now', '-{hours} hours')
            ''')
            total_alerts = cursor.fetchone()[0]
            
            # Severity breakdown
            cursor.execute(f'''
                SELECT severity, COUNT(*) as count
                FROM alerts
                WHERE timestamp > datetime('now', '-{hours} hours')
                GROUP BY severity
            ''')
            severity_dist = dict(cursor.fetchall())
            
            # Threat types
            cursor.execute(f'''
                SELECT threat_type, COUNT(*) as count
                FROM alerts
                WHERE timestamp > datetime('now', '-{hours} hours')
                GROUP BY threat_type
            ''')
            threat_dist = dict(cursor.fetchall())
            
            # Top source IPs
            cursor.execute(f'''
                SELECT src_ip, COUNT(*) as count
                FROM alerts
                WHERE timestamp > datetime('now', '-{hours} hours')
                GROUP BY src_ip
                ORDER BY count DESC
                LIMIT 10
            ''')
            top_ips = [{'ip': row[0], 'count': row[1]} for row in cursor.fetchall()]
            
            # Average confidence
            cursor.execute(f'''
                SELECT AVG(confidence) FROM alerts
                WHERE timestamp > datetime('now', '-{hours} hours')
            ''')
            avg_confidence = cursor.fetchone()[0] or 0
            
            conn.close()
        
        report = {
            'status': 'success',
            'time_range': time_range,
            'generated_at': datetime.utcnow().isoformat(),
            'summary': {
                'total_alerts': total_alerts,
                'severity_distribution': severity_dist,
                'threat_distribution': threat_dist,
                'top_source_ips': top_ips,
                'average_confidence': round(avg_confidence, 2),
            }
        }
        
        return jsonify(report), 200
        
    except Exception as e:
        logger.error(f"Error generating report summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@export_bp.route('/report/pdf', methods=['POST'])
def export_report_pdf():
    """
    Generate PDF report
    Request body:
      - title: Report title
      - include_sections: Array of sections to include
      - time_range: 24h, 7d, 30d
    """
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        title = data.get('title', 'NIDS Report')
        sections = data.get('include_sections', ['summary', 'alerts', 'threats'])
        time_range = data.get('time_range', '24h')
        
        # For now, return HTML that can be converted to PDF
        html_content = generate_html_report(title, sections, time_range)
        
        return jsonify({
            'status': 'success',
            'message': 'HTML report generated. Use your PDF converter.',
            'html': html_content,
            'can_download': False
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating PDF report: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


def generate_html_report(title: str, sections: List[str], time_range: str) -> str:
    """Generate HTML report"""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 40px;
                background-color: #f5f5f5;
            }}
            .container {{
                background-color: white;
                padding: 40px;
                border-radius: 8px;
                max-width: 1000px;
                margin: 0 auto;
            }}
            h1 {{
                color: #333;
                border-bottom: 2px solid #2196f3;
                padding-bottom: 10px;
            }}
            h2 {{
                color: #555;
                margin-top: 30px;
            }}
            .metadata {{
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 4px;
                margin-bottom: 20px;
                font-size: 0.9em;
                color: #666;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            th {{
                background-color: #2196f3;
                color: white;
                padding: 12px;
                text-align: left;
            }}
            td {{
                padding: 10px 12px;
                border-bottom: 1px solid #ddd;
            }}
            tr:hover {{
                background-color: #f5f5f5;
            }}
            .stats {{
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 20px 0;
            }}
            .stat-box {{
                background-color: #f0f4f8;
                padding: 20px;
                border-radius: 4px;
                border-left: 4px solid #2196f3;
            }}
            .stat-value {{
                font-size: 2em;
                font-weight: bold;
                color: #2196f3;
            }}
            .stat-label {{
                color: #666;
                margin-top: 5px;
            }}
            .footer {{
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 0.9em;
                color: #999;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>{title}</h1>
            <div class="metadata">
                <strong>Generated:</strong> {datetime.utcnow().isoformat()}<br>
                <strong>Time Range:</strong> {time_range}<br>
                <strong>System:</strong> NIDS - Network Intrusion Detection System
            </div>
    """
    
    if 'summary' in sections:
        html += """
            <h2>Executive Summary</h2>
            <p>This report provides an overview of network security events detected during the specified time period.</p>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-value">N/A</div>
                    <div class="stat-label">Total Alerts</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">N/A</div>
                    <div class="stat-label">Critical Threats</div>
                </div>
            </div>
        """
    
    html += """
            <div class="footer">
                <p>This report is automatically generated by the NIDS system.</p>
                <p>For detailed analysis and recommendations, please consult with your security team.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html


@export_bp.route('/report/schedule', methods=['POST'])
def schedule_report():
    """
    Schedule automated report generation
    Request body:
      - frequency: daily, weekly, monthly
      - email: Recipient email
      - format: csv, json, pdf
    """
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        frequency = data.get('frequency', 'weekly')
        email = data.get('email')
        format_type = data.get('format', 'pdf')
        
        if not email:
            return jsonify({
                'status': 'error',
                'message': 'Email is required'
            }), 400
        
        # TODO: Implement scheduled reports with cron or APScheduler
        
        return jsonify({
            'status': 'success',
            'message': f'Report scheduled: {frequency} in {format_type} to {email}'
        }), 201
        
    except Exception as e:
        logger.error(f"Error scheduling report: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


logger.info("✅ Export & Reporting API blueprint initialized")
