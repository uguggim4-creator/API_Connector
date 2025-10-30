"use client";

import { useState } from "react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더는 전역 Header 사용 */}

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-16">
        {/* 타이틀 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">요금 안내</h1>
          <p className="text-lg text-gray-600">비즈니스 규모에 맞는 플랜을 선택하세요</p>
        </div>

        {/* 플랜 선택 탭 (월간/연간) */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
            월간
          </button>
          <button className="px-6 py-2 rounded-full bg-gray-800 text-white text-sm font-medium">
            연간
          </button>
          <span className="text-sm text-gray-600">연간 결제 시 30% 할인</span>
        </div>

        {/* 요금 플랜 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <p className="text-sm text-gray-600 mb-6 h-12">
              개인 또는 소규모 팀을 위한 무료 플랜
            </p>
            <div className="mb-6">
              <div className="text-5xl font-bold text-gray-900">0원</div>
              <div className="text-sm text-gray-500 mt-1">평생무료</div>
              <div className="text-xs text-gray-400 mt-1">*1만미디 연장 가능</div>
            </div>
            <button className="w-full py-3 rounded-lg border-2 border-teal-500 text-teal-500 font-medium hover:bg-teal-50 transition-colors mb-8">
              가입하기
            </button>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm mb-4">사용 가능 모델</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Seedream 4.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Nanobanana</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Midjourney</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Kling</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Veo 3.1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Sora 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Plan */}
          <div className="rounded-2xl border-2 border-teal-500 bg-white p-8 relative hover:shadow-xl transition-shadow">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-teal-500 text-white text-xs font-bold shadow-lg">
              추천! 가장 인기있는 상품
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard</h3>
            <p className="text-sm text-gray-600 mb-6 h-12">
              가장 일반적인 규모의 미디어 서비스 제공
            </p>
            <div className="mb-6">
              <div className="text-5xl font-bold text-gray-900">210,000원</div>
              <div className="text-sm text-gray-500 mt-1">/월</div>
              <div className="text-xs text-gray-400 mt-1">(연간 계약)</div>
            </div>
            <button className="w-full py-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors mb-8">
              구매하기
            </button>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm mb-4">사용 가능 모델</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Seedream 4.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Nanobanana</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Midjourney</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Kling</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Veo 3.1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Sora 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
            <p className="text-sm text-gray-600 mb-6 h-12">
              서비스 성장에 따른 사용량의 확보가 요구되는 중소 · 중견 기업, 단체, 학원
            </p>
            <div className="mb-6">
              <div className="text-5xl font-bold text-gray-900">350,000원</div>
              <div className="text-sm text-gray-500 mt-1">/월</div>
              <div className="text-xs text-gray-400 mt-1">(연간 계약)</div>
            </div>
            <button className="w-full py-3 rounded-lg border-2 border-teal-500 text-teal-500 font-medium hover:bg-teal-50 transition-colors mb-8">
              구매하기
            </button>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm mb-4">사용 가능 모델</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Seedream 4.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Nanobanana</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Midjourney</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Kling</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Veo 3.1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Sora 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ultra Plan */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ultra</h3>
            <p className="text-sm text-gray-600 mb-6 h-12">
              대규모 서비스 운영과 엔터프라이즈급 지원이 필요한 기업
            </p>
            <div className="mb-6">
              <div className="text-5xl font-bold text-gray-900">500,000원</div>
              <div className="text-sm text-gray-500 mt-1">/월</div>
              <div className="text-xs text-gray-400 mt-1">(연간 계약)</div>
            </div>
            <button className="w-full py-3 rounded-lg border-2 border-teal-500 text-teal-500 font-medium hover:bg-teal-50 transition-colors mb-8">
              구매하기
            </button>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm mb-4">사용 가능 모델</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Seedream 4.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Nanobanana</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Midjourney</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Kling</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Veo 3.1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">✓</span>
                  <span>Sora 2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ 섹션 */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">자주 묻는 질문</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">플랜 변경은 어떻게 하나요?</h3>
              <p className="text-gray-600">언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 변경 사항은 다음 결제 주기부터 적용됩니다.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">환불 정책은 어떻게 되나요?</h3>
              <p className="text-gray-600">서비스 시작 후 7일 이내에 환불을 요청하실 수 있습니다. 자세한 내용은 고객 지원팀에 문의해 주세요.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">모든 플랜에서 모든 모델을 사용할 수 있나요?</h3>
              <p className="text-gray-600">네, 모든 플랜에서 Seedream 4.0, Nanobanana, Midjourney, Kling, Veo 3.1, Sora 2 모델을 사용하실 수 있습니다. 플랜별로 사용량 한도가 다릅니다.</p>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="mt-20 text-center bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">아직 고민 중이신가요?</h2>
          <p className="text-lg mb-8 text-white/90">무료 플랜으로 시작해보세요. 언제든지 업그레이드 가능합니다.</p>
          <a href="/" className="inline-block px-8 py-4 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            시작하기
          </a>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 mt-20 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">제품</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/" className="hover:text-gray-900">이미지 생성</a></li>
                <li><a href="/" className="hover:text-gray-900">비디오 생성</a></li>
                <li><a href="/" className="hover:text-gray-900">프로젝트 관리</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">회사</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">소개</a></li>
                <li><a href="#" className="hover:text-gray-900">블로그</a></li>
                <li><a href="#" className="hover:text-gray-900">채용</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">지원</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">도움말 센터</a></li>
                <li><a href="mailto:contact@ainspire.com" className="hover:text-gray-900">문의하기</a></li>
                <li><a href="#" className="hover:text-gray-900">상태 페이지</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">법률</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">이용 약관</a></li>
                <li><a href="#" className="hover:text-gray-900">개인정보 처리방침</a></li>
                <li><a href="#" className="hover:text-gray-900">쿠키 정책</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>&copy; 2025 AInspire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
