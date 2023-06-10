export enum Inputs {
  FIREBASE_CONFIG = "firebase_config",
  FIREBASE_METADATA = "firebase_metadata",
  FILEFORM = "file_form",
  WEBHOOK = "webhook",
}

export enum RDMethods {
  GET = "GET",
  DELETE = "DELETE",
}

export enum CUMethods {
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

export type FireBaseConfigType = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  path: string;
};

export type FireBaseMetadataType = {
  contentType: string;
};

export type FileFormType = {
  file: string;
};

export type WebhookType = {
  url: RDMethods | CUMethods;
  method: string;
  secret: string;
  secret_name: string;
  data: {};
};

export interface UploadInputs {
  firebaseConfig: FireBaseConfigType;
  fireBaseMetadata: FireBaseMetadataType;
  fileForm: FileFormType;
  webhook: WebhookType | null;
}
