# Protocol Buffers 정의 파일

이 디렉토리는 멘토-멘티 매칭 앱의 마이크로서비스 간 통신을 위한 gRPC Protocol Buffers 정의 파일들을 포함합니다.

## 파일 구조

```
proto/
├── user-service.proto      # 사용자 관리 서비스
├── mentor-service.proto    # 멘토 관리 서비스
├── match-service.proto     # 매칭 관리 서비스
└── profile-service.proto   # 프로필 관리 서비스
```

## 서비스별 설명

### user-service.proto
사용자 인증 및 관리를 담당하는 서비스
- 회원가입, 로그인
- 사용자 정보 조회/수정
- 비밀번호 관리

### mentor-service.proto
멘토 관련 기능을 담당하는 서비스
- 멘토 목록 조회
- 멘토 검색 및 필터링
- 멘토 가용성 확인

### match-service.proto
멘토-멘티 매칭을 담당하는 서비스
- 매칭 요청 생성/조회
- 매칭 수락/거절/취소
- 매칭 상태 관리

### profile-service.proto
프로필 이미지 관리를 담당하는 서비스
- 프로필 이미지 업로드/조회
- 이미지 URL 생성
- 이미지 유효성 검증

## 코드 생성

Protocol Buffers 컴파일러를 사용하여 각 언어별 코드를 생성합니다:

```bash
# TypeScript/JavaScript 코드 생성
protoc --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
       --ts_proto_out=./generated \
       --ts_proto_opt=outputServices=grpc-js \
       ./proto/*.proto

# Go 코드 생성
protoc --go_out=./generated --go-grpc_out=./generated ./proto/*.proto

# Python 코드 생성
python -m grpc_tools.protoc -I./proto --python_out=./generated --grpc_python_out=./generated ./proto/*.proto
```

## 버전 관리

proto 파일을 수정할 때는 다음 사항을 주의하세요:
- 필드 번호를 변경하지 마세요
- 기존 필드를 삭제하지 마세요 (deprecated로 표시)
- 새 필드는 optional로 추가하세요
- 하위 호환성을 유지하세요