import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import core from "@actions/core";

export default async function initFirebase(config, fileMap, fire_metadataMap) {
  console.log(config, fileMap, fire_metadataMap);
  core.setOutput("output", config);
  core.setOutput("output", fileMap);
  core.setOutput("output", fire_metadataMap);

  const app = firebase.initializeApp(config);
  var storageRef = app.storage().ref();

  var metadata = fire_metadataMap;
  const data = Buffer.from(fileMap.get("file"));

  var uploadTask = storageRef
    .child("application/" + "app.apk")
    .put(data, metadata);

  return new Promise((res, rej) => {
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log("Upload is paused");
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/unauthorized":
            console.log("Unauthorized");
            break;
          case "storage/canceled":
            // User canceled the upload
            break;

          // ...

          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log("File available at", downloadURL);
          core.setOutput("output", downloadURL);
          res(downloadURL);
        });
      }
    );
  });
}
