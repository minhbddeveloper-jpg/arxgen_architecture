# arxgen Roadmap

This roadmap tracks planned work by release line. It uses plain ASCII so the file stays readable across terminals and editors.

## v1.5.0 - Database Confidence

Goal: make TypeScript Express database-backed generation more trustworthy.

Status: completed in the codebase. PostgreSQL e2e is available through `npm run test:e2e:postgres` and requires Docker.

- Express Prisma PostgreSQL e2e
  - Generate Express project with Prisma
  - Generate PostgreSQL docker-compose
  - Run npm install
  - Run Prisma generate/migrate flow
  - Run npm build
  - Start generated server
  - Test POST `/students`
  - Test GET `/students`
  - Test PUT `/students/:id`
  - Test DELETE `/students/:id`
- SQL import e2e
  - Create sample `schema.sql`
  - Parse tables, fields, primary keys, and foreign keys
  - Generate entities from SQL
  - Generate Prisma schema from SQL
  - Generate CRUD from SQL entities
  - Run generated API test
- Generated README
  - Generate `README.md` per project
  - Add install, dev, build, database setup, migration, API examples, and environment variables sections
- Doctor command
  - Check Node.js version
  - Check npm version
  - Check output folder permission
  - Check package manager
  - Check Docker availability
  - Check database config
  - Print actionable fix suggestions

## v1.6.0 - NestJS Serious Mode

Goal: promote NestJS from scaffold to serious beta/stable candidate.

Status: completed in the codebase. Generated NestJS e2e is available through `npm run test:e2e:nestjs`.

- NestJS build test
  - Generate NestJS project
  - Run npm install
  - Run npm build
  - Verify generated project compiles
- NestJS CRUD
  - Generate module per entity
  - Generate controller
  - Generate service
  - Generate repository interface
  - Generate repository implementation
  - Generate DTO files
  - Generate class-validator rules
  - Generate Swagger decorators
- NestJS Prisma
  - Generate Prisma schema
  - Generate PrismaService
  - Generate repository using Prisma
  - Generate migration docs
  - Add Prisma setup to package.json
- NestJS add entity
  - Detect existing NestJS project
  - Add new module/controller/service/repository
  - Update app module
  - Update Prisma schema if enabled
  - Preserve existing code
- NestJS e2e
  - Start generated NestJS app
  - Test health endpoint
  - Test CRUD endpoints
  - Validate response format

## v1.7.0 - Schema Upgrade

Goal: move schema upgrade beyond additive-only changes.

Status: completed in the codebase. Schema upgrade now reports risky changes during dry-run and requires `--force` before applying additive parts of risky upgrades.

- Schema upgrade plan
  - Detect added tables and columns
  - Detect removed columns
  - Detect changed column types
  - Detect nullable changes
  - Detect default value changes
  - Print dry-run summary
- Relation detection
  - Detect many-to-one and one-to-many
  - Detect many-to-many join tables
  - Detect foreign key constraints
  - Generate relation metadata
- Safety warnings
  - Warn on dropped table/column
  - Warn on type changes
  - Warn on possible rename
  - Warn on destructive migrations
  - Require `--force` for risky changes
- SQL parser improvements
  - Support indexes and unique constraints
  - Support enum fields
  - Support decimal precision
  - Support varchar length
  - Support composite primary keys
  - Support `created_at` / `updated_at` conventions

## v1.8.0 - Core Refactor

Goal: split the generator into smaller feature modules.

Status: completed first-pass core refactor. CLI routing is split into command/parser/formatter modules, project detection is separated from project extension, and the generation pipeline now validates feature dependencies and capabilities.

- Split generator engine
  - Move ORM, auth, validation, Docker, OpenAPI, and relation generation into feature modules
  - Keep `GeneratorEngine` as orchestrator only
- Split project extender
  - Create project detector, route patcher, Prisma schema patcher, module patchers, package.json patcher, and schema upgrade patcher
- Feature pipeline
  - Define `FeatureGenerator` interface
  - Support feature ordering, only/skip, dependencies, and capability validation
- Template system
  - Move hard-coded templates out of generator
  - Add template renderer, variables, snapshot tests, and versioning

## v1.9.0 - Production Auth

Goal: replace auth scaffold with production-oriented generated auth.

Status: completed for TypeScript Express JWT generation. `--auth-mode production` generates JWT config, refresh-token hash storage and rotation, logout, RBAC metadata, and Prisma auth models.

- JWT production mode
  - Add `--auth-mode production`
  - Require `JWT_SECRET` in production
  - Generate auth config, middleware, and error handling
- User management
  - Generate users table/entity/repository
  - Generate register, login, and current user endpoints
- Password security
  - Use bcrypt or argon2
  - Hash password on register
  - Verify password on login
  - Never store plain password
- Refresh token
  - Generate refresh token storage
  - Store refresh token hash
  - Implement token rotation, revoke token, and logout
- RBAC
  - Generate roles, permissions, user_roles, and role_permissions tables
  - Generate roles and permissions guards

## v2.0.0 - Plugin SDK

Goal: stabilize external plugin APIs and multi-stack positioning.

Status: completed in the codebase. arxgen 2.0 loads local and npm plugins through `--plugin`, validates plugin API compatibility, exposes v2 metadata/capability/generation contracts, and includes plugin SDK contract, fixture, snapshot, and compatibility tests.

- Stable plugin API
  - Define plugin metadata, capabilities, and generation contracts
- External plugin support
  - Load local and npm plugins
  - Validate plugin compatibility
  - Show plugin errors clearly
  - Document plugin lifecycle
- Plugin docs
  - Create plugin development guide
  - Create example plugin
  - Document template variables, capability matrix, and testing requirements
- Plugin tests
  - Add contract tests
  - Add fixture-based tests
  - Add generated output snapshot tests
  - Add compatibility tests

## v2.1.0 - Plugin Ecosystem

Goal: make external plugins discoverable, installable, and easier to validate before use.

Status: planned.

- Plugin registry metadata
  - Define registry manifest format
  - Support plugin categories, tags, maintainers, and compatibility ranges
  - Add verified/community plugin status labels
  - Document security expectations for third-party plugins
- Plugin install workflow
  - Add `arxgen plugin add <package-or-url>`
  - Add `arxgen plugin remove <name>`
  - Add `arxgen plugin list`
  - Store local plugin config in a project-safe format
- Plugin validation
  - Add `arxgen plugin doctor`
  - Validate SDK version compatibility before generation
  - Validate declared capabilities against implemented hooks
  - Print actionable failures for missing metadata, bad hooks, and invalid generated files
- Plugin examples
  - Add a real template-based external plugin example
  - Add a plugin with CRUD hooks
  - Add a plugin with auth/ORM hooks
  - Add publishing checklist for npm plugin authors

## v2.2.0 - Generation Quality Gates

Goal: reduce hidden bugs by validating generated projects automatically and consistently.

Status: planned.

- Generated app validators
  - Add `arxgen validate <project>`
  - Detect generated stack, package manager, framework, ORM, and database mode
  - Run stack-specific install, typecheck, build, and smoke checks
  - Print concise pass/fail summaries with failing commands
- Snapshot strategy
  - Add fixture folders for common generated scenarios
  - Normalize snapshot output across operating systems
  - Separate public contract snapshots from internal implementation snapshots
  - Add snapshot update workflow documentation
- CLI quality gates
  - Add `--validate` option to run validation after create/add/upgrade
  - Add `--strict` option to fail on partial feature support
  - Add `--report json` for CI integrations
  - Preserve dry-run behavior without touching the filesystem
- CI expansion
  - Run generated app validators in CI
  - Add package install test from packed tarball
  - Add Windows CI coverage for CLI path handling
  - Keep Docker-backed tests isolated and optional for contributors

## v2.3.0 - Stack Promotion

Goal: move the strongest non-Express stacks toward stable support with real generated-app validation.

Status: planned.

- NestJS stable
  - Promote NestJS CRUD and Prisma from beta to stable
  - Add schema import coverage for common NestJS Prisma cases
  - Add generated auth baseline for NestJS
  - Add generated app validation to CI
- Python FastAPI beta
  - Add SQLAlchemy-backed repository generation
  - Add Pydantic request/response DTOs
  - Add generated app build/start/smoke test
  - Add `add entity` support
- Go Gin beta
  - Add GORM-backed repository generation
  - Add request validation layer
  - Add generated app build/start/smoke test
  - Add `add entity` support
- Stack support policy
  - Define promotion checklist in docs
  - Mark unsupported features clearly in CLI output
  - Add stack capability reports to `arxgen list plugins`
  - Keep experimental stacks available but explicit about risk

## Multi-Language Parity Plan

Goal: bring supported backend languages to the same practical confidence level as TypeScript Express.

Status: planned.

Parity means a stack is not only able to generate files. It must support the full day-two workflow: create, CRUD, database, validation, add entity, SQL import, schema upgrade, generated README, generated app validation, and clear production-readiness notes.

- Parity baseline
  - Generated project installs from a clean checkout
  - Generated project builds or passes the native compile/check command
  - Generated project starts successfully
  - Health endpoint responds
  - CRUD endpoints work through HTTP tests
  - Generated README contains install, dev, build, database, migration, validation, and API examples
  - `arxgen validate <project>` can verify the generated project
- Required feature set per backend stack
  - Clean Architecture folder layout
  - Entity/domain model generation
  - Repository interface and implementation
  - Create, list, get, update, and delete use cases or services
  - Controller/router/handler generation
  - Request DTOs and response DTOs
  - Validation layer
  - Pagination and filtering baseline
  - ORM/database artifacts
  - Docker and `.env.example`
  - OpenAPI or framework-native API docs where practical
  - Add entity support without breaking existing code
  - SQL import and additive schema upgrade support
- Wave 1 parity targets
  - TypeScript NestJS
  - Python FastAPI
  - Go Gin
  - These stacks should reach stable before expanding the same depth to every experimental stack.
- Wave 2 parity targets
  - Java Spring Boot
  - C# ASP.NET Core
  - Python Django
  - These stacks should reach beta after Wave 1 has stable validators and shared test fixtures.
- Wave 3 parity targets
  - PHP Laravel
  - Ruby Rails
  - Kotlin Ktor
  - These stacks should keep scaffold support until their native dependency/build flows are fully covered in CI.
- Shared parity infrastructure
  - Create stack adapter interface for install, build, start, test, and smoke commands
  - Create common CRUD e2e harness reusable across frameworks
  - Create shared SQL import fixtures
  - Create shared schema upgrade fixtures
  - Create generated README checklist tests
  - Create capability matrix generated from plugin metadata
- Native ORM mapping
  - TypeScript Express and NestJS: Prisma
  - Python FastAPI: SQLAlchemy
  - Python Django: Django ORM
  - Java Spring Boot: JPA
  - C# ASP.NET Core: EF Core
  - Go Gin: GORM
  - PHP Laravel: Eloquent
  - Ruby Rails: Active Record
  - Kotlin Ktor: Exposed or JetBrains-supported SQL stack after evaluation
- Promotion gates
  - Scaffold: files are generated consistently and snapshots exist
  - Beta: generated project installs, builds, starts, and CRUD smoke tests pass
  - Stable: database-backed CRUD, add entity, SQL import, schema upgrade, generated README, and CI validation all pass
  - Production-oriented: auth, observability, security baseline, Docker, env validation, and production-readiness docs exist
- Anti-regression rules
  - No stack can be promoted without generated app tests
  - No stack can claim ORM support without database-backed CRUD tests
  - No stack can claim schema upgrade support without before/after fixtures
  - No stack can claim production-oriented support without explicit security and deployment notes
  - Stack support labels must be generated from tested capabilities, not manually claimed

## v2.4.0 - Schema And Migration Workbench

Goal: make schema-first workflows safer for iterative application development.

Status: planned.

- Migration planner
  - Generate structured migration plans from SQL differences
  - Classify additive, destructive, rename-like, and manual changes
  - Export migration plan as markdown and JSON
  - Support approval checkpoints before writing changes
- Rename detection
  - Detect likely renamed tables
  - Detect likely renamed columns
  - Ask for explicit mapping through config
  - Avoid destructive rewrites without confirmation
- Multi-stack schema upgrade
  - Improve additive upgrade for NestJS, FastAPI, and Go Gin
  - Update DTOs, repositories, validators, and route registration consistently
  - Add rollback notes to generated migration docs
  - Add fixture tests for schema upgrades per promoted stack
- Database metadata
  - Preserve indexes, unique constraints, defaults, and nullable metadata
  - Support enum documentation in generated code
  - Improve relation metadata for composite keys
  - Document unsupported SQL features clearly

## v2.5.0 - Production Baselines

Goal: provide safer production-oriented defaults for generated services without pretending to replace review.

Status: planned.

- Security baseline
  - Generate secure headers middleware for supported HTTP stacks
  - Add rate limit scaffold
  - Add request size limits
  - Add environment validation for required secrets
- Observability baseline
  - Generate structured logging
  - Generate request correlation IDs
  - Add health, readiness, and liveness endpoints consistently
  - Add OpenAPI output for promoted backend stacks
- Auth expansion
  - Add production auth baseline for NestJS
  - Add optional OAuth/OIDC provider hooks
  - Add role and permission seed examples
  - Add auth smoke tests for generated apps
- Deployment readiness
  - Generate Dockerfiles with production build stages
  - Add Kubernetes manifest scaffold as optional output
  - Add environment-specific README sections
  - Add production readiness checklist per generated project

## v3.0.0 - Stable Generator Platform

Goal: make arxgen a stable platform with versioned contracts, predictable upgrades, and clearly supported stacks.

Status: planned.

- Stable public contracts
  - Freeze plugin SDK v3 with migration notes from v2
  - Publish generated project manifest schema
  - Version template variables and feature hooks
  - Document backward compatibility guarantees
- Project manifest
  - Generate `.arxgen/project.json`
  - Store stack, plugin, entity, relation, and feature metadata
  - Use manifest for add, upgrade, validate, and doctor commands
  - Support manifest migration between arxgen versions
- Command model cleanup
  - Standardize command groups for create, add, upgrade, validate, doctor, and plugin
  - Standardize `--dry-run`, `--force`, `--strict`, and `--report json`
  - Keep breaking CLI changes documented with migration examples
  - Add deprecation warnings before removals where possible
- Stable stack set
  - Declare stable support for TypeScript Express and NestJS
  - Promote at least one non-TypeScript backend stack to stable if quality gates pass
  - Keep experimental stacks behind explicit status labels
  - Publish support matrix with tested feature combinations
- Upgrade path
  - Add v2-to-v3 migration guide
  - Add compatibility tests for v2 plugin behavior
  - Add generated project migration fixtures
  - Publish final release checklist for 3.0.0

## Documentation And CI Quality

- Documentation
  - Keep README short
  - Add quick start, stack support matrix, production confidence note, and docs links
  - Add release notes for every version bump
- CI quality
  - Run typecheck, unit tests, snapshot tests, generated app e2e, and package publish dry-run
  - Test Node.js 20 and 22
  - Test Express basic, Express Prisma, NestJS basic, and SQL import
  - Block publish when typecheck, unit tests, or snapshot tests fail
