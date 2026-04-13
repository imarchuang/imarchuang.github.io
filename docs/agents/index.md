---
name: observability-onboarding
description: Use when a user wants help onboarding a service to the observability platform, including logging, metrics, tracing, dashboards, alerts, and standard validation. Do not use for incident triage, postmortems, or one-off debugging unrelated to onboarding.
---

# Observability Onboarding

## Purpose

Help engineering teams onboard a service to the observability platform in a consistent, low-friction way.

The goal is to ensure the service has the minimum required observability coverage:
- service metadata and ownership
- logs
- metrics
- traces
- dashboards
- alerts
- validation after rollout

## When to use

Use this skill when the user asks things like:
- "Help me onboard this service to observability"
- "What do I need to set up for a new service?"
- "Can you guide me through logging / metrics / tracing setup?"
- "Can you review whether this service is observability-ready?"

Do not use this skill for:
- incident investigation
- alert noise reduction for an already mature service
- postmortem writing
- deep architectural review unrelated to observability onboarding

## Required inputs

Collect these if missing:
- service name
- environment(s): dev / staging / prod
- runtime / framework
- deployment platform
- owning team
- critical user journeys or key operations
- whether the service is synchronous, async, batch, or event-driven
- whether existing instrumentation already exists

## Desired end state

A service is considered onboarded when the following are true:

1. Service ownership is clear.
2. Logs are centralized and queryable.
3. Core golden signals or equivalent service health metrics are available.
4. Distributed tracing is enabled where applicable.
5. A basic service dashboard exists.
6. Minimum required alerts exist.
7. The team knows how to validate and use the observability setup.

## Workflow

### 1. Understand the service
Clarify:
- what the service does
- who owns it
- what the critical paths are
- what the main failure modes are
- what dependencies it calls
- whether it has inbound traffic, outbound calls, queue consumers, scheduled jobs, or batch workflows

### 2. Check current observability state
Determine what already exists:
- structured logging
- metrics exposure
- tracing instrumentation
- dashboards
- alerts
- runbook / ownership metadata

If the user has partial onboarding already, focus only on missing gaps.

### 3. Logging onboarding
Confirm:
- logs are being shipped to the central logging platform
- logs include service, environment, region, version, and severity
- logs are structured whenever possible
- request identifiers / trace identifiers are present where applicable
- high-volume noisy logs are identified early

Minimum expectations:
- startup / shutdown logs
- error logs
- dependency failure logs
- key business operation logs where appropriate

### 4. Metrics onboarding
Confirm the service exposes or emits metrics covering at least:
- request rate / throughput
- error rate
- latency
- saturation / resource signals where relevant

Also check for service-specific business or workflow metrics if they are important for correctness.

### 5. Tracing onboarding
Where tracing is applicable, confirm:
- inbound requests create or continue traces
- outbound calls propagate trace context
- spans cover critical dependencies
- key attributes are attached consistently
- sampling behavior is understood

If the service is async or event-driven, confirm trace propagation strategy across queues/topics.

### 6. Dashboard setup
Recommend at least one baseline dashboard containing:
- traffic / throughput
- error trends
- latency trends
- dependency health
- resource usage if relevant
- deployment / version context if available

If applicable, include breakdowns by:
- environment
- region
- endpoint / operation
- tenant / domain
- dependency

### 7. Alert setup
Define the minimum required alerts.

Typical starting points:
- sustained error-rate increase
- sustained latency degradation
- no traffic / stuck consumer / backlog growth for async services
- critical dependency failure
- missing telemetry if that indicates broken instrumentation

Do not recommend excessive alerting at onboarding time.
Prefer a small set of actionable alerts.

### 8. Validation
After setup, validate:
- logs are searchable
- metrics are arriving
- traces are visible end-to-end
- dashboards load correctly
- alerts can evaluate successfully
- ownership and escalation metadata are correct

Ask the team to verify using a known request, job, or event path.

### 9. Final handoff
Provide:
- what has been completed
- what remains
- any risks or gaps
- recommended next steps
- links or references if available

## Output format

Always structure the response as:

### Service Overview
- Service:
- Owner:
- Environment(s):
- Runtime / Platform:
- Critical paths:

### Current State
- Logs:
- Metrics:
- Traces:
- Dashboards:
- Alerts:

### Required Onboarding Actions
- Logging:
- Metrics:
- Tracing:
- Dashboards:
- Alerts:

### Validation Checklist
- Check 1
- Check 2
- Check 3

### Risks / Gaps
- Gap 1
- Gap 2

### Recommended Next Steps
- Step 1
- Step 2
- Step 3

## Rules

- Do not assume a service is fully onboarded just because some telemetry exists.
- Prefer minimum viable observability first, then iterate.
- Separate required items from nice-to-have improvements.
- Do not recommend alerts that are not actionable.
- When uncertain, ask for missing service context before prescribing instrumentation.
- For high-volume services, explicitly call out cardinality and cost risks.
- For logging, prefer structured logs and stable field names.
- For tracing, verify propagation, not just span creation.
- For dashboards, optimize for operational usefulness, not visual completeness.

## Heuristics

### For stateless APIs
Prioritize:
- request count
- error rate
- latency
- downstream dependency errors
- request tracing

### For async consumers / workers
Prioritize:
- consume rate
- processing latency
- failure / retry count
- backlog / lag
- poison message handling
- trace continuity where possible

### For scheduled jobs / batch workflows
Prioritize:
- run success/failure
- run duration
- freshness / completion timestamp
- item counts processed
- dependency failures

## Common pitfalls

Watch for:
- logs without service or environment labels
- missing correlation IDs
- metrics with unbounded cardinality
- traces created but not propagated downstream
- dashboards with no alertable signals
- alerts that mirror dashboards but are not operationally actionable
- missing ownership or escalation information

## Completion criteria

The onboarding can be considered complete when:
- telemetry is present and queryable
- the baseline dashboard exists
- minimum alerts are configured
- the team has validated a real service path
- ownership is clear
- remaining gaps, if any, are explicitly documented

