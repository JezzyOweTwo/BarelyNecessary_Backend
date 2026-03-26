> **THIS PROJECT WILL NOT WORK WITHOUT THE `.ENV` FILES!**
> Please see the setup guide below.

---

## Setup Guide

Sup. Welcome to the project! Here's a quick tutorial to get you started:

---

### 0. Optional

I'd recommend downloading [Docker Desktop](https://www.docker.com/products/docker-desktop/).
It makes managing each container way easier. You don't need it, buuuuuuut do it.

---

### 1a. Updating an Existing Installation

If you have previously cloned the repository and just want to update to the latest version:

* Open the project folder in VS Code using `Control + K + O`
* Go to the **Source Control** section on the left-hand pane (the icon with three circles and lines)
* In the **GRAPH** section, press the button labelled **Fetch**, then the one labelled **Pull**

---

### 1b. Fresh Installation

If you have not previously cloned the repo, do this instead:

* Navigate to wherever you want the project to live on your local machine with `Control + K + O`
* Run:

```bash
git clone https://github.com/JezzyOweTwo/BarelyNecessary_Backend.git
```

* Use `Control + K + O` again to move yourself into the project folder

---

### 2. Running the Project Locally

We're using Docker now, which makes it dead simple to start.

#### 1. Environment Files

Go to Discord, find the envs, and add them to the root of the project:

* `.env.development`
* `.env.production`

---

#### 2a. Developer Setup

If you're tryna change stuff in the project:

```bash
docker compose --env-file .env.development -f docker-compose.yml -f docker-compose-dev.yml up
```

```bash
npm run dev
```

---

#### 2b. Production Setup

When we're all done and we need to finally deploy to AWS:

```bash
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose-dev.yml up
```

```bash
npm run start
```

---

### 3. Production Notes

Note that when we deploy to AWS, all we need to do in code is edit `production.env` and use step **2b**.
