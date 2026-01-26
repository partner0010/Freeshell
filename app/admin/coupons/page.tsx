'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Gift,
  CheckCircle, 
  XCircle,
  Calendar,
  Users,
  Loader2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  max_users?: number;
  current_users: number;
  max_uses_per_user: number;
  expires_at?: string;
  is_active: boolean;
  plan_restriction?: string;
  min_purchase?: number;
  created_at: string;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // 쿠폰 생성 폼 상태
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'subscription_days',
    value: 0,
    max_users: null as number | null,
    max_uses_per_user: 1,
    expires_at: '',
    is_active: true,
    plan_restriction: '',
    min_purchase: null as number | null,
  });

  useEffect(() => {
    loadCoupons();
  }, [filterActive]);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('page_size', '100');
      if (filterActive !== null) {
        params.append('is_active', filterActive.toString());
      }

      const response = await fetch(`/api/coupon/list?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/coupon/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          expires_at: formData.expires_at || null,
          max_users: formData.max_users || null,
          min_purchase: formData.min_purchase || null,
          plan_restriction: formData.plan_restriction || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          code: '',
          name: '',
          description: '',
          type: 'subscription_days',
          value: 0,
          max_users: null,
          max_uses_per_user: 1,
          expires_at: '',
          is_active: true,
          plan_restriction: '',
          min_purchase: null,
        });
        loadCoupons();
        alert('쿠폰이 생성되었습니다');
      } else {
        alert(data.detail || '쿠폰 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to create coupon:', error);
      alert('쿠폰 생성에 실패했습니다');
    }
  };

  const getCouponTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      subscription_days: '구독 일수',
      credit: '크레딧',
      discount_percent: '할인율',
      discount_amount: '할인 금액',
      plan_upgrade: '플랜 업그레이드',
    };
    return labels[type] || type;
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        coupon.code.toLowerCase().includes(query) ||
        coupon.name.toLowerCase().includes(query) ||
        (coupon.description && coupon.description.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">쿠폰 관리</h1>
              <p className="text-gray-600">쿠폰을 생성하고 관리하세요</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              쿠폰 생성
            </Button>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="쿠폰 코드, 이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                setFilterActive(e.target.value === 'all' ? null : e.target.value === 'active');
              }}
              className="w-48 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">전체</option>
              <option value="active">활성화</option>
              <option value="inactive">비활성화</option>
            </select>
          </div>
        </div>

        {/* 쿠폰 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">쿠폰이 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                      <CardDescription className="mt-1">{coupon.name}</CardDescription>
                    </div>
                    {coupon.is_active ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">타입:</span>
                      <span className="font-semibold">{getCouponTypeLabel(coupon.type)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">값:</span>
                      <span className="font-semibold">
                        {coupon.type.includes('percent') ? `${coupon.value}%` : 
                         coupon.type.includes('amount') ? `${coupon.value.toLocaleString()}원` :
                         coupon.value}
                      </span>
                    </div>
                    {coupon.max_users && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">사용 인원:</span>
                        <span className="font-semibold">
                          {coupon.current_users} / {coupon.max_users}
                        </span>
                      </div>
                    )}
                    {coupon.expires_at && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">
                          {new Date(coupon.expires_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    )}
                    {coupon.plan_restriction && (
                      <div className="text-xs text-gray-500">
                        {coupon.plan_restriction} 플랜 전용
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 쿠폰 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>쿠폰 생성</CardTitle>
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium mb-1">쿠폰 코드 *</label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME2024"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">쿠폰 이름 *</label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="신규 가입 환영 쿠폰"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">설명</label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="쿠폰 설명을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-1">쿠폰 타입 *</label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="subscription_days">구독 일수</option>
                      <option value="credit">크레딧</option>
                      <option value="discount_percent">할인율 (%)</option>
                      <option value="discount_amount">할인 금액 (원)</option>
                      <option value="plan_upgrade">플랜 업그레이드</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="value" className="block text-sm font-medium mb-1">값 *</label>
                    <Input
                      id="value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="max_users" className="block text-sm font-medium mb-1">최대 사용 인원수</label>
                    <Input
                      id="max_users"
                      type="number"
                      min="1"
                      value={formData.max_users || ''}
                      onChange={(e) => setFormData({ ...formData, max_users: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="무제한 (비워두기)"
                    />
                  </div>
                  <div>
                    <label htmlFor="max_uses_per_user" className="block text-sm font-medium mb-1">사용자당 최대 사용 횟수</label>
                    <Input
                      id="max_uses_per_user"
                      type="number"
                      min="1"
                      value={formData.max_uses_per_user}
                      onChange={(e) => setFormData({ ...formData, max_uses_per_user: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expires_at" className="block text-sm font-medium mb-1">만료일</label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="plan_restriction" className="block text-sm font-medium mb-1">플랜 제한</label>
                    <select
                      id="plan_restriction"
                      value={formData.plan_restriction}
                      onChange={(e) => setFormData({ ...formData, plan_restriction: e.target.value || '' })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">모든 플랜</option>
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="min_purchase" className="block text-sm font-medium mb-1">최소 구매 금액 (원)</label>
                  <Input
                    id="min_purchase"
                    type="number"
                    min="0"
                    value={formData.min_purchase || ''}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="제한 없음 (비워두기)"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="text-sm">활성화</label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    생성
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
