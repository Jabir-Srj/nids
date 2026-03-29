"""
NIDS Packet Capture Engine
Real-time network traffic analysis with Scapy
"""

import asyncio
import logging
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import threading
import queue

from scapy.all import sniff, IP, TCP, UDP, ICMP, Raw, DNS, DNSQR
from scapy.layers.inet import IP
import ipaddress

logger = logging.getLogger(__name__)

@dataclass
class Packet:
    """Packet data structure"""
    timestamp: datetime
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    payload: bytes
    packet_size: int
    ttl: int
    flags: str
    raw_packet: Any

    def to_dict(self):
        """Convert to dictionary"""
        data = asdict(self)
        data['timestamp'] = data['timestamp'].isoformat()
        data['raw_packet'] = None  # Don't serialize raw packet
        return data


class PacketCaptureEngine:
    """
    High-performance packet capture engine using Scapy.
    Supports live capture and PCAP file analysis.
    """

    def __init__(self, buffer_size: int = 10000):
        """Initialize packet capture engine"""
        self.buffer_size = buffer_size
        self.packet_buffer = queue.Queue(maxsize=buffer_size)
        self.is_capturing = False
        self.packet_count = 0
        self.capture_thread = None
        self.filter_callback: Optional[Callable[[Packet], bool]] = None
        self.packet_callback: Optional[Callable[[Packet], None]] = None
        logger.info(f"✅ PacketCaptureEngine initialized (buffer: {buffer_size})")

    def _parse_packet(self, raw_packet) -> Optional[Packet]:
        """Parse raw Scapy packet into Packet dataclass"""
        try:
            timestamp = datetime.now()
            packet_size = len(raw_packet)
            
            # Extract IP layer
            if not raw_packet.haslayer(IP):
                return None
            
            ip_layer = raw_packet[IP]
            src_ip = ip_layer.src
            dst_ip = ip_layer.dst
            ttl = ip_layer.ttl
            protocol_name = ip_layer.proto
            
            # Determine protocol and ports
            src_port = 0
            dst_port = 0
            flags = ""
            payload = b""
            
            if raw_packet.haslayer(TCP):
                tcp_layer = raw_packet[TCP]
                protocol = "TCP"
                src_port = tcp_layer.sport
                dst_port = tcp_layer.dport
                # Extract TCP flags
                flags_list = []
                if tcp_layer.flags.F: flags_list.append("FIN")
                if tcp_layer.flags.S: flags_list.append("SYN")
                if tcp_layer.flags.R: flags_list.append("RST")
                if tcp_layer.flags.P: flags_list.append("PSH")
                if tcp_layer.flags.A: flags_list.append("ACK")
                if tcp_layer.flags.U: flags_list.append("URG")
                flags = ",".join(flags_list) if flags_list else "NONE"
                
                if raw_packet.haslayer(Raw):
                    payload = raw_packet[Raw].load
                    
            elif raw_packet.haslayer(UDP):
                udp_layer = raw_packet[UDP]
                protocol = "UDP"
                src_port = udp_layer.sport
                dst_port = udp_layer.dport
                if raw_packet.haslayer(Raw):
                    payload = raw_packet[Raw].load
                    
            elif raw_packet.haslayer(ICMP):
                protocol = "ICMP"
            else:
                protocol = f"OTHER({protocol_name})"
            
            packet = Packet(
                timestamp=timestamp,
                src_ip=src_ip,
                dst_ip=dst_ip,
                src_port=src_port,
                dst_port=dst_port,
                protocol=protocol,
                payload=payload,
                packet_size=packet_size,
                ttl=ttl,
                flags=flags,
                raw_packet=raw_packet
            )
            
            return packet
            
        except Exception as e:
            logger.warning(f"Failed to parse packet: {e}")
            return None

    def _packet_handler(self, raw_packet):
        """Callback for each captured packet"""
        packet = self._parse_packet(raw_packet)
        if packet is None:
            return
        
        # Apply filter if set
        if self.filter_callback and not self.filter_callback(packet):
            return
        
        # Add to buffer
        try:
            self.packet_buffer.put_nowait(packet)
            self.packet_count += 1
        except queue.Full:
            logger.warning("Packet buffer full - dropping packet")
        
        # Call user callback if set
        if self.packet_callback:
            try:
                self.packet_callback(packet)
            except Exception as e:
                logger.error(f"Error in packet callback: {e}")

    def start_live_capture(self, interface: str, bpf_filter: str = "") -> None:
        """
        Start live packet capture from network interface
        
        Args:
            interface: Network interface name (e.g., 'eth0', 'en0')
            bpf_filter: BPF filter string (empty for all traffic)
        """
        if self.is_capturing:
            logger.warning("Capture already running")
            return
        
        self.is_capturing = True
        self.packet_count = 0
        
        def capture():
            try:
                logger.info(f"📡 Starting live capture on {interface}")
                sniff(
                    iface=interface,
                    prn=self._packet_handler,
                    filter=bpf_filter if bpf_filter else None,
                    store=False,
                    stop_filter=lambda x: not self.is_capturing
                )
            except Exception as e:
                logger.error(f"Capture error: {e}")
                self.is_capturing = False
        
        self.capture_thread = threading.Thread(target=capture, daemon=True)
        self.capture_thread.start()
        logger.info(f"✅ Capture started on {interface}")

    def stop_capture(self) -> None:
        """Stop packet capture"""
        if not self.is_capturing:
            logger.warning("Capture not running")
            return
        
        self.is_capturing = False
        if self.capture_thread:
            self.capture_thread.join(timeout=5)
        logger.info(f"✅ Capture stopped ({self.packet_count} packets)")

    def get_packets(self, count: int = 10) -> List[Packet]:
        """Get packets from buffer (non-blocking)"""
        packets = []
        for _ in range(count):
            try:
                packet = self.packet_buffer.get_nowait()
                packets.append(packet)
            except queue.Empty:
                break
        return packets

    def load_pcap_file(self, file_path: str) -> List[Packet]:
        """
        Load and parse PCAP file
        
        Args:
            file_path: Path to PCAP file
            
        Returns:
            List of Packet objects
        """
        packets = []
        try:
            from scapy.all import rdpcap
            pcap_packets = rdpcap(file_path)
            logger.info(f"📂 Loading PCAP file: {file_path} ({len(pcap_packets)} packets)")
            
            for raw_packet in pcap_packets:
                packet = self._parse_packet(raw_packet)
                if packet:
                    packets.append(packet)
            
            logger.info(f"✅ Loaded {len(packets)} packets from PCAP")
            return packets
            
        except Exception as e:
            logger.error(f"Error loading PCAP: {e}")
            return []

    def set_filter(self, callback: Callable[[Packet], bool]) -> None:
        """Set packet filter callback"""
        self.filter_callback = callback
        logger.info("🔍 Filter set")

    def set_packet_callback(self, callback: Callable[[Packet], None]) -> None:
        """Set packet callback for real-time processing"""
        self.packet_callback = callback
        logger.info("📍 Packet callback registered")

    def get_stats(self) -> Dict[str, Any]:
        """Get capture statistics"""
        return {
            "is_capturing": self.is_capturing,
            "packet_count": self.packet_count,
            "buffer_size": self.packet_buffer.qsize(),
            "buffer_max": self.buffer_size,
        }


# For testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    engine = PacketCaptureEngine()
    
    # Try to load a sample PCAP if available
    try:
        packets = engine.load_pcap_file("sample.pcap")
        print(f"\nLoaded {len(packets)} packets:")
        for p in packets[:5]:
            print(f"  {p.src_ip}:{p.src_port} → {p.dst_ip}:{p.dst_port} [{p.protocol}]")
    except Exception as e:
        print(f"No sample PCAP: {e}")
    
    print("\n✅ PacketCaptureEngine ready!")
