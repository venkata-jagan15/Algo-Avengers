import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import API_BASE_URL from '../config';
import { toast } from 'sonner';

const statuses = ['completed', 'incomplete', 'failed', 'continuation'];

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await axios.get(`${API_BASE_URL}/projects`);
      setProjects(res.data);
    } catch (err) {
      setFetchError(err.message || String(err));
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesDept = !selectedDept || p.department === selectedDept;
      const matchesStatus = !selectedStatus || p.outcome === selectedStatus;

      const searchLower = query.toLowerCase();
      // Parse JSON strings for domain tags and tech stack if needed, but simple string includes works too since they are stringified
      const matchesSearch = !query || (
        (p.title || '').toLowerCase().includes(searchLower) ||
        (p.department || '').toLowerCase().includes(searchLower) ||
        (p.tech_stack || '').toLowerCase().includes(searchLower) ||
        (p.domain_tags || '').toLowerCase().includes(searchLower) ||
        (p.faculty_advisor || '').toLowerCase().includes(searchLower)
      );

      return matchesDept && matchesStatus && matchesSearch;
    });
  }, [projects, selectedDept, selectedStatus, query]);

  const hasFilters = selectedDept || selectedStatus;

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Browse Projects & Match Ideas
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explore past academic projects. Use natural language to search.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mt-8 space-y-4">
          <div className="flex overflow-hidden rounded-xl border bg-card shadow-card">
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, domain, tech stack, or department..."
                className="w-full bg-transparent py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground mr-4">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />

            {/* Department filters */}
            {['Computer Science', 'Mechanical', 'Electrical', 'Civil'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(selectedDept === dept ? null : dept)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${selectedDept === dept
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
              >
                {dept}
              </button>
            ))}

            <div className="h-5 w-px bg-border" />

            {/* Status filters */}
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${selectedStatus === status
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
              >
                {status}
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={() => { setSelectedDept(null); setSelectedStatus(null); }}
                className="ml-2 text-xs text-accent hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {filtered.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Showing {filtered.length} project{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-muted-foreground">No projects found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
