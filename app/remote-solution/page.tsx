'use client';

import { useState } from 'react';
import { Cloud, Server, Monitor, Network, Settings, CheckCircle, Clock, AlertCircle, Terminal, Lock, Globe, Zap, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RemoteSupport from '@/components/RemoteSupport';
import AdminAccessGuard from '@/components/AdminAccessGuard';

interface RemoteConnection {
  id: string;
  name: string;
  type: 'browser' | 'vnc' | 'rdp' | 'ssh';
  url: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastConnected?: Date;
}

interface Service {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: string;
  location: string;
  latency?: number;
}

function RemoteSolutionContent() {
  const [connections, setConnections] = useState<RemoteConnection[]>([]);
  const [newConnection, setNewConnection] = useState({ name: '', url: '', type: 'browser' as const });
  const [services] = useState<Service[]>([
    { name: '메인 서버', status: 'online', uptime: '99.9%', location: '서울, 한국', latency: 12 },
    { name: '백업 서버', status: 'online', uptime: '99.8%', location: '부산, 한국', latency: 15 },
    { name: 'CDN 서버', status: 'online', uptime: '99.95%', location: '글로벌', latency: 8 },
    { name: '데이터베이스', status: 'online', uptime: '99.9%', location: '서울, 한국', latency: 10 },
  ]);

  const addConnection = () => {
    if (!newConnection.name || !newConnection.url) return;
    
    const connection: RemoteConnection = {
      id: Date.now().toString(),
      name: newConnection.name,
      type: newConnection.type,
      url: newConnection.url,
      status: 'disconnected',
    };
    
    setConnections([...connections, connection]);
    setNewConnection({ name: '', url: '', type: 'browser' });
  };

  const connect = (id: string) => {
    setConnections(connections.map(conn => 
      conn.id === id 
        ? { ...conn, status: 'connecting' as const }
        : conn
    ));
    
    setTimeout(() => {
      setConnections(connections.map(conn => 
        conn.id === id 
          ? { ...conn, status: 'connected' as const, lastConnected: new Date() }
          : conn
      ));
    }, 1500);
  };

  const disconnect = (id: string) => {
    setConnections(connections.map(conn => 
      conn.id === id 
        ? { ...conn, status: 'disconnected' as const }
        : conn
    ));
  };

  const removeConnection = (id: string) => {
    setConnections(connections.filter(conn => conn.id !== id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
      case 'disconnected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
      case 'connecting':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return '연결됨';
      case 'offline':
      case 'disconnected':
        return '연결 안됨';
      case 'maintenance':
      case 'connecting':
        return '연결 중...';
      default:
        return '알 수 없음';
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'browser':
        return <Globe className="w-5 h-5" />;
      case 'vnc':
        return <Monitor className="w-5 h-5" />;
      case 'rdp':
        return <Server className="w-5 h-5" />;
      case 'ssh':
        return <Terminal className="w-5 h-5" />;
      default:
        return <Network className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              원격 솔루션
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              인터넷을 통한 원격 접속 솔루션 - 프로그램 설치 없이 브라우저에서 바로 사용
            </p>
          </div>

          {/* 서비스 상태 */}
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Server className="w-6 h-6 text-blue-500" />
              서비스 상태
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    {getStatusIcon(service.status)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">상태:</span>
                      <span className="text-white font-medium">{getStatusText(service.status)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">가동률:</span>
                      <span className="text-green-400 font-medium">{service.uptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">위치:</span>
                      <span className="text-gray-300">{service.location}</span>
                    </div>
                    {service.latency && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">지연시간:</span>
                        <span className="text-blue-400 font-medium">{service.latency}ms</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 원격 지원 (Rsupport 스타일) */}
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Monitor className="w-6 h-6 text-blue-500" />
              원격 지원 (프로그램 설치 불필요)
            </h2>
            <RemoteSupport />
          </div>

          {/* 새 연결 추가 */}
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-500" />
              새 원격 연결 추가
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={newConnection.name}
                onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                placeholder="연결 이름"
                className="px-4 py-3 bg-gray-900 text-white border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <input
                type="url"
                value={newConnection.url}
                onChange={(e) => setNewConnection({ ...newConnection, url: e.target.value })}
                placeholder="원격 URL (예: https://...) 또는 VNC/RDP/SSH 주소"
                className="px-4 py-3 bg-gray-900 text-white border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 md:col-span-2"
              />
              <select
                value={newConnection.type}
                onChange={(e) => setNewConnection({ ...newConnection, type: e.target.value as any })}
                className="px-4 py-3 bg-gray-900 text-white border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="browser">브라우저</option>
                <option value="vnc">VNC</option>
                <option value="rdp">RDP</option>
                <option value="ssh">SSH</option>
              </select>
            </div>
            <button
              onClick={addConnection}
              disabled={!newConnection.name || !newConnection.url}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Network className="w-5 h-5" />
              <span>연결 추가</span>
            </button>
          </div>

          {/* 원격 연결 목록 */}
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-500" />
              원격 연결 ({connections.length}개)
            </h2>
            {connections.length === 0 ? (
              <div className="text-center py-12">
                <Cloud className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">등록된 원격 연결이 없습니다.</p>
                <p className="text-gray-500 text-sm mt-2">위에서 새 연결을 추가하세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          {getConnectionTypeIcon(connection.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{connection.name}</h3>
                          <p className="text-sm text-gray-400">{connection.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(connection.status)}
                        <span className="text-sm text-gray-300">{getStatusText(connection.status)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {connection.status === 'disconnected' ? (
                        <button
                          onClick={() => connect(connection.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Network className="w-4 h-4" />
                          <span>연결</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => disconnect(connection.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>연결 해제</span>
                        </button>
                      )}
                      {connection.status === 'connected' && (
                        <a
                          href={connection.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Globe className="w-4 h-4" />
                          <span>새 탭에서 열기</span>
                        </a>
                      )}
                      <button
                        onClick={() => removeConnection(connection.id)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                    {connection.lastConnected && (
                      <p className="text-xs text-gray-500 mt-3">
                        마지막 연결: {connection.lastConnected.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 안내 */}
          <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-2">보안 안내</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 모든 원격 연결은 HTTPS를 통해 암호화됩니다.</li>
                  <li>• 연결 정보는 브라우저에만 저장되며 서버로 전송되지 않습니다.</li>
                  <li>• VNC/RDP/SSH 연결은 보안이 강화된 터널을 통해 이루어집니다.</li>
                  <li>• 의심스러운 연결은 즉시 차단됩니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RemoteSolutionPage() {
  return <RemoteSolutionContent />;
}
