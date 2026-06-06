# 🏀 HARDWOOD — NBA Analytics Platform
## Product Requirements & Project Plan (PRP)

**Last Updated:** June 6, 2026  
**Status:** MVP Phase 1 - Foundation & Tooling  
**Repository:** [Hanfried-Nguegan/HARDWOOD](https://github.com/Hanfried-Nguegan/HARDWOOD)

---

## 1. 📌 Product Vision

Build a **real-time NBA analytics platform** that allows users to:

- **Explore player statistics** — Browse all NBA players with detailed stats, trends, comparisons
- **Build custom fantasy teams** — Create rosters with validation and analysis
- **Compare players head-to-head** — Statistical matchups with normalized metrics
- **Run game simulations** — AI-driven probability models for team vs. team matchups
- **Get AI-powered insights** — Natural language analysis on players and matchups
- **Track live games** — Real-time scores, box scores, player performance
- **Analyze historical trends** — Performance analytics across seasons

The system is designed as a **cloud-native microservices architecture on AWS**, built iteratively from monolith MVP → distributed services → event-driven system → production Kubernetes.

---

## 2. 🎯 Product Goals

### Primary Goals
- ✅ Centralized NBA data platform
- ✅ High-performance stat queries (< 200ms)
- ✅ Real-time simulation engine (< 2s)
- ✅ AI-driven insights layer
- ✅ Scalable microservices backend

### Secondary Goals
- ✅ Portfolio-grade system design
- ✅ Production-ready AWS deployment
- ✅ Event-driven architecture (Kafka)
- ✅ Modular extensibility (future sports expansion)
- ✅ 99.9% uptime SLA (post-MVP)

---

## 3. 👥 User Roles

| Role | Description | Capabilities |
|---|---|---|
| **Guest** | Unauthenticated visitor | Browse players, teams, stats, read-only |
| **Registered User** | Logged-in user (email/Google) | Create custom teams, run simulations, save comparisons |
| **Power User** | User with premium features (future) | Advanced analytics, historical trend exports, API access |
| **Admin** | System administrator (future) | Manage data ingestion, monitor system health, user management |

---

## 4. ⚙️ System Architecture Summary

### Core Stack

#### **Frontend**
- React 19 + Vite
- TypeScript
- TanStack Query (React Query)
- Responsive UI (TBD: Tailwind/Material-UI)

#### **Backend (Phase 1: Monolith)**
- Node.js 18+ with TypeScript
- Express.js (REST API)
- Modular by domain (auth, players, teams, simulations, etc.)

#### **Database (Phase 1 → Phase 4)**
- **Phase 1-3:** Supabase (managed PostgreSQL)
- **Phase 4:** AWS RDS (PostgreSQL)

#### **Infrastructure Progression**

| Phase | Compute | Cache | Events | Deployment |
|---|---|---|---|---|
| **Phase 1** | Single Express server | None (PostgreSQL direct) | None (REST only) | Local dev / Vercel + Railway |
| **Phase 2** | 10 microservices (Docker) | None yet | None (REST only) | Docker Compose / Multiple servers |
| **Phase 3** | Microservices (Docker) | Redis (ElastiCache ready) | Kafka / Redpanda | Docker Compose + local Kafka |
| **Phase 4** | AWS EKS (Kubernetes) | AWS ElastiCache | AWS MSK (Kafka) | Production-grade cloud-native |

#### **CI/CD**
- GitHub Actions (lint, test, type-check)
- Docker containerization (Phase 2+)
- Amazon ECR (registry, Phase 4)
- Kubernetes deployments (Phase 4)

---

## 5. 🧱 Microservices Breakdown (Phase 2+)

### Phase 1: Single Monolith
All logic in `apps/api` with modular route structure:

```
apps/api/src/
├── routes/
│   ├── auth.ts
│   ├── players.ts
│   ├── teams.ts
│   ├── simulations.ts
│   ├── comparisons.ts
│   ├── games.ts
│   ├── analytics.ts
│   ├── users.ts
│   └── ingest.ts
├── services/          # Business logic (no DB direct)
├── db/queries/        # All database operations
└── types/             # Shared types
```

### Phase 2+: Distributed Services

Each service becomes a separate Docker container:

| Service | Responsibility | Core Operations |
|---|---|---|
| **🔐 Auth Service** | JWT validation, OAuth | Validate tokens, Google OAuth callback, session mgmt |
| **👤 User Service** | User profiles & preferences | Profiles, favorites, saved teams, preferences |
| **🏀 Player Service** | Player data & stats | Player profiles, seasonal stats, career stats, filtering, caching |
| **🧩 Team Service** | User-created teams | Roster CRUD, validation, salary cap (future) |
| **⚖️ Comparison Service** | Player comparisons | A vs B comparisons, stat normalization, similarity scoring |
| **🧪 Simulation Service** | Game simulations (core) | Team vs team sims, probabilistic modeling, score prediction |
| **📊 Analytics Service** | Advanced metrics | PER, TS%, BPM, efficiency calcs, trend analysis |
| **🤖 AI Insight Service** | LLM-powered insights | OpenAI integration, NBA context injection, natural language |
| **📅 Game Service** | Game schedules & scores | Schedules, live scores, box scores, historical games |
| **📡 Data Ingestion Service** | NBA API integration | Batch ingestion, normalization, Kafka event publishing |

---

## 6. 🗄️ Database Design (PostgreSQL / Supabase)

### Authentication Tables

```sql
-- Manages user identities (Supabase auth + custom JWT)
CREATE TABLE auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  google_id VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Optional: JWT token blacklist/refresh tracking
CREATE TABLE jwt_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id),
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Player & Stats Tables

```sql
CREATE TABLE nba_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(3) UNIQUE NOT NULL,
  conference VARCHAR(50),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  team_id UUID REFERENCES nba_teams(id),
  position VARCHAR(10),
  height VARCHAR(10),
  weight INT,
  nba_id INT UNIQUE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season INT NOT NULL,
  ppg FLOAT,
  rpg FLOAT,
  apg FLOAT,
  spg FLOAT,
  bpg FLOAT,
  fg_pct FLOAT,
  three_pct FLOAT,
  ft_pct FLOAT,
  ts_pct FLOAT,
  usage_rate FLOAT,
  bpm FLOAT,
  per FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, season)
);

CREATE INDEX idx_player_stats_player_season ON player_stats(player_id, season);
CREATE INDEX idx_player_stats_season ON player_stats(season);
```

### User Custom Teams

```sql
CREATE TABLE user_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  total_salary INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES user_teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  position VARCHAR(10),
  salary INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);
```

### Comparisons & Simulations

```sql
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id),
  player_a_id UUID NOT NULL REFERENCES players(id),
  player_b_id UUID NOT NULL REFERENCES players(id),
  result_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth_users(id),
  team_a_json JSONB NOT NULL,
  team_b_json JSONB NOT NULL,
  win_prob_a FLOAT,
  win_prob_b FLOAT,
  predicted_score_a INT,
  predicted_score_b INT,
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Games & Live Scores

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID NOT NULL REFERENCES nba_teams(id),
  away_team_id UUID NOT NULL REFERENCES nba_teams(id),
  game_date TIMESTAMP NOT NULL,
  status VARCHAR(50),
  home_score INT,
  away_score INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id),
  points INT,
  rebounds INT,
  assists INT,
  minutes FLOAT,
  plus_minus INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_game_stats_game ON game_stats(game_id);
```

---

## 7. 📡 Event-Driven Architecture (Kafka / MSK)

### Phase 3+ Events

| Event | Producer | Consumers | Trigger |
|---|---|---|---|
| `player.updated` | Ingest Service | Player Service, Analytics | New season stats ingested |
| `game.updated` | Ingest Service | Game Service, Analytics | Game completion |
| `stats.ingested` | Ingest Service | Analytics Service | NBA API sync |
| `simulation.requested` | Simulation Service | (logging/analytics) | User runs simulation |

### Example Event Flow

```
NBA Stats API
    ↓
Ingest Service
    ↓ (batch insert)
PostgreSQL players/stats
    ↓ (publish)
Kafka: player.updated
    ↓
├─ Player Service (invalidate cache)
├─ Analytics Service (recalculate PER/TS%)
└─ (future: ML pipeline for predictions)
```

---

## 8. ⚡ Data Flow Architecture

### Read Flow (High Performance)
```
Frontend
  ↓ HTTP
API Gateway / Service
  ↓
[Redis Cache] → HIT? Return
  ↓ MISS
PostgreSQL
  ↓ (populate cache)
Response
```

### Write Flow (Data Integrity)
```
Frontend
  ↓ HTTP POST/PUT
Service
  ↓
PostgreSQL (transaction)
  ↓ (on commit)
Kafka Event Published
  ↓
Downstream Services Updated
  ↓ (async)
Cache Invalidated
  ↓
Response to Frontend
```

---

## 9. ☁️ AWS Deployment Plan (Phase 4)

### Edge Layer
- **Route 53** — DNS routing
- **CloudFront** — CDN (static assets, API caching)
- **Application Load Balancer (ALB)** — Distribute traffic

### Compute
- **EKS** — Kubernetes cluster (5-10 nodes minimum)
- **Dockerized microservices** — Deployed as Kubernetes pods
- **Auto-scaling** — Horizontal pod autoscaler based on CPU/memory

### Data Layer
- **AWS RDS (PostgreSQL)** — Managed relational database
  - Multi-AZ for HA
  - Read replicas for scaling reads
  - Automated backups
- **ElastiCache (Redis)** — In-memory cache for performance
  - Multi-AZ cluster mode
  - TTL-based eviction

### Streaming
- **MSK (Managed Streaming for Kafka)** — Event bus
  - Multi-AZ brokers
  - Auto-scaling topics

### Storage
- **S3** — Asset storage, backups, logs

### Observability
- **CloudWatch** — Logs aggregation
- **Prometheus** — Metrics collection (via Node.js client)
- **Grafana** — Dashboards and alerting
- **X-Ray** — Distributed tracing across services

### CI/CD
- **GitHub Actions** — Build pipeline
- **Amazon ECR** — Docker image registry
- **ArgoCD** (future) — GitOps deployments to EKS

---

## 10. 🧪 Simulation Engine (Core Differentiator)

### Algorithm Overview

**Input:**
- Team A roster (5 players)
- Team B roster (5 players)

**Process:**
1. **Aggregate player vectors** — Combine player stats (PPG, RPG, APG, TS%, BPM, etc.)
2. **Normalize stats** — Per-game basis to account for playing time differences
3. **Calculate ratings**
   - Offensive Rating = Points per possession created by team
   - Defensive Rating = Points allowed per possession
4. **Apply probabilistic model** — Poisson distribution for score prediction, Bradley-Terry for win probability
5. **Run simulations** — Monte Carlo style (100-1000 iterations for confidence intervals)

**Output:**
- Win probability for Team A
- Win probability for Team B
- Predicted score (Team A)
- Predicted score (Team B)
- Confidence interval

### Performance Requirements
- **Runtime:** < 2 seconds per simulation
- **Accuracy:** Validated against historical game outcomes
- **Scalability:** Support 100+ concurrent simulations

---

## 11. 🚀 MVP Development Phases

### 🟢 Phase 1 — Monolith MVP (Weeks 1-4)
**Goal:** Working end-to-end platform

**Deliverables:**
- ✅ React frontend with player browsing, team builder, simulation UI
- ✅ Express.js monolith backend (all logic)
- ✅ Supabase PostgreSQL with all tables
- ✅ JWT + Google OAuth authentication
- ✅ Player stats ingestion from NBA API
- ✅ Simulation engine working
- ✅ Game schedule & live scores
- ✅ Basic analytics (PER, TS%, BPM calculations)
- ✅ Deployable to Vercel (FE) + Railway/Render (BE)

**Checkpoint Validation:**
- [ ] 500+ NBA players in database
- [ ] User can create custom team
- [ ] Simulation returns win probability < 2s
- [ ] GET /players returns < 200ms
- [ ] Auth flow end-to-end working

---

### 🟡 Phase 2 — Microservices Transition (Weeks 5-8)
**Goal:** Split monolith into independent services

**Deliverables:**
- ✅ 10 separate services (Auth, Player, Team, Compare, Sim, etc.)
- ✅ Docker containerization per service
- ✅ API Gateway for routing (Kong or Express Gateway)
- ✅ Docker Compose for local development
- ✅ Service-to-service communication (REST)
- ✅ Shared database or per-service schemas

**Checkpoint Validation:**
- [ ] Each service deploys independently
- [ ] Inter-service communication works
- [ ] All features still functional
- [ ] Response times maintained

---

### 🟠 Phase 3 — Event-Driven System (Weeks 9-12)
**Goal:** Async, scalable architecture

**Deliverables:**
- ✅ Kafka cluster (local or cloud)
- ✅ Event producers/consumers per service
- ✅ Redis caching layer (player stats, games, sims)
- ✅ Cache invalidation logic
- ✅ Async data ingestion pipeline
- ✅ Analytics service subscriptions

**Checkpoint Validation:**
- [ ] Events publishing and consuming correctly
- [ ] Cache hit rate > 80%
- [ ] System handles high data ingestion

---

### 🔴 Phase 4 — Full AWS Production (Weeks 13+)
**Goal:** Cloud-native, production-grade platform

**Deliverables:**
- ✅ EKS Kubernetes cluster
- ✅ AWS RDS PostgreSQL
- ✅ ElastiCache Redis
- ✅ MSK Kafka
- ✅ CloudFront CDN
- ✅ Application Load Balancer
- ✅ Auto-scaling configured
- ✅ Observability stack (CloudWatch, Prometheus, Grafana)
- ✅ CI/CD via GitHub Actions → ECR → EKS

**Checkpoint Validation:**
- [ ] 99.9% uptime SLA met
- [ ] API latency < 200ms at scale
- [ ] Horizontal scaling works
- [ ] Observability dashboards functional

---

## 12. 📈 Key Performance Requirements

| Metric | Target | Validation |
|---|---|---|
| **API Latency** | < 200ms (p95) | Load test with 100 concurrent users |
| **Simulation Time** | < 2s | Measure 1000 simulations |
| **Cache Hit Rate** | > 80% | Monitor Redis metrics |
| **Database Query Time** | < 100ms | Analyze slow query logs |
| **Uptime** | 99.9% | Post-MVP (Phase 4) |
| **Data Ingestion** | 500+ players / 30 mins | Measure ingest pipeline |
| **Concurrent Users** | 1000+ (Phase 4) | Load test and scale |

---

## 13. 🧠 Key Engineering Principles

### Architecture
- **Microservices are stateless** — No in-memory state, everything goes to DB
- **Supabase/RDS = source of truth** — Single source of authoritative data
- **Redis = performance layer only** — Cache, not permanent storage
- **Kafka = system backbone** — Event-driven communication (Phase 3+)

### Code Quality
- **Type-safe everywhere** — TypeScript end-to-end (FE + BE)
- **Modular by domain** — Organize code around business domains
- **API contracts first** — Define interfaces before implementation
- **Error handling** — Consistent HTTP response codes and error messages

### DevOps & Deployment
- **Immutable infrastructure** — Docker images, not manual deployments
- **Infrastructure as Code** — Terraform for AWS (Phase 4)
- **Automated testing** — Unit, integration, E2E tests in CI
- **Observability first** — Logs, metrics, traces from day 1

### Data & Performance
- **Database indexing** — Strategic indexes for high-query tables
- **Query optimization** — Profile and optimize slow queries
- **Caching strategy** — Identify bottlenecks, cache strategically
- **Horizontally scalable** — No tight coupling, can add instances

---

## 14. 🔐 Authentication & Authorization

### Flow: Google OAuth + Custom JWT

1. **User clicks "Sign in with Google"**
   - Frontend redirects to Supabase OAuth endpoint
   
2. **Supabase handles Google auth**
   - Returns `access_token` to frontend
   
3. **Frontend calls backend**
   - POST `/auth/google-callback` with Supabase token
   
4. **Backend validates & creates user**
   - Verify Supabase token
   - Create `auth_users` record if new
   - Generate **custom JWT** (7-day expiry)
   
5. **Frontend stores JWT locally**
   - All subsequent requests include JWT in `Authorization` header
   
6. **Backend validates JWT**
   - Auth middleware verifies signature
   - Extracts user_id for request context

### JWT Structure
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "iat": 1717680000,
  "exp": 1718284800
}
```

### Protected Routes
```
GET /players → Anyone (guest)
POST /teams → Authenticated only
GET /teams/:id → Owner or admin only (authorization check)
POST /simulations → Authenticated only
```

---

## 15. 🔥 Final Summary

You are building:

### **A real-time NBA data intelligence platform** with:
- ✅ Distributed microservices (Phase 2+)
- ✅ Event-driven architecture (Phase 3+)
- ✅ AI reasoning layer (GPT-powered insights)
- ✅ Cloud-native AWS deployment (Phase 4+)
- ✅ Production-grade observability
- ✅ Horizontal scalability

### **Starting with:**
- ✅ Monolith MVP (single Express service)
- ✅ Supabase managed PostgreSQL
- ✅ Custom JWT + Google OAuth
- ✅ REST API (clean service boundaries)
- ✅ 4-phase iterative development

### **Success Metrics:**
- ✅ MVP shipped in 4 weeks
- ✅ Microservices-ready in 8 weeks
- ✅ Event-driven in 12 weeks
- ✅ Production AWS in 16+ weeks

---

## 📚 Related Documents

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Detailed schema with indexes
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Service boundaries and API contracts (TBD)
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Phase 4 AWS deployment guide (TBD)
- [API_REFERENCE.md](./API_REFERENCE.md) — REST endpoint documentation (TBD)

---

## 🎯 Next Steps

**Checkpoint 1.1 — Foundation & Tooling**
- [ ] Supabase project created
- [ ] `apps/api` Express.js server running
- [ ] JWT + Google OAuth middleware scaffolded
- [ ] Database schema migrated to Supabase

**Then → Checkpoint 1.2 — Data Layer**
- [ ] NBA API integration for player data ingestion
- [ ] 500+ players loaded into database
- [ ] Basic player endpoints working

**Then → Checkpoint 1.3 — Core Features**
- [ ] Player browsing UI
- [ ] User team creation
- [ ] Team builder working

**Then → Checkpoint 1.4 — Simulation Engine**
- [ ] Probabilistic algorithm implemented
- [ ] Simulation API endpoint
- [ ] Simulation UI

---

**Built with ❤️ for the NBA and basketball analytics community.**
