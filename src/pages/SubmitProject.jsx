import { useState, useRef } from 'react';
import { Plus, X, Send, Sparkles, Files, UploadCloud, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';

// Component for handling dynamic lists of dictionaries (e.g., Failed Attempts)
const FailedAttemptsList = ({ items, onChange }) => {
  const [tried, setTried] = useState('');
  const [failedBecause, setFailedBecause] = useState('');
  const [weeksLost, setWeeksLost] = useState('');

  const add = () => {
    if (tried.trim() && failedBecause.trim()) {
      onChange([...items, { tried, failed_because: failedBecause, weeks_lost: parseInt(weeksLost) || 0 }]);
      setTried('');
      setFailedBecause('');
      setWeeksLost('');
    } else {
      toast.error("Please fill in what you tried and why it failed.");
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full -mr-16 -mt-16" />
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-destructive mb-4">What We Tried That Did Not Work</h3>

        {items.length > 0 && (
          <div className="space-y-3 mb-6">
            {items.map((item, i) => (
              <div key={i} className="bg-background/80 glass p-4 rounded-lg text-sm relative group border border-destructive/10">
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                  className="absolute top-2 right-2 p-1.5 bg-destructive/10 text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-bold text-muted-foreground uppercase text-xs">Tried:</span>
                  <span className="text-foreground">{item.tried}</span>
                  <span className="font-bold text-muted-foreground uppercase text-xs">Failed:</span>
                  <span className="text-foreground">{item.failed_because}</span>
                  <span className="font-bold text-muted-foreground uppercase text-xs">Weeks Lost:</span>
                  <span className="text-foreground">{item.weeks_lost}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 bg-background/50 glass p-4 rounded-lg">
          <div className="grid gap-3">
            <Input
              placeholder="What we tried (e.g. OpenCV on Raspberry Pi)"
              value={tried} onChange={(e) => setTried(e.target.value)}
              className="bg-background/80"
            />
            <Textarea
              placeholder="Why it failed (e.g. Dropped to 2 FPS...)"
              value={failedBecause} onChange={(e) => setFailedBecause(e.target.value)}
              className="bg-background/80 resize-none h-20"
            />
            <div className="flex gap-3">
              <Input
                type="number" min="0" placeholder="Weeks lost"
                value={weeksLost} onChange={(e) => setWeeksLost(e.target.value)}
                className="bg-background/80 w-32"
              />
              <button
                type="button"
                onClick={add}
                className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Attempt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple list input for arrays of strings
const ListInput = ({ label, items, onChange, placeholder, isDestructive = false }) => {
  const [input, setInput] = useState('');

  const add = () => {
    if (input.trim()) {
      onChange([...items, input.trim()]);
      setInput('');
    }
  };

  const themeClass = isDestructive ? "text-destructive border-destructive/20 bg-destructive/5" : "text-primary border-primary/20 bg-primary/10";
  const hoverClass = isDestructive ? "hover:bg-destructive/20" : "hover:bg-primary/20";

  return (
    <div className="space-y-3">
      <Label className="block text-sm font-bold tracking-tight text-foreground uppercase">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder || `Add a ${label.toLowerCase().replace(/s$/, '')}...`}
          className="bg-background/50 glass border-border/50 h-10"
        />
        <button
          onClick={add}
          type="button"
          className="h-10 px-4 flex items-center justify-center rounded-lg border border-border/50 bg-secondary/50 hover:bg-accent hover:text-accent-foreground transition-all shrink-0 font-bold text-sm"
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold glass animate-in fade-in zoom-in duration-300 ${themeClass}`}>
              {item}
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className={`p-0.5 rounded-full transition-colors ${hoverClass}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const SubmitProject = () => {
  const fileInputRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // S1: Basic Info
  const [title, setTitle] = useState('');
  const [batchYear, setBatchYear] = useState('2024');
  const [department, setDepartment] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [techStack, setTechStack] = useState('');
  const [domainTags, setDomainTags] = useState([]);

  // S2: What Was Built
  const [problemStatement, setProblemStatement] = useState('');
  const [ourApproach, setOurApproach] = useState('');
  const [outcome, setOutcome] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState([100]);
  const [delivered, setDelivered] = useState('');

  // S3: What Was Learned
  const [failedAttempts, setFailedAttempts] = useState([]);
  const [deadEnds, setDeadEnds] = useState([]);
  const [wishWeHadKnown, setWishWeHadKnown] = useState('');

  // S4: What Comes Next
  const [whatsNext, setWhatsNext] = useState('');
  const [unsolvedProblem, setUnsolvedProblem] = useState('');
  const [openForContinuation, setOpenForContinuation] = useState(false);
  const [repoLink, setRepoLink] = useState('');
  const [reportLink, setReportLink] = useState('');
  const [demoLink, setDemoLink] = useState('');

  // S5: Relationships
  const [inspiredBy, setInspiredBy] = useState('');
  const [continuedFrom, setContinuedFrom] = useState('');

  const handleAIAnalyze = async (e) => {
    const files = Array.from(e.target.files || []);
    
    // If no files from input, check if we're triggered by button but have existing selectedFiles
    const filesToProcess = files.length > 0 ? files : selectedFiles;

    if (filesToProcess.length === 0 && !draftText) {
      toast.error("Please upload file(s) or paste draft text to analyze.");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    filesToProcess.forEach(file => {
      formData.append('files', file);
    });
    formData.append('draft_text', draftText);

    try {
      toast.info("Extracting insights... this may take 15-30 seconds.");
      const response = await axios.post('http://localhost:8000/analyze-submission', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response.data;

      // Auto-fill states
      if (data.title) setTitle(data.title);
      if (data.batch_year) setBatchYear(data.batch_year.toString());
      if (data.department) setDepartment(data.department);
      if (data.problem_statement) setProblemStatement(data.problem_statement);
      if (data.our_approach) setOurApproach(data.our_approach);

      const validOutcomes = ["Completed", "Partially Completed", "Abandoned", "Proof of Concept Only"];
      if (data.outcome && validOutcomes.includes(data.outcome)) setOutcome(data.outcome);

      if (data.completion_percentage !== undefined) setCompletionPercentage([data.completion_percentage]);
      if (data.what_was_delivered) setDelivered(data.what_was_delivered);
      if (data.wish_we_had_known) setWishWeHadKnown(data.wish_we_had_known);
      if (data.whats_next) setWhatsNext(data.whats_next);
      if (data.unsolved_problem) setUnsolvedProblem(data.unsolved_problem);
      if (data.tech_stack) setTechStack(data.tech_stack);
      if (data.team_members) setTeamMembers(data.team_members);
      if (data.faculty_advisor) setAdvisor(data.faculty_advisor);

      if (data.code_repo_link) setRepoLink(data.code_repo_link);
      if (data.report_link) setReportLink(data.report_link);
      if (data.demo_link) setDemoLink(data.demo_link);

      if (data.open_for_continuation === true || data.open_for_continuation === "true") setOpenForContinuation(true);

      if (Array.isArray(data.domain_tags)) setDomainTags(data.domain_tags);
      if (Array.isArray(data.dead_ends)) setDeadEnds(data.dead_ends);
      if (Array.isArray(data.failed_attempts)) setFailedAttempts(data.failed_attempts);

      toast.success("AI Successfully extracted report layout!");
    } catch (err) {
      toast.error("Analysis failed. " + (err.response?.data?.detail || err.message));
    } finally {
      setIsAnalyzing(false);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !department || !problemStatement || !techStack || !outcome) {
      toast.error('Please fill in all required (*) fields.');
      return;
    }

    try {
      await axios.post('http://localhost:8000/projects', {
        title,
        batch_year: parseInt(batchYear) || 2024,
        department,
        team_members: teamMembers,
        faculty_advisor: advisor,
        tech_stack: techStack,
        domain_tags: JSON.stringify(domainTags),

        problem_statement: problemStatement,
        our_approach: ourApproach,
        outcome: outcome,
        completion_percentage: completionPercentage[0],
        what_was_delivered: delivered,

        failed_attempts: JSON.stringify(failedAttempts),
        dead_ends: JSON.stringify(deadEnds),
        wish_we_had_known: wishWeHadKnown,

        whats_next: whatsNext,
        unsolved_problem: unsolvedProblem,
        open_for_continuation: openForContinuation,

        code_repo_link: repoLink,
        report_link: reportLink,
        demo_link: demoLink
      });
      toast.success('Project report archived perfectly into the Knowledge Graph!');
      // Reset major fields
      setTitle(''); setProblemStatement(''); setFailedAttempts([]); setDeadEnds([]);
    } catch (err) {
      toast.error('Failed to submit project: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen py-16 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 pb-20">
        <div data-aos="fade-up" className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider mb-4 glass">
            <Files className="w-3 h-3 text-accent" />
            <span>Institutional Knowledge</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            Archive a <span className="text-gradient-accent">Project</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Record what you built and what you learned so future students don't make the same mistakes.
          </p>
        </div>

        {/* AI AUTO-FILL STUDIO */}
        <div data-aos="fade-up" className="mb-12 rounded-3xl border border-accent/30 bg-accent/5 p-8 glass relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">AI Auto-Fill Studio</h2>
              <p className="text-muted-foreground">Upload your project ZIP or PDF report. Nemotron AI will read it and fill out this entire 5-section form automatically.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>1. Drop your project code/report</Label>
              <div
                className="border-2 border-dashed border-accent/30 rounded-xl p-8 text-center hover:bg-accent/5 transition-colors cursor-pointer flex flex-col items-center justify-center h-48"
                onClick={() => fileInputRef.current?.click()}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-8 w-8 text-accent animate-spin mb-2" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-accent mb-2" />
                )}
                <span className="text-sm font-bold">
                  {isAnalyzing ? "Analyzing repository..." : 
                   selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 
                   "Click to upload ZIPs or PDFs"}
                </span>
                {selectedFiles.length > 0 && !isAnalyzing && (
                  <div className="mt-2 text-xs text-muted-foreground flex flex-wrap justify-center gap-1">
                    {selectedFiles.map(f => (
                      <span key={f.name} className="px-2 py-0.5 bg-accent/10 rounded border border-accent/20">{f.name}</span>
                    ))}
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".zip,.pdf" 
                  multiple 
                  onChange={(e) => {
                    setSelectedFiles(Array.from(e.target.files || []));
                    handleAIAnalyze(e);
                  }} 
                  disabled={isAnalyzing} 
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>OR 2. Paste a quick rundown</Label>
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="We built a React app for smart attendance using facial recognition. It failed because..."
                  value={draftText}
                  onChange={e => setDraftText(e.target.value)}
                  className="h-48 resize-none bg-background/50"
                />
                {!isAnalyzing && <button type="button" onClick={handleAIAnalyze} className="text-xs font-bold text-accent hover:underline self-start">Process text instead →</button>}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* SECTION 1: Basic Info */}
          <section className="space-y-6">
            <div className="border-b border-border pb-2 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">1</div>
              <h2 className="text-2xl font-display font-bold">Basic Information</h2>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground">Project Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Face Recognition Based Attendance System" className="h-12 text-lg" />
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground">Batch Year *</Label>
                  <Input value={batchYear} onChange={e => setBatchYear(e.target.value)} type="number" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground">Department *</Label>
                  <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. CSE" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground">Tech Stack *</Label>
                  <Input value={techStack} onChange={e => setTechStack(e.target.value)} placeholder="React, Python, OpenCV" className="h-12" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground">Team Members</Label>
                  <Input value={teamMembers} onChange={e => setTeamMembers(e.target.value)} placeholder="Names & Roll Numbers" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground">Faculty Advisor</Label>
                  <Input value={advisor} onChange={e => setAdvisor(e.target.value)} placeholder="Name of mentor" className="h-12" />
                </div>
              </div>

              <div>
                <ListInput label="Domain Tags" items={domainTags} onChange={setDomainTags} placeholder="e.g. Smart Campus, AI, Healthcare" />
              </div>
            </div>
          </section>

          {/* SECTION 2: What Was Built */}
          <section className="space-y-6">
            <div className="border-b border-border pb-2 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">2</div>
              <h2 className="text-2xl font-display font-bold">What Was Built</h2>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground">Problem Statement *</Label>
                <Textarea value={problemStatement} onChange={e => setProblemStatement(e.target.value)} rows={3} placeholder="What real-world problem were you trying to solve?" />
              </div>

              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground">Your Approach</Label>
                <Textarea value={ourApproach} onChange={e => setOurApproach(e.target.value)} rows={3} placeholder="How did you tackle it? What was the core idea or architecture?" />
              </div>

              <div className="grid sm:grid-cols-2 gap-8 items-end bg-secondary/20 p-6 rounded-xl border border-border/50">
                <div className="space-y-2 border-r border-border/50 pr-6 border-none">
                  <Label className="uppercase text-xs font-bold text-muted-foreground">Final Outcome *</Label>
                  <Select value={outcome} onValueChange={setOutcome}>
                    <SelectTrigger className="bg-background h-12">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Partially Completed">Partially Completed</SelectItem>
                      <SelectItem value="Abandoned">Abandoned</SelectItem>
                      <SelectItem value="Proof of Concept Only">Proof of Concept Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-6 pl-2 pb-2 mt-4 sm:mt-0">
                  <div className="flex justify-between items-center">
                    <Label className="uppercase text-xs font-bold text-muted-foreground">Completion Percentage</Label>
                    <span className="font-display font-bold text-lg text-primary">{completionPercentage[0]}%</span>
                  </div>
                  <Slider value={completionPercentage} onValueChange={setCompletionPercentage} max={100} step={5} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground">What Was Actually Delivered</Label>
                <Textarea value={delivered} onChange={e => setDelivered(e.target.value)} rows={3} placeholder="A plain description of what a user could actually do with it." />
              </div>
            </div>
          </section>

          {/* SECTION 3: What Was Learned */}
          <section className="space-y-6">
            <div className="border-b border-destructive/30 pb-2 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center font-bold text-destructive text-sm">3</div>
              <h2 className="text-2xl font-display font-bold text-destructive">What Was Learned (Critical)</h2>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex gap-4 text-destructive/80 text-sm italic font-medium mb-6">
              <AlertCircle className="w-6 h-6 shrink-0 text-destructive" />
              <p>This section is the entire reason the system exists. Do not hide failures. Tell future teams exactly what broke so they can skip it.</p>
            </div>

            <div className="grid gap-8">
              <FailedAttemptsList items={failedAttempts} onChange={setFailedAttempts} />

              <div className="bg-destructive/5 p-6 border border-destructive/20 rounded-xl">
                <ListInput label="Dead Ends (Things to skip immediately)" items={deadEnds} onChange={setDeadEnds} placeholder="e.g. Do not use dlib on Raspberry Pi" isDestructive={true} />
              </div>

              <div className="space-y-2 pt-4">
                <Label className="uppercase text-xs font-bold text-muted-foreground">What We Wish We Had Known Before Starting</Label>
                <Textarea value={wishWeHadKnown} onChange={e => setWishWeHadKnown(e.target.value)} rows={4} placeholder="The single most valuable lesson you learned..." className="bg-destructive/5 border border-destructive/20 focus:ring-destructive/20" />
              </div>
            </div>
          </section>

          {/* SECTION 4: What Comes Next */}
          <section className="space-y-6">
            <div className="border-b border-border pb-2 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">4</div>
              <h2 className="text-2xl font-display font-bold">What Comes Next</h2>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground">What We Would Build Next</Label>
                <Textarea value={whatsNext} onChange={e => setWhatsNext(e.target.value)} rows={3} placeholder="Technical roadmap: what approach would you try if you had 1 more semester?" />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold text-muted-foreground">Core Unsolved Problem</Label>
                <Input value={unsolvedProblem} onChange={e => setUnsolvedProblem(e.target.value)} placeholder="One sentence describing the core problem left unsolved." className="h-12" />
              </div>

              <div className="flex items-center space-x-3 bg-secondary/30 p-4 rounded-xl border border-border">
                <Checkbox id="continuation" checked={openForContinuation} onCheckedChange={setOpenForContinuation} className="w-6 h-6 rounded-md data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground" />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="continuation" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Open for Continuation
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow future students to officially adopt and continue this project base.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground flex gap-2 items-center"><LinkIcon className="w-3 h-3" /> Source Code</Label>
                  <Input value={repoLink} onChange={e => setRepoLink(e.target.value)} placeholder="GitHub URL" />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground flex gap-2 items-center"><LinkIcon className="w-3 h-3" /> Report PDF</Label>
                  <Input value={reportLink} onChange={e => setReportLink(e.target.value)} placeholder="Google Drive/Doc URL" />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs font-bold text-muted-foreground flex gap-2 items-center"><LinkIcon className="w-3 h-3" /> Demo</Label>
                  <Input value={demoLink} onChange={e => setDemoLink(e.target.value)} placeholder="YouTube/Live URL" />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: Relationships */}
          <section className="space-y-6">
            <div className="border-b border-border pb-2 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">5</div>
              <h2 className="text-2xl font-display font-bold">Relationship Declarations</h2>
            </div>
            <p className="text-muted-foreground italic text-sm">Help build the knowledge graph by connecting this project to past work.</p>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2 bg-secondary/10 p-6 rounded-xl border border-border/50">
                <Label className="uppercase text-xs font-bold text-muted-foreground">Were you inspired by someone?</Label>
                <Input value={inspiredBy} onChange={e => setInspiredBy(e.target.value)} placeholder="Title of past project..." className="h-12 bg-background" />
                <p className="text-xs text-muted-foreground mt-2">Creates an INSPIRED_BY edge.</p>
              </div>
              <div className="space-y-2 bg-secondary/10 p-6 rounded-xl border border-border/50">
                <Label className="uppercase text-xs font-bold text-muted-foreground">Did you fork/continue someone's code?</Label>
                <Input value={continuedFrom} onChange={e => setContinuedFrom(e.target.value)} placeholder="Title of past project..." className="h-12 bg-background" />
                <p className="text-xs text-muted-foreground mt-2">Creates a CONTINUATION_OF edge.</p>
              </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="pt-8 border-t border-border/50 flex justify-end">
            <button
              type="submit"
              className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary py-6 font-display text-xl font-bold text-primary-foreground shadow-2xl transition-all hover:scale-[1.02] sm:w-auto sm:px-16 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Send className="h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform" />
              <span className="relative z-10 tracking-wide">Archive Project into Graph</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProject;
