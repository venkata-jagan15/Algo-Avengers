import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Layers, Users, Target, Activity, CheckCircle, Clock, XCircle, AlertTriangle, ShieldCheck, LogOut, Lock, Unlock, Eye } from 'lucide-react';
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

const FacultyDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const navigate = useNavigate();

    // Role Protection
    const userStr = localStorage.getItem('innotrack_user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (user?.role === 'Faculty') {
            fetchData();
        }
    }, [user]);

    if (!user || user.role !== 'Faculty') {
        return <Navigate to="/faculty/login" replace />;
    }

    const handleLogout = () => {
        localStorage.removeItem('innotrack_user');
        navigate('/faculty/login');
    };

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/projects`);
            setProjects(res.data);
        } catch (error) {
            toast.error("Failed to load dashboard data");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAccess = async (projectId) => {
        try {
            const res = await axios.put(`${API_BASE_URL}/projects/${projectId}/toggle-access`);
            if (res.data.status === 'success') {
                setProjects(prev => prev.map(p => 
                    p.id === projectId ? { ...p, repo_access_granted: res.data.repo_access_granted } : p
                ));
                toast.success(res.data.repo_access_granted ? "Access granted to students" : "Access revoked");
            }
        } catch (error) {
            toast.error("Failed to toggle access");
        }
    };

    // Analytics (Mirrored from Admin)
    const deptCounts = projects.reduce((acc, p) => {
        acc[p.department] = (acc[p.department] || 0) + 1;
        return acc;
    }, {});
    const deptData = Object.keys(deptCounts).map(key => ({ name: key, count: deptCounts[key] })).sort((a, b) => b.count - a.count);

    const outcomeCounts = projects.reduce((acc, p) => {
        acc[p.outcome] = (acc[p.outcome] || 0) + 1;
        return acc;
    }, {});
    const outcomeData = Object.keys(outcomeCounts).map(key => ({ name: key, value: outcomeCounts[key] }));

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDept === 'All' || p.department === filterDept;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-wider mb-3">
                            <Users className="w-4 h-4" />
                            <span>Faculty Portal</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
                            Faculty <span className="text-indigo-500">Dashboard</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Manage projects, monitor progress, and control student access.
                        </p>
                    </div>
                    <div className="flex items-center pb-2">
                        <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="max-w-7xl mx-auto flex items-center justify-center p-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass p-6 rounded-2xl border border-border/50 bg-background/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-500/10 rounded-lg"><Layers className="w-5 h-5 text-indigo" /></div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase">Owned Projects</h3>
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
                                <div className="p-2 bg-amber-500/10 rounded-lg"><Clock className="w-5 h-5 text-amber-500" /></div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase">In Progress</h3>
                            </div>
                            <p className="text-4xl font-display font-bold">{outcomeCounts['Partially Completed'] || 0}</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-border/50 bg-background/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-rose-500/10 rounded-lg"><Unlock className="w-5 h-5 text-rose-500" /></div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase">Public Repos</h3>
                            </div>
                            <p className="text-4xl font-display font-bold">{projects.filter(p => p.repo_access_granted).length}</p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass p-6 rounded-3xl border border-border/50 bg-background/50">
                            <h3 className="text-lg font-bold font-display mb-6">Outcome Distribution</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
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
                        <div className="glass p-6 rounded-3xl border border-border/50 bg-background/50">
                            <h3 className="text-lg font-bold font-display mb-6">Department Metrics</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deptData} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} stroke="rgba(255,255,255,0.8)" className="text-xs font-bold" />
                                        <RechartsTooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                            itemStyle={{ color: COLORS.indigo }}
                                        />
                                        <Bar dataKey="count" fill={COLORS.indigo} radius={[0, 4, 4, 0]} barSize={24}>
                                            {deptData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.indigo} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Project Management Table */}
                    <div className="glass rounded-3xl border border-border/50 bg-background/50 overflow-hidden">
                        <div className="p-6 border-b border-border/50 flex flex-col md:flex-row justify-between gap-4 items-center">
                            <h3 className="text-xl font-bold font-display">Manage Submissions</h3>
                            <div className="flex gap-3 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search project title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-secondary/20 text-muted-foreground uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Title & Summary</th>
                                        <th className="px-6 py-4">Faculty Advisor</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Student Access</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredProjects.map((p) => (
                                        <tr key={p.id} className="hover:bg-secondary/10 transition-colors">
                                            <td className="px-6 py-4 max-w-md">
                                                <div className="font-bold mb-1 truncate">{p.title}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2 italic">
                                                    {p.problem_statement || "No summary available."}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-foreground">
                                                    {p.faculty_advisor || <span className="text-muted-foreground/50">Not Available</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    p.outcome === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    p.outcome === 'Partially Completed' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    {p.outcome}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleAccess(p.id)}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                        p.repo_access_granted 
                                                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                                                        : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                                                    }`}
                                                >
                                                    {p.repo_access_granted ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                    {p.repo_access_granted ? 'PUBLIC' : 'PRIVATE'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/project/${p.id}`)}
                                                    className="p-2 hover:bg-secondary rounded-lg transition-colors inline-flex items-center gap-2 text-xs font-bold text-indigo-500"
                                                >
                                                    <Eye className="w-4 h-4" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;
