import { useRecentEntities } from '@/hooks/useRecentEntities';
import { PREDEFINED_ENTITIES } from '@/lib/constants/predefined-entities';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';

const MAX_SUGGESTIONS = 5;

export function QuickEntityAccess() {
  const { recentEntities } = useRecentEntities();

  const suggestions = [
    ...recentEntities.map(e => ({ ...e, isRecent: true })),
    ...PREDEFINED_ENTITIES.filter(
      p => !recentEntities.some(r => r.cui === p.cui)
    ).map(e => ({ ...e, isRecent: false })),
  ].slice(0, MAX_SUGGESTIONS);

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((entity, index) => (
          <motion.div
            key={entity.cui}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link to="/entities/$cui" params={{ cui: entity.cui }}>
              <Badge
                variant="outline"
                className="bg-white dark:bg-slate-800 px-4 py-2 border-1 border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition duration-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                <div className="flex flex-row gap-2 items-center justify-between">
                  <span className="text-[0.6rem] md:text-sm whitespace-nowrap">{formatEntityName(entity.name)}</span>
                  <span className="text-[0.4rem] md:text-[0.7rem] text-slate-500 dark:text-slate-400 font-mono font-normal">
                    [{entity.cui}]
                  </span>
                </div>
              </Badge>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}



const entityNameMap = {
  'municipiul': 'mun.',
  'judetul': 'jud.',
  'ministerul': 'min.',
} as Record<string, string>;


function formatEntityName(name: string) {
  return name.toLocaleLowerCase()
    .split(' ')
    .map(word => entityNameMap[word] || word)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
}