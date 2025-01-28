import Image from "next/image";
import { Separator } from "./ui/separator";
import FormattedDateTime from "./formatted-date-time";
import { convertFileSize } from "@/lib/utils";

interface CategoryCardProps {
  category: string;
  icon: string;
  name: string;
  totalUsedSpace: any;
}

const CategoryCard = async ({
  category,
  icon,
  name,
  totalUsedSpace,
}: CategoryCardProps) => {
  return (
    <div className="bg-white w-full h-full relative rounded-3xl pb-10">
      <div className="flex flex-col items-center justify-center">
        <Image
          src={icon}
          alt="images"
          width={226}
          height={100}
          className="summary-type-icon z-10"
          draggable={false}
        />
        <h4 className="w-full text-right p-6 h4 z-50">
          {convertFileSize(totalUsedSpace[category].size)}
        </h4>
        <h5 className="w-full text-center line-clamp-1 font-semibold mb-2">
          {name}
        </h5>
        <Separator className="bg-light-400 w-4/5 mx-auto" />
        <div className="flex flex-col items-center justify-center">
          <p className="text-light-200 text-center w-full mt-4">Last update</p>
          <FormattedDateTime date={totalUsedSpace[category].latestDate} />
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
