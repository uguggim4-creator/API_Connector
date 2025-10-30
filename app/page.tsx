"use client";

import { useState } from "react";

export default function Home() {
  const [isPricingManagementOpen, setIsPricingManagementOpen] = useState(false);

  return (
    <div className="min-h-screen text-white relative">

      {/* 요금관리 패널 토글 버튼 */}
      <button
        onClick={() => setIsPricingManagementOpen(!isPricingManagementOpen)}
        className="fixed top-24 right-4 z-50 px-4 py-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-sm text-white transition-all shadow-lg"
        title="요금관리"
      >
         요금관리
      </button>

      {/* 요금관리 패널 */}
      <div
        className={'fixed top-0 right-0 h-full w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-40 overflow-y-auto ' + (isPricingManagementOpen ? 'translate-x-0' : 'translate-x-full')}
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold"> 요금관리</h2>
            <button
              onClick={() => setIsPricingManagementOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              
            </button>
          </div>

          {/* 요금 정보 */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-sm font-medium text-white/80 mb-3"> 모델별 요금</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Sora 2</span>
                  <span className="text-white">.10/초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Sora 2 Pro</span>
                  <span className="text-white">.30/초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Seedream 4.0</span>
                  <span className="text-white">.03/장</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Veo 3.1 Standard</span>
                  <span className="text-white">.40/초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Veo 3.1 Fast</span>
                  <span className="text-white">.15/초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Nanobanana</span>
                  <span className="text-white">.039/장</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Midjourney</span>
                  <span className="text-white">.04/장</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Kling</span>
                  <span className="text-white/40">가격 미정</span>
                </div>
              </div>
            </div>
          </div>

          {/* 참고 사항 */}
          <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5 text-xs text-white/60">
            <div className="font-medium text-white/80 mb-2"> 참고사항</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>요금은 localStorage 기록 기반으로 계산됩니다</li>
              <li>브라우저 캐시 삭제 시 기록이 초기화됩니다</li>
              <li>실제 청구 금액은 API 제공업체에서 확인하세요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content wrapper (offset from sticky header) */}
      <div className="relative z-10 pt-24">
        <div className="max-w-[1400px] mx-auto px-8 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                AI 콘텐츠 생성 플랫폼
              </h1>
              <p className="text-xl text-white/60 mb-8">
                최신 AI 모델로 이미지와 비디오를 생성하세요
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="/generate" 
                  className="px-8 py-3 rounded-lg bg-white/90 text-black hover:bg-white transition-colors font-medium"
                >
                  생성 시작하기
                </a>
                <a 
                  href="/gallery" 
                  className="px-8 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-colors font-medium"
                >
                  갤러리 보기
                </a>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">이미지 생성</h3>
                <p className="text-white/60 text-sm">
                  Seedream, Nanobanana, Midjourney로 고품질 이미지 생성
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">비디오 생성</h3>
                <p className="text-white/60 text-sm">
                  Kling, Veo 3.1, Sora 2로 창의적인 비디오 제작
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">빠른 생성</h3>
                <p className="text-white/60 text-sm">
                  최적화된 API 연동으로 빠르고 안정적인 생성
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="text-4xl mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">투명한 요금</h3>
                <p className="text-white/60 text-sm">
                  사용량 기반 요금 체계와 실시간 비용 추적
                </p>
              </div>
            </div>

            {/* Supported Models */}
            <div className="p-10 rounded-2xl border border-white/10 bg-white/5 max-w-none">
              <h3 className="text-2xl font-semibold mb-6">지원하는 AI 모델</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <span className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm">
                  Seedream 4.0
                </span>
                <span className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm">
                  Nanobanana
                </span>
                <span className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm">
                  Midjourney
                </span>
                <span className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm">
                  Kling v2.1
                </span>
                <span className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm">
                  Veo 3.1
                </span>
                <span className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm">
                  Sora 2
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing-section" className="mt-20 scroll-mt-24 max-w-none">
              <h2 className="text-4xl font-bold text-white mb-4">💰 요금 안내</h2>
              <p className="text-white/60 mb-8">프로젝트 규모에 맞는 요금제를 선택하세요</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {/* Free Plan */}
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all">
                  <h3 className="text-xl font-semibold mb-2">Free</h3>
                  <p className="text-sm text-white/60 mb-4">개인 또는 소규모 팀을 위한 무료 플랜</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold">0원</div>
                    <div className="text-sm text-white/60">평생무료</div>
                    <div className="text-xs text-white/40 mt-1">*1년마다 연장 가능</div>
                  </div>

                  <button className="w-full py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors mb-6">
                    가입하기
                  </button>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">AI 생성 크레딧</span>
                      <span className="text-white font-medium">100회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">저장 용량</span>
                      <span className="text-white font-medium">1GB</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="text-sm font-medium text-white/80 mb-3">사용 가능 모델</div>
                    <div className="space-y-2 text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Seedream 4.0 (기본)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Starter Plan */}
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all">
                  <h3 className="text-xl font-semibold mb-2">Starter</h3>
                  <p className="text-sm text-white/60 mb-4">처음 시작하는 스타트업 또는 중소기업</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold">140,000원</div>
                    <div className="text-sm text-white/60">/월</div>
                    <div className="text-xs text-white/40 mt-1">(연간 계약)</div>
                  </div>

                  <button className="w-full py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors mb-6">
                    구매하기
                  </button>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">AI 생성 크레딧</span>
                      <span className="text-white font-medium">1,000회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">저장 용량</span>
                      <span className="text-white font-medium">10GB</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="text-sm font-medium text-white/80 mb-3">사용 가능 모델</div>
                    <div className="space-y-2 text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Seedream 4.0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Nanobanana</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Kling v2.1 (기본)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Standard Plan - Recommended */}
                <div className="p-8 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-white/5 hover:border-emerald-500/70 transition-all relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium">
                    추천 가장 인기있는 상품
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 mt-2">Standard</h3>
                  <p className="text-sm text-white/60 mb-4">가장 일반적인 규모의 미디어 서비스 제공</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold">210,000원</div>
                    <div className="text-sm text-white/60">/월</div>
                    <div className="text-xs text-white/40 mt-1">(연간 계약)</div>
                  </div>

                  <button className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors mb-6">
                    구매하기
                  </button>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">AI 생성 크레딧</span>
                      <span className="text-white font-medium">5,000회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">저장 용량</span>
                      <span className="text-white font-medium">50GB</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="text-sm font-medium text-white/80 mb-3">사용 가능 모델</div>
                    <div className="space-y-2 text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Seedream 4.0</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Nanobanana</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Midjourney</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Kling v2.1 (Pro)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Veo 3.1 Fast</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all">
                  <h3 className="text-xl font-semibold mb-2">Pro</h3>
                  <p className="text-sm text-white/60 mb-4">서비스 성장에 따른 사용량과 확장가능</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold">350,000원</div>
                    <div className="text-sm text-white/60">/월</div>
                    <div className="text-xs text-white/40 mt-1">(연간 계약)</div>
                  </div>

                  <button className="w-full py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors mb-6">
                    구매하기
                  </button>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">AI 생성 크레딧</span>
                      <span className="text-white font-medium">무제한</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">저장 용량</span>
                      <span className="text-white font-medium">200GB</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="text-sm font-medium text-white/80 mb-3">사용 가능 모델</div>
                    <div className="space-y-2 text-xs text-white/60">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>모든 이미지 생성 AI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Sora 2 & Sora 2 Pro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Veo 3.1 Standard</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Kling v2.1 (Ultra)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>우선 지원 & 전용 API</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Models Details */}
              <div className="mt-16 max-w-none">
                <h3 className="text-3xl font-bold text-white mb-6">🤖 사용 가능한 AI 모델</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Image Generation Models */}
                  <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
                    <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span>🎨</span>
                      <span>이미지 생성 AI</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Seedream 4.0</div>
                          <span className="text-sm text-emerald-400">$0.03/장</span>
                        </div>
                        <p className="text-sm text-white/60">고품질 이미지 생성, 빠른 처리 속도</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Nanobanana</div>
                          <span className="text-sm text-emerald-400">$0.039/장</span>
                        </div>
                        <p className="text-sm text-white/60">다양한 스타일 지원, 디테일한 표현</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Midjourney</div>
                          <span className="text-sm text-emerald-400">$0.04/장</span>
                        </div>
                        <p className="text-sm text-white/60">예술적 표현, 프로페셔널 품질</p>
                      </div>
                    </div>
                  </div>

                  {/* Video Generation Models */}
                  <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
                    <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span>🎬</span>
                      <span>비디오 생성 AI</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Sora 2 & Sora 2 Pro</div>
                          <span className="text-sm text-emerald-400">$0.10~$0.30/초</span>
                        </div>
                        <p className="text-sm text-white/60">최신 비디오 생성 기술, 자연스러운 움직임</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Veo 3.1</div>
                          <span className="text-sm text-emerald-400">$0.15~$0.40/초</span>
                        </div>
                        <p className="text-sm text-white/60">Fast/Standard 모드, 고품질 영상 생성</p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">Kling v2.1</div>
                          <span className="text-sm text-white/60">출시 예정</span>
                        </div>
                        <p className="text-sm text-white/60">차세대 비디오 AI, 향상된 품질과 속도</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Notes */}
              <div className="mt-10 p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>💡</span>
                  <span>참고사항</span>
                </h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-white/50">•</span>
                    <span>월간 크레딧 소진 후 추가 사용 시 건당 요금이 적용됩니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/50">•</span>
                    <span>연간 계약 시 30% 할인이 적용되며, 계약 기간 중 플랜 변경이 가능합니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/50">•</span>
                    <span>비디오 생성 요금은 최종 영상의 길이(초)를 기준으로 계산됩니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/50">•</span>
                    <span>Pro 플랜은 전용 API 키와 우선 지원 서비스가 포함됩니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white/50">•</span>
                    <span>모든 플랜은 14일 환불 보장 정책이 적용됩니다</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
