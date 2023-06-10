import * as core from '@actions/core';
import axios, { AxiosRequestConfig } from 'axios';
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { createReadStream } from 'fs';
import { Stream } from 'stream';
import { RDMethods, UploadInputs, WebhookType } from './constants';
import { getInputs } from './input-helper';

async function run() : Promise<void> {
  // Actions Input 
  const inputs = getInputs()

  try {
    await initFirebases(inputs)
    core.setOutput("Success","Successfully Uploaded")
  } catch (err) {
    console.log(err)
    core.setFailed(JSON.stringify(err))
  }

}

async function initFirebases(inputs : UploadInputs)  {

  const firebaseConfig  = inputs.firebaseConfig
  const { path } = firebaseConfig
	const fireBaseMetadata  = inputs.fireBaseMetadata
	const fileForm  = inputs.fileForm
	const webhook  = inputs.webhook
  
  return await new Promise( (res,rej) => { 
    const app = firebase.initializeApp(firebaseConfig)
    var storageRef = firebase.app().storage(firebaseConfig.storageBucket).ref();
    const readStream = createReadStream(fileForm.file)
    const blob = streamToBlob(readStream)

    var uploadTask = storageRef.child(path).put(blob,fireBaseMetadata);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,(snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        core.setOutput('file','Upload is ' + progress + '% done');
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: 
            console.log('Upload is paused');
            break;
        case firebase.storage.TaskState.RUNNING: 
            console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
          switch (error.code) {
          case 'storage/unauthorized':
              console.log("Unauthorized")
              break;
          case 'storage/canceled':
            console.log("Cancelled")
              break;
          case 'storage/unknown':
            console.log("Unknown Error")
              break;
          }
          rej(error)
      }, 
      () => {
          // Upload completed successfully, now we can get the download URL
          uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
              console.log('File available at', downloadURL);
              core.setOutput('file',`File avaliable at ${downloadURL}`);
              if(webhook){
                await triggerWebhook(webhook,downloadURL)
              }
              res(downloadURL)
          });
      });
  });
}

function streamToBlob(stream : Stream) {
  const chunks : Array<any> = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    return Buffer.concat(chunks)
}

async function triggerWebhook(webhook : WebhookType, url : string) {
  try {
    const config : AxiosRequestConfig =  webhook.method in RDMethods ?
      {
        method : webhook.method,
        url : webhook.url,
        params : {
          [webhook.secret_name] : webhook.secret,
          url : url,
          ...webhook.data
        },
        maxBodyLength : Infinity,
        maxContentLength : Infinity
      }
      : 
      {
        method : webhook.method,
        url : webhook.url,
        data : {
          [webhook.secret_name] : webhook.secret,
          url : url
        },
        headers : {
          "Content-Type" : 'application/json'
        },
        maxBodyLength : Infinity,
        maxContentLength : Infinity
      }
    const response = await axios(config)
    core.setOutput("webhook",`Successfully Triggering Webhook at ${new Date().getMilliseconds()}`)
  } catch (err) {
    core.setOutput("webhook",`Failed Triggering Webhook : ${err}`)
  }
}

run();
