import CategoryCard from "@/components/category-card";
import Chart from "@/components/chart";
import RecentFiles from "@/components/recent-files";
import { dashboardItems } from "@/constants";
import { getTotalUsedSpace } from "@/lib/actions/file.actions";

export default async function Home() {
  const totalUsedSpace = await getTotalUsedSpace();

  if (!totalUsedSpace) return;

  return (
    <div className="p-10 flex flex-col xl:flex-row gap-[30px] w-full">
      <section className="flex flex-col w-full xl:w-1/2 h-full">
        <Chart totalUsedSpace={totalUsedSpace} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px] h-full mt-10">
          {dashboardItems.map((item) => (
            <CategoryCard
              key={item.name}
              {...item}
              totalUsedSpace={totalUsedSpace}
            />
          ))}
        </div>
      </section>

      <RecentFiles />
    </div>
  );
}
