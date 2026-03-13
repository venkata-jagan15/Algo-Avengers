import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Users, GraduationCap, Wrench, AlertTriangle, Lightbulb, XCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const statusStyles = {
  Completed: 'bg-success text-success-foreground',
  'Partially Completed': 'bg-warning text-warning-foreground',
  Abandoned: 'bg-destructive text-destructive-foreground',
  'Proof of Concept Only': 'bg-info text-info-foreground',
};

const Section = ({ icon: Icon, title, items, color }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError('Project not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsSending(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/projects/${id}/chat`, {
        message: userMsg.content,
        history: chatHistory
      });
      setChatHistory((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      toast.error('Failed to get response from AI.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">{error || 'Project not found'}</p>
          <Link to="/browse" className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to browse
          </Link>
        </div>
      </div>
    );
  }

  // Parse JSON fields
  const parseJSON = (str) => {
    try {
      if (!str) return [];
      const parsed = typeof str === 'string' ? JSON.parse(str) : str;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const domainTags = parseJSON(project.domain_tags);
  const failedAttempts = parseJSON(project.failed_attempts);
  const deadEnds = parseJSON(project.dead_ends);
  const techStack = project.tech_stack ? project.tech_stack.split(',').map(s => s.trim()) : [];

  // Format failed attempts for display
  const formattedFailedAttempts = failedAttempts.map(fa =>
    `Tried: ${fa.tried} | Failed: ${fa.failed_because} | Lost: ${fa.weeks_lost} week(s)`
  );

  return (
    <div className="min-h-screen py-10 pb-24">
      <div className="container mx-auto max-w-4xl px-4">
        <Link to="/browse" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[project.outcome] || 'bg-secondary text-secondary-foreground'}`}>
                {project.outcome}
              </span>
              <span className="text-sm text-muted-foreground">{project.department}</span>
              {project.completion_percentage !== undefined && (
                <span className="text-sm font-bold text-accent">{project.completion_percentage}% Built</span>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{project.title}</h1>
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">Problem Statement</h4>
                <p className="text-lg leading-relaxed text-muted-foreground">{project.problem_statement}</p>
              </div>
              {project.our_approach && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">Our Approach</h4>
                  <p className="text-base text-muted-foreground">{project.our_approach}</p>
                </div>
              )}
              {project.what_was_delivered && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-1">Delivered</h4>
                  <p className="text-base text-muted-foreground">{project.what_was_delivered}</p>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground bg-card/50 p-4 rounded-xl border border-border">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Batch {project.batch_year}</span>
              {project.faculty_advisor && <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> {project.faculty_advisor}</span>}
              {project.team_members && <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {project.team_members}</span>}
            </div>

            {/* Tags & Tools */}
            <div className="mt-6 flex flex-wrap gap-2">
              {domainTags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            {techStack.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4" />
                {techStack.map(t => <Badge key={t} variant="outline" className="border-accent/30 text-accent bg-accent/5">{t}</Badge>)}
              </div>
            )}
          </div>

          {/* Knowledge Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            {project.wish_we_had_known && (
              <Section
                icon={Lightbulb}
                title="Wish We Had Known"
                items={[project.wish_we_had_known]}
                color="bg-accent/15 text-accent"
              />
            )}

            <Section
              icon={XCircle}
              title="Failed Approaches"
              items={formattedFailedAttempts}
              color="bg-destructive/15 text-destructive"
            />

            <Section
              icon={AlertTriangle}
              title="Dead Ends"
              items={deadEnds}
              color="bg-warning/15 text-warning"
            />

            {(project.whats_next || project.unsolved_problem) && (
              <Section
                icon={ArrowRight}
                title="Future Work & Unsolved"
                items={[
                  ...(project.whats_next ? [`Next Steps: ${project.whats_next}`] : []),
                  ...(project.unsolved_problem ? [`Unsolved: ${project.unsolved_problem}`] : []),
                  ...(project.open_for_continuation ? ["Open for Continuation"] : [])
                ]}
                color="bg-info/15 text-info"
              />
            )}
          </div>

          {(project.code_repo_link || project.report_link || project.demo_link) && (
            <div className="mt-8 p-6 bg-secondary/20 rounded-xl border border-border flex gap-4">
              {project.code_repo_link && <a href={project.code_repo_link} target="_blank" rel="noreferrer" className="text-accent hover:underline font-bold text-sm">Source Code ↗</a>}
              {project.report_link && <a href={project.report_link} target="_blank" rel="noreferrer" className="text-accent hover:underline font-bold text-sm">Report ↗</a>}
              {project.demo_link && <a href={project.demo_link} target="_blank" rel="noreferrer" className="text-accent hover:underline font-bold text-sm">Demo ↗</a>}
            </div>
          )}

          {/* Chat Interface */}
          <div className="mt-12 overflow-hidden rounded-2xl border bg-card shadow-lg">
            <div className="border-b bg-accent/5 p-4">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Sparkles className="h-5 w-5 text-accent" />
                Chat with Project AI
              </h3>
              <p className="text-xs text-muted-foreground">Ask anything about this project's implementation or findings.</p>
            </div>

            <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-muted/30">
              {chatHistory.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
                  <Sparkles className="h-10 w-10 mb-2" />
                  <p className="text-sm">How can I help you understand this project better?</p>
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border text-foreground'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-2xl px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2 bg-card">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 bg-muted/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 border"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className="bg-accent text-accent-foreground p-2 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail;
