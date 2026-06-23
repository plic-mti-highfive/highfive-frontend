import type { StorageFolder } from "@plic-mti-highfive/shared-types";
import { httpClient } from "../../http-client";

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  fileKey: string;
}

export class StorageServiceHttp {
  async getPresignedUrl(
    fileName: string,
    mimeType: string,
    folder: StorageFolder,
  ): Promise<PresignedUrlResponse> {
    return httpClient.post<PresignedUrlResponse>("/storage/presigned-url", {
      fileName,
      mimeType,
      folder,
    });
  }

  async upload(file: File, folder: StorageFolder): Promise<string> {
    const { uploadUrl, publicUrl } = await this.getPresignedUrl(
      file.name,
      file.type,
      folder,
    );

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'upload de l'image");
    }

    return publicUrl;
  }
}

export const storageService = new StorageServiceHttp();
