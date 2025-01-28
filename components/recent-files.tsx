import { getFiles } from "@/lib/actions/file.actions";
import FormattedDateTime from "./formatted-date-time";
import Thumbnail from "./thumbnail";
import { Models } from "node-appwrite";
import ActionDropdown from "./action-dropdown";
import Link from "next/link";

const RecentFiles = async () => {
  const results = await getFiles({ types: [], limit: 10 });

  return (
    <section className="bg-white w-full xl:w-1/2 h-full rounded-3xl p-8">
      <h2 className="h2 mb-6">Recent files uploaded</h2>
      <ul className="">
        {results.documents.length > 0 ? (
          results.documents.map((file: Models.Document) => (
            <li
              className="flex items-center my-2 2xl:my-4 justify-between"
              key={file.$id}
            >
              <Link
                href={file.url}
                target="_blank"
                className="flex items-center gap-4 w-full cursor-pointer"
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                  className="size-9 min-w-9"
                />
                <div className="flex flex-col">
                  <p className="subtitle-2 line-clamp-1 text-light-100">
                    {file.name}
                  </p>
                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </div>
              </Link>
              <ActionDropdown file={file} />
            </li>
          ))
        ) : (
          <p className="empty-result">No files found</p>
        )}
      </ul>
    </section>
  );
};

export default RecentFiles;
