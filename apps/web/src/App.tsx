import type { IInventoryCategory } from '@reyogo/shared/inventory';

function App() {
  const _typeCheck: IInventoryCategory | undefined = undefined;
  void _typeCheck;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold">ReYoGo Web</h1>
        <p className="mt-2 text-muted-foreground">Coming soon.</p>
      </main>
    </div>
  );
}

export default App;
