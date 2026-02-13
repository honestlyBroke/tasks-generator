/**
 * Template-based task & user story generator.
 * Generates contextual user stories, engineering tasks, and risks
 * based on project type + user inputs (goal, users, constraints).
 */

const TEMPLATES = {
  web: {
    label: 'Web App',
    userStories: [
      { story: 'As a {user}, I want to {goal} so that I can achieve my objective efficiently.', priority: 'high' },
      { story: 'As a {user}, I want a responsive interface that works on desktop and mobile browsers.', priority: 'high' },
      { story: 'As a {user}, I want to sign up and log in securely to access personalized features.', priority: 'high' },
      { story: 'As a {user}, I want clear navigation so I can find features without confusion.', priority: 'medium' },
      { story: 'As a {user}, I want to receive feedback (loading states, success/error messages) for every action I take.', priority: 'medium' },
      { story: 'As a {user}, I want my data to persist across sessions so I don\'t lose progress.', priority: 'medium' },
      { story: 'As an admin, I want a dashboard to monitor usage and manage user accounts.', priority: 'low' },
      { story: 'As a {user}, I want to export or share my results with others.', priority: 'low' },
    ],
    tasks: [
      { title: 'Set up project scaffolding (React/Next.js + build tooling)', group: 'Frontend', priority: 'high', description: 'Initialize the frontend project with chosen framework, configure linting, formatting, and dev server.' },
      { title: 'Design and implement core UI layout and navigation', group: 'Frontend', priority: 'high', description: 'Create the main app shell, header, sidebar/nav, and route structure.' },
      { title: 'Build the primary feature interface for: {goal}', group: 'Frontend', priority: 'high', description: 'Implement the main user-facing feature as described in the goal. Include form inputs, interactions, and result display.' },
      { title: 'Implement form validation and error handling', group: 'Frontend', priority: 'medium', description: 'Add client-side validation, error boundaries, and user-friendly error messages.' },
      { title: 'Add responsive design and cross-browser testing', group: 'Frontend', priority: 'medium', description: 'Ensure the app works on mobile, tablet, and desktop. Test on Chrome, Firefox, Safari.' },
      { title: 'Set up backend API with Node.js/Python', group: 'Backend', priority: 'high', description: 'Initialize the backend project, configure routing, middleware, and environment variables.' },
      { title: 'Design database schema and set up ORM/models', group: 'Backend', priority: 'high', description: 'Define data models for the core feature. Set up database connection and migrations.' },
      { title: 'Implement authentication (signup, login, sessions)', group: 'Backend', priority: 'high', description: 'Add user auth with hashed passwords, JWT or session tokens, and protected routes.' },
      { title: 'Build REST/GraphQL API endpoints for core feature', group: 'Backend', priority: 'high', description: 'Create CRUD endpoints that the frontend will consume for: {goal}' },
      { title: 'Add input sanitization and rate limiting', group: 'Backend', priority: 'medium', description: 'Prevent injection attacks, validate all inputs server-side, and add rate limits.' },
      { title: 'Write unit tests for core business logic', group: 'Testing', priority: 'medium', description: 'Test the main processing/logic functions with edge cases.' },
      { title: 'Write integration tests for API endpoints', group: 'Testing', priority: 'medium', description: 'Test API routes end-to-end with mock data.' },
      { title: 'Set up CI/CD pipeline', group: 'DevOps', priority: 'medium', description: 'Configure GitHub Actions or similar for automated testing and deployment.' },
      { title: 'Configure hosting and deployment (Vercel/Render/AWS)', group: 'DevOps', priority: 'high', description: 'Set up production hosting, environment variables, and domain.' },
      { title: 'Add logging, monitoring, and error tracking', group: 'DevOps', priority: 'low', description: 'Integrate error tracking (Sentry) and basic logging for production debugging.' },
    ],
    risks: [
      { risk: 'Cross-browser compatibility issues may cause layout or functionality bugs.', mitigation: 'Test on multiple browsers early. Use CSS resets and polyfills.' },
      { risk: 'Performance may degrade with large datasets or high traffic.', mitigation: 'Implement pagination, caching, and lazy loading from the start.' },
      { risk: 'Security vulnerabilities (XSS, CSRF, SQL injection).', mitigation: 'Use established frameworks with built-in protections. Follow OWASP guidelines.' },
    ],
  },

  mobile: {
    label: 'Mobile App',
    userStories: [
      { story: 'As a {user}, I want to {goal} on my phone so I can use it on the go.', priority: 'high' },
      { story: 'As a {user}, I want the app to load quickly even on slow connections.', priority: 'high' },
      { story: 'As a {user}, I want to receive push notifications for important updates.', priority: 'medium' },
      { story: 'As a {user}, I want the app to work offline and sync when back online.', priority: 'medium' },
      { story: 'As a {user}, I want touch-friendly gestures (swipe, pull-to-refresh) for natural interaction.', priority: 'medium' },
      { story: 'As a {user}, I want biometric login (fingerprint/face) for quick secure access.', priority: 'low' },
      { story: 'As a {user}, I want to access device features (camera, location, contacts) when needed.', priority: 'low' },
    ],
    tasks: [
      { title: 'Set up React Native / Flutter project', group: 'Frontend', priority: 'high', description: 'Initialize the mobile project with the chosen framework and configure the dev environment.' },
      { title: 'Design and implement core mobile UI for: {goal}', group: 'Frontend', priority: 'high', description: 'Build the primary screens and navigation flow for the main feature.' },
      { title: 'Implement bottom tab / stack navigation', group: 'Frontend', priority: 'high', description: 'Set up the app navigation structure with proper screen transitions.' },
      { title: 'Add offline storage and data sync', group: 'Frontend', priority: 'medium', description: 'Implement local storage (AsyncStorage/SQLite) with background sync to server.' },
      { title: 'Implement push notification support', group: 'Frontend', priority: 'medium', description: 'Set up FCM/APNS for push notifications, handle notification taps.' },
      { title: 'Optimize for performance (lazy loading, image caching)', group: 'Frontend', priority: 'medium', description: 'Add list virtualization, image caching, and minimize re-renders.' },
      { title: 'Set up backend API', group: 'Backend', priority: 'high', description: 'Build the REST API that the mobile app will consume.' },
      { title: 'Implement user authentication with token refresh', group: 'Backend', priority: 'high', description: 'Add auth flow optimized for mobile: token-based with secure refresh.' },
      { title: 'Build core API endpoints for: {goal}', group: 'Backend', priority: 'high', description: 'Create the API endpoints needed for the main mobile feature.' },
      { title: 'Write unit and integration tests', group: 'Testing', priority: 'medium', description: 'Test core business logic and API endpoints.' },
      { title: 'Set up device testing matrix (iOS + Android)', group: 'Testing', priority: 'medium', description: 'Test on multiple device sizes and OS versions.' },
      { title: 'Configure app store build and submission', group: 'DevOps', priority: 'high', description: 'Set up signing, build configs, and store listings for iOS/Android.' },
      { title: 'Set up OTA update mechanism', group: 'DevOps', priority: 'low', description: 'Configure CodePush or similar for over-the-air updates.' },
    ],
    risks: [
      { risk: 'Device fragmentation may cause inconsistent behavior across phones.', mitigation: 'Test on a range of devices. Use responsive layouts and feature detection.' },
      { risk: 'App store review process may delay launches.', mitigation: 'Follow guidelines strictly. Submit for review early and buffer time.' },
      { risk: 'Battery and data usage concerns from background processes.', mitigation: 'Optimize background tasks. Use efficient polling or WebSockets.' },
    ],
  },

  internal: {
    label: 'Internal Tool',
    userStories: [
      { story: 'As an internal {user}, I want to {goal} to improve team productivity.', priority: 'high' },
      { story: 'As an internal {user}, I want a simple interface that requires minimal training.', priority: 'high' },
      { story: 'As a manager, I want to view reports and metrics on tool usage.', priority: 'medium' },
      { story: 'As an internal {user}, I want role-based access so I only see what\'s relevant to me.', priority: 'medium' },
      { story: 'As an internal {user}, I want to import/export data in common formats (CSV, Excel).', priority: 'medium' },
      { story: 'As an admin, I want audit logs of all actions for compliance.', priority: 'low' },
      { story: 'As an internal {user}, I want SSO login with our company accounts.', priority: 'low' },
    ],
    tasks: [
      { title: 'Set up internal tool framework (React Admin / Retool / custom)', group: 'Frontend', priority: 'high', description: 'Choose and initialize the framework for the internal tool UI.' },
      { title: 'Build the main operational interface for: {goal}', group: 'Frontend', priority: 'high', description: 'Create the primary CRUD interface for the tool\'s core function.' },
      { title: 'Add data tables with sorting, filtering, and pagination', group: 'Frontend', priority: 'high', description: 'Implement a data grid component for viewing and managing records.' },
      { title: 'Build import/export functionality (CSV, Excel)', group: 'Frontend', priority: 'medium', description: 'Add buttons to upload CSV/Excel and download data in those formats.' },
      { title: 'Implement role-based UI (show/hide features per role)', group: 'Frontend', priority: 'medium', description: 'Conditionally render UI elements based on user permissions.' },
      { title: 'Set up backend with SSO/LDAP integration', group: 'Backend', priority: 'high', description: 'Configure the backend with company SSO for authentication.' },
      { title: 'Build CRUD API for core data models', group: 'Backend', priority: 'high', description: 'Create endpoints for creating, reading, updating, and deleting core records.' },
      { title: 'Implement role-based access control (RBAC)', group: 'Backend', priority: 'medium', description: 'Add middleware to enforce permissions per role on each endpoint.' },
      { title: 'Add audit logging for all write operations', group: 'Backend', priority: 'medium', description: 'Log who did what and when for compliance and debugging.' },
      { title: 'Write tests for access control and business logic', group: 'Testing', priority: 'medium', description: 'Ensure RBAC works correctly and core logic handles edge cases.' },
      { title: 'Deploy to internal infrastructure', group: 'DevOps', priority: 'high', description: 'Deploy behind VPN or internal network. Configure access restrictions.' },
      { title: 'Write user documentation and onboarding guide', group: 'Documentation', priority: 'medium', description: 'Create a quick-start guide for team members using the tool.' },
    ],
    risks: [
      { risk: 'User adoption may be low if the tool is too complex.', mitigation: 'Keep the UI simple. Get feedback from 2-3 users during development.' },
      { risk: 'Data privacy concerns with internal sensitive data.', mitigation: 'Implement proper access controls and encryption at rest.' },
      { risk: 'Integration with existing internal systems may be complex.', mitigation: 'Map out integrations early. Use standard APIs and formats.' },
    ],
  },

  api: {
    label: 'API Service',
    userStories: [
      { story: 'As a developer, I want to {goal} via a clean REST API with good documentation.', priority: 'high' },
      { story: 'As a developer, I want consistent JSON responses with proper HTTP status codes.', priority: 'high' },
      { story: 'As a developer, I want API key authentication so I can securely integrate.', priority: 'high' },
      { story: 'As a developer, I want rate limiting info in response headers so I can manage my usage.', priority: 'medium' },
      { story: 'As a developer, I want versioned endpoints (v1, v2) so breaking changes don\'t affect me.', priority: 'medium' },
      { story: 'As a developer, I want webhook support to get notified of async events.', priority: 'low' },
      { story: 'As a developer, I want SDK/client libraries in popular languages.', priority: 'low' },
    ],
    tasks: [
      { title: 'Design API schema and endpoint structure', group: 'Backend', priority: 'high', description: 'Define the REST resources, routes, request/response shapes, and versioning strategy.' },
      { title: 'Set up API framework (Express/FastAPI/Django REST)', group: 'Backend', priority: 'high', description: 'Initialize the project with the chosen framework and configure middleware.' },
      { title: 'Implement core endpoints for: {goal}', group: 'Backend', priority: 'high', description: 'Build the primary API endpoints that deliver the core value.' },
      { title: 'Add API key authentication and management', group: 'Backend', priority: 'high', description: 'Implement API key generation, validation, and revocation.' },
      { title: 'Add request validation and error formatting', group: 'Backend', priority: 'high', description: 'Validate all inputs with clear error messages. Use consistent error response format.' },
      { title: 'Implement rate limiting with headers', group: 'Backend', priority: 'medium', description: 'Add per-key rate limits. Return X-RateLimit headers in responses.' },
      { title: 'Add API versioning (URL or header-based)', group: 'Backend', priority: 'medium', description: 'Set up versioning so future breaking changes are manageable.' },
      { title: 'Set up database and data models', group: 'Backend', priority: 'high', description: 'Design and implement the database schema for the API\'s data.' },
      { title: 'Write comprehensive API tests', group: 'Testing', priority: 'high', description: 'Test every endpoint with valid, invalid, and edge-case inputs.' },
      { title: 'Load test the API', group: 'Testing', priority: 'medium', description: 'Run load tests to establish baseline performance and find bottlenecks.' },
      { title: 'Generate OpenAPI/Swagger documentation', group: 'Documentation', priority: 'high', description: 'Auto-generate API docs from code. Host an interactive doc page.' },
      { title: 'Write integration guides and examples', group: 'Documentation', priority: 'medium', description: 'Create example requests in curl, Python, and JavaScript.' },
      { title: 'Set up CI/CD and production deployment', group: 'DevOps', priority: 'high', description: 'Configure automated testing, staging, and production deploy pipeline.' },
      { title: 'Add logging, metrics, and alerting', group: 'DevOps', priority: 'medium', description: 'Track request counts, latency, and errors. Set up alerts for anomalies.' },
    ],
    risks: [
      { risk: 'Breaking changes may disrupt existing integrations.', mitigation: 'Use API versioning from day one. Communicate changes via changelog.' },
      { risk: 'Abuse or unexpected traffic spikes.', mitigation: 'Implement rate limiting, API key quotas, and auto-scaling.' },
      { risk: 'Poor documentation leads to support burden.', mitigation: 'Generate docs from code. Include runnable examples.' },
    ],
  },
};

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function interpolate(text, vars) {
  return text
    .replace(/\{goal\}/g, vars.goal || 'achieve the project objective')
    .replace(/\{user\}/g, vars.users || 'user');
}

/**
 * Generate a full spec from form inputs.
 */
export function generateSpec({ goal, users, constraints, template }) {
  const tmpl = TEMPLATES[template];
  if (!tmpl) throw new Error(`Unknown template: ${template}`);

  idCounter = 0;
  const vars = { goal, users };

  const userStories = tmpl.userStories.map((us) => ({
    id: nextId('us'),
    story: interpolate(us.story, vars),
    priority: us.priority,
  }));

  const tasks = tmpl.tasks.map((t) => ({
    id: nextId('t'),
    title: interpolate(t.title, vars),
    group: t.group,
    priority: t.priority,
    description: interpolate(t.description, vars),
  }));

  const risks = tmpl.risks.map((r) => ({
    id: nextId('r'),
    risk: interpolate(r.risk, vars),
    mitigation: interpolate(r.mitigation, vars),
  }));

  // Append constraint-aware tasks if constraints are provided
  if (constraints && constraints.trim()) {
    tasks.push({
      id: nextId('t'),
      title: 'Address project constraints and limitations',
      group: 'Planning',
      priority: 'high',
      description: `Review and plan for the following constraints: ${constraints}`,
    });
  }

  return {
    title: `${tmpl.label} Spec: ${goal}`,
    templateType: template,
    templateLabel: tmpl.label,
    goal,
    users,
    constraints,
    userStories,
    tasks,
    risks,
    createdAt: Date.now(),
  };
}

export function getTemplateOptions() {
  return Object.entries(TEMPLATES).map(([id, t]) => ({ id, label: t.label }));
}

/**
 * Export a spec as Markdown.
 */
export function specToMarkdown(spec) {
  const lines = [];
  lines.push(`# ${spec.title}`);
  lines.push('');
  lines.push(`**Type:** ${spec.templateLabel}`);
  lines.push(`**Goal:** ${spec.goal}`);
  lines.push(`**Target Users:** ${spec.users}`);
  if (spec.constraints) {
    lines.push(`**Constraints:** ${spec.constraints}`);
  }
  lines.push('');

  lines.push('## User Stories');
  lines.push('');
  for (const us of spec.userStories) {
    const badge = us.priority === 'high' ? '🔴' : us.priority === 'medium' ? '🟡' : '🟢';
    lines.push(`- ${badge} ${us.story}`);
  }
  lines.push('');

  // Group tasks
  const groups = {};
  for (const t of spec.tasks) {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  }

  lines.push('## Engineering Tasks');
  lines.push('');
  for (const [group, tasks] of Object.entries(groups)) {
    lines.push(`### ${group}`);
    lines.push('');
    for (const t of tasks) {
      const badge = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
      lines.push(`- ${badge} **${t.title}**`);
      if (t.description) {
        lines.push(`  ${t.description}`);
      }
    }
    lines.push('');
  }

  if (spec.risks && spec.risks.length > 0) {
    lines.push('## Risks & Unknowns');
    lines.push('');
    for (const r of spec.risks) {
      lines.push(`- **Risk:** ${r.risk}`);
      lines.push(`  **Mitigation:** ${r.mitigation}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
