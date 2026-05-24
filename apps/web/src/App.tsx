import { AnimatePresence, motion } from 'framer-motion';
import { fadeUp, staggerChildren } from '@reyogo/ui';

const statCards = [
  { label: 'Total Items', value: '2,841' },
  { label: 'Low Stock', value: '14' },
  { label: 'Total Value', value: '$183,290' },
  { label: 'Suppliers', value: '37' },
];

function App() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-background text-foreground"
      >
        <main className="container mx-auto p-8">
          <h1 className="text-2xl font-bold">ReYoGo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Coming soon.</p>

          <motion.div
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
            className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {statCards.map((card) => (
              <motion.div
                key={card.label}
                variants={fadeUp}
                className="rounded-lg bg-card border border-border p-4"
              >
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="mt-1 font-mono text-2xl font-medium">{card.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
