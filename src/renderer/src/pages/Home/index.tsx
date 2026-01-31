import { Link } from "react-router-dom";
import { ProductRoutes } from "@/components/AppRoutes/routePaths";
import { Button } from "@/components/ui/button";
import { PackageIcon } from "lucide-react";

const Home = () => (
  <div className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-16">
    <h1 className="text-3xl font-semibold text-foreground">Welcome</h1>
    <p className="text-muted-foreground">Get started by going to Goods Received.</p>
    <div className="flex flex-wrap justify-center gap-3">
      <Button asChild size="lg">
        <Link to={ProductRoutes.GoodsReceived} className="inline-flex items-center gap-2">
          <PackageIcon className="size-5" aria-hidden />
          Goods Received
        </Link>
      </Button>
    </div>
  </div>
);

export default Home;
