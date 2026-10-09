/**
 * Lightweight Client-Side Router
 * Supports hash-based or path-based route matching for:
 * - / (Landing)
 * - /login
 * - /signup
 * - /dashboard
 * - /repositories
 * - /pull-requests
 * - /code-review
 * - /knowledge
 * - /settings
 * - /studio (Phase 1 Diagnostics & 12 Acceptance Tests)
 */

export type AppRoute =
  | '/'
  | '/login'
  | '/signup'
  | '/dashboard'
  | '/repositories'
  | '/pull-requests'
  | '/code-review'
  | '/knowledge'
  | '/settings'
  | '/studio';

export class NavigationService {
  private static parseCurrentRoute(): AppRoute {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash || hash === '/') return '/';
    if (hash.startsWith('/login')) return '/login';
    if (hash.startsWith('/signup')) return '/signup';
    if (hash.startsWith('/dashboard')) return '/dashboard';
    if (hash.startsWith('/repositories')) return '/repositories';
    if (hash.startsWith('/pull-requests')) return '/pull-requests';
    if (hash.startsWith('/code-review')) return '/code-review';
    if (hash.startsWith('/knowledge')) return '/knowledge';
    if (hash.startsWith('/settings')) return '/settings';
    if (hash.startsWith('/studio')) return '/studio';

    // Check pathname fallback
    const path = window.location.pathname;
    if (path === '/login') return '/login';
    if (path === '/signup') return '/signup';
    if (path === '/dashboard') return '/dashboard';
    if (path === '/repositories') return '/repositories';
    if (path === '/pull-requests') return '/pull-requests';
    if (path === '/code-review') return '/code-review';
    if (path === '/knowledge') return '/knowledge';
    if (path === '/settings') return '/settings';
    if (path === '/studio') return '/studio';

    return '/';
  }

  static getInitialRoute(): AppRoute {
    return this.parseCurrentRoute();
  }

  static navigate(route: AppRoute): void {
    window.location.hash = route;
  }
}
