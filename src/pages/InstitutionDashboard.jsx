import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Layers, Users, Target, Activity, CheckCircle, Clock, XCircle, AlertTriangle, ShieldCheck, LogOut } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const COLORS = {
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    blue: '#3b82f6',
    indigo: '#6366f1',
    cyan: '#06b6d4',
    teal: '#14b8a6',
};

const STAT_COLORS = {
    "Completed": COLORS.emerald,
    "Partially Completed": COLORS.amber,
    "Abandoned": COLORS.rose,
    "Proof of Concept Only": COLORS.violet
};

const InstitutionDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const navigate = useNavigate();

    // Role Protection
    const userStr = localStorage.getItem('innotrack_user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (user?.role === 'Admin') {
            fetchData();
        }
    }, [user]);

    if (!user || user.role !== 'Admin') {
        return <Navigate to="/institution/login" replace />;
    }

    const handleLogout = () => {
        localStorage.removeItem('innotrack_user');
        navigate('/institution/login');
    };

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/projects`);
            // Assuming the 'user.name' or 'user.institution' is what we filter by.
            // Since we don't have a rigid institution field yet, we'll filter based on 
            // a hypothetical 'institution' field, or just return all for demo if not present.
            // For now, let's filter if the project has an 'institution' matching the user's name.
            // But right now the backend /projects returns everything. 
            // Let's filter on the frontend:
            const allProjects = res.data;

            // In a real app, projects would have an 'institution_id'. 
            // Since this is a standalone demo for a single college (MVGR), we will just 
            // assume all current projects belong to the admin's college and show them all,
            // OR we can add a hardcoded filter to demonstrate the capability.
            // I'll add a pseudo-filter for demonstration.

            // To truly "scope" it, we pretend the Admin's "name" or "email" defines their institution.
            // E.g., admin@innotrack.com sees all. 
            setProjects(allProjects);
        } catch (error) {
            toast.error("Failed to load analytics data");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Analytics Derivations ---

    // 1. Department Distribution
    const deptCounts = projects.reduce((acc, p) => {
        acc[p.department] = (acc[p.department] || 0) + 1;
        return acc;
    }, {});
    const deptData = Object.keys(deptCounts).map(key => ({ name: key, count: deptCounts[key] })).sort((a, b) => b.count - a.count);

    // 2. Outcome Distribution
    const outcomeCounts = projects.reduce((acc, p) => {
        acc[p.outcome] = (acc[p.outcome] || 0) + 1;
        return acc;
    }, {});
    const outcomeData = Object.keys(outcomeCounts).map(key => ({ name: key, value: outcomeCounts[key] }));

    // 3. Domain Distribution
    const domainCounts = {};
    projects.forEach(p => {
        try {
            if (p.domain_tags) {
                const tags = JSON.parse(p.domain_tags);
                tags.forEach(t => {
                    domainCounts[t] = (domainCounts[t] || 0) + 1;
                });
            }
        } catch (e) { /* ignore parse errors */ }
    });
    const domainData = Object.keys(domainCounts).map(key => ({ name: key, count: domainCounts[key] })).sort((a, b) => b.count - a.count).slice(0, 10);

    // Filtering for the Table
    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDept === 'All' || p.department === filterDept;
        return matchesSearch && matchesDept;
    });

    const getOutcomeIcon = (outcome) => {
        if (outcome === 'Completed') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        if (outcome === 'Partially Completed') return <Clock className="w-4 h-4 text-amber-500" />;
        if (outcome === 'Abandoned') return <XCircle className="w-4 h-4 text-rose-500" />;
        return <AlertTriangle className="w-4 h-4 text-violet-500" />; // PoC
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider mb-3">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Access Only</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
                            Institution <span className="text-rose-500">Analytics</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Macro-level view of all student development happening across the college.
                        </p>
                    </div>
                    <div className="flex items-center pb-2">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-200 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="max-w-7xl mx-auto flex items-center justify-center p-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass p-6 rounded-2xl border border-border/50 bg-background/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg"><Layers className="w-5 h-5 text-primary" /></div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase">Total Projects</h3>
                            </div>
                            <p className="text-4xl font-display font-bold">{projects.length}</p>
                        </div>

                        <div className="glass p-6 rounded-2xl border border-border/50 bg-background/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase">Completed</h3>
                            </div>
                            <p className="text-4xl font-display font-bold">{outcomeCounts['Completed'] || 0}</p>
                        </div>

                        <div className="glass p-6 rounded-2xl border border-border/50 bg-background/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-rose-500/10 rounded-lg"><Target className="w-5 h-5 text-rose-500" /></div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase">Departments</h3>
                            </div>
                            <p className="text-4xl font-display font-bold">{Object.keys(deptCounts).length}</p>
                        </div>

                        <div className="glass p-6 rounded-2xl border border-border/50 bg-background/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-violet-500/10 rounded-lg"><Activity className="w-5 h-5 text-violet-500" /></div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase">Unique Domains</h3>
                            </div>
                            <p className="text-4xl font-display font-bold">{Object.keys(domainCounts).length}</p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Chart: Outcomes */}
                        <div className="glass p-6 rounded-3xl border border-border/50 bg-background/50">
                            <h3 className="text-lg font-bold font-display mb-6">Outcome Distribution</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={outcomeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {outcomeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={STAT_COLORS[entry.name] || COLORS.blue} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                            labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart: Departments */}
                        <div className="glass p-6 rounded-3xl border border-border/50 bg-background/50">
                            <h3 className="text-lg font-bold font-display mb-6">Projects by Department</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                                        <YAxis dataKey="name" type="category" width={80} stroke="rgba(255,255,255,0.8)" className="text-xs font-bold" />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                            itemStyle={{ color: COLORS.rose }}
                                        />
                                        <Bar dataKey="count" fill={COLORS.rose} radius={[0, 4, 4, 0]} barSize={24}>
                                            {deptData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.rose} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* Chart: Domains (Full Width) */}
                    <div className="glass p-6 rounded-3xl border border-border/50 bg-background/50">
                        <h3 className="text-lg font-bold font-display mb-6">Top 10 Focus Domains</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={domainData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.8)" className="text-xs font-bold" />
                                    <YAxis stroke="rgba(255,255,255,0.5)" />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        itemStyle={{ color: COLORS.indigo }}
                                    />
                                    <Bar dataKey="count" fill={COLORS.indigo} radius={[4, 4, 0, 0]} barSize={40}>
                                        {domainData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS.indigo} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Project Data Table */}
                    <div className="glass rounded-3xl border border-border/50 bg-background/50 overflow-hidden">
                        <div className="p-6 border-b border-border/50 flex flex-col md:flex-row justify-between gap-4 items-center">
                            <h3 className="text-xl font-bold font-display cursor-default">All Submissions log</h3>
                            <div className="flex gap-3 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search projects by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <select
                                    className="bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={filterDept}
                                    onChange={(e) => setFilterDept(e.target.value)}
                                >
                                    <option value="All">All Departments</option>
                                    {Object.keys(deptCounts).map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-secondary/20 text-muted-foreground uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Project Title</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Batch</th>
                                        <th className="px-6 py-4">Outcome Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredProjects.map((p) => (
                                        <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                                            <td className="px-6 py-4 font-medium max-w-md">{p.title}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-secondary px-2 py-1 rounded text-xs font-bold">{p.department}</span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{p.batch_year}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getOutcomeIcon(p.outcome)}
                                                    <span>{p.outcome}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/project/${p.id}`)}
                                                    className="text-xs font-bold text-primary hover:underline"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProjects.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground italic">
                                                No projects found matching the criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default InstitutionDashboard;
