import { StepIndicator } from "./StepIndicator";
import { WelcomeStep } from "./WelcomeStep";
import { GoodTypesStep } from "./GoodTypesStep";
import { UnitsStep } from "./UnitsStep";
import { CategoriesStep } from "./CategoriesStep";
import { ItemsStep } from "./ItemsStep";
import { DoneStep } from "./DoneStep";
import { useSetupWizard } from "./hooks/useSetupWizard";

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const {
    step,
    goodTypes,
    setGoodTypes,
    units,
    setUnits,
    categories,
    setCategories,
    items,
    setItems,
    saving,
    goTo,
    handleImport,
    handleFinish,
  } = useSetupWizard(onComplete);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--content-tint)] p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--nav-foreground)]">ReYoGo Setup</span>
          {step !== "welcome" && step !== "done" && <StepIndicator current={step} />}
        </div>

        <div className="rounded-2xl border border-[var(--nav-border)] bg-background shadow-sm p-8">
          {step === "welcome" && (
            <WelcomeStep
              onNext={() => goTo("good-types")}
              onImport={handleImport}
            />
          )}
          {step === "good-types" && (
            <GoodTypesStep
              goodTypes={goodTypes}
              setGoodTypes={setGoodTypes}
              onNext={() => goTo("units")}
              onBack={() => goTo("welcome")}
            />
          )}
          {step === "units" && (
            <UnitsStep
              units={units}
              setUnits={setUnits}
              onNext={() => goTo("categories")}
              onBack={() => goTo("good-types")}
            />
          )}
          {step === "categories" && (
            <CategoriesStep
              categories={categories}
              setCategories={setCategories}
              goodTypes={goodTypes}
              onNext={() => goTo("items")}
              onBack={() => goTo("units")}
            />
          )}
          {step === "items" && (
            <ItemsStep
              items={items}
              setItems={setItems}
              categories={categories}
              units={units}
              onNext={() => goTo("done")}
              onBack={() => goTo("categories")}
            />
          )}
          {step === "done" && (
            <DoneStep
              goodTypes={goodTypes}
              units={units}
              categories={categories}
              items={items}
              onFinish={handleFinish}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
