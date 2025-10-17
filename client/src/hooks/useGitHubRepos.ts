import { useState, useEffect } from 'react';

export interface GitHubRepo {
  id: string;
  name: string;
  fullName?: string;
  private?: boolean;
  default_branch?: string;
}

export function useGitHubRepos() {
  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/integrations/github/repositories', { credentials: 'include' })
      .then(async r => {
        if (!r.ok) {
          if (r.status === 404) {
            setRepos([]);
            return null;
          }
          throw new Error((await r.json()).message || 'Failed to load repos');
        }
        return r.json();
      })
      .then(data => {
        if (data) setRepos(Array.isArray(data) ? data : (data.repositories || []));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { repos, loading, error };
}
