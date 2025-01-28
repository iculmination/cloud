"use server";

import { createAdminClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { ID, Models, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });
    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload files");
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) {
    queries.push(Query.equal("type", types));
  }

  if (searchText) {
    queries.push(Query.contains("name", searchText));
  }

  if (limit) {
    queries.push(Query.limit(limit));
  }

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
    );
  }
  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User now found");
    }

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  try {
    const { databases } = await createAdminClient();
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { name: newName }
    );
    revalidatePath(path);

    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to raname file");
  }
};

export const updateFilesUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  try {
    const { databases } = await createAdminClient();

    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users: emails }
    );
    revalidatePath(path);

    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to raname file");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  try {
    const { databases, storage } = await createAdminClient();

    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);

    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to raname file");
  }
};

export const getTotalUsedSpace = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("User now found");
    }

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId
    );

    const totalSpaceUsed: StorageUsage = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      media: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, //2gb
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpaceUsed[fileType].size += file.size;
      totalSpaceUsed.used += file.size;

      if (
        !totalSpaceUsed[fileType].latestDate ||
        new Date(totalSpaceUsed[fileType].latestDate) <
          new Date(file.$updatedAt)
      ) {
        totalSpaceUsed[fileType].latestDate = file.$updatedAt;
      }

      totalSpaceUsed.media.size =
        totalSpaceUsed.audio.size + totalSpaceUsed.video.size;

      totalSpaceUsed.media.latestDate =
        new Date(totalSpaceUsed.audio.latestDate) <
        new Date(totalSpaceUsed.video.latestDate)
          ? totalSpaceUsed.video.latestDate
          : totalSpaceUsed.audio.latestDate;
    });

    return totalSpaceUsed;
  } catch (error) {
    handleError(error, "Could not calculate total used space");
  }
};
