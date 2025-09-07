export type ContributionBreakdown = {
  calendarTotal: number;
  commits: number;
  pullRequests: number;
  pullRequestReviews: number;
  issues: number;
  repositories: number;
  restricted: number;
};

export type ContributionSummary = {
  login: string;
  range: { from: string; to: string };
  totals: ContributionBreakdown;
};

type GraphQLError = {
  message: string;
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
};

type ContributionGraphQLResponse = {
  data?: {
    user: {
      login: string;
      contributionsCollection: {
        contributionCalendar: { totalContributions: number };
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalPullRequestReviewContributions: number;
        totalIssueContributions: number;
        totalRepositoryContributions: number;
        restrictedContributionsCount: number;
      };
    } | null;
  };
  errors?: GraphQLError[];
};

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql" as const;

function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "Missing GitHub token. Set GITHUB_TOKEN in environment."
    );
  }
  return token;
}

function assertIsoDateTime(value: string, label: string): void {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid ISO-8601 datetime string`);
  }
}

export async function fetchContributionSummary(params: {
  login: string;
  from: string;
  to: string;
}): Promise<ContributionSummary> {
  const { login, from, to } = params;

  if (!login || typeof login !== "string") {
    throw new Error("login is required");
  }
  assertIsoDateTime(from, "from");
  assertIsoDateTime(to, "to");

  const query = /* GraphQL */ `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        login
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar { totalContributions }
          totalCommitContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalIssueContributions
          totalRepositoryContributions
          restrictedContributionsCount
        }
      }
    }
  `;

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getGitHubToken()}`,
      Accept: "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ query, variables: { login, from, to } }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `GitHub API request failed with ${response.status}: ${text || response.statusText}`
    );
  }

  const payload = (await response.json()) as ContributionGraphQLResponse;

  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors.map((e) => e.message).join("; ");
    throw new Error(`GitHub GraphQL error: ${message}`);
  }

  const user = payload.data?.user;
  if (!user) {
    throw new Error("User not found or no data returned by GitHub API");
  }

  const c = user.contributionsCollection;

  return {
    login: user.login,
    range: { from, to },
    totals: {
      calendarTotal: c.contributionCalendar.totalContributions,
      commits: c.totalCommitContributions,
      pullRequests: c.totalPullRequestContributions,
      pullRequestReviews: c.totalPullRequestReviewContributions,
      issues: c.totalIssueContributions,
      repositories: c.totalRepositoryContributions,
      restricted: c.restrictedContributionsCount,
    },
  };
}


