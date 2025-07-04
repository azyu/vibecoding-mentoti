# 멘토-멘티 매칭 앱 개발 Todo

## 🎯 현재 우선순위

### 1. 개발 환경 설정 (High Priority)
- [ ] Protocol Buffers 컴파일러 설치 및 설정
- [ ] 각 마이크로서비스 프로젝트 초기화
- [ ] Docker Compose 설정 파일 작성
- [ ] 데이터베이스 스키마 설계 및 마이그레이션 파일 작성

### 2. 마이크로서비스 핵심 기능 구현 (High Priority)
- [ ] User Service - 기본 gRPC 서버 설정 및 사용자 CRUD 구현
- [ ] Mentor Service - 멘토 조회 및 검색 기능 구현
- [ ] Match Service - 매칭 요청 관리 기능 구현
- [ ] Profile Service - 프로필 이미지 관리 기능 구현

### 3. API Gateway 구현 (High Priority)
- [ ] NestJS 기반 Backend API Gateway 설정
- [ ] gRPC 클라이언트 연결 및 프록시 로직 구현
- [ ] JWT 인증 미들웨어 구현
- [ ] 모든 REST API 엔드포인트 구현

## 📋 상세 작업 목록

### Phase 1: 인프라 및 기본 설정
1. **개발 환경 설정**
   - [ ] `protoc` 컴파일러 설치
   - [ ] Node.js/NestJS 프로젝트 초기화
   - [ ] 필요한 패키지 설치 (gRPC, Protocol Buffers 등)
   - [ ] ESLint, Prettier 설정

2. **데이터베이스 설정**
   - [ ] PostgreSQL 스키마 설계
   - [ ] 마이그레이션 파일 작성
   - [ ] 시드 데이터 준비
   - [ ] 데이터베이스 연결 설정

3. **Protocol Buffers 코드 생성**
   - [ ] `/proto` 디렉토리의 .proto 파일에서 TypeScript 코드 생성
   - [ ] 코드 생성 스크립트 작성 (package.json에 추가)
   - [ ] 생성된 코드를 `/generated` 디렉토리에 저장
   - [ ] 생성된 코드 검증

### Phase 2: 마이크로서비스 구현
1. **User Service (포트: 50051)**
   - [ ] gRPC 서버 기본 설정
   - [ ] 사용자 데이터 모델 정의
   - [ ] 회원가입 로직 구현
   - [ ] 로그인 로직 구현 (비밀번호 해싱)
   - [ ] 사용자 조회/수정 로직 구현
   - [ ] 에러 핸들링 구현

2. **Mentor Service (포트: 50052)**
   - [ ] gRPC 서버 기본 설정
   - [ ] 멘토 목록 조회 로직 구현
   - [ ] 멘토 검색 및 필터링 로직 구현
   - [ ] 멘토 정렬 로직 구현
   - [ ] 멘토 가용성 확인 로직 구현

3. **Match Service (포트: 50053)**
   - [ ] gRPC 서버 기본 설정
   - [ ] 매칭 요청 CRUD 로직 구현
   - [ ] 매칭 상태 관리 로직 구현
   - [ ] 중복 요청 방지 로직 구현
   - [ ] 매칭 제약 조건 검증 로직 구현

4. **Profile Service (포트: 50054)**
   - [ ] gRPC 서버 기본 설정
   - [ ] 이미지 업로드 로직 구현
   - [ ] 이미지 유효성 검증 로직 구현
   - [ ] 이미지 저장 및 조회 로직 구현
   - [ ] 기본 이미지 처리 로직 구현

### Phase 3: API Gateway 구현
1. **NestJS Backend 설정**
   - [ ] NestJS 프로젝트 초기화
   - [ ] gRPC 클라이언트 모듈 설정
   - [ ] 환경 변수 관리 설정
   - [ ] 로깅 설정

2. **인증 시스템**
   - [ ] JWT 토큰 생성 로직 구현
   - [ ] JWT 토큰 검증 미들웨어 구현
   - [ ] 권한 기반 접근 제어 구현
   - [ ] 인증 가드 구현

3. **REST API 엔드포인트**
   - [ ] 인증 API (`/api/signup`, `/api/login`)
   - [ ] 사용자 API (`/api/me`, `/api/profile`)
   - [ ] 멘토 API (`/api/mentors`)
   - [ ] 매칭 API (`/api/match-requests/*`)
   - [ ] 이미지 API (`/api/images/*`)

### Phase 4: 프론트엔드 구현
1. **Next.js 프로젝트 설정**
   - [ ] Next.js 프로젝트 초기화
   - [ ] Tailwind CSS 설정
   - [ ] 타입 정의 파일 작성
   - [ ] API 클라이언트 라이브러리 구현

2. **인증 시스템**
   - [ ] JWT 토큰 관리 (localStorage)
   - [ ] 인증 상태 관리 (Context API)
   - [ ] 보호된 라우트 구현
   - [ ] 자동 로그인 구현

3. **페이지 구현**
   - [ ] 회원가입 페이지 (`/signup`)
   - [ ] 로그인 페이지 (`/login`)
   - [ ] 프로필 페이지 (`/profile`)
   - [ ] 멘토 목록 페이지 (`/mentors`)
   - [ ] 매칭 요청 페이지 (`/requests`)

4. **UI 컴포넌트**
   - [ ] 공통 컴포넌트 (Button, Input, Card 등)
   - [ ] 폼 컴포넌트 (회원가입, 로그인, 프로필 편집)
   - [ ] 멘토 카드 컴포넌트
   - [ ] 매칭 요청 컴포넌트
   - [ ] 네비게이션 바 컴포넌트

### Phase 5: 테스트 및 검증
1. **단위 테스트**
   - [ ] 각 마이크로서비스 비즈니스 로직 테스트
   - [ ] API Gateway 로직 테스트
   - [ ] 프론트엔드 컴포넌트 테스트

2. **통합 테스트**
   - [ ] 서비스 간 통신 테스트
   - [ ] 데이터베이스 연동 테스트
   - [ ] 인증 플로우 테스트

3. **E2E 테스트**
   - [ ] 사용자 시나리오 테스트
   - [ ] 매칭 플로우 테스트
   - [ ] 에러 상황 테스트

### Phase 6: 배포 및 모니터링
1. **Docker 설정**
   - [ ] 각 서비스별 Dockerfile 작성
   - [ ] Docker Compose 파일 작성
   - [ ] 개발/프로덕션 환경 분리

2. **모니터링 설정**
   - [ ] 로깅 시스템 구현
   - [ ] 헬스 체크 구현
   - [ ] 성능 모니터링 설정

3. **문서화**
   - [ ] API 문서 생성 (Swagger)
   - [ ] 개발 가이드 작성
   - [ ] 배포 가이드 작성

## 🚧 현재 진행 중 (In Progress)

### 마이크로서비스 아키텍처 설계 완료
- ✅ Protocol Buffers 스키마 파일 작성
- ✅ 마이크로서비스 구조 설계
- ✅ API 명세서 업데이트
- ✅ 개발 체크리스트 작성

### 다음 단계
1. **개발 환경 설정 시작**
   - Protocol Buffers 컴파일러 설치
   - 각 서비스 프로젝트 초기화
   - 데이터베이스 스키마 설계

## 📝 메모 및 참고사항

### 기술 스택 선택
- **Backend**: NestJS (API Gateway)
- **Microservices**: Node.js + gRPC
- **Database**: PostgreSQL
- **Frontend**: Next.js + Tailwind CSS
- **Authentication**: JWT
- **Communication**: gRPC (서비스 간), HTTP/REST (클라이언트-서버)

### 개발 우선순위
1. 핵심 기능 구현 (인증, 멘토 조회, 매칭)
2. 사용자 경험 개선 (UI/UX)
3. 성능 최적화 및 보안 강화
4. 테스트 및 배포 자동화

### 주의사항
- 각 마이크로서비스는 독립적으로 배포 가능해야 함
- 서비스 간 통신 실패에 대한 에러 핸들링 필수
- 데이터 일관성 보장을 위한 트랜잭션 처리 고려
- 보안 요구사항 (JWT 검증, 입력 검증, SQL 인젝션 방지) 준수