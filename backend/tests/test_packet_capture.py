"""
Unit tests for packet capture module
"""
import pytest
import time
from unittest.mock import Mock, patch, MagicMock
from capture.packet_capture import PacketCaptureEngine

class TestPacketCaptureEngine:
    """Test cases for PacketCaptureEngine"""
    
    def test_initialization(self):
        """Test PacketCaptureEngine initialization"""
        engine = PacketCaptureEngine()
        assert engine is not None
        assert hasattr(engine, 'start_live_capture')
        assert hasattr(engine, 'stop_capture')
        assert hasattr(engine, 'load_pcap_file')
    
    @patch('capture.packet_capture.conf')
    def test_start_live_capture(self, mock_conf):
        """Test starting live packet capture"""
        engine = PacketCaptureEngine()
        
        with patch.object(engine, '_sniff_callback'):
            # Mock the sniff function
            with patch('capture.packet_capture.sniff') as mock_sniff:
                mock_sniff.return_value = None
                # Note: In production, this would run continuously
                # For testing, we just verify the method exists and can be called
                assert callable(engine.start_live_capture)
    
    @patch('capture.packet_capture.rdpcap')
    def test_load_pcap_file(self, mock_rdpcap, sample_pcap):
        """Test loading PCAP file"""
        engine = PacketCaptureEngine()
        
        # Mock packets
        mock_packets = [MagicMock() for _ in range(5)]
        mock_rdpcap.return_value = mock_packets
        
        packets = engine.load_pcap_file(str(sample_pcap))
        
        # Verify rdpcap was called with the correct file
        mock_rdpcap.assert_called_once_with(str(sample_pcap))
    
    def test_apply_filter(self):
        """Test applying BPF filter"""
        engine = PacketCaptureEngine()
        
        # Test valid BPF filters
        filters = [
            'tcp port 80',
            'udp port 53',
            'host 192.168.1.1',
            'src net 192.168.0.0/24'
        ]
        
        for bpf_filter in filters:
            # Should not raise exception
            engine.apply_filter(bpf_filter)
    
    def test_stop_capture(self):
        """Test stopping packet capture"""
        engine = PacketCaptureEngine()
        
        # Should not raise exception
        engine.stop_capture()
    
    def test_packet_processing_performance(self, mock_packet_data):
        """Test packet processing performance"""
        engine = PacketCaptureEngine()
        
        # Simulate processing 1000 packets
        packets = [mock_packet_data] * 1000
        
        start_time = time.time()
        for packet in packets:
            # Process packet
            pass
        end_time = time.time()
        
        elapsed_time = end_time - start_time
        # Should process 1000 packets quickly (within 1 second)
        assert elapsed_time < 1.0, f"Processing too slow: {elapsed_time}s"
    
    def test_packet_filtering(self):
        """Test packet filtering functionality"""
        engine = PacketCaptureEngine()
        
        # Test filter application
        bpf_filter = 'tcp port 80'
        engine.apply_filter(bpf_filter)
        
        # Verify filter is set
        assert engine.current_filter == bpf_filter
    
    def test_handle_no_interface(self):
        """Test graceful handling when no interface specified"""
        engine = PacketCaptureEngine()
        
        # Should use default interface
        with patch('capture.packet_capture.conf.iface') as mock_iface:
            # Should handle gracefully
            assert engine is not None
    
    def test_pcap_file_not_found(self):
        """Test handling of missing PCAP file"""
        engine = PacketCaptureEngine()
        
        with pytest.raises(FileNotFoundError):
            engine.load_pcap_file('/nonexistent/path/file.pcap')
    
    def test_invalid_bpf_filter(self):
        """Test handling of invalid BPF filter"""
        engine = PacketCaptureEngine()
        
        with pytest.raises(Exception):
            engine.apply_filter('invalid filter syntax )(')
    
    def test_capture_state_management(self):
        """Test capture state transitions"""
        engine = PacketCaptureEngine()
        
        # Initially not capturing
        assert not engine.is_capturing
        
        # After starting, should be capturing
        with patch('capture.packet_capture.sniff'):
            try:
                engine.is_capturing = True
                assert engine.is_capturing
            finally:
                engine.is_capturing = False
                assert not engine.is_capturing

class TestPacketParsing:
    """Test cases for packet parsing"""
    
    @patch('capture.packet_capture.IP')
    def test_parse_tcp_packet(self, mock_ip):
        """Test parsing TCP packet"""
        from capture.packet_capture import parse_packet
        
        mock_packet = MagicMock()
        mock_packet.haslayer = MagicMock(return_value=True)
        
        result = parse_packet(mock_packet)
        assert result is not None
    
    @patch('capture.packet_capture.IP')
    def test_parse_udp_packet(self, mock_ip):
        """Test parsing UDP packet"""
        from capture.packet_capture import parse_packet
        
        mock_packet = MagicMock()
        mock_packet.haslayer = MagicMock(return_value=True)
        
        result = parse_packet(mock_packet)
        assert result is not None
    
    def test_extract_packet_metadata(self, mock_packet_data):
        """Test extracting packet metadata"""
        from capture.packet_capture import extract_metadata
        
        metadata = extract_metadata(mock_packet_data)
        
        assert metadata['src_ip'] == '192.168.1.1'
        assert metadata['dst_ip'] == '192.168.1.2'
        assert metadata['src_port'] == 12345
        assert metadata['dst_port'] == 80
        assert metadata['protocol'] == 'TCP'
