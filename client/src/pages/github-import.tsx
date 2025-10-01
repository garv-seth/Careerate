import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, GitBranch, Star, Code, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  language?: string;
  topics: string[];
  stargazersCount: number;
  size: number;
  updatedAt: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
}

export default function GitHubImport() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  // Fetch repositories
  const { data, isLoading, error } = useQuery<{ repositories: Repository[] }>({
    queryKey: ['/api/integrations/github/repositories'],
    retry: false,
  });

  // Import repository mutation
  const importMutation = useMutation({
    mutationFn: async (repo: Repository) => {
      const response = await fetch('/api/integrations/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          repositoryId: repo.id,
          repositoryName: repo.fullName,
          repositoryUrl: repo.cloneUrl,
          defaultBranch: repo.defaultBranch
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import repository');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to the newly created project
      navigate(`/dashboard?imported=true&project=${data.project.id}`);
    }
  });

  const filteredRepos = data?.repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (error) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">GitHub Not Connected</h2>
            <p className="text-foreground/60 mb-4">
              Please connect your GitHub account to import repositories.
            </p>
            <Button onClick={() => window.location.href = '/api/integrations/github/oauth/initiate'}>
              Connect GitHub
            </Button>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Import from GitHub</h1>
          <p className="text-foreground/70">
            Select a repository to import and deploy with Careerate
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
            <Input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground/70">Loading repositories...</span>
          </div>
        )}

        {/* Repository List */}
        {!isLoading && (
          <div className="grid gap-4">
            {filteredRepos.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-foreground/60">
                  {searchQuery ? 'No repositories match your search' : 'No repositories found'}
                </p>
              </Card>
            ) : (
              filteredRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={repo.owner.avatarUrl}
                            alt={repo.owner.login}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h3 className="text-xl font-semibold">{repo.fullName}</h3>
                            <div className="flex items-center gap-4 text-sm text-foreground/60">
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <Code className="h-4 w-4" />
                                  {repo.language}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                {repo.stargazersCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitBranch className="h-4 w-4" />
                                {repo.defaultBranch}
                              </span>
                              {repo.isPrivate && (
                                <span className="bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded text-xs">
                                  Private
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {repo.description && (
                          <p className="text-foreground/70 mb-3">{repo.description}</p>
                        )}

                        {repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {repo.topics.slice(0, 5).map(topic => (
                              <span
                                key={topic}
                                className="bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-foreground/50">
                          Updated {new Date(repo.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <Button
                        onClick={() => importMutation.mutate(repo)}
                        disabled={importMutation.isPending && selectedRepo?.id === repo.id}
                        className="ml-4"
                      >
                        {importMutation.isPending && selectedRepo?.id === repo.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Import
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
