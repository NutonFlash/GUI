# GUI

## Our team develops the front-end part of a Korean startup related to optimizing the collection of a garbage using AI technologies

Team members and their roles:

-   Aleskei (manage team and review code)
-   Justin (integrate KakaoMap)
-   Ali (apply css style)
-   Akhmadjon (add dynamic with JS)
-   한승헌 (create HTML-markup)

# Setup

## Pull Repository

In a new folder do

```
git init
git remote add origin git@github.com:NutonFlash/GUI
git pull origin main
```

## Environment Variables

create a new file `.env` with the following contents

```
GOOGLE_API_KEY=yourapikey
```

Get an api key from [here](https://developers.google.com/maps/documentation/geolocation/get-api-key)

## Install Dependencies

Download and Install

-   [VSCode](https://code.visualstudio.com/)
-   [NodeJS](https://nodejs.org/en)

At the root folder do

```
npm i
```

## Create Seperate Branch

```
git branch -b yourNickName/yourFeatureName
```

## Commit Changes

```
git add .
git commit -m "short change explanation message"
```

## Pushing Changes

```
git push origin yourNickName/yourFeatureName
```
