### What it does
 Uploads a file to firebase cloud storage and trigger a webhook.

# Installation
**Using the actions in workflow**
```yaml
    - uses: nothingdeveloped/upload-to-firebase-github-action@master 
      with:
       firebase_metadata: '{ "Content-Type": "application/zip" }'
       file_form: '{"file":"build/app/outputs/apk/release/app-release.apk"}'
       firebase_config: '{{SECRETS.FIRE_CONFIG}}'
```
Note : Firebase Config are stored in github Action secrets

**Workflow for Flutter Application :**

```yaml
name: AutoDeployApk
on:
  push:
    branches: [ "dev" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: actions/setup-java@v1
      with:
        java-version: '12.x'
    - name: Cache Flutter dependencies
      uses: actions/cache@v1
      with:
        path: /opt/hostedtoolcache/flutter
        key: ${{ runner.OS }}-flutter-install-cache-${{ env.flutter_version }}
    - uses: subosito/flutter-action@v1
      with:
        channel: 'stable' 
        flutter-version: '3.7.10' 
    - run: flutter pub get
    - run: flutter build apk
    - uses: actions/upload-artifact@v3
      with:
        name: release-apk
        path: build/app/outputs/apk/release/app-release.apk
        retention-days: 1
    - uses: nothingdeveloped/upload-to-firebase-github-action@master 
      with:
       firebase_metadata: '{ "Content-Type": "application/zip" }'
       file_form: '{"file":"build/app/outputs/apk/release/app-release.apk"}'
       firebase_config: '{{SECRETS.FIREBASE_CONFIG}}'
```

# Configuration
First, Configure the firebase config in the secrets to avoid exposing credentials (firebase config keys) in code base.
1. Goto [firebase console](https://console.firebase.google.com/ "firebase console")
2. Select the project and goto Project Settings -> General -> Scroll to "Your App" -> In "SDK setup and configuration" section select config and copy the code.
3. Create a secret in Github and paste the config.

**Sample : **
In FireBase Console: 

![](https://nothingdeveloped.github.io/assets/firebase_config.png)

In Github: 

![](https://nothingdeveloped.github.io/assets/github_action_secret.png)


# Options
- **FireBase Config** (required) : 
     ```javascript
apiKey: string;
authDomain: string;
projectId: string;
storageBucket: string;
messagingSenderId: string;
appId: string;
measurementId: string;
path: string;
```
1-7 -> Others are default firebase config 
8 -> path : Path to upload the firebase cloud storage

![](https://nothingdeveloped.github.io/assets/firebase_cloud_storage.png)


- **FireBase MetaData **(optional)
```javascript
  contentType: string;
```
1.contentType : Content Tye for uploaded file . Default : 'application/zip'

- ** FileForm** (required)
```javascript
  file: string;
```
1.file : File path of the file to be uploaded ( file path in the artifact )

- **Webhook** (optional)
```javascript
  url: string (GET,PUT,POST,DELETE);
  method: string;
  secret: string;
  secret_name: string;
  data: {};
```
url : Url of the website
method : Http Method
secret : Webhook secret to verify request is made from this action . default : sha256 of url
secret_name : Name of webhook secret key . default : secret_key
data : Additional data that can be passed.




