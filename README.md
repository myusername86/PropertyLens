# ARV SaaS — AI Real Estate Investment Intelligence Platform

Multi-tenant SaaS for real estate investors: AI-powered deal analysis (ARV, ROI,
risk scoring), pipeline management, Stripe subscriptions, and Zapier automation.

**Stack:** ASP.NET Core (.NET 9) · Clean Architecture · EF Core + PostgreSQL ·
React + TypeScript · Microsoft Entra External ID · Stripe · Azure

## Architecture

```
src/
  ArvSaas.Domain          Entities, enums, value objects, business rules (no dependencies)
  ArvSaas.Application     CQRS features (MediatR), validation, interfaces
  ArvSaas.Infrastructure  EF Core + PostgreSQL, tenancy, external services
  ArvSaas.Api             Controllers, auth, rate limiting, Serilog, Swagger
```

Dependency rule: Api → Infrastructure → Application → Domain. The Domain
project references nothing.

### Key design decisions

| Decision | Choice | Why |
|---|---|---|
| Multi-tenancy | Shared DB, `TenantId` + EF **global query filters** | Cost-efficient on Azure free tier; isolation enforced centrally in `AppDbContext`, impossible to forget per-query |
| Tenant resolution | JWT claim (`extension_TenantId`) via `ITenantProvider` | Stateless, works behind any load balancer |
| Business logic | Rich domain model (`Deal.RunAnalysis()`, guarded stage transitions) | This is what makes it *not* a CRUD app — the API exposes behaviors, not table rows |
| Deployment shape | Modular monolith | One App Service, one pipeline; layers keep it maintainable |
| Risk scoring | Deterministic baseline + optional AI enrichment | Product works even if OpenAI is down or the tenant is on Free plan |
| Feature gating | On the `Tenant` domain entity | Plan limits enforced server-side in one place |

## Local development

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Create the initial migration + database
dotnet tool install --global dotnet-ef
dotnet ef migrations add Initial -p src/ArvSaas.Infrastructure -s src/ArvSaas.Api
dotnet ef database update -p src/ArvSaas.Infrastructure -s src/ArvSaas.Api

# 3. Run the API
dotnet run --project src/ArvSaas.Api
# Swagger: http://localhost:5000/swagger   Health: /health
```

Fill in `AzureAd` values in `appsettings.json` from your Entra External ID
tenant (create a *new* app registration for this project — do not reuse the
SnapReceipt one).

## Roadmap

- [x] **Phase 1** — Clean Architecture skeleton, multi-tenant EF Core, ARV/ROI/risk engine, deal pipeline API, Docker, CI
- [ ] **Phase 2** — React + TS dashboard (Vite, MUI, React Query, Zustand): pipeline board, deal analyzer form, ROI charts (Recharts)
- [ ] **Phase 3** — Stripe: Checkout for Pro/Enterprise, customer portal, webhook endpoint syncing `Tenant.Plan`/`SubscriptionStatus`
- [ ] **Phase 4** — OpenAI recommendation service behind `IAiAnalysisService`, Zapier outbound webhooks (deal approved, high-ROI alert), Hangfire weekly report job
- [ ] **Phase 5** — Azure: App Service (container) + Static Web Apps + Azure PostgreSQL Flexible Server (B1ms), Key Vault secrets, Application Insights, GitHub Actions deploy job
- [ ] **Phase 6** — PDF reports (QuestPDF), shareable deal links, audit logging, integration tests (Testcontainers)

## Multi-tenancy: how isolation works

1. User signs in via Entra External ID → JWT contains `extension_TenantId`.
2. `HttpTenantProvider` reads the claim per request.
3. `AppDbContext` applies a global query filter: every query on tenant-owned
   entities is automatically scoped — handlers never mention `TenantId`.
4. `SaveChangesAsync` stamps `TenantId` on inserts as a safety net.

To verify: create two users in different tenants, create deals as each,
confirm `GET /api/deals` never returns the other tenant's rows.
