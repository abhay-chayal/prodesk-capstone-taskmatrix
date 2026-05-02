export interface FallbackRule {
  keywords: string[];
  subtasks: string[];
}

// A generic default if nothing matches
const defaultSubtasks = [
  "Define project requirements",
  "Create an execution plan",
  "Implement the core task",
  "Review and test the work",
  "Finalize and deploy/submit"
];

// Predefined rules mapping keywords to 5 actionable subtasks
const fallbackRules: FallbackRule[] = [
  // Authentication & Security
  {
    keywords: ["login", "auth", "register", "signup", "sign in", "authentication"],
    subtasks: ["Design auth UI", "Set up authentication provider", "Implement login/register logic", "Handle error states", "Test auth flows"]
  },
  {
    keywords: ["password", "reset password", "forgot password"],
    subtasks: ["Design reset password UI", "Implement token generation", "Create email template", "Build reset logic", "Test reset flow"]
  },
  {
    keywords: ["security", "audit", "vulnerability", "encryption"],
    subtasks: ["Review current security architecture", "Run vulnerability scanner", "Patch identified issues", "Implement encryption/hashing", "Verify security fixes"]
  },

  // Frontend / UI / UX
  {
    keywords: ["ui", "ux", "interface", "design", "mockup", "wireframe", "figma"],
    subtasks: ["Gather design requirements", "Create low-fidelity wireframes", "Design high-fidelity mockups", "Review with stakeholders", "Export design assets"]
  },
  {
    keywords: ["responsive", "mobile", "tablet", "media query"],
    subtasks: ["Audit current mobile layout", "Update CSS media queries", "Fix mobile navigation", "Test on actual devices", "Optimize touch targets"]
  },
  {
    keywords: ["accessibility", "a11y", "aria", "screen reader"],
    subtasks: ["Run accessibility audit", "Add ARIA labels", "Ensure keyboard navigation", "Fix color contrast issues", "Test with screen reader"]
  },
  {
    keywords: ["component", "react", "vue", "angular", "button", "modal", "navbar", "header", "footer", "sidebar", "card", "form", "table", "list"],
    subtasks: ["Define component props", "Create UI structure", "Add styling", "Implement interactivity", "Write component tests"]
  },
  {
    keywords: ["animation", "transition", "motion", "framer"],
    subtasks: ["Plan animation timing", "Write CSS/JS transitions", "Implement enter/exit states", "Optimize performance", "Test across browsers"]
  },

  // Backend & API
  {
    keywords: ["api", "endpoint", "rest", "graphql", "webhook"],
    subtasks: ["Define API contract/schema", "Set up route handler", "Implement business logic", "Add input validation", "Write integration tests"]
  },
  {
    keywords: ["backend", "server", "node", "express", "django", "spring"],
    subtasks: ["Initialize server project", "Set up middleware", "Define routing structure", "Connect to database", "Deploy server"]
  },
  {
    keywords: ["payment", "stripe", "checkout", "billing", "subscription"],
    subtasks: ["Set up payment provider keys", "Build checkout UI", "Implement backend webhook", "Handle success/failure states", "Test with dummy cards"]
  },
  {
    keywords: ["email", "sendgrid", "mailer", "notification"],
    subtasks: ["Select email provider", "Design email templates", "Implement sending logic", "Handle bounce/spam rules", "Test email delivery"]
  },

  // Database & State
  {
    keywords: ["database", "db", "sql", "postgres", "mongo", "firestore", "schema", "migration", "query"],
    subtasks: ["Design data schema", "Write migration script", "Implement database connection", "Write CRUD queries", "Optimize query performance"]
  },
  {
    keywords: ["cache", "redis", "memcached"],
    subtasks: ["Identify cacheable data", "Set up caching server", "Implement read-through cache", "Handle cache invalidation", "Monitor cache hit rate"]
  },
  {
    keywords: ["state", "redux", "zustand", "context"],
    subtasks: ["Define state interface", "Set up store/context", "Create actions/reducers", "Connect UI components", "Test state updates"]
  },

  // Testing & QA
  {
    keywords: ["test", "jest", "cypress", "unit test", "e2e", "qa", "bug", "fix", "issue"],
    subtasks: ["Identify edge cases", "Write test cases", "Execute tests locally", "Debug failing tests", "Integrate into CI/CD"]
  },

  // DevOps & Infrastructure
  {
    keywords: ["deploy", "vercel", "netlify", "aws", "heroku", "hosting", "production"],
    subtasks: ["Configure build settings", "Set environment variables", "Trigger production build", "Verify deployment", "Monitor error logs"]
  },
  {
    keywords: ["ci", "cd", "pipeline", "github actions", "docker"],
    subtasks: ["Write pipeline config file", "Set up testing step", "Configure deployment step", "Manage secrets", "Test pipeline execution"]
  },
  {
    keywords: ["analytics", "tracking", "google analytics", "mixpanel"],
    subtasks: ["Set up analytics account", "Install tracking script", "Define custom events", "Implement event triggers", "Verify data collection"]
  },

  // Marketing, Content & SEO
  {
    keywords: ["seo", "meta", "search engine", "sitemap"],
    subtasks: ["Conduct keyword research", "Update meta tags", "Optimize page speed", "Generate XML sitemap", "Submit to search consoles"]
  },
  {
    keywords: ["blog", "article", "post", "content", "copywriting"],
    subtasks: ["Research topic", "Draft outline", "Write content", "Add media/images", "Review and publish"]
  },
  {
    keywords: ["marketing", "campaign", "ads", "social media", "newsletter"],
    subtasks: ["Define campaign goals", "Identify target audience", "Create ad creatives", "Launch campaign", "Analyze performance metrics"]
  },

  // Planning & Strategy
  {
    keywords: ["plan", "strategy", "roadmap", "research", "architecture"],
    subtasks: ["Gather stakeholder requirements", "Conduct market research", "Define technical architecture", "Create project roadmap", "Present findings"]
  },
  
  // Specific App Features
  {
    keywords: ["search", "filter", "sort"],
    subtasks: ["Design search UI", "Implement debounce logic", "Build search query backend", "Handle empty states", "Optimize search speed"]
  },
  {
    keywords: ["upload", "file", "image", "s3", "storage", "avatar"],
    subtasks: ["Build file picker UI", "Implement client-side validation", "Set up cloud storage bucket", "Handle upload progress", "Secure upload endpoints"]
  },
  {
    keywords: ["dashboard", "chart", "graph", "analytics UI", "stats"],
    subtasks: ["Determine key metrics", "Select charting library", "Fetch data from API", "Render visual charts", "Ensure responsive layout"]
  },
  {
    keywords: ["shopping cart", "ecommerce", "cart", "basket"],
    subtasks: ["Create cart state store", "Build cart UI overlay", "Implement add/remove logic", "Calculate totals/taxes", "Connect to checkout flow"]
  },
  {
    keywords: ["profile", "user account", "settings"],
    subtasks: ["Design profile UI", "Fetch user data", "Build edit forms", "Handle data validation", "Save updates to database"]
  }
];

export function getFallbackSubtasks(title: string): string[] {
  const normalizedTitle = title.toLowerCase();

  // Try to find a matching rule
  for (const rule of fallbackRules) {
    // If any keyword is found within the title string
    if (rule.keywords.some(keyword => normalizedTitle.includes(keyword.toLowerCase()))) {
      return rule.subtasks;
    }
  }

  // If no keywords match, return generic subtasks
  return defaultSubtasks;
}
