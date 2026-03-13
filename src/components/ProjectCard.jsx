import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  partial: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  failed: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const ProjectCard = ({ project }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/project/${project.id}`} className="group block">
        <div className="rounded-xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${statusStyles[project.outcome] || 'bg-primary/10 text-primary border-primary/20'}`}>
              {project.outcome || 'Unknown'}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
          </div>
          <h3 className="mb-2 font-display text-lg font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{project.problem_statement}</p>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {project.tech_stack && project.tech_stack.split(',').slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Batch {project.batch_year}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project.team_members ? project.team_members.split(',').length : 1} members
            </span>
          </div>
          <div className="mt-4 text-xs font-medium text-muted-foreground border-t pt-2">{project.department}</div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
