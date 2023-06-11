import {
  FileFormType,
  FireBaseConfigType,
  FireBaseMetadataType,
  Inputs,
  RDMethods,
  UploadInputs,
  WebhookType,
} from "./constants";
import * as core from "@actions/core";
import { createHash } from "crypto";
import { url } from "inspector";

export function getInputs(): UploadInputs {
  const firebaseConfig = getFirebaseConfig(
    core.getInput(Inputs.FIREBASE_CONFIG)
  );
  const fireBaseMetadata = getfireBaseMetadata(
    core.getInput(Inputs.FIREBASE_METADATA)
  );
  const fileForm = getfileForm(core.getInput(Inputs.FILEFORM));
  const webhook = getwebhook(core.getInput(Inputs.WEBHOOK));

  console.log(firebaseConfig);

  const inputs = {
    firebaseConfig: firebaseConfig,
    fireBaseMetadata: fireBaseMetadata,
    fileForm: fileForm,
    webhook: webhook,
  } as UploadInputs;

  return inputs;
}

function getFirebaseConfig(jsonStr): FireBaseConfigType {
  if (jsonStr.trim() == "") core.setFailed("FireBase Config is Empty");
  const json = jsonStr
  console.log(JSON.stringify(jsonStr));
  // console.log(Object.keys(json).map((e)=> console.log(e)))
  // console.log(Object.keys(json))
  // return jsonStr
  return {
    apiKey: json["apiKey"],
    authDomain: json["authDomain"],
    projectId: json["projectId"],
    storageBucket: json["storageBucket"],
    messagingSenderId: json["messagingSenderId"],
    appId: json["appId"],
    measurementId: json["measurementId"],
    path: json["path"],
  };
}

function getfireBaseMetadata(jsonStr: string): FireBaseMetadataType {
  if (jsonStr.trim() == "")
    return {
      contentType: "application/zip",
    };
  const json = JSON.parse(jsonStr);
  return {
    contentType: json["Content-Type"],
  };
}

function getfileForm(jsonStr: string): FileFormType {
  if (jsonStr.trim() == "") core.setFailed("File Not Specified");
  const json = JSON.parse(jsonStr);
  return {
    file: json["file"],
  };
}

function getwebhook(jsonStr: string): WebhookType | null {
  if (jsonStr.trim() == "") return null;
  const json: JSON = JSON.parse(jsonStr);
  if (json["url"] == null) core.setFailed("Url Required for Webhook");
  let hash = "";
  if (json["url"] == null) {
    hash = createHash("sha256").update(String(json["url"])).digest("hex");
    core.setOutput(
      "hash",
      `Secret not provided ,use this generated secret: ${hash}`
    );
  }
  return {
    url: json["url"],
    method: json["method"] ?? RDMethods.GET,
    secret: json["secret"] ?? hash,
    secret_name: json["secret_name"] ?? "secret_key",
    data: JSON.parse(json["data"]),
  };
}
